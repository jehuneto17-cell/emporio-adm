// Charts in the warm Empório palette. Pure SVG/CSS, no deps.
const { useState: useStateC } = React;

// ─── Vertical bar chart ─────────────────────────────────────────────────────
function BarChart({ data, height = 230, barColor = '#d8a360', highlightColor = window.THEME.primary, fmt = (v)=>v }) {
  const [hover, setHover] = useStateC(null);
  const max = Math.max(...data.map(d => d.value));
  const niceMax = Math.ceil(max / 500) * 500;
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round(niceMax - (niceMax / ticks) * i));
  const plotH = height - 34;

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* Y axis */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: plotH, paddingBottom: 2 }}>
        {tickVals.map((v, i) => (
          <div key={i} style={{ fontSize: 11, color: '#87726e', textAlign: 'right', lineHeight: 1, fontFamily: 'Plus Jakarta Sans', fontVariantNumeric: 'tabular-nums' }}>
            {v >= 1000 ? (v/1000).toLocaleString('pt-BR') + 'k' : v}
          </div>
        ))}
      </div>
      {/* Plot */}
      <div style={{ flex: 1 }}>
        <div style={{ position: 'relative', height: plotH }}>
          {/* grid lines */}
          {tickVals.map((_, i) => (
            <div key={i} className="grid-line" style={{ position: 'absolute', left: 0, right: 0, top: (plotH / ticks) * i }} />
          ))}
          {/* bars */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 4px' }}>
            {data.map((d, i) => {
              const h = (d.value / niceMax) * plotH;
              const active = d.today || hover === i;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  {(active) && (
                    <div className="num" style={{ fontSize: 12, color: d.today ? window.THEME.primary : '#52170c', marginBottom: 6, whiteSpace: 'nowrap' }}>
                      {fmt(d.value)}
                    </div>
                  )}
                  <div style={{
                    width: '100%', maxWidth: 46, height: Math.max(h, 4), borderRadius: '8px 8px 3px 3px',
                    background: d.today ? highlightColor : barColor,
                    opacity: hover === null || active ? 1 : 0.55,
                    transition: 'opacity .15s, height .4s cubic-bezier(.22,.61,.36,1)',
                    boxShadow: d.today ? '0 4px 12px rgba(150,73,4,0.3)' : 'none',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
        {/* X axis */}
        <div style={{ display: 'flex', gap: 14, padding: '10px 4px 0' }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: d.today ? 700 : 500, color: d.today ? window.THEME.primary : '#54433f' }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Line / area chart ──────────────────────────────────────────────────────
function LineChart({ data, height = 230, color = window.THEME.primary, fill = 'rgba(216,163,96,0.18)', fmt = (v)=>v }) {
  const [hover, setHover] = useStateC(null);
  const w = 620, plotH = height - 30, pad = 8;
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const min = Math.min(...data.map(d => d.value)) * 0.85;
  const x = (i) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v) => plotH - ((v - min) / (max - min)) * (plotH - 10);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  const area = `${pad},${plotH} ${pts} ${w - pad},${plotH}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${plotH}`} width="100%" height={plotH} preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
        onMouseLeave={() => setHover(null)}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={0} x2={w} y1={plotH * t} y2={plotH * t} stroke="#ecdfdb" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <polygon points={area} fill={fill} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <rect x={x(i) - (w / data.length / 2)} y={0} width={w / data.length} height={plotH} fill="transparent"
              onMouseEnter={() => setHover(i)} />
            <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 6 : 3.5} fill="#fff" stroke={color} strokeWidth="2.5" />
            {hover === i && (
              <g>
                <rect x={x(i) - 34} y={y(d.value) - 34} width={68} height={22} rx={6} fill="#1c1c1a" />
                <text x={x(i)} y={y(d.value) - 19} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Plus Jakarta Sans">{fmt(d.value)}</text>
              </g>
            )}
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 2px 0' }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: '#54433f', fontWeight: 500 }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Donut chart ────────────────────────────────────────────────────────────
function DonutChart({ data, size = 180, thickness = 26, centerLabel, centerSub }) {
  const [hover, setHover] = useStateC(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0ede9" strokeWidth={thickness} />
          {data.map((d, i) => {
            const frac = d.value / total;
            const len = frac * c;
            const seg = (
              <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
                stroke={d.color} strokeWidth={hover === i ? thickness + 4 : thickness}
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
                style={{ transition: 'stroke-width .15s', cursor: 'pointer' }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="num" style={{ fontSize: 26, color: '#52170c' }}>
            {hover !== null ? Math.round(data[hover].value / total * 100) + '%' : centerLabel}
          </div>
          <div style={{ fontSize: 11, color: '#87726e', marginTop: 2 }}>
            {hover !== null ? data[hover].label : centerSub}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: hover === null || hover === i ? 1 : 0.5, transition: 'opacity .15s', cursor: 'pointer' }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#54433f', flex: 1 }}>{d.label}</span>
            <span className="num" style={{ fontSize: 13, color: '#1c1c1a' }}>{Math.round(d.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ value, max = 100, color = '#d8a360', height = 8 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%', height, borderRadius: 999, background: '#f0ede9', overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', borderRadius: 999, background: color, transition: 'width .5s cubic-bezier(.22,.61,.36,1)' }} />
    </div>
  );
}

// ─── Horizontal bar (ranking) ───────────────────────────────────────────────
function HBar({ data, color = window.THEME.primary, fmt = (v)=>v }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#1c1c1a', fontWeight: 500 }}>{d.label}</span>
            <span className="num" style={{ fontSize: 13, color: '#52170c' }}>{fmt(d.value)}</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: '#f0ede9', overflow: 'hidden' }}>
            <div style={{ width: (d.value / max * 100) + '%', height: '100%', borderRadius: 999,
              background: d.color || color, transition: 'width .5s cubic-bezier(.22,.61,.36,1)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BarChart, LineChart, DonutChart, ProgressBar, HBar });
