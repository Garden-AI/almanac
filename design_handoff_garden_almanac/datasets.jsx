// Datasets — section 05 of the Almanac.
// Two routes:
//   /datasets               → DatasetsIndexPage (chronological table)
//   /dataset/{slug}         → DatasetDetailPage (OMat24 is the worked example)
// Rendered from a structured DATASET_RECORDS data model. The "Models trained on"
// table is computed from MODEL_TRAINING_DATA — keyed by dataset slug.

const DATASET_RECORDS = {
  qm9: {
    slug: 'qm9',
    name: 'QM9',
    fullName: 'Quantum Machines 9',
    domain: 'Molecules',
    size: '134k molecules',
    sizeLong: '~134,000 small organic molecules; one equilibrium geometry each',
    dft: 'B3LYP/6-31G(2df,p)',
    year: 2014,
    curator: 'Ramakrishnan, Dral, Rupp, von Lilienfeld',
    composition: 'Stable small organics up to 9 heavy atoms (C, N, O, F)',
    license: 'CC0 1.0',
    doi: '10.1038/sdata.2014.22',
    paper: 'Ramakrishnan et al., Quantum chemistry structures and properties of 134 kilo molecules, Sci. Data 1:140022 (2014).',
  },
  md17: {
    slug: 'md17',
    name: 'MD17 / rMD17',
    fullName: 'MD17 (revised: rMD17)',
    domain: 'Molecules',
    size: '~3.6M frames (10 molecules)',
    sizeLong: '~3.6M MD frames across 10 small organic molecules',
    dft: 'PBE+TS / CCSD(T) for select molecules',
    year: 2017,
    curator: 'Chmiela, Tkatchenko et al.',
    composition: 'Aspirin, ethanol, naphthalene, salicylic acid, toluene, etc.',
    license: 'CC-BY 4.0',
    doi: '10.1126/sciadv.1603015',
    paper: 'Chmiela et al., Machine learning of accurate energy-conserving molecular force fields, Sci. Adv. (2017). Revised: Christensen & von Lilienfeld (2020).',
  },
  ani1x: {
    slug: 'ani1x',
    name: 'ANI-1x / ANI-2x',
    fullName: 'ANI-1x and ANI-2x',
    domain: 'Molecules',
    size: '~5M / ~9M conformations',
    sizeLong: '~5M (ANI-1x) and ~9M (ANI-2x) conformations of small organics',
    dft: 'ωB97X / 6-31G*',
    year: 2018,
    curator: 'Smith, Isayev, Roitberg et al.',
    composition: 'Organic molecules; H, C, N, O for ANI-1x; +F, S, Cl for ANI-2x',
    license: 'CC-BY 4.0',
    doi: '10.1038/s41597-020-0473-z',
    paper: 'Smith et al., The ANI-1ccx and ANI-1x data sets, Sci. Data 7:134 (2020).',
  },
  mp2018: {
    slug: 'mp2018',
    name: 'MP-2018+',
    fullName: 'Materials Project structures',
    domain: 'Materials',
    size: '~150k structures',
    sizeLong: '~150k DFT-relaxed inorganic crystals (MP-2018 snapshot, growing)',
    dft: 'PBE; PBE+U for selected TM oxides; VASP',
    year: 2018,
    curator: 'Materials Project (LBNL)',
    composition: 'Inorganic crystals across the periodic table',
    license: 'CC-BY 4.0',
    doi: '10.1063/1.4812323',
    paper: 'Jain et al., Commentary: The Materials Project, APL Materials 1:011002 (2013).',
  },
  oc20: {
    slug: 'oc20',
    name: 'OC20',
    fullName: 'Open Catalyst 2020',
    domain: 'Catalysis',
    size: '~265M frames',
    sizeLong: '~1.3M relaxations, ~265M structure-energy pairs along the relaxation paths',
    dft: 'RPBE; VASP',
    year: 2020,
    curator: 'Meta FAIR-Chem (formerly OCP)',
    composition: 'Adsorbates on inorganic catalyst surfaces',
    license: 'CC-BY 4.0',
    doi: '10.1021/acscatal.0c04525',
    paper: 'Chanussot et al., Open Catalyst 2020 (OC20) Dataset and Community Challenges, ACS Catal. (2021).',
  },
  oc22: {
    slug: 'oc22',
    name: 'OC22',
    fullName: 'Open Catalyst 2022 (oxides)',
    domain: 'Catalysis',
    size: '~62M frames',
    sizeLong: '~62k relaxations on oxide surfaces; ~62M structure-energy pairs',
    dft: 'PBE+U; VASP',
    year: 2022,
    curator: 'Meta FAIR-Chem',
    composition: 'Oxide-surface catalysis; emphasis on transition-metal oxides',
    license: 'CC-BY 4.0',
    doi: '10.1021/acscatal.2c05426',
    paper: 'Tran et al., The Open Catalyst 2022 (OC22) Dataset and Challenges for Oxide Electrocatalysis, ACS Catal. (2023).',
  },
  mptrj: {
    slug: 'mptrj',
    name: 'MPTrj',
    fullName: 'Materials Project Trajectories',
    domain: 'Materials',
    size: '~1.6M frames',
    sizeLong: '~1.6M VASP relaxation frames extracted from Materials Project',
    dft: 'PBE; PBE+U for select TMs; VASP',
    year: 2023,
    curator: 'Deng, Persson, et al. (CHGNet)',
    composition: 'Inorganic crystals; relaxation trajectories with forces and stresses',
    license: 'CC-BY 4.0',
    doi: '10.1038/s42256-023-00716-3',
    paper: 'Deng et al., CHGNet as a pretrained universal neural network potential for charge-informed atomistic modelling, Nat. Mach. Intell. 5:1031 (2023).',
  },
  spice: {
    slug: 'spice',
    name: 'SPICE',
    fullName: 'Small-molecule/Protein Interaction Chemical Energies',
    domain: 'Molecules',
    size: '~1.1M conformations',
    sizeLong: '~1.1M conformations; small drug-like molecules, dipeptides, ions, ligand-binding poses',
    dft: 'ωB97M-D3(BJ) / def2-TZVPPD',
    year: 2023,
    curator: 'Eastman, Pande et al. (OpenMM)',
    composition: 'Drug-like molecules + dipeptides; broad chemical space',
    license: 'MIT',
    doi: '10.1038/s41597-022-01882-6',
    paper: 'Eastman et al., SPICE: A Dataset for Training Machine Learning Potentials, Sci. Data 10:11 (2023).',
  },
  salex: {
    slug: 'salex',
    name: 'sAlex',
    fullName: 'Subsampled Alexandria',
    domain: 'Materials',
    size: '~4.2M structures',
    sizeLong: '~4.2M inorganic structures, subsampled from the Alexandria database',
    dft: 'PBE; some PBE+U; VASP',
    year: 2024,
    curator: 'Schmidt, Marques et al. (Alexandria) / FAIR-Chem (subsample)',
    composition: 'Inorganic crystals, broad coverage; many off-equilibrium structures',
    license: 'CC-BY 4.0',
    doi: '10.1002/adma.202210788',
    paper: 'Schmidt et al., Machine-Learning-Assisted Determination of the Global Zero-Temperature Phase Diagram of Materials, Adv. Mater. (2023).',
  },
  omat24: {
    slug: 'omat24',
    name: 'OMat24',
    fullName: 'Open Materials 2024',
    domain: 'Materials',
    size: '118M structures',
    sizeLong: '~118M structures; ~3.2B atom-environments',
    dft: 'PBE; PBE+U for 3d TMs',
    year: 2024,
    curator: 'Meta FAIR-Chem',
    composition: 'Inorganic crystals across 90 elements; equilibrium and non-equilibrium configurations',
    license: 'CC-BY 4.0',
    doi: '10.48550/arXiv.2410.12771',
    paper: 'Barroso-Luque et al., Open Materials 2024 (OMat24): A Foundation Dataset for Inorganic Materials, arXiv:2410.12771 (2024).',
  },
  mad: {
    slug: 'mad',
    name: 'MAD',
    fullName: 'Massive Atomistic Diversity',
    domain: 'Mixed',
    size: '~95M frames',
    sizeLong: '~95M frames spanning crystals, surfaces, molecules, and disordered configurations',
    dft: 'PBE / r²SCAN (mixed-fidelity)',
    year: 2025,
    curator: 'Garden Collaboration',
    composition: 'Curated mix of materials, molecules, catalysis; intentionally diverse',
    license: 'CC-BY 4.0',
    doi: 'pending',
    paper: 'Pending. Internal release notes at thegardens.ai/datasets/mad.',
  },
  omol25: {
    slug: 'omol25',
    name: 'OMol25',
    fullName: 'Open Molecules 2025',
    domain: 'Molecules',
    size: '~110M frames',
    sizeLong: '~110M molecular frames; ωB97X-D-quality energies and forces',
    dft: 'ωB97X-D / def2-TZVPD',
    year: 2025,
    curator: 'Meta FAIR-Chem',
    composition: 'Drug-like molecules, peptides, transition states; broad organic chemistry',
    license: 'CC-BY 4.0',
    doi: 'pending',
    paper: 'Levine et al., Open Molecules 2025: A Foundation Dataset for Molecular Chemistry, arXiv:2505.xxxxx (2025).',
  },
};

// Models with their training-data lineage. v1 default role is "Training data";
// where the role is known (pretraining / fine-tuning), it's listed explicitly.
// This drives both the "Models trained on this dataset" reverse-index and the
// "Used as" column on each detail page.
const MODEL_TRAINING_DATA = [
  { model:'UMA Medium',   slug:'uma-medium',    family:'Equivariant',     uses:[ {ds:'omat24', role:'Pretraining'}, {ds:'salex', role:'Pretraining'}, {ds:'omol25', role:'Joint training'} ] },
  { model:'UMA Small',    slug:'uma-small',     family:'Equivariant',     uses:[ {ds:'omat24', role:'Pretraining'}, {ds:'salex', role:'Pretraining'}, {ds:'omol25', role:'Joint training'} ] },
  { model:'EquiformerV2', slug:'equiformerv2',  family:'Equivariant',     uses:[ {ds:'oc20', role:'Training data'}, {ds:'oc22', role:'Training data'}, {ds:'omat24', role:'Fine-tuning'} ] },
  { model:'eSCN-L6',      slug:'escn-l6',       family:'Equivariant',     uses:[ {ds:'oc20', role:'Training data'}, {ds:'omat24', role:'Fine-tuning'} ] },
  { model:'SCN',          slug:'scn',           family:'Equivariant',     uses:[ {ds:'oc20', role:'Training data'} ] },
  { model:'GemNet-OC',    slug:'gemnet-oc',     family:'Message-Passing', uses:[ {ds:'oc20', role:'Training data'} ] },
  { model:'GemNet-T',     slug:'gemnet-t',      family:'Message-Passing', uses:[ {ds:'oc20', role:'Training data'} ] },
  { model:'PaiNN',        slug:'painn',         family:'Message-Passing', uses:[ {ds:'qm9', role:'Training data'}, {ds:'md17', role:'Training data'} ] },
  { model:'DimeNet++',    slug:'dimenetpp',     family:'Message-Passing', uses:[ {ds:'qm9', role:'Training data'}, {ds:'md17', role:'Training data'} ] },
  { model:'SchNet',       slug:'schnet',        family:'Message-Passing', uses:[ {ds:'qm9', role:'Training data'}, {ds:'md17', role:'Training data'} ] },
  { model:'MACE-MP-0',    slug:'mace-mp-0',     family:'ACE',             uses:[ {ds:'mptrj', role:'Training data'} ] },
  { model:'MACE-OFF23',   slug:'mace-off23',    family:'ACE',             uses:[ {ds:'spice', role:'Training data'} ] },
  { model:'MACE-Large',   slug:'mace-large',    family:'ACE',             uses:[ {ds:'mptrj', role:'Training data'}, {ds:'spice', role:'Auxiliary'} ] },
  { model:'Allegro',      slug:'allegro',       family:'ACE',             uses:[ {ds:'md17', role:'Training data'}, {ds:'spice', role:'Training data'} ] },
  { model:'NequIP',       slug:'nequip',        family:'Equivariant',     uses:[ {ds:'md17', role:'Training data'}, {ds:'qm9', role:'Training data'} ] },
  { model:'Orb-v2',       slug:'orb-v2',        family:'Equivariant',     uses:[ {ds:'mptrj', role:'Training data'} ] },
  { model:'Orb-v3',       slug:'orb-v3',        family:'Equivariant',     uses:[ {ds:'mptrj', role:'Training data'}, {ds:'omat24', role:'Fine-tuning'} ] },
  { model:'MatterSim-v1', slug:'mattersim-v1',  family:'Message-Passing', uses:[ {ds:'mp2018', role:'Training data'}, {ds:'mptrj', role:'Auxiliary'} ] },
  { model:'CHGNet',       slug:'chgnet',        family:'Message-Passing', uses:[ {ds:'mptrj', role:'Sole training data'} ] },
  { model:'M3GNet',       slug:'m3gnet',        family:'Message-Passing', uses:[ {ds:'mp2018', role:'Sole training data'} ] },
  { model:'ANI-2x',       slug:'ani-2x',        family:'Message-Passing', uses:[ {ds:'ani1x', role:'Training data'} ] },
  { model:'TorchMD-Net',  slug:'torchmd-net',   family:'Equivariant',     uses:[ {ds:'md17', role:'Training data'}, {ds:'qm9', role:'Training data'} ] },
];

// Free-form editorial blocks per dataset (kept separately from the structured
// record so they read as written prose, not data). Detail pages without an
// editorial block get a placeholder.
const DATASET_EDITORIAL = {
  omat24: {
    howToGet: [
      `OMat24 is hosted on Hugging Face Datasets at \`fairchem/OMat24\` and mirrored in the FAIR-Chem repository. The canonical format is LMDB (one shard per split: train, val_id, val_ood). Total on-disk size is ~640 GB; plan for that plus a working buffer.`,
      `No registration is required — the dataset is CC-BY 4.0. The recommended path uses \`huggingface-cli\` with parallel downloads enabled. On a Garden-supported cluster, the data is already at \`/scratch/.../garden-cache/datasets/omat24\` and Rootstock will pick it up.`,
    ],
    howToGetCode: `# Hugging Face (recommended)
huggingface-cli download fairchem/OMat24 --repo-type dataset --local-dir ./omat24
rootstock dataset get omat24   # uses cluster-local mirror if present`,
    notes: `OMat24 is the largest publicly available DFT-quality materials dataset to date and the de facto pretraining corpus for the UMA family and Orb-v3. Two caveats are worth flagging. First, composition coverage is broad but not uniform: oxides and intermetallics dominate; lanthanides and actinides are underrepresented. Second, PBE+U is applied to 3d transition metals only, which keeps energetics consistent within OMat24 but introduces a discontinuity if you fine-tune on r²SCAN data. The closest sibling is sAlex, which has more off-equilibrium configurations but a quarter the size.`,
    references: [
      { cite:'Barroso-Luque et al., OMat24, arXiv:2410.12771 (2024).',     href:'https://arxiv.org/abs/2410.12771' },
      { cite:'Hugging Face: fairchem/OMat24 dataset card.',                 href:'https://huggingface.co/datasets/fairchem/OMat24' },
      { cite:'Related: sAlex (subsampled Alexandria).',                     href:'/dataset/salex' },
      { cite:'Related: MPTrj (Materials Project trajectories).',            href:'/dataset/mptrj' },
    ],
  },
};

window.DATASET_RECORDS = DATASET_RECORDS;
window.MODEL_TRAINING_DATA = MODEL_TRAINING_DATA;
window.DATASET_EDITORIAL = DATASET_EDITORIAL;


// ─────────────────────────────────────────────────────────────────────────
// Index page
// ─────────────────────────────────────────────────────────────────────────

function DatasetsIndexPage(){
  const all = Object.values(DATASET_RECORDS).sort((a,b)=> a.year - b.year);

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>Datasets</span>
      </div>

      {/* Title block */}
      <div style={{marginTop:4}}>
        <div className="sc" style={{fontSize:11.5, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
          §05
        </div>
        <h1 style={{fontFamily:'var(--serif)', fontSize:42, lineHeight:1.0, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
          Datasets
        </h1>
        <div className="it" style={{fontSize:14, color:'var(--ink-2)', marginTop:4, lineHeight:1.4}}>
          The structure libraries from which these models descend.
        </div>
        <div style={{marginTop:8}}>
          <Ornament.Rule width={220}/>
        </div>
      </div>

      {/* Body — main + right rail */}
      <div className="cluster-body" style={{
        display:'grid',
        gridTemplateColumns: '1fr 220px',
        columnGap: 22,
        rowGap: 14,
        marginTop: 12,
        flex: 1,
      }}>
        <div>
          {/* Editorial preface */}
          <div style={{maxWidth:560, fontSize:12.75, lineHeight:1.5, color:'var(--ink)'}}>
            <p style={{margin:'0 0 8px'}}>
              The lineage of an MLIP is shaped at least as much by what it was
              trained on as by its architecture. Two equivariant transformers
              with nearly identical layer counts can produce wildly different
              relaxation paths if one was raised on QM9 and the other on OMat24.
              The clusters in the Map track training dataset more reliably
              than they track model family — and on most days, more reliably
              than the architecture diagrams in the original papers.
            </p>
            <p style={{margin:'0 0 8px'}}>
              This section is a working reference, not a comprehensive review of
              materials and molecular chemistry datasets. The entries cover the
              libraries actually referenced by the catalog. For broader surveys,
              see the original dataset papers cited below and the{' '}
              <a className="ink-link" href="https://opencatalystproject.org">Open Catalyst project documentation</a>.
            </p>
          </div>

          <div style={{height:12}}/>

          {/* Index table */}
          <table className="almanac" style={{fontSize:12.5}}>
            <thead>
              <tr>
                <th>Name</th>
                <th style={{width:110}}>Domain</th>
                <th style={{width:140, textAlign:'right'}}>Size</th>
                <th style={{width:130}}>DFT level</th>
                <th style={{width:54, textAlign:'right'}}>Year</th>
              </tr>
            </thead>
            <tbody>
              {all.map(d=>(
                <tr key={d.slug}>
                  <td>
                    <a className="ink-link" href={`/dataset/${d.slug}`} style={{fontStyle:'italic'}}>{d.name}</a>
                  </td>
                  <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                    {d.domain}
                  </td>
                  <td style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{d.size}</td>
                  <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                    {d.dft}
                  </td>
                  <td style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{d.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="it" style={{fontSize:11.5, color:'var(--ink-2)', marginTop:6}}>
            Sorted oldest first to read as a timeline of what models had to learn from.
          </div>
        </div>

        {/* Marginalia rail */}
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
            Cross-references
          </div>
          <div className="it" style={{
            fontStyle:'italic', fontSize:11.75, lineHeight:1.5, color:'var(--ink-2)'
          }}>
            Datasets and models cross-reference throughout the Almanac. Each
            dataset entry lists which models trained on it; each model entry
            lists its training data. The reverse-index is one of the most
            useful pages in the book — it answers <span style={{fontStyle:'normal'}}>“what's the
            lineage?”</span> in a single glance.
          </div>
        </aside>
      </div>

      <div className="folio">
        <span>§05 &middot; Datasets</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────
// Detail page — templated; OMat24 is the worked example
// ─────────────────────────────────────────────────────────────────────────

function DatasetDetailPage({ slug = 'omat24' }){
  const d = DATASET_RECORDS[slug] ?? DATASET_RECORDS.omat24;
  const ed = DATASET_EDITORIAL[d.slug] ?? DATASET_EDITORIAL.omat24;

  const trainedOn = MODEL_TRAINING_DATA
    .map(m => {
      const u = m.uses.find(x => x.ds === d.slug);
      return u ? { ...m, role: u.role } : null;
    })
    .filter(Boolean);

  const constitution = [
    ['Full name',           d.fullName],
    ['Curator',             d.curator],
    ['Size',                d.sizeLong],
    ['Composition coverage',d.composition],
    ['DFT level of theory', d.dft],
    ['Released',            String(d.year)],
    ['License',             d.license],
    ['DOI',                 { kind:'link', label:d.doi, href:`https://doi.org/${d.doi}` }],
    ['Primary paper',       d.paper],
  ];

  return (
    <div className="page" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <div className="running-head">
        <span>Garden &middot; thegardens.ai</span>
        <span>Dataset · {d.name}</span>
      </div>

      {/* Title block */}
      <div style={{marginTop:4}}>
        <div className="sc" style={{fontSize:11.5, letterSpacing:'0.14em', color:'var(--ink-2)'}}>
          {d.domain}
        </div>
        <h1 style={{fontFamily:'var(--serif)', fontSize:42, lineHeight:1.0, fontWeight:600, marginTop:3, letterSpacing:'-0.005em'}}>
          {d.name}
        </h1>
        <div className="it" style={{fontSize:14, color:'var(--ink-2)', marginTop:4, lineHeight:1.4}}>
          {d.fullName}. Released by {d.curator}, {d.year}.
        </div>
        <div style={{marginTop:8}}>
          <Ornament.Rule width={220}/>
        </div>
      </div>

      {/* Body — main + right rail */}
      <div className="cluster-body" style={{
        display:'grid',
        gridTemplateColumns: '1fr 220px',
        columnGap: 22,
        rowGap: 10,
        marginTop: 10,
        flex: 1,
      }}>
        <div>
          <DatasetSection heading="Constitution">
            <table className="almanac" style={{fontSize:12.25}}>
              <tbody>
                {constitution.map(([k,v])=>(
                  <tr key={k}>
                    <td className="sc" style={{width:170, fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                      {k}
                    </td>
                    <td>{renderDsValue(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DatasetSection>

          <div style={{height:6}}/>

          <DatasetSection heading="How to Get It">
            <div style={{fontSize:12.5, lineHeight:1.4, color:'var(--ink)'}}>
              {ed.howToGet.map((p,i)=>(
                <p key={i} style={{margin:'0 0 6px'}}>
                  {renderDsInline(p)}
                </p>
              ))}
              {ed.howToGetCode && (
                <div className="cmd" style={{marginTop:3, whiteSpace:'pre-wrap'}}>{ed.howToGetCode}</div>
              )}
            </div>
          </DatasetSection>

          <div style={{height:6}}/>

          <DatasetSection heading={`Models Trained on ${d.name}`}>
            <table className="almanac" style={{fontSize:12.25}}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th style={{width:140}}>Family</th>
                  <th style={{width:170}}>Used as</th>
                </tr>
              </thead>
              <tbody>
                {trainedOn.map(m=>(
                  <tr key={m.slug}>
                    <td>
                      <a className="ink-link" href={`/model/${m.slug}`} style={{fontStyle:'italic'}}>{m.model}</a>
                    </td>
                    <td className="sc" style={{fontFamily:'var(--smallcaps)', fontSize:11, letterSpacing:'0.08em'}}>
                      {m.family}
                    </td>
                    <td className="it" style={{color:'var(--ink-2)'}}>{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="it" style={{fontSize:11.5, color:'var(--ink-2)', marginTop:6}}>
              Computed from each model's <span style={{fontStyle:'normal'}}>training_data</span> field. See the{' '}
              <a className="ink-link" href="/datasets">datasets index</a> for the full list of corpora.
            </div>
          </DatasetSection>
        </div>

        {/* Marginalia rail — caveats + references */}
        <DatasetRail notes={ed.notes} references={ed.references}/>
      </div>

      <div className="folio">
        <span>Dataset &middot; {d.name}</span>
        <span className="num">·</span>
        <span>Garden's Almanac, 2026</span>
      </div>
    </div>
  );
}


// ── helpers ──────────────────────────────────────────────────────────────

function DatasetSection({ heading, children }){
  return (
    <section>
      <div className="sc" style={{
        fontFamily:'var(--smallcaps)',
        fontSize:12.5, letterSpacing:'0.10em',
        color:'var(--ink)',
        borderBottom: '1.5px solid var(--ink)',
        paddingBottom: 4,
      }}>{heading}</div>
      <div style={{marginTop:6}}>{children}</div>
    </section>
  );
}

function renderDsValue(v){
  if (v && typeof v === 'object' && v.kind === 'link'){
    return <a className="ink-link" href={v.href}>{v.label}</a>;
  }
  return v;
}

// inline backtick → <code>
function renderDsInline(text){
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

function DatasetRail({ notes, references }){
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
        fontStyle:'italic', fontSize:11.5, lineHeight:1.5, color:'var(--ink-2)'
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

window.DatasetsIndexPage = DatasetsIndexPage;
window.DatasetDetailPage = DatasetDetailPage;
