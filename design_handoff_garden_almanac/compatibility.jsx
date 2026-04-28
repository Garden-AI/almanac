// Compatibility Matrix — landscape reference page.
// Models × clusters. Three cell states: verified / lapsed / not applicable.

function CompatibilityMatrix() {
  const clusters = [
  { name: 'Polaris', inst: 'ALCF', gpu: 'NVIDIA A100' },
  { name: 'Frontier', inst: 'OLCF', gpu: 'AMD MI250X' },
  { name: 'Perlmutter', inst: 'NERSC', gpu: 'NVIDIA A100' },
  { name: 'Delta', inst: 'NCSA', gpu: 'NVIDIA A100' },
  { name: 'Della', inst: 'Princeton', gpu: 'NVIDIA H100' },
  { name: 'Sophia', inst: 'ALCF', gpu: 'NVIDIA A100' },
  { name: '+ more', inst: 'Coming soon', gpu: '—', placeholder: true }];


  // states: 'v' verified, 'l' lapsed, 'n' not applicable
  const rows = [
  { model: 'UMA Medium', family: 'Equivariant', params: '1.4B', states: ['v', 'l', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'UMA Small', family: 'Equivariant', params: '420M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'EquiformerV2', family: 'Equivariant', params: '153M', states: ['v', 'n', 'v', 'v', 'v', 'l', 'n'] },
  { model: 'MACE-MP-0', family: 'ACE', params: '4.7M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'MACE-OFF23', family: 'ACE', params: '4.7M', states: ['v', 'l', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'MACE-Large', family: 'ACE', params: '15.6M', states: ['v', 'l', 'v', 'l', 'v', 'v', 'n'] },
  { model: 'eSEN-OMat', family: 'Equivariant', params: '180M', states: ['v', 'n', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'Orb-v3', family: 'Equivariant', params: '48M', states: ['v', 'n', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'Orb-v2', family: 'Equivariant', params: '25M', states: ['v', 'n', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'MatterSim-v1', family: 'Message-pass', params: '182M', states: ['v', 'n', 'v', 'l', 'v', 'v', 'n'] },
  { model: 'CHGNet', family: 'Message-pass', params: '0.4M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'M3GNet', family: 'Message-pass', params: '0.2M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'GemNet-OC', family: 'Message-pass', params: '38M', states: ['v', 'n', 'v', 'v', 'v', 'l', 'n'] },
  { model: 'GemNet-T', family: 'Message-pass', params: '31M', states: ['l', 'n', 'v', 'v', 'v', 'l', 'n'] },
  { model: 'PaiNN', family: 'Message-pass', params: '14M', states: ['v', 'l', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'DimeNet++', family: 'Message-pass', params: '10M', states: ['v', 'n', 'v', 'v', 'v', 'l', 'n'] },
  { model: 'SchNet', family: 'Message-pass', params: '1.7M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'NequIP', family: 'Equivariant', params: '2.5M', states: ['v', 'l', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'Allegro', family: 'ACE', params: '8.0M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'eSCN-L6', family: 'Equivariant', params: '200M', states: ['v', 'n', 'l', 'v', 'v', 'v', 'n'] },
  { model: 'TorchMD-Net', family: 'Equivariant', params: '7.0M', states: ['l', 'n', 'v', 'v', 'v', 'v', 'n'] },
  { model: 'ANI-2x', family: 'Message-pass', params: '1.5M', states: ['v', 'v', 'v', 'v', 'v', 'v', 'n'] }];


  // Counts for the legend / summary line
  const total = rows.length * (clusters.length - 1); // exclude the placeholder col
  let v = 0,l = 0,n = 0;
  rows.forEach((r) => r.states.slice(0, -1).forEach((s) => {
    if (s === 'v') v++;else if (s === 'l') l++;else n++;
  }));

  return (
    <div className="page" style={{ height: '100%', padding: '40px 56px 48px' }}>
      <div className="running-head">
        <span>The Compatibility Matrix</span>
        <span>Which models run where</span>
      </div>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end' }}>
        <div>
          <div className="sc" style={{ fontSize: 11.5, letterSpacing: '0.14em', color: 'var(--ink-2)' }}>Pull-out reference</div>
          <h1 style={{ fontSize: 40, marginTop: 2, lineHeight: 1 }}>The Availability Matrix</h1>
          <div className="it" style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 4, maxWidth: 780 }}>
            A filled circle means Rootstock tested the install and ran a basic inference within the last
            seven days. An open circle means that check has lapsed. Empty cells with hatching mean the model
            is not supported on that cluster. Nightly tests keep the table current.
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
          <div className="sc" style={{ fontSize: 10.5, letterSpacing: '0.10em', color: 'var(--ink)' }}>Last updated</div>
          27 April 2026 &middot; 03:14 UTC<br />
          <span className="mono" style={{ fontSize: 11 }}>nightly CI &middot; rootstock&nbsp;0.9.4</span>
        </div>
      </div>
      <hr className="double-rule" style={{ marginTop: 10, marginBottom: 14 }} />

      {/* Matrix */}
      <div>
        <table className="almanac" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 24 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 60 }} />
              {clusters.map((c, i) => <col key={i} style={{ width: 'auto' }} />)}
            </colgroup>
            <thead>
              <tr>
                <th>№</th>
                <th>Model</th>
                <th style={{ textAlign: 'right' }}>Size</th>
                {clusters.map((c) =>
              <th key={c.name} style={{ textAlign: 'center', verticalAlign: 'bottom', padding: '6px 4px' }}>
                    <div style={{
                  fontFamily: 'var(--smallcaps)',
                  fontSize: 12.5,
                  letterSpacing: '0.06em',
                  color: c.placeholder ? 'var(--ink-3)' : 'var(--ink)',
                  fontStyle: c.placeholder ? 'italic' : 'normal'
                }}>
                      {c.name}
                    </div>
                    <div className="sc" style={{
                  fontSize: 9.5,
                  letterSpacing: '0.10em',
                  color: 'var(--ink-2)',
                  marginTop: 1
                }}>
                      {c.inst}
                    </div>
                    <div className="mono" style={{
                  fontSize: 9,
                  color: 'var(--ink-3)',
                  marginTop: 1,
                  letterSpacing: '0.02em'
                }}>
                      {c.gpu}
                    </div>
                  </th>
              )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) =>
            <tr key={r.model}>
                  <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-2)' }}>{String(i + 1).padStart(2, '0')}</td>
                  <td><a className="ink-link" style={{ fontWeight: 600 }}>{r.model}</a></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.params}</td>
                  {r.states.map((s, j) =>
              <td key={j} style={{ textAlign: 'center', padding: '4px 0', position: 'relative' }}>
                      <CellMark state={s} placeholder={clusters[j].placeholder} />
                    </td>
              )}
                </tr>
            )}
            </tbody>
          </table>

          {/* Caption + legend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, fontSize: 11.5 }}>
            <span className="it" style={{ color: 'var(--ink-2)' }}>
              {rows.length} models &middot; {clusters.length - 1} clusters &middot; {v} verified, {l} lapsed, {n} not applicable
            </span>
            <Legend />
          </div>
      </div>

      <div className="folio">
        <span>The Compatibility Matrix</span>
        <span className="num">156</span>
        <span>Garden's Atlas, 2026</span>
      </div>
    </div>);

}

function CellMark({ state, placeholder }) {
  if (placeholder) {
    return (
      <span style={{ display: 'inline-block', width: 14, height: 14, opacity: 0.4 }}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <text x="7" y="11" textAnchor="middle" fontFamily="'Source Serif 4',serif"
          fontSize="12" fill="#7a7268">·</text>
        </svg>
      </span>);

  }
  if (state === 'v') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-label="verified">
        <circle cx="7" cy="7" r="3.6" fill="#7a1f1f" />
      </svg>);

  }
  if (state === 'l') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-label="lapsed">
        <circle cx="7" cy="7" r="3.4" fill="none" stroke="#7a1f1f" strokeWidth="1" />
      </svg>);

  }
  // not applicable — diagonal hatch fill across the cell
  return (
    <svg width="100%" height="14" viewBox="0 0 40 14" preserveAspectRatio="none" aria-label="not applicable" style={{ display: 'block' }}>
      <defs>
        <pattern id="na-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#1f1c18" strokeWidth="0.5" opacity="0.35" />
        </pattern>
      </defs>
      <rect x="0" y="3" width="40" height="8" fill="url(#na-hatch)" />
    </svg>);

}

function Legend() {
  const item = (mark, label) =>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 14 }}>
      <span style={{ display: 'inline-flex', width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>{mark}</span>
      <span className="sc" style={{ fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--ink-2)' }}>{label}</span>
    </span>;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {item(<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="3.6" fill="#7a1f1f" /></svg>, 'Verified')}
      {item(<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="3.4" fill="none" stroke="#7a1f1f" strokeWidth="1" /></svg>, 'Lapsed')}
      {item(<svg width="14" height="6" viewBox="0 0 14 6"><defs><pattern id="lg-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#1f1c18" strokeWidth="0.5" opacity="0.5" /></pattern></defs><rect x="0" y="0" width="14" height="6" fill="url(#lg-hatch)" /></svg>, 'Not applicable')}
    </span>);

}

window.CompatibilityMatrix = CompatibilityMatrix;