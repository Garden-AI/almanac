---
layout: ../../layouts/Annex.astro
title: "The Machine"
piece: "01"
eyebrow: "Builder's Annex · 01 · Understand"
dek: "An MLIP mapped onto the transformer stack you already run — and the five places the analogy breaks, each one a consequence for the tools you build."
nextHref: "/annex/the-two-jobs"
nextLabel: "The Two Jobs"
---

You run transformers for a living. You know what an embedding table is, where attention spends its FLOPs, why a KV cache exists, and what LoRA does to a fine-tune. That knowledge transfers to machine-learning interatomic potentials better than you would guess — and then it stops transferring, abruptly, in five specific places. This chapter walks the map first and the breaks second. The breaks are the useful part. Every one of them changes how you serve these models, speed them up, or build fine-tuning tools around them.

First, the machine itself, in three sentences. An MLIP takes a pile of atoms — an atomic number and a 3D position for each, plus optionally a repeating box for crystals and a total charge and spin — and returns one scalar: the potential energy of that arrangement, in electron-volts. The force on each atom is the negative derivative of that energy with respect to the atom's position — a 3-vector per atom, pointing downhill in energy. A molecular dynamics simulation calls the model, gets forces, nudges every atom a femtosecond forward, and calls the model again, millions of times.

The training labels come from density functional theory, a quantum-mechanics simulator that computes the same energy from first principles. It is accurate and brutally slow — CPU-hours per snapshot. The MLIP is a learned surrogate for it, three to six orders of magnitude faster. That is the entire pitch of the field.

Here is the map.

| The stack you know | The MLIP stack |
|---|---|
| token | atom |
| vocabulary, ~50,000–200,000 entries | element vocabulary, ~100 entries |
| token embedding lookup | element embedding lookup |
| positional encoding | edge geometry: distance through a radial basis, direction through spherical harmonics |
| sliding-window / block-sparse attention | cutoff neighborhood, 5–6 angstroms, ~20–80 neighbors per atom |
| transformer layer | message-passing block |
| depth × window = receptive field | rounds × cutoff = receptive field |
| pooling / LM head | per-atom readout, summed to one scalar |
| foundation model, then fine-tune | same |
| mixture of experts | UMA's mixture of linear experts |

## Atoms and tokens

A token is an integer index into an embedding table. So is an atom. Its atomic number — 1 for hydrogen, 8 for oxygen, 79 for gold — indexes a learned embedding table with about a hundred rows, one per chemical element. There is no tokenizer, no BPE, no vocabulary politics. The lookup is the same `nn.Embedding` you already have, producing an initial feature per atom of shape `[N, k]` — for the running example below, `[5000, 128]`.

The proportions are inverted, though. In a language model the token identity carries nearly all the information and position is a correction term; the embedding table is a large fraction of the parameters. In an MLIP the identity is one of a hundred integers and carries almost nothing. Two carbon atoms are interchangeable. Everything that matters is in the positions — continuous, three-dimensional, changing every step. The embedding table is a rounding error in the parameter count, and the "positional encoding" is where the real machinery lives.

## The neighborhood is the attention window

MLIPs bet on locality. The total energy is written as a sum of per-atom contributions,

    E = ε₁ + ε₂ + ... + ε_N,

where each atom's contribution depends only on its neighbors within a cutoff radius, typically 5 to 6 angstroms (an angstrom is 10⁻¹⁰ meters, written Å; a chemical bond is 1 to 2 of them). Physics justifies the bet: interatomic interactions decay fast with distance, so a hard window loses little. Compare a language model, where the token that resolves a pronoun may sit ten thousand positions back. Sliding-window attention is a compromise in an LLM. In an MLIP it is close to the truth for neutral bulk matter — charged, polar, and interfacial systems carry real electrostatics past any cutoff, and correcting for that is an active research front we return to at the end.

The window is built explicitly, as a data structure. A neighbor-list pass finds every pair of atoms within the cutoff. The naive way — measure all N²/2 distances — is quadratic in atom count. Instead, cell lists: chop the box into a grid of cubes each at least one cutoff wide, bin every atom in one O(N) pass, then for each atom look only in its own cube and the 26 touching it. Every true neighbor lives in that 27-cube shell. The result is a graph in the exact layout PyTorch Geometric uses: `edge_index` of shape `[2, E]`, where column `e` holds a directed edge `(i, j)` from center atom `i` to neighbor `j`. Both `(i,j)` and `(j,i)` appear. For a 5,000-atom box of liquid water at a 6 Å cutoff, each atom has roughly 85 neighbors — water runs about 0.1 atoms per cubic angstrom and a 6 Å sphere holds about 900 Å³ — so `E ≈ 400000`. This graph is the attention mask, materialized, and it is recomputed as atoms move. If you have implemented block-sparse attention, you have already built the shape of this thing.

Each edge then gets features, and this is the positional-encoding row of the table. Split the edge's displacement vector into its length and its orientation and handle each. The length passes through a **radial basis** — a bank of Gaussian or Bessel bumps spread across the cutoff, a soft one-hot over distance, `[E, 8]` — and then a small MLP whose output supplies the per-path weights the interaction layer needs. The direction, a unit 3-vector, passes through **spherical harmonics**: fixed polynomials of the direction's components, the natural basis for functions on a sphere the way sines and cosines are the basis on a circle. They come in groups indexed by an integer `l`. Group `l` has `2l + 1` functions: `l = 0` is one constant (the scalar), `l = 1` is three (the components of the unit vector itself), `l = 2` is five, `l = 3` is seven. Models evaluate them up to a maximum order called `l_max`, typically 1 to 3. For `l_max = 3` that is `1 + 3 + 5 + 7 = 16` numbers per edge — this is `(l_max + 1)²`. Where a transformer encodes "position 4,096 in the sequence," an MLIP encodes "2.3 angstroms away, in this direction" — a relative encoding, closer in spirit to RoPE than to absolute positions, because physics does not care where the origin is.

> **[FIG]** One atom at center with its cutoff sphere; neighbors inside drawn as graph edges, atoms outside grayed out. An inset shows one edge decomposed into a distance (radial basis bumps) and a direction (a small spherical-harmonic lobe diagram, annotated with the 1/3/5/7 multiplicities).

## Layers are message-passing rounds

A message-passing block is a transformer layer with the attention pattern pinned to the neighbor graph. It plays the role attention plays, and it burns most of the compute. Four steps.

**Gather.** For each edge, fetch the sending atom's current feature vector: `sender = node_feats[edge_index[1]]`, shape `[E, k] = [400000, 128]`. This is a memory-bound gather that materializes a `[E, k]` tensor — about 200 MB in fp32.

**Tensor product.** Each edge now holds the neighbor's features and the edge's 16 spherical-harmonic numbers, gated by the radial weights. The model combines them. In equivariant models this is a tensor product of the two — with the radial MLP's output supplying the weights per allowed path. The result is a message: `[E, k']` typed channels.

**Scatter.** The messages arriving at each atom are summed onto it: `scatter_add(messages, edge_index[0], dim_size=N)`, shape `[N, k']`. This is the transpose of the gather — memory-bound, with atomic-add contention when many edges hit one atom. Summing, not mean or attention, hard-codes extensivity (below) and stays permutation-invariant: reorder an atom's neighbors and the sum is unchanged, as it must be, since atoms have no order.

**Update.** A per-atom MLP folds the aggregated messages back into each atom's feature vector, `[N, k]`.

Edge-wise compute, aggregate, node-wise update: read attention, then MLP, and you will not be far wrong. The gather and scatter are the memory-traffic backbone, and they are why MLIP inference looks like graph processing, not like a dense transformer. Some newer families — EquiformerV2, eSEN — make the correspondence literal and run genuine attention within each neighborhood.

Depth buys reach, exactly as it does for windowed attention. After one round, an atom's features have seen 6 Å out. When a second round gathers from those same neighbors, each neighbor is now carrying a summary of *its* neighbors out to 6 Å, so information reaches from as far as 12 Å away:

    receptive field = L × cutoff

Most models run 2 to 5 rounds. The family tree is mostly variations on this block. SchNet, the 2017 ancestor, uses distances only — no directions — and invariant scalar features. NequIP made the features equivariant (more on what that costs you in break three). MACE builds symmetrized many-body products inside each layer, taking products of the aggregated features with themselves so a single layer captures interactions among three and four atoms at once — "I have two neighbors 104 degrees apart," exactly a water molecule's H–O–H angle — and it gets away with just two layers. Allegro refuses to pass messages at all: each edge is processed to full depth independently, so the receptive field is exactly one cutoff, period. That sounds like a limitation. In the multi-node section it becomes the selling point.

## The head sums instead of pools

After the last block, take only the scalar (`l = 0`) channels of each atom's features — a rotation-invariant energy must be built from invariant quantities — and pass them through a small readout MLP to one number: that atom's energy contribution. Sum the contributions and you have the total energy. Where a classification head pools token states and projects to logits, this head reduces by plain summation, which hard-codes a physical fact called extensivity: two non-interacting copies of a system must have exactly twice the energy. Mean-pooling would get this wrong. Summing cannot.

One number in the sum is bigger than everything else: each element carries a fixed reference energy, roughly the energy of that atom alone in a vacuum, added per atom of that element. These baselines dominate the raw magnitude — think of a bias so large the network only ever learns the residual on top of it. The interesting chemistry, the part the network actually models, is a small correction to a big constant. The forward pass then collapses a 5,000-atom, 400,000-edge computation to a single float — and that collapse is what makes the next stage the expensive one.

The training economics rhyme with what you know. Labels are expensive (DFT compute instead of human annotation), so the field consolidated on the same play: pretrain big on pooled public datasets, fine-tune on your niche. Bespoke potentials for a single material run 10⁵ to 10⁶ parameters. Foundation models run larger: MACE-MP-0 medium is 4.7M; UMA-medium reaches 1.4 billion total, though its routing activates only about 50 million per structure. UMA, Meta FAIR's universal model, even imports the MoE trick: an eSEN-style backbone carries a mixture of linear experts, where a routing decision conditioned on the dataset/task and the system's charge and spin selects a blend of expert weight matrices. The routing happens once per system, not per atom, and the chosen experts merge into a single linear map before the forward pass — capacity scaling without token-level routing overhead. It is trained across five FAIR datasets, about 500 million structures.

## Sidebar: the cutoff envelope

The radial basis has one detail that is not cosmetic. The cutoff makes the energy a function with a boundary: a neighbor at 4.99 Å contributes, one at 5.01 Å does not. So the basis is multiplied by a smooth envelope that falls to exactly zero at the cutoff.

```python
class RadialBasis(nn.Module):
    def __init__(self, n_rbf, cutoff):
        super().__init__()
        self.register_buffer("centers", torch.linspace(0.0, cutoff, n_rbf))
        self.gamma  = (n_rbf / cutoff) ** 2      # width ~ center spacing
        self.cutoff = cutoff

    def forward(self, d):                                    # d: [E]
        g = torch.exp(-self.gamma * (d[:, None] - self.centers) ** 2)  # [E, n_rbf]
        env = 0.5 * (torch.cos(torch.pi * d / self.cutoff) + 1.0)      # [E]
        return g * env[:, None]
```

If the contribution did not taper to zero, an atom drifting across the boundary would make the energy jump discontinuously. Forces are the derivative of the energy — and the derivative of a jump is a spike. One atom crossing the cutoff would kick the simulation with a nonsense force, and molecular dynamics integrates every kick. The cosine envelope makes the contribution and its derivative go smoothly to zero, so atoms enter and leave neighborhoods without anyone feeling a seam. This is also what makes the neighbor-list "skin" trick safe: build the list out to the cutoff plus a margin and reuse it for many steps, and a pair crossing the true cutoff contributes zero and zero derivative until the list rebuilds.

## Sidebar: forces come out of the backward pass

Almost nobody wants the energy alone. They want forces — which way, and how hard, each atom is being pushed — because forces are what you integrate to move atoms. Classical potentials derive force expressions by hand. We have autograd.

```python
def energy_and_forces(model, Z, R, batch, training=False):
    R = R.requires_grad_(True)
    E = model(Z, R, batch)
    # E.sum() is safe: structure b's energy doesn't depend on structure c's atoms,
    # so the gradient lands on the right atoms regardless
    F = -torch.autograd.grad(E.sum(), R, create_graph=training)[0]   # [N, 3]
    return E, F
```

The force is a gradient, so producing it means backpropagating through the whole network on every single call. Inference includes a backward pass. `create_graph=training` is the second flag that matters: at training time the backward pass must itself build a graph, because the loss includes a force term and the force is already a first derivative — getting a weight gradient out of it means differentiating a gradient, a second-order pass. Forget `create_graph=True` and you get the classic silent bug: the loss goes down, but the force term contributes no weight gradients at all.

## Break 1: the output comes out of the backward pass

The model's forward pass produces energy. Nobody running a simulation wants energy. They want forces — and in most MLIPs, forces are not predicted. They are computed, as the autograd gradient of the energy with respect to the input positions.

Every production inference is a forward pass and a backward pass. There is no `torch.no_grad()`, no inference mode, no eval-time autograd teardown. Input positions require gradients; the backward graph is built and traversed on every single MD step, millions of times per simulation. It also holds the forward activations — the `[E, k]` edge tensors from every layer — in memory to differentiate through them, so the memory high-water mark of "inference" here is training-shaped. Your mental model of "inference = forward" is simply wrong here, and every serving decision downstream of it — memory budget, latency estimate, graph capture strategy — inherits the error.

Training compounds it. The loss is a weighted sum of energy error, force error, and stress error, and the force weight is set high because forces are what the simulation consumes. But the predicted force is itself a gradient. Backpropagating the force loss to the weights means differentiating a gradient — the double-backward path — for roughly 2 to 3 times the memory and time of energy-only training. When your fine-tuning tool OOMs at a batch size that "should" fit, this is why. (The companion piece takes up the rest of the fine-tuning story — reference energies, replay, loss weighting.)

Why tolerate any of this? Because a force field obtained as the gradient of a scalar is *conservative*: the work it does around any closed loop of positions is zero, so energy is conserved by construction, up to integrator error. Some models skip the backward pass and bolt on a direct force head — three outputs per atom, roughly half the per-step cost and memory because you never differentiate. Orb-v3 ships direct and conservative variants side by side; released UMA and eSEN are conservative-only — they train with a direct head internally but remove it, releasing conservative checkpoints. Which family exposes which changes release to release; check before you build a serving path around one. The direct head is faster. But an arbitrary per-atom 3-vector field is not the gradient of anything, and the discrepancy acts like a tiny hidden thermostat: over a long simulation, energy drifts. Whether that trade is acceptable is a physics decision your users make — but your serving stack has to support both paths.

## Break 2: no autoregression, no KV cache

An LLM decodes a sequence and caches its past; each new token costs one incremental slice of compute. An MD loop has the same sequential outer shape — the model's output feeds its next input — but nothing carries over. Every step recomputes every atom from scratch. Prior activations are useless because every position moved.

But look at how little they moved. One femtosecond of thermal motion displaces an atom by thousandths of an angstrom, against a 5-angstrom cutoff. The graph is nearly identical to last step's. The activations are nearly identical. Step after step, the model does complete work on an input that is 99-plus percent the same as the one it just processed. The workload looks ready-made for caching, and the field, for the most part, does not cache it.

The one exception, universal and old, lives below the model: the skin distance. The neighbor list is built out to the cutoff plus a margin — the skin — and reused, step after step, until some atom has moved half the skin distance and the list can no longer be trusted. That amortizes graph construction. Nothing amortizes the network itself, and there is a hard obstacle in the way of anything that tries: every atom moves every step, so no neighborhood is exactly unchanged, and the quantity consumed is a gradient — the output least tolerant of approximation, since MD integrates force error into drift. Whether any incremental scheme can beat honest recomputation is an open question, not a plan.

## Break 3: hidden states carry geometry

An LLM's hidden state is an unstructured vector; any layer that maps vectors to vectors is fair game. The hidden state of an equivariant MLIP is not unstructured. Rotate the input molecule and the internal features must rotate with it, in lockstep, so that the predicted forces come out rotated by exactly the same amount. This is enforced by the architecture, not learned from augmentation.

Concretely, in e3nn-style models (NequIP, MACE, Allegro), each atom's feature is a bundle of typed segments called irreps: order-0 pieces are scalars, unchanged by rotation; order-1 pieces are true 3-vectors whose three numbers transform like a spatial direction; order-2 pieces are 5-number objects with their own rotation rule. Combining two typed pieces into a third follows a fixed algebra — the Clebsch–Gordan tensor product — and that product, evaluated across every edge of the graph, is the hot kernel of these models. It is the only bilinear operation that mixes geometry into features while keeping every channel's rotation type honest; that is why it is not optional. NVIDIA's cuEquivariance ships fused implementations, with MACE and NequIP integrations.

The engineering consequence: you cannot insert an arbitrary layer. LayerNorm across a vector piece's three components breaks the rotation rule. An element-wise ReLU on those components breaks it. Standard dropout breaks it. Equivariant models apply nonlinearities to scalar pieces only and let scalars gate the magnitudes of the higher-order pieces. If you build optimization tooling — fusion passes, quantization, pruning, adapter injection — the typed structure is a correctness constraint, and violating it does not throw an error. It produces a model whose forces silently depend on how the molecule happens to be oriented in space.

> **[FIG]** Side-by-side: a molecule and its per-atom feature bundle (scalar / vector / order-2 segments drawn as differently shaped slots), then the same molecule rotated 90 degrees with each feature segment transformed by its own rule — scalars fixed, vector segments rotated.

## Break 4: tiny model, huge irregular input

Every serving intuition you have was formed on models with billions of parameters and small, regular inputs. Flip both. A bespoke MLIP has 10⁵ to 10⁶ parameters and most foundation checkpoints sit under 10⁸ active — small enough to nearly live in L2 cache (UMA-medium's 1.4 billion total is the exception, though even it activates only ~50 million per structure) — while the input is a graph of thousands to millions of atoms with 20 to 80 edges each, and its shape changes every step.

So the workload inverts. Weight-loading bandwidth, the thing that dominates LLM decode, is irrelevant. What the GPU actually does is gather features along hundreds of thousands of edges, run small matrix multiplies on them, and scatter-add the results back onto atoms. Scatter/gather plus many small GEMMs, memory-bound and irregular — not the few large GEMMs your batching instincts were trained on. And because the arithmetic per kernel is small, at small atom counts you are launch-bound, not compute-bound: the GPU spends its time starting kernels, not running them. This is why `torch.compile`, CUDA graphs, and kernel fusion matter more here than raw FLOPs would suggest. Batching exists but looks different: multiple systems concatenate into one big disconnected graph, the same trick as packing sequences with a block-diagonal attention mask.

The dynamic shapes hurt most. Atom count is fixed within a simulation, but edge count fluctuates every time the neighbor list rebuilds. `torch.compile` and CUDA graphs want static shapes; a shape that changes every few steps means recompilation stalls or graph re-capture, and either can eat the model's entire speed advantage. The working mitigation is padding to size buckets — round the edge count up to one of a few fixed sizes, mask the padding, recompile only on bucket promotion. If you have served dynamic-batch LLM inference, you have played this exact game with sequence lengths. Here it is per-step, inside a hot loop, forever.

## Break 5: the eval is physics, not perplexity

An LLM ships when perplexity and benchmark scores clear a bar, and a mildly degraded model is mildly worse. An MLIP's real acceptance test is behavioral: run constant-energy molecular dynamics for millions of femtosecond steps and watch whether the total energy stays flat. Small force errors do not average away over a trajectory; correlated ones accumulate, and a simulation that slowly heats itself is not slightly wrong — it is garbage, and sometimes it detonates outright, atoms flying apart mid-run.

This is why the field is conservative — in both senses — about numerics. fp32 is the standard; the casual mixed-precision defaults of LLM land do not carry over. TF32 matmuls, silently enabled on Ampere and later, inject exactly the kind of low-amplitude force noise that long MD is sensitive to — turn them off before you benchmark accuracy. Tight structure relaxations, which chase force norms down to near zero, sometimes want fp64. And it is why the conservative-versus-direct force choice from break 1 resurfaces here: a direct-force model can post a better force error on a static test set and still lose in deployment, because its errors do not integrate to zero. Any eval harness you build must include a short stability run — force MAE alone will pass models that fail in production.

## Two facts the analogy hides

The map above gets you reading these codebases quickly. Two things it does not surface will bite a team that builds both inference and fine-tuning tooling.

**The inference fast path and the fine-tuning path conflict.** The wins at inference time are cuEquivariance's fused tensor-product kernels plus `torch.compile` or CUDA-graph capture. The win at training time is the double-backward that force-label fine-tuning requires — you cannot train on forces without differentiating a gradient. These do not currently compose. The fused, compiled path does not support the second-order backward that force training needs (see NVIDIA's cuEquivariance issue #268), so the exact kernels that make inference fast often have to be dropped or run eager for fine-tuning. If you are standing up both an inference-speedup library and a fine-tuning service against the same checkpoints, you are maintaining two code paths through the hot kernel, not one.

**Short-range MLIPs miss long-range electrostatics by default.** The locality bet from the neighborhood section is a bet, and it loses exactly where charge does not stay local. A hard cutoff at 6 Å cannot see the Coulomb interaction between two ions 20 Å apart, and for charged, polar, and interfacial systems that interaction is real physics, not noise. This is a known default limitation, and patches exist — latent Ewald summation, PME-style message passing that carries a long-range term alongside the short-range graph. It is worth naming precisely where the map touts UMA's total-charge and spin inputs: those inputs let the model *condition* on global charge state, but conditioning the routing is not the same as summing the electrostatics, and a short-range backbone still needs the long-range correction bolted on to get interfaces right.

## What this means for the tools you build

**Serving.** The de facto interfaces are the ASE `Calculator` (`get_potential_energy`, `get_forces`) and LAMMPS pair styles, and the workload is a hot loop, not a request stream: latency per call is the metric, steps cannot be batched across time because each consumes the last one's output, and throughput comes from running many simulations in parallel. Provision for forward *plus backward* on every call, plus the direct-force fallback path for users who choose speed over conservation.

**Multi-node.** Big systems split across GPUs by spatial domain decomposition, and each domain must hold ghost copies of neighboring atoms out to the model's receptive field. Rounds times cutoff sets the halo width: more rounds, fatter halos, more communication, worse scaling. This is why strictly local Allegro scales across nodes the way deep message-passers cannot, and why "how many rounds" is an infrastructure question, not just an accuracy one.

**Speed.** The wins live in kernels and shape discipline: fused equivariant tensor products, bucket-padded compilation, neighbor-list tuning. The almost-cache from break 2 remains unclaimed. And the fast path conflicts with the training path — budget for both.

The map earns its keep both ways. The matches mean your instincts about embeddings, sparse attention, receptive fields, and fine-tuning pipelines mostly hold, and you can navigate these codebases on day one. The breaks mean the surrounding infrastructure cannot be ported from the LLM stack — it has to be built. That is the job.
