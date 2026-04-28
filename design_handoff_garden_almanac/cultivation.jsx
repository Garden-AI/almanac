// Cluster Detail Page — one of N routes (/cluster/{slug}).
// Rendered from a structured Cluster record + a live supported-models feed +
// free-form "Running on" prose + free-form Notes marginalia + references.
// Princeton's Della is the worked example.

const CLUSTER_RECORDS = {
  della: {
    name: 'Della',
    institution: 'Princeton University · Research Computing',
    subtitle: "Princeton's general-purpose research cluster, with a mix of CPU and NVIDIA H100 GPU nodes.",
    specs: {
      Architecture:     'x86_64',
      'GPU types':      'NVIDIA H100 80GB; NVIDIA A100 80GB; some MIG-partitioned GPUs available',
      Scheduler:        'Slurm 23.11',
      'Operating institution': 'Princeton University',
      'Allocation model':      'Open to Princeton-affiliated researchers; collaborators by sponsorship',
      Documentation:    { kind:'link', label:'researchcomputing.princeton.edu/della', href:'https://researchcomputing.princeton.edu/systems/della' },
    },
    // Live Rootstock feed — verification status & install commands.
    // Sorted later by status (verified → stale → na), then by params desc.
    supported: [
      { model:'UMA Medium',    slug:'uma-medium',     family:'Equivariant',     params:'1.4B',  status:'verified', cmd:'rootstock install uma-medium --cluster della' },
      { model:'UMA Small',     slug:'uma-small',      family:'Equivariant',     params:'420M',  status:'verified', cmd:'rootstock install uma-small --cluster della' },
      { model:'EquiformerV2',  slug:'equiformerv2',   family:'Equivariant',     params:'153M',  status:'verified', cmd:'rootstock install equiformer-v2 --cluster della' },
      { model:'eSCN-L6',       slug:'escn-l6',        family:'Equivariant',     params:'200M',  status:'verified', cmd:'rootstock install escn-l6 --cluster della' },
      { model:'MatterSim-v1',  slug:'mattersim-v1',   family:'Message-Passing', params:'182M',  status:'verified', cmd:'rootstock install mattersim-v1 --cluster della --accept-license' },
      { model:'SCN',           slug:'scn',            family:'Equivariant',     params:'87M',   status:'verified', cmd:'rootstock install scn --cluster della' },
      { model:'Orb-v3',        slug:'orb-v3',         family:'Equivariant',     params:'48M',   status:'verified', cmd:'rootstock install orb-v3 --cluster della' },
      { model:'GemNet-OC',     slug:'gemnet-oc',      family:'Message-Passing', params:'38M',   status:'verified', cmd:'rootstock install gemnet-oc --cluster della' },
      { model:'GemNet-T',      slug:'gemnet-t',       family:'Message-Passing', params:'31M',   status:'verified', cmd:'rootstock install gemnet-t --cluster della' },
      { model:'Orb-v2',        slug:'orb-v2',         family:'Equivariant',     params:'25M',   status:'verified', cmd:'rootstock install orb-v2 --cluster della' },
      { model:'MACE-Large',    slug:'mace-large',     family:'ACE',             params:'15.6M', status:'verified', cmd:'rootstock install mace-large --cluster della' },
      { model:'PaiNN',         slug:'painn',          family:'Message-Passing', params:'14M',   status:'verified', cmd:'rootstock install painn --cluster della' },
      { model:'DimeNet++',     slug:'dimenetpp',      family:'Message-Passing', params:'10M',   status:'verified', cmd:'rootstock install dimenetpp --cluster della' },
      { model:'Allegro',       slug:'allegro',        family:'ACE',             params:'8.0M',  status:'verified', cmd:'rootstock install allegro --cluster della' },
      { model:'TorchMD-Net',   slug:'torchmd-net',    family:'Equivariant',     params:'7.0M',  status:'verified', cmd:'rootstock install torchmd-net --cluster della' },
      { model:'MACE-MP-0',     slug:'mace-mp-0',      family:'ACE',             params:'4.7M',  status:'stale',    cmd:'rootstock install mace-mp-0 --cluster della' },
      { model:'MACE-OFF23',    slug:'mace-off23',     family:'ACE',             params:'4.7M',  status:'verified', cmd:'rootstock install mace-off23 --cluster della' },
      { model:'NequIP',        slug:'nequip',         family:'Equivariant',     params:'2.5M',  status:'verified', cmd:'rootstock install nequip --cluster della' },
      { model:'SchNet',        slug:'schnet',         family:'Message-Passing', params:'1.7M',  status:'verified', cmd:'rootstock install schnet --cluster della' },
      { model:'ANI-2x',        slug:'ani-2x',         family:'Message-Passing', params:'1.5M',  status:'verified', cmd:'rootstock install ani-2x --cluster della' },
      { model:'CHGNet',        slug:'chgnet',         family:'Message-Passing', params:'0.4M',  status:'verified', cmd:'rootstock install chgnet --cluster della' },
      { model:'M3GNet',        slug:'m3gnet',         family:'Message-Passing', params:'0.2M',  status:'na',       cmd:null },
    ],
    // Free-form editorial — operational gotchas. The voice is sysadmin-direct.
    runningOn: [
      `Rootstock is installed at the cluster level. Load it before anything else with \`module load rootstock\`; this puts the right Python, CUDA toolchain, and the rootstock CLI on your PATH. The default toolchain is CUDA 12.4 against PyTorch 2.5; if you need an older combination, pass \`--toolchain cu118\` at install time.`,
      `The default queue is \`gpu-h100\`. For inference workloads on the smaller models (anything under ~150M parameters), use \`gpu-h100-shared\` and request a fraction of a GPU with \`--gres=gpu:1g.10gb\` (10GB MIG slice) or \`--gres=gpu:2g.20gb\`. Do not request a full H100 unless you actually need its memory; the queue is shared and your job will sit longer than necessary.`,
      `Outbound network from compute nodes is restricted to *.princeton.edu. Hugging Face downloads will fail at runtime. The fix is to fetch weights from the Garden cache at \`/scratch/gpfs/garden-cache\`: rootstock will pick this up automatically when \`GARDEN_CACHE=/scratch/gpfs/garden-cache\` is in your environment, which is set by the module file. Set it once in your \`~/.bashrc\` if you launch jobs without loading the module first.`,
      `One real gotcha: MACE on a MIG-partitioned GPU silently fails certain cuBLAS calls and returns NaN forces without crashing. If you are running any MACE variant, ask for a non-MIG slice (\`--gres=gpu:h100:1\` rather than a sharded request), or you will spend an afternoon debugging an "instability" that is actually the partition. This is tracked upstream and is expected to be fixed in cuBLAS 12.6.`,
    ],
    notes: `Della's Garden contact is Jenna Park (jpark@princeton.edu), who handles new-user onboarding for the MLIP stack. Maintenance windows are announced on the rcc-announce list — the next scheduled outage is the third weekend of May 2026 for a Slurm upgrade. Two known issues are being tracked: occasional NCCL hangs on multi-GPU jobs spanning more than a single node (workaround: pin to a single node with \`-N 1\`), and a slow filesystem on \`/scratch/gpfs\` during peak hours that affects checkpoint loading for the larger models. The cluster team is open to hosting new Garden-supported models on request; the lead time from request to verified install is typically two weeks.`,
    references: [
      { cite:'Princeton Research Computing — Della user documentation.', href:'https://researchcomputing.princeton.edu/systems/della' },
      { cite:'Slurm 23.11 reference manual.',                            href:'https://slurm.schedmd.com/documentation.html' },
      { cite:'Garden weight cache: /scratch/gpfs/garden-cache (read-only, refreshed nightly).', href:'/cluster/della#garden-cache' },
      { cite:'New-user onboarding: cses@princeton.edu.',                 href:'mailto:cses@princeton.edu' },
    ],
  },
};

const STATUS_ORDER = { verified: 0, stale: 1, na: 2 };
function paramsToFloat(s){
  const n = parseFloat(s);
  if (s.endsWith('B')) return n * 1000;
  return n; // already in M
}

function ClusterPage({ slug = 'della' }){
  const c = CLUSTER_RECORDS[slug] ?? CLUSTER_RECORDS.della;

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>Cluster · {c.name}</span>
      </div>

      {/* Title block */}
      <div style={{marginTop:4}}>
        <div className="sc" style={{fontSize:11.5, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
          {c.institution}
        </div>
        <h1 style={{fontFamily:'var(--serif)', fontSize:42, lineHeight:1.0, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
          {c.name}
        </h1>
        <div className="it" style={{fontSize:14, color:'var(--ink-2)', marginTop:4, lineHeight:1.4}}>
          {c.subtitle}
        </div>
        <div style={{marginTop:8}}>
          <Ornament.Rule width={220}/>
        </div>
      </div>

      {/* Body — main + right rail. On this side: Specs + Running on prose. */}
      <div className="cluster-body" style={{
        display:'grid',
        gridTemplateColumns: '1fr 220px',
        columnGap: 22,
        rowGap: 14,
        marginTop: 12,
        flex: 1,
      }}>
        <div>
          <ClusterSection heading="Specifications">
            <table className="almanac" style={{fontSize:12.5}}>
              <tbody>
                {Object.entries(c.specs).map(([k,v])=>(
                  <tr key={k}>
                    <td className="sc" style={{width:170, fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                      {k}
                    </td>
                    <td>{renderSpec(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ClusterSection>

          <div style={{height:10}}/>

          <ClusterSection heading={`Running on ${c.name}`}>
            <div style={{fontSize:12.5, lineHeight:1.45, color:'var(--ink)'}}>
              {c.runningOn.map((p,i)=>(
                <p key={i} style={{margin: '0 0 8px'}}>
                  {renderInline(p)}
                </p>
              ))}
              <div className="it" style={{fontSize:12, color:'var(--ink-2)', marginTop:4}}>
                Supported models, install commands, and verification status are on the facing page.
              </div>
            </div>
          </ClusterSection>
        </div>

        {/* Marginalia rail */}
        <ClusterRail notes={c.notes} references={c.references}/>
      </div>

      <div className="folio">
        <span>Cluster &middot; {c.name}</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

// Facing page: full supported-models table.
function ClusterSupportedPage({ slug = 'della' }){
  const c = CLUSTER_RECORDS[slug] ?? CLUSTER_RECORDS.della;
  const supported = [...c.supported].sort((a,b)=>{
    const ds = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (ds !== 0) return ds;
    return paramsToFloat(b.params) - paramsToFloat(a.params);
  });
  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Cluster · {c.name}</span>
        <span>Supported Models</span>
      </div>

      <div style={{textAlign:'center', marginTop:4}}>
        <div className="sc" style={{fontSize:13, letterSpacing:'0.16em', color:'var(--ink)'}}>
          Supported Models
        </div>
        <div className="it" style={{fontSize:13, color:'var(--ink-2)', marginTop:4}}>
          All Rootstock-supported MLIPs verified to run on {c.name}.
        </div>
        <hr className="hairline" style={{marginTop:10}}/>
      </div>

      <div style={{marginTop:14, flex:1}}>
        <table className="almanac" style={{fontSize:12.25}}>
          <thead>
            <tr>
              <th>Model</th>
              <th style={{width:140}}>Family</th>
              <th style={{width:74, textAlign:'right'}}>Params</th>
              <th style={{width:54, textAlign:'center'}}>Status</th>
              <th>Install command</th>
            </tr>
          </thead>
          <tbody>
            {supported.map(s=>(
              <tr key={s.model}>
                <td>
                  <a className="ink-link" href={`/model/${s.slug}`} style={{fontStyle:'italic'}}>{s.model}</a>
                </td>
                <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                  {s.family}
                </td>
                <td style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{s.params}</td>
                <td style={{textAlign:'center'}}>
                  <StatusGlyph status={s.status}/>
                </td>
                <td>
                  {s.cmd
                    ? <span className="mono" style={{fontSize:10.75}}>{s.cmd}</span>
                    : <span className="it" style={{color:'var(--ink-3)', fontSize:11.5}}>not applicable</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="it" style={{fontSize:11.5, color:'var(--ink-2)', marginTop:6}}>
          Status reflects the most recent automated test, run nightly.{' '}
          <a className="ink-link" href="/compatibility">See the Compatibility Matrix for the full grid →</a>
        </div>
      </div>

      <div className="folio">
        <span>Cluster &middot; {c.name} · Supported</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

function ClusterSection({ heading, sub, children }){
  return (
    <section>
      <div className="sc" style={{
        fontFamily:'var(--smallcaps)',
        fontSize:12.5, letterSpacing:'0.10em',
        color:'var(--ink)',
        borderBottom: '1.5px solid var(--ink)',
        paddingBottom: 4,
      }}>{heading}</div>
      {sub && <div className="it" style={{fontSize:12, color:'var(--ink-2)', marginTop:4}}>{sub}</div>}
      <div style={{marginTop:6}}>{children}</div>
    </section>
  );
}

function renderSpec(v){
  if (v && typeof v === 'object' && v.kind === 'link'){
    return <a className="ink-link" href={v.href}>{v.label}</a>;
  }
  return v;
}

// inline backtick → <code>
function renderInline(text){
  const out = [];
  let i = 0, key = 0;
  const re = /`([^`]+)`/g;
  let m;
  while ((m = re.exec(text)) !== null){
    if (m.index > i) out.push(<span key={key++}>{text.slice(i, m.index)}</span>);
    out.push(<span key={key++} className="mono" style={{fontSize:'0.92em', background:'rgba(26,22,18,0.04)', padding:'0 3px'}}>{m[1]}</span>);
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push(<span key={key++}>{text.slice(i)}</span>);
  return out;
}

function ClusterRail({ notes, references }){
  return (
    <aside className="cluster-rail" style={{
      borderTop: '0.5px solid var(--rule)',
      borderBottom: '0.5px solid var(--rule)',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 14,
      borderLeft: '0.5px solid var(--rule-soft)',
      alignSelf: 'start',
    }}>
      <div className="sc" style={{
        fontFamily:'var(--smallcaps)', fontSize:10.5,
        letterSpacing:'0.10em', color:'var(--ink)', marginBottom:6
      }}>
        Notes
      </div>
      <div className="it" style={{
        fontStyle:'italic', fontSize:11.75, lineHeight:1.5, color:'var(--ink-2)'
      }}>
        {notes}
      </div>

      <hr className="hairline" style={{marginTop:14, marginBottom:10}}/>

      <div className="sc" style={{
        fontFamily:'var(--smallcaps)', fontSize:10.5,
        letterSpacing:'0.10em', color:'var(--ink)', marginBottom:6
      }}>
        References
      </div>
      <ol style={{margin:0, paddingLeft:16, fontSize:11, lineHeight:1.45, color:'var(--ink-2)'}}>
        {references.map((r,i)=>(
          <li key={i} style={{marginBottom:5}}>
            <a className="ink-link" href={r.href}>{r.cite}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

window.ClusterPage = ClusterPage;
window.ClusterSupportedPage = ClusterSupportedPage;
window.CLUSTER_RECORDS = CLUSTER_RECORDS;
// keep CultivationPage alias so existing artboards still resolve
window.CultivationPage = ClusterPage;
