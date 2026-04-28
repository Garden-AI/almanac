// About this Almanac — editorial preface page (Section 01).
// Single-column running prose with a narrow marginalia rail on the right.

function AboutPage() {
  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>About this Almanac</span>
      </div>

      {/* Title block */}
      <div style={{marginTop: 4}}>
        <div className="sc" style={{fontSize:12, letterSpacing:'0.18em', color:'var(--ink-2)'}}>
          Section 01
        </div>
        <h1 style={{
          fontFamily:'var(--serif)', fontSize:34, lineHeight:1.02,
          fontWeight:600, letterSpacing:'-0.005em', marginTop:3
        }}>
          About this Almanac
        </h1>
        <div style={{
          marginTop:5, fontStyle:'italic', fontSize:14.5,
          color:'var(--ink-2)', lineHeight:1.35
        }}>
          What it is, what it isn't, and how it was made.
        </div>
        <div style={{marginTop:8}}>
          <Ornament.Rule width={220}/>
        </div>
      </div>

      {/* Body — two columns: prose | marginalia */}
      <div style={{
        marginTop: 14,
        display:'grid',
        gridTemplateColumns: '1fr 188px',
        columnGap: 22,
        flex:1,
      }}>
        {/* Prose column */}
        <div style={{fontSize:12.75, lineHeight:1.4, color:'var(--ink)'}}>
          <Section heading="What this is">
            <p style={{marginTop:0}} className="drop-cap">
              The Garden's Almanac is a curated guide to machine learning
              interatomic potentials — the family of models that, having
              absorbed millions of quantum mechanical calculations, now
              predict the energies and forces of atomic systems at a small
              fraction of the cost.
            </p>
            <p>
              The 2026 Edition catalogs twenty-two such models. Each is placed
              on a map by the similarity of its internal representation,
              annotated with installation notes, and linked to the datasets
              and architectures from which it descends. The Almanac will grow.
            </p>
          </Section>

          <Section heading="What this isn't">
            <p style={{marginTop:0}}>
              The Almanac does not rank models, and it does not report a
              single number against which every potential is measured. Such a
              number would not be meaningful across the breadth of materials
              chemistry the field now spans.
            </p>
            <p>
              It is not a substitute for the underlying papers.{' '}
              <span className="it">Matbench Discovery</span> remains the place
              to look for predictive performance; the{' '}
              <span className="it">Hugging Face Hub</span> remains the place
              to obtain weights. The Almanac links to both, and competes with
              neither.
            </p>
          </Section>

          <Section heading="How models are placed">
            <p style={{marginTop:0}}>
              Two models sit near one another on the map when, given the same
              input structures, they encode them in similar ways internally.
              This is not a measure of accuracy but of representational
              kinship: models that share a lineage — a dataset, a training
              recipe, an architectural ancestor — tend to cluster.
            </p>
            <p>
              The methodology follows Edamadaka, Yang, et al. (2025),{' '}
              <span className="it">Universally Converging Representations of
              Matter Across Scientific Foundation Models</span>. Similarity is
              computed on a fixed reference set drawn from QM9, OMat24,
              OMol25, and sAlex. Representational kinship does not, by
              itself, predict downstream behavior — two near neighbors can
              still disagree on a particular phase diagram. The map is a
              chart of the territory, not the territory itself.
            </p>
          </Section>

          <Section heading="How installations are verified">
            <p style={{marginTop:0}}>
              For every cluster the Almanac covers, Garden runs a nightly
              automated test suite that installs each supported model from a
              clean environment and executes a basic inference run. The
              freshness threshold is seven days; the Compatibility Matrix
              reflects the most recent result.
            </p>
            <p>
              <span className="it">Verified</span> means precisely that — the
              install and a basic inference succeeded recently. It does not
              mean the model produces correct physics for your problem. That
              remains, as ever, the reader's responsibility.
            </p>
          </Section>

          <Section heading="How the Almanac is maintained">
            <p style={{marginTop:0}}>
              The Almanac ships an annual edition, preserved at its published
              DOI as a static record of the field on the day of release.
              Between editions, the Compatibility Matrix and the catalog
              update continuously as Garden adds clusters and models.
            </p>
            <p>
              Inclusion is, for now, by curatorial judgment rather than open
              submission. A new cluster joins the verification CI by
              partnering with Garden directly.
            </p>
          </Section>
        </div>

        {/* Marginalia rail */}
        <aside style={{
          borderTop: '0.5px solid var(--rule)',
          borderBottom: '0.5px solid var(--rule)',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 14,
          borderLeft: '0.5px solid var(--rule-soft)',
        }}>
          <Marginal label="Acknowledgement">
            The methodological foundation is the work of Sathya Edamadaka, Soojung
            Yang, and collaborators at MIT. The Almanac is their map, drawn by
            other hands.
          </Marginal>

          <Marginal label="Reference set">
            The structures used to compute representational similarity are drawn
            from QM9, OMat24, OMol25, and sAlex — all public. The Almanac uses a
            fixed sample; the sample list is preserved at the edition's DOI.
          </Marginal>

          <Marginal label="See also">
            Weights and inference code live on the <span className="it">Hugging Face Hub</span>.
            Predictive performance is tracked on{' '}
            <span className="it">Matbench Discovery</span>. Both are linked from
            every model entry in the catalog.
          </Marginal>

          <Marginal label="Cadence" last>
            Annual editions, preserved at DOI. Continuous updates to the
            Compatibility Matrix and catalog between editions.
          </Marginal>
        </aside>
      </div>

      <div className="folio">
        <span>About this Almanac</span>
        <span className="num">4</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section style={{marginTop: 9, breakInside:'avoid'}}>
      <h3 className="sc" style={{
        fontFamily:'var(--smallcaps)',
        fontSize: 11.5,
        letterSpacing:'0.10em',
        color: 'var(--ink)',
        marginBottom: 3,
        fontWeight: 500,
      }}>
        {heading}
      </h3>
      <div style={{margin:0}}>{children}</div>
    </section>
  );
}

function Marginal({ label, children, last }) {
  return (
    <div style={{
      marginBottom: last ? 0 : 10,
      paddingBottom: last ? 0 : 9,
      borderBottom: last ? 'none' : '0.5px solid var(--rule-soft)',
    }}>
      <div className="sc" style={{
        fontFamily: 'var(--smallcaps)',
        fontSize: 10.5,
        letterSpacing: '0.10em',
        color: 'var(--ink)',
        marginBottom: 2,
      }}>
        {label}
      </div>
      <div className="it" style={{
        fontStyle: 'italic',
        fontSize: 11.25,
        lineHeight: 1.4,
          color: 'var(--ink-2)',
      }}>
        {children}
      </div>
    </div>
  );
}

window.AboutPage = AboutPage;
