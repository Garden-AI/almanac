// Frontispiece — landing page. Almanac of Matter Models, 2026 Edition.
// MLIP section is the headline; protein section is a quiet editorial note.

function Frontispiece() {
  const toc = [
    { num: '01', title: 'About this Almanac',  page: 4   },
    { num: '02', title: 'The Map',             page: 11  },
    { num: '03', title: 'Model Catalog',       page: 24, note: '22 entries, A–Z' },
    { num: '04', title: 'Where to Run on HPC', page: 96  },
    { num: '05', title: 'Datasets',            page: 132 },
    { num: '06', title: 'Architectures',       page: 158 },
  ];

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>2026 Edition</span>
      </div>

      {/* Title block */}
      <div style={{textAlign:'center', marginTop: 8}}>
        <div className="sc" style={{fontSize:13, letterSpacing:'0.18em', color:'var(--ink-2)'}}>
          Garden's
        </div>
        <div style={{height:4}}/>
        <h1 style={{fontFamily:'var(--serif)', fontSize:50, lineHeight:1.0, fontWeight:600, letterSpacing:'-0.005em'}}>
          Almanac of Matter Models
        </h1>
        <div style={{marginTop:10, fontStyle:'italic', fontSize:17.5, color:'var(--ink-2)', lineHeight:1.35}}>
          A guide to foundation models for<br/>molecules, materials, and proteins
        </div>
        <div style={{margin:'14px auto 0', width:240}}>
          <Ornament.Rule width={240}/>
        </div>
        <div className="sc" style={{fontSize:12, letterSpacing:'0.16em', marginTop:8}}>
          2026 Edition
        </div>
        <div style={{fontStyle:'italic', fontSize:13, color:'var(--ink-2)', marginTop:1}}>
          22 models, with notes on how to install them and how they compare
        </div>
      </div>

      {/* MLIP section — primary content */}
      <div style={{marginTop:22}}>
        <div className="ornament">
          <hr/>
          <span className="sc glyph" style={{fontFamily:'var(--smallcaps)', fontSize:11.5, letterSpacing:'0.10em'}}>
            Machine Learning Interatomic Potentials
          </span>
          <hr/>
        </div>

        <p style={{
          fontSize:13.75, lineHeight:1.55, color:'var(--ink)',
          margin:'12px auto 0', maxWidth:560, textAlign:'center'
        }}>
          The Almanac charts the present generation of MLIPs by the similarity of
          their internal representations, lists where they run on shared HPC, and
          notes which datasets and architectures they descend from. It is intended
          as a companion to Hugging Face and the public leaderboards — a chart of
          the territory, not a replacement for them.
        </p>

        {/* Cartouche — adsorbate woodcut */}
        <div style={{display:'flex', justifyContent:'center', marginTop:16}}>
          <img
            src="uploads/adsorption.png"
            alt="Adsorbate on surface, set among flowers"
            style={{
              width: 380, height: 'auto', display:'block',
              mixBlendMode: 'multiply',
            }}
          />
        </div>

        {/* MLIP-only contents */}
        <table className="almanac" style={{marginTop:14, maxWidth:560, marginLeft:'auto', marginRight:'auto'}}>
          <tbody>
            {toc.map((row,i)=>(
              <tr key={i}>
                <td style={{width:42, fontVariantNumeric:'tabular-nums', color:'var(--ink-2)'}}>{row.num}</td>
                <td>{row.title}{row.note && <span className="it" style={{color:'var(--ink-3)'}}>  · {row.note}</span>}</td>
                <td style={{width:42, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{row.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decorative break — heavier than inline rules */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:14,
        marginTop:24, color:'var(--ink)'
      }}>
        <span style={{flex:1, borderTop:'0.5px solid var(--rule)'}}/>
        <span style={{fontFamily:'var(--serif)', fontSize:18, lineHeight:1, color:'var(--ink)'}}>❦</span>
        <span style={{flex:'0 0 90px', borderTop:'1.5px solid var(--ink)', borderBottom:'0.5px solid var(--ink)', height:3}}/>
        <span style={{fontFamily:'var(--serif)', fontSize:18, lineHeight:1, color:'var(--ink)'}}>❦</span>
        <span style={{flex:1, borderTop:'0.5px solid var(--rule)'}}/>
      </div>

      {/* Forthcoming section — proteins, quieter */}
      <div style={{marginTop:14}}>
        <div className="ornament" style={{justifyContent:'center'}}>
          <span className="sc glyph" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.12em', color:'var(--ink-2)'}}>
            Forthcoming
          </span>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'auto 1fr',
          gap:18,
          alignItems:'center',
          marginTop:10,
          maxWidth:620,
          marginLeft:'auto',
          marginRight:'auto'
        }}>
          <img
            src="uploads/proteins.png"
            alt="Protein ribbon diagram, set among flowers"
            style={{
              width: 230, height:'auto', display:'block',
              mixBlendMode: 'multiply',
            }}
          />
          <p className="it" style={{
            fontSize:13, lineHeight:1.5, color:'var(--ink-2)', margin:0
          }}>
            Future editions of the Almanac may extend to protein foundation
            models — ESM, ESM3, ProstT5, and their kin. The methodology that
            organizes the MLIP almanac applies equally to protein
            representation; the curatorial work is ongoing.
          </p>
        </div>
      </div>

      {/* Colophon */}
      <div style={{
        marginTop:'auto', paddingTop:18,
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:24,
        fontSize:12.5, color:'var(--ink-2)'
      }}>
        <div>
          <span className="sc" style={{fontSize:10.5, letterSpacing:'0.10em', color:'var(--ink)'}}>Published by</span><br/>
          Globus Labs
        </div>
        <div style={{textAlign:'right'}}>
          <span className="sc" style={{fontSize:10.5, letterSpacing:'0.10em', color:'var(--ink)'}}>Cite as</span><br/>
          <span className="mono" style={{fontSize:11}}>10.26311/almanac-2026</span>
        </div>
      </div>

      <div className="folio">
        <span>Cover</span>
        <span className="num">i</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

window.Frontispiece = Frontispiece;
