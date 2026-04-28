// Geometric ornaments built from primitives only — circles, lines, dots.
// No figurative drawing. Original; not copied from any almanac.

const Ornament = {};

// A horizontal flourish: dot · line · diamond · line · dot
Ornament.Rule = function({ width = 280, color = '#1a1612' }) {
  return (
    <svg width={width} height="14" viewBox={`0 0 ${width} 14`} aria-hidden="true">
      <line x1="0" y1="7" x2={width} y2="7" stroke={color} strokeWidth="0.6" />
      <circle cx="14" cy="7" r="1.6" fill={color} />
      <circle cx={width - 14} cy="7" r="1.6" fill={color} />
      <g transform={`translate(${width/2},7) rotate(45)`}>
        <rect x="-4" y="-4" width="8" height="8" fill={color} />
      </g>
      <line x1={width/2 - 22} y1="7" x2={width/2 - 8} y2="7" stroke={color} strokeWidth="1.2" />
      <line x1={width/2 + 8} y1="7" x2={width/2 + 22} y2="7" stroke={color} strokeWidth="1.2" />
    </svg>
  );
};

// A compact section opener: ❦-style asterism made of three dots
Ornament.Asterism = function({ size = 18, color = '#1a1612' }) {
  return (
    <svg width={size*3} height={size} viewBox="0 0 54 18" aria-hidden="true" style={{display:'inline-block', verticalAlign:'middle'}}>
      <circle cx="9"  cy="13" r="1.6" fill={color} />
      <circle cx="27" cy="5"  r="1.6" fill={color} />
      <circle cx="45" cy="13" r="1.6" fill={color} />
    </svg>
  );
};

// Frontispiece "molecule + map" emblem.
// Concentric compass-rose rings with bond-graph inside. Geometric only.
Ornament.Frontispiece = function({ size = 320, color = '#1a1612', accent = '#7a1f1f' }) {
  const c = size / 2;
  // Bond graph: hexagonal ring + 3 outer atoms, all from circles + lines
  const r = size * 0.18;
  const hex = Array.from({length:6}, (_,i)=>{
    const a = (Math.PI/3) * i - Math.PI/2;
    return { x: c + r*Math.cos(a), y: c + r*Math.sin(a) };
  });
  // 8-point star = two squares rotated
  const ringR = size * 0.40;
  const compassRays = Array.from({length:16}, (_,i)=>{
    const a = (Math.PI/8) * i;
    const long = i % 4 === 0;
    const r1 = size * 0.30;
    const r2 = long ? size * 0.46 : size * 0.42;
    return {
      x1: c + r1*Math.cos(a), y1: c + r1*Math.sin(a),
      x2: c + r2*Math.cos(a), y2: c + r2*Math.sin(a),
      long
    };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* outer concentric rings */}
      <circle cx={c} cy={c} r={size*0.48} fill="none" stroke={color} strokeWidth="0.6" />
      <circle cx={c} cy={c} r={size*0.46} fill="none" stroke={color} strokeWidth="0.6" />
      <circle cx={c} cy={c} r={size*0.40} fill="none" stroke={color} strokeWidth="0.4" />
      {/* tick marks around outer ring (24 ticks) */}
      {Array.from({length:48}, (_,i)=>{
        const a = (Math.PI*2/48)*i;
        const long = i % 4 === 0;
        const r1 = size * (long ? 0.475 : 0.478);
        const r2 = size * (long ? 0.46 : 0.465);
        return <line key={i}
          x1={c + r1*Math.cos(a)} y1={c + r1*Math.sin(a)}
          x2={c + r2*Math.cos(a)} y2={c + r2*Math.sin(a)}
          stroke={color} strokeWidth="0.5" />;
      })}
      {/* compass rays */}
      {compassRays.map((r,i)=>(
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke={color} strokeWidth={r.long?"0.9":"0.4"} />
      ))}
      {/* latitude/longitude graticule across the disc */}
      <g clipPath="url(#disc)">
        {Array.from({length:5},(_,i)=>{
          const y = c - size*0.30 + i*size*0.15;
          return <line key={'h'+i} x1={c-size*0.30} y1={y} x2={c+size*0.30} y2={y}
                       stroke={color} strokeWidth="0.3" strokeDasharray="2 3" opacity="0.5" />;
        })}
      </g>
      <defs><clipPath id="disc"><circle cx={c} cy={c} r={size*0.30} /></clipPath></defs>

      {/* inner hex molecule */}
      <g>
        {hex.map((p,i)=>{
          const q = hex[(i+1)%6];
          return <line key={'b'+i} x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                       stroke={color} strokeWidth="1.1" />;
        })}
        {/* outer atoms — three of the six get a "bond" outward */}
        {[0,2,4].map(i=>{
          const p = hex[i];
          const a = Math.atan2(p.y-c, p.x-c);
          const ox = c + (r+size*0.07)*Math.cos(a);
          const oy = c + (r+size*0.07)*Math.sin(a);
          return (
            <g key={'o'+i}>
              <line x1={p.x} y1={p.y} x2={ox} y2={oy} stroke={color} strokeWidth="1.1" />
              <circle cx={ox} cy={oy} r="3.2" fill={accent} stroke={color} strokeWidth="0.6"/>
            </g>
          );
        })}
        {/* the hex atoms themselves */}
        {hex.map((p,i)=>(
          <circle key={'a'+i} cx={p.x} cy={p.y} r="2.6" fill="#f4ede0" stroke={color} strokeWidth="0.9" />
        ))}
      </g>

      {/* center dot */}
      <circle cx={c} cy={c} r="1.6" fill={color}/>
    </svg>
  );
};

// A small marginalia mark: a manicule-style arrow built from triangles.
Ornament.Pointer = function({ size=14, color='#1a1612' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{display:'inline-block', verticalAlign:'-2px', marginRight:4}}>
      <polygon points="2,7 8,3 8,5 12,5 12,9 8,9 8,11" fill={color} />
    </svg>
  );
};

window.Ornament = Ornament;
