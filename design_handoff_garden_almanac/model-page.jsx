// Model Detail Page — one of 22 routes (/model/{slug}).
// Rendered from a structured Model record + a free-form marginalia note +
// a small references list. UMA Medium is the worked example.

const MODEL_RECORDS = {
  'uma-medium': {
    name: 'UMA Medium',
    family: 'Equivariant Transformer',
    subtitle: 'Universal Model for Atoms, medium size. Released by Meta FAIR-Chem, January 2026.',
    constitution: {
      Architecture:    'Equivariant transformer (SO(3)), 16 layers, 256 channels, L=4 spherical harmonics',
      Parameters:      '1.4B total, 96M trainable',
      'Training data': [
        { kind:'dataset', name:'OMat24',    note:'118M structures', href:'/dataset/omat24' },
        { kind:'dataset', name:'sAlex',     note:'4.2M',            href:'/dataset/salex' },
        { kind:'dataset', name:'OMol25-pre',note:'810k',            href:'/dataset/omol25-pre' },
      ],
      'DFT level of theory': 'PBE / PBE+U for 3d transition metals; r²SCAN side head',
      License:         'CC-BY-NC 4.0',
      'First released':'22 January 2026 (v1.0.2 current)',
      DOI:             { kind:'link', label:'10.26311/uma-medium', href:'https://doi.org/10.26311/uma-medium' },
      'Hugging Face Hub': { kind:'link', label:'fair-chem/uma-medium', href:'https://huggingface.co/fair-chem/uma-medium' },
    },
    neighbors: [
      { name:'UMA Small',    family:'Equivariant',  sim:0.94, slug:'uma-small' },
      { name:'EquiformerV2', family:'Equivariant',  sim:0.88, slug:'equiformerv2' },
      { name:'eSCN-L6',      family:'Equivariant',  sim:0.81, slug:'escn-l6' },
      { name:'SCN',          family:'Equivariant',  sim:0.76, slug:'scn' },
      { name:'GemNet-OC',    family:'Message-Passing', sim:0.62, slug:'gemnet-oc' },
    ],
    installs: [
      { cluster:'Della',      slug:'della',      status:'verified',     cmd:'rootstock install uma-medium --cluster della' },
      { cluster:'Sophia',     slug:'sophia',     status:'verified',     cmd:'rootstock install uma-medium --cluster sophia --gpu a100' },
      { cluster:'Frontier',   slug:'frontier',   status:'stale',        cmd:'rootstock install uma-medium --cluster frontier --variant rocm' },
      { cluster:'Perlmutter', slug:'perlmutter', status:'verified',     cmd:'rootstock install uma-medium --cluster perlmutter --gpu a100' },
      { cluster:'Polaris',    slug:'polaris',    status:'na',           cmd:null },
    ],
    notes: `UMA's training mix includes data not present in either sAlex or OMol25 alone, so cross-dataset comparisons against models trained only on the public splits should be read with care. Empirically the model is strong on bulk inorganic crystals and adsorption energetics, where the OMat24 component dominates; it is less reliable on molecular crystals with strong van der Waals interactions, where MACE-OFF23 remains the better choice. Architecturally, UMA Medium is the direct descendant of EquiformerV2: it restores the L=4 spherical-harmonic head that UMA Small drops, which accounts for most of the accuracy gap between the two sizes. UMA Large is expected in June 2026; until then, Medium is the most capable model in the family and the one we recommend as a default for new materials projects.`,
    references: [
      { cite:'Wood et al., UMA: A Family of Universal Models for Atoms, arXiv:2602.04812, 2026.', href:'https://arxiv.org/abs/2602.04812' },
      { cite:'Tran et al., The Open Materials 2024 Dataset, npj Comput. Mater. 11, 2025.',         href:'https://doi.org/10.1038/s41524-025-00000-0' },
      { cite:'fair-chem/uma-medium on the Hugging Face Hub.',                                       href:'https://huggingface.co/fair-chem/uma-medium' },
    ],
  },
};

function ModelPage({ slug = 'uma-medium' }) {
  const m = MODEL_RECORDS[slug] ?? MODEL_RECORDS['uma-medium'];

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>Model · {m.name}</span>
      </div>

      {/* Title block */}
      <div style={{marginTop:4}}>
        <div className="sc" style={{fontSize:12, letterSpacing:'0.16em', color:'var(--ink-2)'}}>
          {m.family}
        </div>
        <h1 style={{fontFamily:'var(--serif)', fontSize:42, lineHeight:1.0, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
          {m.name}
        </h1>
        <div className="it" style={{fontSize:14.5, color:'var(--ink-2)', marginTop:5, lineHeight:1.4}}>
          {m.subtitle}
        </div>
        <div style={{marginTop:10}}>
          <Ornament.Rule width={220}/>
        </div>
      </div>

      {/* Body — main column + right rail */}
      <div className="model-body" style={{
        display:'grid',
        gridTemplateColumns: '1fr 220px',
        columnGap: 24,
        rowGap: 12,
        marginTop: 10,
        flex: 1,
      }}>
        <div>
          <Constitution data={m.constitution}/>
          <div style={{height:8}}/>
          <Neighbors items={m.neighbors} slug={slug}/>
          <div style={{height:8}}/>
          <Installs items={m.installs}/>
        </div>

        <Marginalia notes={m.notes} references={m.references} family={m.family}/>
      </div>

      <div className="folio">
        <span>Model &middot; {m.name}</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

function ModelSection({ heading, sub, children }){
  return (
    <section style={{marginTop:0}}>
      <div className="sc" style={{
        fontFamily:'var(--smallcaps)',
        fontSize:12.5, letterSpacing:'0.10em',
        color:'var(--ink)',
        borderBottom: '1.5px solid var(--ink)',
        paddingBottom: 4,
      }}>{heading}</div>
      {sub && <div className="it" style={{fontSize:12, color:'var(--ink-2)', marginTop:4}}>{sub}</div>}
      <div style={{marginTop:8}}>{children}</div>
    </section>
  );
}

function Constitution({ data }){
  return (
    <ModelSection heading="Constitution">
      <table className="almanac" style={{fontSize:12.75}}>
        <tbody>
          {Object.entries(data).map(([k,v])=>(
            <tr key={k}>
              <td className="sc" style={{width:160, fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                {k}
              </td>
              <td>{renderValue(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModelSection>
  );
}

function renderValue(v){
  if (Array.isArray(v)){
    return (
      <span>
        {v.map((d,i)=>(
          <React.Fragment key={i}>
            <a className="ink-link" href={d.href}>{d.name}</a>
            {d.note && <span className="it" style={{color:'var(--ink-2)'}}> ({d.note})</span>}
            {i < v.length - 1 && <span>, </span>}
          </React.Fragment>
        ))}
      </span>
    );
  }
  if (v && typeof v === 'object' && v.kind === 'link'){
    return <a className="ink-link mono" href={v.href} style={{fontSize:11.5}}>{v.label}</a>;
  }
  return v;
}

function Neighbors({ items, slug }){
  return (
    <ModelSection
      heading="Nearest Neighbors"
      sub="The five closest models on the map, computed on OMat24."
    >
      <table className="almanac" style={{fontSize:12.75}}>
        <thead>
          <tr>
            <th style={{width:36}}>Rank</th>
            <th>Model</th>
            <th style={{width:140}}>Family</th>
            <th style={{width:80, textAlign:'right'}}>Similarity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((n,i)=>(
            <tr key={n.name}>
              <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                {['I','II','III','IV','V'][i]}
              </td>
              <td>
                <a className="ink-link" href={`/model/${n.slug}`} style={{fontStyle:'italic'}}>{n.name}</a>
              </td>
              <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                {n.family}
              </td>
              <td style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{n.sim.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="it" style={{fontSize:12, color:'var(--ink-2)', marginTop:6}}>
        Neighbors shift with the reference dataset. <a className="ink-link" href={`/map?highlight=${slug}`}>View on the map →</a>
      </div>
    </ModelSection>
  );
}

function StatusGlyph({ status }){
  if (status === 'verified') {
    return <svg width="14" height="14" viewBox="0 0 14 14" aria-label="verified"><circle cx="7" cy="7" r="3.5" fill="#7a1f1f"/></svg>;
  }
  if (status === 'stale') {
    return <svg width="14" height="14" viewBox="0 0 14 14" aria-label="not recently verified"><circle cx="7" cy="7" r="3.5" fill="none" stroke="#7a1f1f" strokeWidth="0.9"/></svg>;
  }
  // not applicable — diagonal hatched cell
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-label="not applicable">
      <defs>
        <pattern id="na-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#7a7268" strokeWidth="0.7"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="14" height="14" fill="url(#na-hatch)" opacity="0.6"/>
    </svg>
  );
}

function Installs({ items }){
  return (
    <ModelSection
      heading="Where it Runs"
      sub="Verified clusters and install commands."
    >
      <table className="almanac" style={{fontSize:12.75}}>
        <thead>
          <tr>
            <th style={{width:120}}>Cluster</th>
            <th style={{width:60, textAlign:'center'}}>Status</th>
            <th>Install command</th>
          </tr>
        </thead>
        <tbody>
          {items.map(r=>(
            <tr key={r.cluster}>
              <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                <a className="ink-link" href={`/cluster/${r.slug}`}>{r.cluster}</a>
              </td>
              <td style={{textAlign:'center'}}>
                <StatusGlyph status={r.status}/>
              </td>
              <td>
                {r.cmd ? <div className="cmd">{r.cmd}</div>
                       : <span className="it" style={{color:'var(--ink-3)', fontSize:12}}>not applicable</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="it" style={{fontSize:12, color:'var(--ink-2)', marginTop:6}}>
        Verified by automated test within the last 7 days.{' '}
        <a className="ink-link" href="/compatibility">See the Compatibility Matrix for the full grid →</a>
      </div>
    </ModelSection>
  );
}

function Marginalia({ notes, references, family }){
  return (
    <aside className="model-rail" style={{
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
        fontStyle:'italic', fontSize:12, lineHeight:1.5, color:'var(--ink-2)'
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
      <ol style={{margin:0, paddingLeft:16, fontSize:11.25, lineHeight:1.45, color:'var(--ink-2)'}}>
        {references.map((r,i)=>(
          <li key={i} style={{marginBottom:5}}>
            <a className="ink-link" href={r.href}>{r.cite}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

window.ModelPage = ModelPage;
window.MODEL_RECORDS = MODEL_RECORDS;
