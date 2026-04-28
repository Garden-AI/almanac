// The Map — section 02 of the Almanac.
// Two facing pages: left = the chart, right = the alphabetical catalog index.

const MAP_MODELS = [
  { name:'UMA Medium',    family:'Equivariant',  params:'1.4B', layouts:{ QM9:[.42,.46], OMat24:[.50,.40], OMol25:[.46,.44], sAlex:[.48,.42] } },
  { name:'UMA Small',     family:'Equivariant',  params:'420M', layouts:{ QM9:[.38,.50], OMat24:[.46,.44], OMol25:[.42,.48], sAlex:[.44,.46] } },
  { name:'EquiformerV2',  family:'Equivariant',  params:'153M', layouts:{ QM9:[.34,.42], OMat24:[.42,.38], OMol25:[.38,.42], sAlex:[.40,.40] } },
  { name:'eSCN-L6',       family:'Equivariant',  params:'200M', layouts:{ QM9:[.30,.46], OMat24:[.38,.42], OMol25:[.34,.46], sAlex:[.36,.44] } },
  { name:'SCN',           family:'Equivariant',  params:'87M',  layouts:{ QM9:[.28,.40], OMat24:[.36,.36], OMol25:[.32,.40], sAlex:[.34,.38] } },
  { name:'GemNet-OC',     family:'Message-pass', params:'38M',  layouts:{ QM9:[.55,.62], OMat24:[.62,.58], OMol25:[.58,.62], sAlex:[.60,.60] } },
  { name:'GemNet-T',      family:'Message-pass', params:'31M',  layouts:{ QM9:[.60,.58], OMat24:[.66,.54], OMol25:[.62,.58], sAlex:[.64,.56] } },
  { name:'PaiNN',         family:'Message-pass', params:'14M',  layouts:{ QM9:[.64,.66], OMat24:[.70,.62], OMol25:[.66,.66], sAlex:[.68,.64] } },
  { name:'DimeNet++',     family:'Message-pass', params:'10M',  layouts:{ QM9:[.58,.70], OMat24:[.66,.66], OMol25:[.62,.70], sAlex:[.64,.68] } },
  { name:'SchNet',        family:'Message-pass', params:'1.7M', layouts:{ QM9:[.68,.72], OMat24:[.74,.68], OMol25:[.70,.72], sAlex:[.72,.70] } },
  { name:'MACE-MP-0',     family:'ACE',          params:'4.7M', layouts:{ QM9:[.22,.28], OMat24:[.28,.22], OMol25:[.20,.30], sAlex:[.24,.26] } },
  { name:'MACE-OFF23',    family:'ACE',          params:'4.7M', layouts:{ QM9:[.18,.32], OMat24:[.24,.26], OMol25:[.16,.34], sAlex:[.20,.30] } },
  { name:'MACE-Large',    family:'ACE',          params:'15.6M',layouts:{ QM9:[.26,.24], OMat24:[.32,.20], OMol25:[.24,.26], sAlex:[.28,.22] } },
  { name:'Allegro',       family:'ACE',          params:'8.0M', layouts:{ QM9:[.20,.20], OMat24:[.26,.18], OMol25:[.18,.22], sAlex:[.22,.20] } },
  { name:'NequIP',        family:'Equivariant',  params:'2.5M', layouts:{ QM9:[.24,.18], OMat24:[.30,.16], OMol25:[.22,.20], sAlex:[.26,.18] } },
  { name:'Orb-v2',        family:'Equivariant',  params:'25M',  layouts:{ QM9:[.78,.30], OMat24:[.74,.34], OMol25:[.80,.32], sAlex:[.76,.32] } },
  { name:'Orb-v3',        family:'Equivariant',  params:'48M',  layouts:{ QM9:[.82,.26], OMat24:[.78,.30], OMol25:[.84,.28], sAlex:[.80,.28] } },
  { name:'MatterSim-v1',  family:'Message-pass', params:'182M', layouts:{ QM9:[.74,.18], OMat24:[.70,.22], OMol25:[.76,.20], sAlex:[.72,.20] } },
  { name:'CHGNet',        family:'Message-pass', params:'0.4M', layouts:{ QM9:[.80,.22], OMat24:[.76,.26], OMol25:[.82,.24], sAlex:[.78,.24] } },
  { name:'M3GNet',        family:'Message-pass', params:'0.2M', layouts:{ QM9:[.84,.18], OMat24:[.80,.22], OMol25:[.86,.20], sAlex:[.82,.20] } },
  { name:'ANI-2x',        family:'Message-pass', params:'1.5M', layouts:{ QM9:[.50,.78], OMat24:[.56,.74], OMol25:[.52,.78], sAlex:[.54,.76] } },
  { name:'TorchMD-Net',   family:'Equivariant',  params:'7.0M', layouts:{ QM9:[.46,.74], OMat24:[.52,.70], OMol25:[.48,.74], sAlex:[.50,.72] } },
];

// page numbers for the catalog (deterministic stand-ins, A→Z)
const CATALOG_PAGES = (() => {
  const sorted = [...MAP_MODELS].sort((a,b)=>a.name.localeCompare(b.name));
  const out = {};
  sorted.forEach((m,i)=>{ out[m.name] = 24 + i*3; });
  return out;
})();

const MAP_CONSTELLATIONS = [
  { name:'The Equivariants',   members:['UMA Medium','UMA Small','EquiformerV2','eSCN-L6','SCN'] },
  { name:'The ACE Cluster',    members:['MACE-MP-0','MACE-OFF23','MACE-Large','Allegro','NequIP'] },
  { name:'Message-Passing',    members:['GemNet-OC','GemNet-T','PaiNN','DimeNet++','SchNet'] },
  { name:'Materials Belt',     members:['Orb-v2','Orb-v3','MatterSim-v1','CHGNet','M3GNet'] },
  { name:'Earlier Generations',members:['ANI-2x','TorchMD-Net'] },
];

function MapPage() {
  const [dataset, setDataset] = React.useState('OMat24');
  const [selected, setSelected] = React.useState('UMA Medium');
  const W = 740, H = 700; // chart inner dims

  const px = (m) => {
    const [u,v] = m.layouts[dataset];
    return { x: u*W, y: v*H };
  };
  const sizeFor = (params) => {
    const m = parseFloat(params);
    const unit = params.endsWith('B') ? 1000 : 1;
    const M = m*unit;
    return Math.max(2.6, Math.min(6.5, 2 + Math.log10(M+1)*1.2));
  };

  const datasets = ['QM9','OMat24','OMol25','sAlex'];

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>The Map</span>
      </div>

      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16}}>
        <div>
          <div className="sc" style={{fontSize:12, letterSpacing:'0.18em', color:'var(--ink-2)'}}>
            Section 02
          </div>
          <h1 style={{fontFamily:'var(--serif)', fontSize:38, lineHeight:1.02, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
            The Map
          </h1>
          <div className="it" style={{color:'var(--ink-2)', marginTop:4, fontSize:14.5}}>
            Twenty-two models, charted by representational similarity.
          </div>
        </div>
        {/* Typographic dataset selector — small caps row, hairline underline on active */}
        <div style={{textAlign:'right'}}>
          <div className="sc" style={{fontSize:10.5, letterSpacing:'0.10em', color:'var(--ink-2)', marginBottom:4}}>
            Reference dataset
          </div>
          <div style={{display:'flex', gap:18, alignItems:'baseline'}}>
            {datasets.map(d=>(
              <button key={d}
                onClick={()=>setDataset(d)}
                style={{
                  appearance:'none', background:'transparent', border:0, padding:0,
                  fontFamily:'var(--smallcaps)',
                  fontSize: 12.5,
                  letterSpacing:'0.10em',
                  color: d===dataset ? 'var(--ink)' : 'var(--ink-3)',
                  borderBottom: d===dataset ? '0.8px solid var(--ink)' : '0.5px solid transparent',
                  paddingBottom: 2,
                  cursor:'pointer',
                }}
              >{d}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{margin:'10px 0 12px'}}>
        <Ornament.Rule width={220}/>
      </div>

      {/* Chart */}
      <Chart
        W={W} H={H}
        models={MAP_MODELS}
        constellations={MAP_CONSTELLATIONS}
        dataset={dataset}
        selected={selected} setSelected={setSelected}
        sizeFor={sizeFor} px={px}
      />

      {/* Caption */}
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, color:'var(--ink-2)'}}>
        <span className="it">
          Layout: t-SNE on activations from 4,096 structures in {dataset}.
        </span>
        <span className="sc" style={{fontSize:10.5, letterSpacing:'0.10em'}}>22 models</span>
      </div>

      <div className="folio" style={{marginTop:'auto'}}>
        <span>The Map</span>
        <span className="num">11</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

function Chart({W,H,models,constellations,dataset,selected,setSelected,sizeFor,px}){
  const [hover, setHover] = React.useState(null);
  // build constellation hulls
  const hulls = constellations.map(con=>{
    const pts = con.members.map(name=>{
      const m = models.find(m=>m.name===name);
      return px(m);
    });
    const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
    const minx = Math.min(...xs), maxx = Math.max(...xs);
    const miny = Math.min(...ys), maxy = Math.max(...ys);
    const cx = (minx+maxx)/2, cy = (miny+maxy)/2;
    const rx = Math.max(40, (maxx-minx)/2 + 36);
    const ry = Math.max(32, (maxy-miny)/2 + 28);
    return { ...con, cx, cy, rx, ry };
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
         style={{background:'var(--paper-2)', border:'1px solid var(--ink)', display:'block'}}>
      <defs>
        <pattern id="dotgrid" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.5" fill="#1f1c18" opacity="0.30"/>
        </pattern>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill="url(#dotgrid)"/>

      {/* dashed parallels every 1/4 */}
      {[0.25,0.5,0.75].map(t=>(
        <g key={'g'+t}>
          <line x1="0" y1={t*H} x2={W} y2={t*H} stroke="#1a1612" strokeWidth="0.3" strokeDasharray="1 4" opacity="0.7"/>
          <line y1="0" x1={t*W} y2={H} x2={t*W} stroke="#1a1612" strokeWidth="0.3" strokeDasharray="1 4" opacity="0.7"/>
        </g>
      ))}

      {/* axis labels — replace compass with plain DIM I / DIM II */}
      <text x={10} y={16} fontFamily="var(--smallcaps)" fontSize="9" letterSpacing="1.6" fill="#3a342c">DIM. I</text>
      <text x={W-54} y={H-10} fontFamily="var(--smallcaps)" fontSize="9" letterSpacing="1.6" fill="#3a342c">DIM. II</text>

      {/* Constellation hulls */}
      {hulls.map((h,i)=>(
        <g key={i}>
          <ellipse cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry}
                   fill="none" stroke="#1a1612" strokeWidth="0.5"
                   strokeDasharray="2 3" opacity="0.55" />
          <text
            x={h.cx} y={h.cy - h.ry - 6}
            textAnchor="middle"
            fontFamily="'IM Fell English SC','EB Garamond',serif"
            fontSize="11" letterSpacing="2"
            fill="#1a1612"
            style={{fontVariant:'small-caps'}}
          >
            {h.name.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Star markers + labels */}
      {models.map((m,i)=>{
        const p = px(m);
        const r = sizeFor(m.params);
        const isSel = m.name === selected;
        const isHov = m.name === hover;
        return (
          <g key={m.name}
             style={{cursor:'pointer'}}
             onMouseEnter={()=>setHover(m.name)}
             onMouseLeave={()=>setHover(null)}
             onClick={()=>setSelected(m.name)}>
            {r >= 4 && (
              <g stroke="#1a1612" strokeWidth="0.6">
                <line x1={p.x-r-2} y1={p.y} x2={p.x+r+2} y2={p.y}/>
                <line x1={p.x} y1={p.y-r-2} x2={p.x} y2={p.y+r+2}/>
              </g>
            )}
            <circle cx={p.x} cy={p.y} r={r}
                    fill={isSel ? '#7a1f1f' : '#1a1612'}
                    stroke={isSel ? '#7a1f1f' : 'none'}
            />
            {isSel && (
              <circle cx={p.x} cy={p.y} r={r+5}
                      fill="none" stroke="#7a1f1f" strokeWidth="0.7"/>
            )}
            <circle cx={p.x} cy={p.y} r={Math.max(12,r+6)} fill="transparent" />
            <text x={p.x + r + 4} y={p.y + 3.5}
                  fontFamily="'EB Garamond',serif"
                  fontSize={isHov || isSel ? 12.5 : 11.5}
                  fontStyle="italic"
                  fill={isSel ? '#7a1f1f' : '#1a1612'}
                  style={{paintOrder:'stroke', stroke:'#f4ede0', strokeWidth:3, strokeLinejoin:'round'}}
            >
              {m.name}
            </text>
          </g>
        );
      })}

      {/* scale-bar bottom-right */}
      <g transform={`translate(${W-130},${H-26})`}>
        <line x1="0" y1="0" x2="100" y2="0" stroke="#1a1612" strokeWidth="0.8"/>
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#1a1612" strokeWidth="0.8"/>
        <line x1="50" y1="-2" x2="50" y2="2" stroke="#1a1612" strokeWidth="0.8"/>
        <line x1="100" y1="-3" x2="100" y2="3" stroke="#1a1612" strokeWidth="0.8"/>
        <text x="0" y="14" fontFamily="'IM Fell English SC',serif" fontSize="9" letterSpacing="1.2" fill="#3a342c">0</text>
        <text x="100" y="14" fontFamily="'IM Fell English SC',serif" fontSize="9" letterSpacing="1.2" fill="#3a342c" textAnchor="end">0.5 σ</text>
      </g>
    </svg>
  );
}

// ── Right-hand facing page: model catalog index ────────────────────────────
function CatalogIndexPage(){
  const sorted = [...MAP_MODELS].sort((a,b)=>a.name.localeCompare(b.name));
  // first/last halves for two-column wrap
  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>The Map</span>
        <span>Model Catalog · Index</span>
      </div>

      {/* Centered header */}
      <div style={{textAlign:'center', marginTop:6}}>
        <div className="sc" style={{fontSize:13, letterSpacing:'0.16em', color:'var(--ink)'}}>
          Model Catalog
        </div>
        <div className="it" style={{fontSize:13.5, color:'var(--ink-2)', marginTop:4}}>
          All 22 models, sorted A–Z.
        </div>
        <hr className="hairline" style={{marginTop:10}}/>
      </div>

      {/* Body — index table + marginalia rail.
          At >= 720px the rail sits to the right of the table; below that it
          stacks beneath. */}
      <div className="catalog-body" style={{
        display:'grid',
        gridTemplateColumns: '1fr 184px',
        columnGap: 22,
        rowGap: 18,
        marginTop: 14,
        flex: 1,
      }}>
        <table className="almanac" style={{fontSize:12.5}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Family</th>
              <th style={{textAlign:'right', width:80}}>Params</th>
              <th style={{width:24}} aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(m=>{
              const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
              return (
                <tr key={m.name}
                    onClick={()=>{ /* would navigate to /model/{slug} */ }}
                    style={{cursor:'pointer'}}
                    className="catalog-row">
                  <td>
                    <a className="ink-link" href={`/model/${slug}`} style={{fontStyle:'italic'}}>{m.name}</a>
                  </td>
                  <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                    {m.family === 'Message-pass' ? 'Message-Passing' : m.family}
                  </td>
                  <td style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{m.params}</td>
                  <td style={{textAlign:'right', color:'var(--ink-3)', fontFamily:'var(--serif)'}} aria-hidden="true">→</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Marginalia */}
        <aside className="catalog-rail" style={{
          borderTop: '0.5px solid var(--rule)',
          borderBottom: '0.5px solid var(--rule)',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 14,
          borderLeft: '0.5px solid var(--rule-soft)',
          alignSelf: 'start',
        }}>
          <div className="sc" style={{
            fontFamily:'var(--smallcaps)', fontSize:10.5,
            letterSpacing:'0.10em', color:'var(--ink)', marginBottom:4
          }}>
            On reading the map
          </div>
          <p className="it" style={{
            fontStyle:'italic', fontSize:11.75, lineHeight:1.5,
            color:'var(--ink-2)', margin:0
          }}>
            The map's layout shifts with the reference dataset. A model's
            neighbors on OMat24 may differ from its neighbors on QM9. The
            catalog entries note both, where it matters.
          </p>
        </aside>
      </div>

      <div className="folio">
        <span>The Map · Index</span>
        <span className="num">12</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

window.MapPage = MapPage;
window.CatalogIndexPage = CatalogIndexPage;
// keep old export so existing artboard doesn't break if referenced elsewhere
window.AtlasMap = MapPage;
