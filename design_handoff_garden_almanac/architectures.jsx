// Architectures — section 06.
// Single editorial page: a working glossary of the model families the catalog
// uses. No per-architecture detail pages at v1; capsule treatments only.
// Family designation comes from MODEL_TRAINING_DATA (defined in datasets.jsx);
// Earlier Generations uses an explicit roster since it overlaps with families.

// Year + params for every catalog model. Used to render the
// "Models in this family" tables. (Year = first public release of the
// architecture, not of any specific weight checkpoint.)
const MODEL_META = {
  'NequIP':       { year:2021, params:'2.5M',  slug:'nequip' },
  'Allegro':      { year:2022, params:'8.0M',  slug:'allegro' },
  'MACE-MP-0':    { year:2023, params:'4.7M',  slug:'mace-mp-0' },
  'MACE-OFF23':   { year:2023, params:'4.7M',  slug:'mace-off23' },
  'MACE-Large':   { year:2024, params:'15.6M', slug:'mace-large' },
  'EquiformerV2': { year:2023, params:'153M',  slug:'equiformerv2' },
  'eSCN-L6':      { year:2022, params:'200M',  slug:'escn-l6' },
  'SCN':          { year:2022, params:'87M',   slug:'scn' },
  'UMA Medium':   { year:2026, params:'1.4B',  slug:'uma-medium' },
  'UMA Small':    { year:2026, params:'420M',  slug:'uma-small' },
  'TorchMD-Net':  { year:2022, params:'7.0M',  slug:'torchmd-net' },
  'Orb-v2':       { year:2024, params:'25M',   slug:'orb-v2' },
  'Orb-v3':       { year:2025, params:'48M',   slug:'orb-v3' },
  'SchNet':       { year:2017, params:'1.7M',  slug:'schnet' },
  'PaiNN':        { year:2021, params:'14M',   slug:'painn' },
  'DimeNet++':    { year:2020, params:'10M',   slug:'dimenetpp' },
  'GemNet-T':     { year:2021, params:'31M',   slug:'gemnet-t' },
  'GemNet-OC':    { year:2022, params:'38M',   slug:'gemnet-oc' },
  'ANI-2x':       { year:2020, params:'1.5M',  slug:'ani-2x' },
  'M3GNet':       { year:2022, params:'0.2M',  slug:'m3gnet' },
  'CHGNet':       { year:2023, params:'0.4M',  slug:'chgnet' },
  'MatterSim-v1': { year:2024, params:'182M',  slug:'mattersim-v1' },
};

// Family rosters. Equivariant excludes ACE-lineage models (NequIP, Allegro, MACE)
// since ACE is treated as a sibling cluster on the Map.
const FAM_EQUIV = ['EquiformerV2','eSCN-L6','SCN','TorchMD-Net','UMA Small','UMA Medium'];
const FAM_ACE   = ['NequIP','Allegro','MACE-MP-0','MACE-OFF23','MACE-Large'];
const FAM_MPNN  = ['SchNet','PaiNN','DimeNet++','GemNet-T','GemNet-OC','ANI-2x','M3GNet','CHGNet','MatterSim-v1'];
const FAM_VANILLA = ['Orb-v2','Orb-v3'];
const FAM_EARLIER = ['SchNet','DimeNet++','GemNet-T','ANI-2x'];

const FAMILIES = [
  {
    id: 'equivariant',
    name: 'Equivariant Models',
    descriptor: 'Models that respect the symmetries of three-dimensional space by construction.',
    body: (
      <>
        <p style={{margin:'0 0 6px'}}>
          Equivariant networks build SO(3) rotational symmetry directly into their
          layers, propagating tensor representations of various angular-momentum
          orders rather than relying on data augmentation to teach the model
          that rotated molecules are still molecules. The promise is precise:
          predictions transform correctly under rotation by{' '}
          <span className="it">construction</span>, not by training. Canonical
          examples are{' '}
          <a className="ink-link it" href="https://www.nature.com/articles/s41467-022-29939-5">Batzner et al.,
          NequIP</a>{' '}and{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/2306.12059">Liao et al.,
          EquiformerV2</a>. The tradeoff is cost: the operations that preserve
          equivariance are more expensive than their unconstrained counterparts,
          and large models in this family demand significant GPU memory.
        </p>
      </>
    ),
    models: FAM_EQUIV,
  },
  {
    id: 'ace',
    name: 'Atomic Cluster Expansion',
    descriptor: 'A specific equivariant formalism, expanding atomic environments into a body-ordered basis.',
    body: (
      <>
        <p style={{margin:'0 0 6px'}}>
          ACE-based models are technically equivariant but represent a distinct
          lineage with their own basis functions, body-order construction, and
          training conventions. The original formulation is{' '}
          <a className="ink-link it" href="https://journals.aps.org/prb/abstract/10.1103/PhysRevB.99.014104">Drautz,
          Atomic Cluster Expansion</a>{' '}(2019); the modern message-passing
          variant is{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/2206.07697">Kovács et al.,
          MACE</a>. The catalog's ACE cluster on the Map (NequIP, Allegro, MACE)
          reflects this lineage; readers will see overlap with the Equivariant
          family above and that overlap is real. We list ACE separately because
          the embedding clusters do — and because, in practice, the basis
          choice matters more than the equivariant label suggests.
        </p>
      </>
    ),
    models: FAM_ACE,
  },
  {
    id: 'mpnn',
    name: 'Message-Passing Neural Networks',
    descriptor: 'The earlier and more general family — atoms exchange messages with neighbors over multiple rounds.',
    body: (
      <>
        <p style={{margin:'0 0 6px'}}>
          Message-passing networks treat atoms as graph nodes and propagate
          information along bonds (or near-neighbor edges) over several rounds
          of aggregation. The earliest broadly-adopted example is{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/1706.08566">Schütt
          et al., SchNet</a>; later refinements added directional information
          (DimeNet, GemNet) and equivariant message channels (PaiNN,
          TorchMD-Net, GemNet-OC), yielding a continuum from this family
          to the equivariant successors above. The headline reference for the
          modern direction is{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/2106.08903">Gasteiger
          et al., GemNet</a>. Cheap, well-understood, and the workhorse for
          everything from QM9 to large-scale catalysis.
        </p>
      </>
    ),
    models: FAM_MPNN,
  },
  {
    id: 'vanilla',
    name: 'Vanilla / Direct-Prediction',
    descriptor: 'Architectures that don\u2019t impose equivariance as a hard constraint.',
    body: (
      <>
        <p style={{margin:'0 0 6px'}}>
          Direct-prediction models trade the equivariance guarantee for raw
          throughput. The headline example is the Orb family, which uses an{' '}
          <span className="it">equigrad</span> training-time regularizer to
          encourage rotational consistency without enforcing it in the
          architecture. See{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/2410.22570">Neumann
          et al., Orb</a>{' '}and the v3 follow-up{' '}
          <a className="ink-link it" href="https://arxiv.org/abs/2504.06231">Rhodes
          et al., Orb-v3</a>. What's gained is wall-clock speed (often
          2–4× over equivariant siblings on the same hardware); what's risked
          is sporadic violations of physical consistency that can surface at
          long simulation timescales. Worth the tradeoff for many
          screening-scale workloads, less defensible for production MD.
        </p>
      </>
    ),
    models: FAM_VANILLA,
  },
  {
    id: 'earlier',
    name: 'Earlier Generations',
    descriptor: 'Architectures from before the current scale era — included for historical orientation.',
    body: (
      <>
        <p style={{margin:'0 0 6px'}}>
          Some catalog entries come from a period when MLIPs were small,
          single-purpose, and trained on one chemistry domain at a time. SchNet,
          DimeNet++, GemNet-T, and ANI-2x are listed here as historical anchors.
          Their inclusion in the catalog is partly archival and partly
          practical: they remain the most widely cited baselines, and recent
          papers continue to benchmark against them. This capsule overlaps with
          the Message-Passing family above and that overlap is intentional —
          the lineage matters, even when the architecture name is the same.
        </p>
      </>
    ),
    models: FAM_EARLIER,
  },
];

function ArchitecturesPage({ side = 'left' } = {}){
  const isLeft = side === 'left';
  const families = isLeft
    ? FAMILIES.slice(0, 3)   // Equivariant, ACE, Message-Passing
    : FAMILIES.slice(3);     // Vanilla, Earlier Generations

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>{isLeft ? 'Garden · thegardens.ai' : 'Architectures · continued'}</span>
        <span>{isLeft ? 'Architectures' : `§05 → §06 · ${FAMILIES.length} families`}</span>
      </div>

      {isLeft ? (
        <>
          {/* Title block + cartouche */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 72px', gap:14, alignItems:'end', marginTop:4}}>
            <div>
              <div className="sc" style={{fontSize:11.5, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
                §06
              </div>
              <h1 style={{fontFamily:'var(--serif)', fontSize:42, lineHeight:1.0, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
                Architectures
              </h1>
              <div className="it" style={{fontSize:14, color:'var(--ink-2)', marginTop:4, lineHeight:1.4}}>
                A short field guide to the families of models in the catalog.
              </div>
            </div>
            <LatticeCartouche/>
          </div>
          <div style={{marginTop:6}}>
            <Ornament.Rule width={220}/>
          </div>

          {/* Editorial preface */}
          <div style={{maxWidth:640, fontSize:12, lineHeight:1.4, color:'var(--ink)', marginTop:6}}>
            <p style={{margin:0}}>
              A working vocabulary for reading the rest of the Almanac, not a
              tutorial. Representational similarity tracks training data more
              reliably than architecture (per §02), but architecture still
              shapes what a model can learn. The five families below are the
              ones the catalog uses; for broader treatment, see Behler's MLIP
              reviews and{' '}
              <a className="ink-link it" href="https://arxiv.org/abs/2401.00096">Batatia
              et al., Foundation models for atomistic simulation</a>.
            </p>
          </div>

          <hr className="hairline" style={{margin:'8px 0 2px'}}/>
        </>
      ) : (
        <>
          <div style={{marginTop:4}}>
            <div className="sc" style={{fontSize:11.5, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
              §06 · continued
            </div>
            <h1 style={{fontFamily:'var(--serif)', fontSize:32, lineHeight:1.05, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
              Architectures
            </h1>
            <div className="it" style={{fontSize:13, color:'var(--ink-2)', marginTop:3, lineHeight:1.4}}>
              Two families that sit slightly outside the main lineage — and a
              note on cross-linking from model pages.
            </div>
          </div>
          <hr className="hairline" style={{margin:'8px 0 4px'}}/>
        </>
      )}

      {/* Family capsules */}
      <div style={{flex:1}}>
        {families.map((f, i) => (
          <FamilyCapsule key={f.id} f={f} divider={i < families.length - 1}/>
        ))}

        {!isLeft && (
          <div style={{marginTop:14}}>
            <hr className="hairline" style={{margin:'4px 0 8px'}}/>
            <div className="sc" style={{
              fontFamily:'var(--smallcaps)', fontSize:10.5,
              letterSpacing:'0.10em', color:'var(--ink)',
              marginBottom:5,
            }}>
              On cross-linking
            </div>
            <div style={{fontSize:12, lineHeight:1.45, color:'var(--ink-2)', maxWidth:640}}>
              Each capsule's table links to the corresponding model detail
              page; inline citations link to the canonical papers; and each
              model detail page links back to its family's capsule on this
              page via anchor (e.g., <span className="mono" style={{fontSize:11}}>/architectures#equivariant</span>).
              The five anchors are{' '}
              {FAMILIES.map((f,i)=>(
                <React.Fragment key={f.id}>
                  {i>0 && ', '}
                  <a className="ink-link" href={`/architectures#${f.id}`}>{f.id}</a>
                </React.Fragment>
              ))}.
            </div>
          </div>
        )}
      </div>

      <div className="folio">
        <span>§06 &middot; Architectures{isLeft ? '' : ' · ii'}</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

function FamilyCapsule({ f, divider }){
  const rows = [...f.models]
    .filter(name => MODEL_META[name])
    .map(name => ({ name, ...MODEL_META[name] }))
    .sort((a,b)=> a.year - b.year || a.name.localeCompare(b.name));

  return (
    <section id={f.id} style={{margin:'8px 0 0'}}>
      <h2 style={{
        fontFamily:'var(--serif)',
        fontSize:21, fontWeight:600, lineHeight:1.0,
        margin:'0', letterSpacing:'-0.003em',
      }}>
        {f.name}
      </h2>
      <div className="it" style={{fontSize:12.5, color:'var(--ink-2)', marginTop:1, marginBottom:4}}>
        {f.descriptor}
      </div>

      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 260px',
        columnGap:20,
        alignItems:'start',
      }}>
        <div style={{fontSize:11.75, lineHeight:1.4, color:'var(--ink)', maxWidth:560}}>
          {f.body}
        </div>

        <div>
          <div className="sc" style={{
            fontFamily:'var(--smallcaps)', fontSize:10.5,
            letterSpacing:'0.10em', color:'var(--ink)',
            paddingBottom:2, borderBottom:'0.5px solid var(--rule)',
            marginBottom:2,
          }}>
            Models in this family
          </div>
          <table className="almanac fam-table" style={{fontSize:11.5, marginTop:0}}>
            <tbody>
              {rows.map(r=>(
                <tr key={r.name}>
                  <td>
                    <a className="ink-link" href={`/model/${r.slug}`} style={{fontStyle:'italic'}}>{r.name}</a>
                  </td>
                  <td style={{width:46, textAlign:'right', fontVariantNumeric:'tabular-nums', color:'var(--ink-2)'}}>{r.year}</td>
                  <td style={{width:54, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{r.params}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {divider && <hr className="hairline" style={{margin:'7px 0 0'}}/>}
    </section>
  );
}

// Restrained taxonomic cartouche: a small lattice/graph motif. Geometric only.
function LatticeCartouche(){
  const s = 64;
  const c = s/2;
  // 7 nodes in a hexagonal lattice + center; lines connect each to center.
  const r = 22;
  const nodes = [];
  for (let i=0;i<6;i++){
    const a = (Math.PI/3)*i - Math.PI/2;
    nodes.push({ x: c + r*Math.cos(a), y: c + r*Math.sin(a) });
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{display:'block', marginLeft:'auto'}}>
      <circle cx={c} cy={c} r={s*0.46} fill="none" stroke="var(--ink)" strokeWidth="0.5"/>
      <circle cx={c} cy={c} r={s*0.40} fill="none" stroke="var(--ink)" strokeWidth="0.4"/>
      {/* edges from center to each ring node */}
      {nodes.map((p,i)=>(
        <line key={'e'+i} x1={c} y1={c} x2={p.x} y2={p.y} stroke="var(--ink)" strokeWidth="0.6"/>
      ))}
      {/* edges connecting ring nodes */}
      {nodes.map((p,i)=>{
        const q = nodes[(i+1)%6];
        return <line key={'r'+i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--ink)" strokeWidth="0.5"/>;
      })}
      {/* nodes */}
      {nodes.map((p,i)=>(
        <circle key={'n'+i} cx={p.x} cy={p.y} r="2.4" fill="#f4ede0" stroke="var(--ink)" strokeWidth="0.7"/>
      ))}
      <circle cx={c} cy={c} r="3.0" fill="var(--oxblood)" stroke="var(--ink)" strokeWidth="0.7"/>
    </svg>
  );
}

window.ArchitecturesPage = ArchitecturesPage;
window.MODEL_META = MODEL_META;
