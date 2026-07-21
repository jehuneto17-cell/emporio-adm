const { useState, useEffect } = React;

function downloadCSV(filename, rows) {
  const csv = rows.map(r =>
    r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')
  ).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const brl0 = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PERIODS = ['Este mês', 'Mês anterior', 'Últimos 3 meses', 'Este ano', 'Personalizado'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDateBR(s) {
  if (!s || typeof s !== 'string') return null;
  const p = s.split('/');
  if (p.length !== 3) return null;
  const dt = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(dt.getTime()) ? null : dt;
}

function getPeriodBounds(period) {
  const now = new Date();
  let start, end;
  if (period === 'Mês anterior') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (period === 'Últimos 3 meses') {
    start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (period === 'Este ano') {
    start = new Date(now.getFullYear(), 0, 1);
    end   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
  return { start, end };
}

function computeMetrics(orders, produtos, period) {
  const { start, end } = getPeriodBounds(period);
  const today = new Date(); today.setHours(23, 59, 59, 999);
  const capEnd = end < today ? end : today;

  const inRange = orders.filter(o => {
    const d = parseDateBR(o.date);
    return d && d >= start && d <= capEnd && o.status !== 'Cancelado';
  });

  const faturamento  = inRange.reduce((s, o) => s + (o.total    || 0), 0);
  const totalPedidos = inRange.length;
  const ticketMedio  = totalPedidos > 0 ? faturamento / totalPedidos : 0;
  const descontos    = inRange.reduce((s, o) => s + (o.discount || 0), 0);
  const frete        = inRange.reduce((s, o) => s + (o.freight  || 0), 0);

  // DAILY — one entry per calendar day in the visible range
  const daily = [];
  const cur = new Date(start);
  while (cur <= capEnd) {
    const key = `${String(cur.getDate()).padStart(2,'0')}/${String(cur.getMonth()+1).padStart(2,'0')}/${cur.getFullYear()}`;
    const v = inRange.filter(o => o.date === key).reduce((s, o) => s + (o.total || 0), 0);
    daily.push({ d: cur.getDate(), v, label: `${cur.getDate()} ${MONTHS_SHORT[cur.getMonth()]}` });
    cur.setDate(cur.getDate() + 1);
  }

  // Product aggregation from order items
  const productMap = {};
  inRange.forEach(o => {
    (o.products || []).forEach(item => {
      if (!item.n) return;
      if (!productMap[item.n]) productMap[item.n] = { qty: 0, rev: 0 };
      productMap[item.n].qty += (item.q || 0);
      productMap[item.n].rev += (item.p || 0) * (item.q || 0);
    });
  });

  // CATEGORIES — join with product catalog for category names
  const CAT_COLORS = [window.THEME.primary,'#d8a360','#2e7d32','#3949ab','#7b1fa2','#f57c00','#e53935'];
  const catMap = {};
  Object.entries(productMap).forEach(([name, data]) => {
    const prod = produtos.find(p => p.name === name);
    const cat = prod?.category || 'Outros';
    catMap[cat] = (catMap[cat] || 0) + data.rev;
  });
  const totalCatRev = Object.values(catMap).reduce((s, v) => s + v, 0);
  const categories = Object.entries(catMap)
    .sort(([,a],[,b]) => b - a)
    .map(([label, rev], i) => ({
      label, rev,
      value: totalCatRev > 0 ? Math.round((rev / totalCatRev) * 100) : 0,
      color: CAT_COLORS[i % CAT_COLORS.length],
    }));

  // TOP5
  const PROD_COLORS = ['#d8a360', window.THEME.primary,'#2e7d32','#3949ab','#7b1fa2'];
  const MEDALS = ['🥇','🥈','🥉'];
  const sorted = Object.entries(productMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5);
  const maxProdRev = sorted.length > 0 ? sorted[0].rev : 1;
  const top5 = sorted.map((p, i) => {
    const prod = produtos.find(pr => pr.name === p.name);
    return {
      rank: i + 1,
      medal: MEDALS[i],
      name: p.name,
      producer: prod?.producer || '—',
      cat: prod?.category || '—',
      qty: p.qty,
      rev: p.rev,
      pct: maxProdRev > 0 ? (p.rev / maxProdRev) * 100 : 0,
      color: PROD_COLORS[i],
    };
  });

  return { faturamento, totalPedidos, ticketMedio, descontos, frete, daily, categories, top5 };
}

// ─────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────
function Sparkline({ points, color = '#2e7d32', w = 92, h = 30 }) {
  if (!points || points.length === 0) return <span style={{ fontSize: 12, color: '#87726e' }}>—</span>;
  const max = Math.max(...points), min = Math.min(...points);
  const x = (i) => (i / (points.length - 1)) * w;
  const y = (v) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
  const line = points.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;
  const gid = 'sg' + color.replace('#', '');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r="2.6" fill={color} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────────────────────────────────
function Metric({ icon: Ic, iconBg, iconFg, value, label, delta, spark }) {
  return (
    <div className="card" style={{ padding: 22, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic size={23} color={iconFg} />
        </div>
        {spark && <div style={{ marginLeft: 'auto' }}><Sparkline points={spark} /></div>}
      </div>
      <div className="num" style={{ fontSize: 28, color: '#52170c', marginTop: 16, letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#87726e', marginTop: 4 }}>{label}</div>
      {(delta != null) && (
        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconArrowUp size={13} color="#2e7d32" /> {delta}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Daily area chart
// ─────────────────────────────────────────────────────────────────────────
function DailyChart({ data }) {
  const peakIdx = data.reduce((best, d, i) => d.v > (data[best]?.v || 0) ? i : best, 0);
  const [hover, setHover] = useState(null);
  const hoverIdx = hover !== null ? hover : peakIdx;
  const W = 880, H = 280, padL = 8, padR = 8, plotH = H - 28;
  const maxVal   = data.reduce((m, d) => Math.max(m, d.v), 0);
  const niceMax  = maxVal <= 0 ? 500 : Math.max(Math.ceil(maxVal / 500) * 500, 500);
  const tickStep = niceMax / 5;
  const ticks    = [5, 4, 3, 2, 1, 0].map(i => i * tickStep);
  const x = (i) => padL + (i / Math.max(data.length - 1, 1)) * (W - padL - padR);
  const y = (v) => (1 - v / niceMax) * plotH;
  const line = data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ');
  const area = `${padL},${plotH} ${line} ${W - padR},${plotH}`;
  const step = Math.max(1, Math.floor(data.length / 14));
  const xLabels = data.reduce((acc, d, i) => {
    if (i === 0 || i % step === 0 || i === data.length - 1) acc.push({ i, d: d.d });
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      {/* Y axis */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: plotH, paddingTop: 0 }}>
        {ticks.map((tk) => (
          <div key={tk} className="num" style={{ fontSize: 11, color: '#87726e', textAlign: 'right', lineHeight: 1 }}>{brl0(tk)}</div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', display: 'block' }} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={window.THEME.primary} stopOpacity="0.20" />
              <stop offset="100%" stopColor={window.THEME.primary} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((_, i) => (
            <line key={i} x1={0} x2={W} y1={(plotH / (ticks.length - 1)) * i} y2={(plotH / (ticks.length - 1)) * i} stroke="#f0ede9" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          <polygon points={area} fill="url(#revGrad)" />
          <polyline points={line} fill="none" stroke={window.THEME.primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <rect key={i} x={x(i) - (W / data.length / 2)} y={0} width={W / data.length} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />
          ))}
          {[peakIdx, hoverIdx].filter((v, i, a) => v != null && a.indexOf(v) === i).map((idx) => (
            <line key={idx} x1={x(idx)} x2={x(idx)} y1={y(data[idx].v)} y2={plotH} stroke={window.THEME.primary} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          ))}
          <circle cx={x(hoverIdx)} cy={y(data[hoverIdx].v)} r="6" fill={window.THEME.primary} stroke="#fff" strokeWidth="2.5" />
          <g transform={`translate(${Math.min(Math.max(x(hoverIdx), 60), W - 60)}, ${y(data[hoverIdx].v) - 16})`}>
            <rect x={-58} y={-26} width={116} height={26} rx={7} fill="#1c1c1a" />
            <text x={0} y={-9} fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="Plus Jakarta Sans">{data[hoverIdx].label} · {formatBRL(data[hoverIdx].v)}</text>
          </g>
        </svg>
        {/* X axis */}
        <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
          {xLabels.map(({ i, d }) => (
            <span key={i} className="num" style={{ position: 'absolute', left: `${(x(i) / W) * 100}%`, transform: 'translateX(-50%)', fontSize: 11, color: i === peakIdx ? window.THEME.primary : '#87726e', fontWeight: i === peakIdx ? 700 : 500 }}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card shell
// ─────────────────────────────────────────────────────────────────────────
function Panel({ title, sub, right, children, pad = 24 }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: '#52170c' }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: '#87726e', marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function EmptyChart({ label }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <IconChart size={28} color="var(--border)" />
      <div style={{ fontSize: 13, fontWeight: 500 }}>Nenhum dado disponível ainda</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label || 'Registre pedidos para ver os relatórios.'}</div>
    </div>
  );
}

function App() {
  const [period, setPeriod] = useState('Este mês');
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    Promise.all([DB.getPedidos(), DB.getProdutos()])
      .then(([orders, prods]) => { setAllOrders(orders); setProdutos(prods); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const metrics      = loading ? null : computeMetrics(allOrders, produtos, period);
  const faturamento  = metrics?.faturamento  ?? 0;
  const totalPedidos = metrics?.totalPedidos ?? 0;
  const ticketMedio  = metrics?.ticketMedio  ?? 0;
  const descontos    = metrics?.descontos    ?? 0;
  const frete        = metrics?.frete        ?? 0;
  const daily        = metrics?.daily        ?? [];
  const categories   = metrics?.categories   ?? [];
  const top5         = metrics?.top5         ?? [];
  const totalCat     = categories.reduce((s, c) => s + c.value, 0);

  const periodStart = getPeriodBounds(period).start;
  const mesAtual    = (s => s.charAt(0).toUpperCase() + s.slice(1))(
    periodStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );
  const sparkPoints = daily.map(d => d.v);

  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingFull, setExportingFull] = useState(false);

  const exportarPDF = () => { window.print(); };

  const exportarCSV = () => {
    if (loading) return;
    setExportingCSV(true);
    try {
      const rows = [
        [`Relatório financeiro — ${mesAtual}`],
        [],
        ['Faturamento diário'],
        ['Data', 'Faturamento (R$)'],
        ...daily.map(d => [d.label, d.v.toFixed(2).replace('.', ',')]),
        [],
        ['Produtos mais vendidos (Top 5)'],
        ['Ranking', 'Produto', 'Produtor', 'Categoria', 'Qtd. vendida', 'Receita (R$)'],
        ...top5.map(p => [p.rank, p.name, p.producer, p.cat, p.qty, p.rev.toFixed(2).replace('.', ',')]),
      ];
      downloadCSV(`relatorio-${period.toLowerCase().replace(/\s+/g, '-')}.csv`, rows);
    } finally {
      setExportingCSV(false);
    }
  };

  const exportarRelatorioCompleto = () => {
    if (loading) return;
    setExportingFull(true);
    try {
      const rows = [
        [`Relatório completo — ${mesAtual}`],
        [],
        ['Resumo financeiro'],
        ['Receita bruta (R$)', faturamento.toFixed(2).replace('.', ',')],
        ['Pedidos realizados', totalPedidos],
        ['Ticket médio (R$)', ticketMedio.toFixed(2).replace('.', ',')],
        ['Descontos aplicados (R$)', descontos.toFixed(2).replace('.', ',')],
        ['Frete cobrado (R$)', frete.toFixed(2).replace('.', ',')],
        ['Receita líquida (R$)', Math.max(0, faturamento - descontos).toFixed(2).replace('.', ',')],
        [],
        ['Faturamento diário'],
        ['Data', 'Faturamento (R$)'],
        ...daily.map(d => [d.label, d.v.toFixed(2).replace('.', ',')]),
        [],
        ['Vendas por categoria'],
        ['Categoria', 'Participação (%)', 'Receita (R$)'],
        ...categories.map(c => [c.label, c.value, c.rev.toFixed(2).replace('.', ',')]),
        [],
        ['Produtos mais vendidos (Top 5)'],
        ['Ranking', 'Produto', 'Produtor', 'Categoria', 'Qtd. vendida', 'Receita (R$)'],
        ...top5.map(p => [p.rank, p.name, p.producer, p.cat, p.qty, p.rev.toFixed(2).replace('.', ',')]),
      ];
      downloadCSV(`relatorio-completo-${period.toLowerCase().replace(/\s+/g, '-')}.csv`, rows);
    } finally {
      setExportingFull(false);
    }
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="relatorios" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Relatórios', href: 'Relatorios.html' }, { label: 'Financeiro' }]}
          search="Buscar relatório, produto, categoria..."
          actions={<>
            <button className="btn btn-outline no-print" onClick={exportarPDF}><IconDownload size={16} /> Exportar PDF</button>
            <button className="btn btn-outline no-print" onClick={exportarCSV} disabled={loading || exportingCSV}>
              {exportingCSV ? <><span className="spinner" /> Gerando...</> : <><IconDownload size={16} /> Exportar CSV</>}
            </button>
          </>} />

        <main style={{ padding: 32 }}>
          {/* period selector */}
          <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {PERIODS.map(p => (
                <button key={p} className={`pill ${period === p ? 'active' : ''}`}
                  style={period === p ? { background: '#52170c', color: '#fff' } : undefined}
                  onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="pg-btn" style={{ width: 'auto', padding: '0 12px', gap: 5 }}
                onClick={() => setPeriod('Mês anterior')}><IconChevronLeft size={15} /> Mês anterior</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconCalendar size={17} color={window.THEME.primary} />
                <span className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c' }}>{mesAtual}</span>
              </div>
              <button className="pg-btn" style={{ width: 'auto', padding: '0 12px', gap: 5 }}
                onClick={() => setPeriod('Este mês')}>Este mês <IconChevronRight size={15} /></button>
            </div>
          </div>

          {/* metrics */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <Metric icon={IconMoney} iconBg="#fdddc8" iconFg={window.THEME.primary}
              value={loading ? '—' : formatBRL(faturamento)} label={`faturamento — ${mesAtual}`} delta={null} spark={sparkPoints} />
            <Metric icon={IconCart} iconBg="#e3f1e3" iconFg="#2e7d32"
              value={loading ? '—' : String(totalPedidos)} label="pedidos realizados" delta={null} spark={sparkPoints} />
            <Metric icon={IconChart} iconBg="#e8eaf6" iconFg="#3949ab"
              value={loading ? '—' : formatBRL(ticketMedio)} label="ticket médio por pedido" delta={null} />
            <Metric icon={IconUserPlus} iconBg="#fdecd6" iconFg="#f57c00" value="—" label="novos clientes" delta={null} />
          </div>

          {/* daily revenue chart */}
          <div style={{ marginBottom: 24 }}>
            <Panel title={`Faturamento diário — ${mesAtual}`} sub="Receita gerada por dia no período selecionado">
              {daily.length > 0 ? <DailyChart data={daily} /> : <EmptyChart label="Nenhum pedido registrado neste período." />}
            </Panel>
          </div>

          {/* two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* categories */}
            <Panel title="Vendas por categoria" sub={`Receita por categoria — ${mesAtual}`}>
              {categories.length > 0 ? (
                <>
                  <DonutChart data={categories} centerLabel={brl0(faturamento)} centerSub="total" size={190} />
                  <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 20, paddingTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                    {categories.map(c => (
                      <div key={c.label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#54433f', flex: 1 }}>{c.label}</span>
                          <span className="num" style={{ fontSize: 12.5, color: '#87726e' }}>{c.value}%</span>
                          <span className="num" style={{ fontSize: 13, color: '#1c1c1a', fontWeight: 600 }}>{formatBRL(c.rev)}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 999, background: '#f0ede9', overflow: 'hidden' }}>
                          <div style={{ width: `${(c.value / totalCat) * 100}%`, height: '100%', background: c.color, borderRadius: 999 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyChart label="Dados por categoria disponíveis após registrar pedidos." />}
            </Panel>

            {/* top products */}
            <Panel title="Produtos mais vendidos" sub={`Top 5 por receita — ${mesAtual}`} pad={0}>
              {top5.length > 0 ? (
                <>
                  <div>
                    {top5.map((p, i) => (
                      <div key={p.rank} className="rankrow" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: i < top5.length - 1 ? '1px solid #f0ede9' : 'none' }}>
                        <div style={{ width: 30, textAlign: 'center', flexShrink: 0 }}>
                          {p.medal ? <span style={{ fontSize: 20 }}>{p.medal}</span> : <span className="num" style={{ fontSize: 15, color: '#87726e' }}>{p.rank}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#87726e', marginTop: 2 }}>{p.producer} · {p.cat}</div>
                          <div style={{ height: 6, borderRadius: 999, background: '#f0ede9', overflow: 'hidden', marginTop: 8 }}>
                            <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 999, transition: 'width .5s' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="num" style={{ fontSize: 14, color: '#52170c', fontWeight: 600 }}>{formatBRL(p.rev)}</div>
                          <div style={{ fontSize: 12, color: '#87726e', marginTop: 2 }}>{p.qty} un</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-soft)' }}>
                    <a href="Painel Admin.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: window.THEME.primary, textDecoration: 'none' }}>
                      Ver todos os produtos <IconChevronRight size={15} />
                    </a>
                  </div>
                </>
              ) : <EmptyChart label="Ranking disponível após registrar pedidos." />}
            </Panel>
          </div>

          {/* financial summary */}
          <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {[
              ['Receita bruta',       formatBRL(faturamento),                                          '#1c1c1a', false],
              ['Descontos aplicados', descontos > 0 ? `− ${formatBRL(descontos)}` : '− R$ 0,00',      '#ba1a1a', false],
              ['Frete cobrado',       frete > 0     ? `+ ${formatBRL(frete)}`     : '+ R$ 0,00',      '#2e7d32', false],
              ['Receita líquida',     formatBRL(Math.max(0, faturamento - descontos)),                 '#52170c', true],
            ].map(([label, val, color, big], i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: 1, height: 48, background: 'var(--border-soft)', margin: '0 28px' }} />}
                <div>
                  <div style={{ fontSize: 12, color: '#87726e', marginBottom: 6 }}>{label}</div>
                  <div className="num" style={{ fontSize: big ? 22 : 18, color, fontWeight: big ? 700 : 600 }}>{val}</div>
                </div>
              </React.Fragment>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary no-print" style={{ background: window.THEME.primary }} onClick={exportarRelatorioCompleto} disabled={loading || exportingFull}>
              {exportingFull ? <><span className="spinner" /> Gerando...</> : <><IconDownload size={16} /> Exportar relatório completo</>}
            </button>
          </div>
        </main>
      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
