const { useState, useMemo, useEffect } = React;

const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateBR(s) {
  if (!s || typeof s !== 'string') return null;
  const p = s.split('/');
  if (p.length !== 3) return null;
  const dt = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(dt.getTime()) ? null : dt;
}

function getWindowStart(period) {
  const days = period === '7 dias' ? 7 : period === '30 dias' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildChartData(allPedidos, period) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (period === '90 dias') {
    const weeks = [];
    for (let w = 12; w >= 0; w--) {
      const wEnd = new Date(today); wEnd.setDate(today.getDate() - w * 7); wEnd.setHours(23, 59, 59, 999);
      const wStart = new Date(wEnd); wStart.setDate(wEnd.getDate() - 6); wStart.setHours(0, 0, 0, 0);
      const value = allPedidos
        .filter(o => { const d = parseDateBR(o.date); return d && d >= wStart && d <= wEnd && o.status !== 'Cancelado'; })
        .reduce((s, o) => s + (o.total || 0), 0);
      weeks.push({ value, label: `${wEnd.getDate()}/${wEnd.getMonth() + 1}`, today: w === 0 });
    }
    return weeks;
  }

  const days = period === '7 dias' ? 7 : 30;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today); day.setDate(today.getDate() - i);
    const key = `${String(day.getDate()).padStart(2,'0')}/${String(day.getMonth()+1).padStart(2,'0')}/${day.getFullYear()}`;
    const value = allPedidos
      .filter(o => o.date === key && o.status !== 'Cancelado')
      .reduce((s, o) => s + (o.total || 0), 0);
    const label = period === '7 dias' ? DAYS_SHORT[day.getDay()] : String(day.getDate());
    result.push({ value, label, today: i === 0 });
  }
  return result;
}

function computeDashMetrics(allPedidos, period) {
  const start = getWindowStart(period);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const inRange = allPedidos.filter(o => {
    const d = parseDateBR(o.date);
    return d && d >= start && d <= todayEnd && o.status !== 'Cancelado';
  });
  const faturamento  = inRange.reduce((s, o) => s + (o.total || 0), 0);
  const totalPedidos = inRange.length;
  const ticketMedio  = totalPedidos > 0 ? faturamento / totalPedidos : 0;
  const clientesAtivos = new Set(inRange.map(o => o.customerId || o.customer).filter(Boolean)).size;
  return { faturamento, totalPedidos, ticketMedio, clientesAtivos };
}

// ─── UI components (sem alterações de design) ─────────────────────────────────

function Metric({ icon: Ic, iconBg, iconColor, value, label, trend, trendTone = 'success' }) {
  return (
    <div className="card card-hover" style={{ padding: 22, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic size={22} color={iconColor} />
        </div>
        {trend && (
          <div className={`badge ${trendTone === 'success' ? 'badge-success' : 'badge-gray'}`}>
            {trendTone === 'success' && <IconArrowUp size={12} />}{trend}
          </div>
        )}
      </div>
      <div className="num" style={{ fontSize: 32, color: '#52170c', marginTop: 18, lineHeight: 1.1, letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Card({ title, sub, right, children, footer, pad = 24 }) {
  return (
    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: '#52170c' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ padding: `0 ${pad}px 4px`, flex: 1 }}>{children}</div>
      {footer && <div style={{ padding: '14px 24px 18px' }}>{footer}</div>}
    </div>
  );
}

function LinkBtn({ children, href = '#' }) {
  return (
    <a href={href} style={{ fontSize: 13, fontWeight: 600, color: window.THEME.primary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      onMouseEnter={e => e.currentTarget.style.color = '#fe9b55'}
      onMouseLeave={e => e.currentTarget.style.color = window.THEME.primary}>
      {children} <IconChevronRight size={14} />
    </a>
  );
}

function saudacao() {
  var h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function dataHoje() {
  return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [period, setPeriod] = useState('7 dias');
  const [allPedidos, setAllPedidos] = useState([]);
  const [alertasEstoque, setAlertasEstoque] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    try {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          var nome = user.displayName || user.email.split('@')[0];
          setUserName(nome.charAt(0).toUpperCase() + nome.slice(1));
        }
      });
    } catch(e) {}

    if (typeof DB === 'undefined') { setLoading(false); return; }

    Promise.all([
      DB.getPedidos(),
      DB.getClientes(),
      DB.getAlertasEstoque(10),
      DB.getProdutos(),
      DB.getCupons(),
    ]).then(function(results) {
      setAllPedidos(results[0]);
      // results[1] = clientes (carregado mas métricas calculadas dos pedidos)
      setAlertasEstoque(results[2]);
      setProdutos(results[3]);
      setCupons(results[4]);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  const metrics   = useMemo(() => computeDashMetrics(allPedidos, period), [allPedidos, period]);
  const chartData = useMemo(() => buildChartData(allPedidos, period),     [allPedidos, period]);
  const hasData   = chartData.some(d => d.value > 0);

  const recent = useMemo(() => {
    return [...allPedidos].sort(function(a, b) {
      var ta = a.createdAt?.seconds ?? ((parseDateBR(a.date)?.getTime() ?? 0) / 1000);
      var tb = b.createdAt?.seconds ?? ((parseDateBR(b.date)?.getTime() ?? 0) / 1000);
      return tb - ta;
    }).slice(0, 5);
  }, [allPedidos]);

  const chartTitle = period === '90 dias'
    ? 'Vendas — últimos 90 dias (por semana)'
    : `Vendas dos últimos ${period}`;
  const chartSub = period === '90 dias'
    ? 'Faturamento semanal agrupado'
    : 'Faturamento diário em reais';

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="dashboard" />
      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar title="Dashboard" search="Buscar produtos, pedidos, clientes..." />

        <main style={{ padding: 32 }}>
          {/* Welcome */}
          <div style={{ marginBottom: 24 }}>
            <h2 className="h-jakarta" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#52170c' }}>{saudacao()}, {userName} 👋</h2>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Aqui está o resumo do Empório — {dataHoje()}</div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 22 }}>
            <Metric icon={IconMoney} iconBg="#fdddc8" iconColor={window.THEME.primary}
              value={loading ? '—' : fmtBRL(metrics.faturamento)}
              label={`faturamento — ${period}`} />
            <Metric icon={IconOrders} iconBg="#e3f1e3" iconColor="#2e7d32"
              value={loading ? '—' : String(metrics.totalPedidos)}
              label={`pedidos — ${period}`} />
            <Metric icon={IconChart} iconBg="#e8eaf6" iconColor="#3949ab"
              value={loading ? '—' : fmtBRL(metrics.ticketMedio)}
              label="ticket médio" />
            <Metric icon={IconUsers} iconBg="#fdecd6" iconColor="#f57c00"
              value={loading ? '—' : String(metrics.clientesAtivos)}
              label={`clientes ativos — ${period}`} />
          </div>

          {/* Sales chart */}
          <div style={{ marginBottom: 22 }}>
            <Card title={chartTitle} sub={chartSub}
              right={
                <div style={{ display: 'flex', gap: 4, background: '#faf7f3', padding: 4, borderRadius: 999 }}>
                  {['7 dias','30 dias','90 dias'].map(p => (
                    <button key={p} className={`pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
                  ))}
                </div>
              }>
              <div style={{ paddingBottom: 12 }}>
                {hasData
                  ? <BarChart data={chartData} barColor="#d8a360" fmt={(v) => fmtBRL(v)} />
                  : <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      {loading ? 'Carregando…' : 'Nenhum dado para o período selecionado.'}
                    </div>
                }
              </div>
            </Card>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
            {/* Recent orders */}
            <Card title="Pedidos Recentes" right={<LinkBtn href="Pedidos.html">Ver todos</LinkBtn>}
              footer={<a href="Pedidos.html" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Ver todos os pedidos <IconChevronRight size={14} /></a>}
              pad={12}>
              <div>
                {recent.length === 0
                  ? <div style={{ padding: '20px 12px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                      {loading ? 'Carregando…' : 'Nenhum pedido registrado.'}
                    </div>
                  : recent.map((o, i) => {
                      const st = ORDER_STATUS_STYLE[o.status] || ORDER_STATUS_STYLE['Aguardando pagamento'];
                      return (
                        <a key={o.id} href={`Detalhe do Pedido.html?id=${o.id}`} className="row" style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10,
                          background: i % 2 ? '#faf7f3' : '#fff', textDecoration: 'none',
                        }}>
                          <span className="mono" style={{ fontSize: 13, color: '#87726e', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>#{String(o.id).slice(-6)}</span>
                          <span style={{ flex: 1, fontSize: 14, color: '#1c1c1a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer}</span>
                          <span className="num" style={{ fontSize: 14, color: '#52170c', flexShrink: 0 }}>{fmtBRL(o.total)}</span>
                          <span className={`badge ${st.cls}`} style={{ width: 116, flexShrink: 0, justifyContent: 'center' }}>
                            <span className="badge-dot" style={{ background: st.dot }} />{o.status}
                          </span>
                        </a>
                      );
                    })
                }
              </div>
            </Card>

            {/* Stock alerts */}
            <Card title="Alertas de Estoque" right={<IconBell size={18} color="#f57c00" />}
              footer={<a href="Estoque.html" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Gerenciar estoque <IconChevronRight size={14} /></a>}
              pad={12}>
              <div>
                {alertasEstoque.length === 0
                  ? <div style={{ padding: '20px 12px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>Nenhum alerta de estoque.</div>
                  : alertasEstoque.map((a, i) => (
                    <div key={i} className="row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.tone === 'error' ? '#ba1a1a' : '#f57c00', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 14, color: '#1c1c1a', fontWeight: 500 }}>{a.name}</span>
                      <span className="num" style={{ fontSize: 13, color: a.qty === 0 ? '#ba1a1a' : '#f57c00', width: 48, textAlign: 'right' }}>{a.qty} un</span>
                      <span className={`badge ${a.tone === 'error' ? 'badge-error' : 'badge-warn'}`} style={{ width: 84, justifyContent: 'center' }}>{a.level}</span>
                    </div>
                  ))
                }
              </div>
            </Card>
          </div>

          {/* Three small cards */}
          {(() => {
            const produtosAtivos    = produtos.filter(p => p.status === 'Ativo').length;
            const cuponsAtivos      = cupons.filter(c => c.status === 'Ativo').length;
            const cupomProximoVencer = cupons
              .filter(c => c.status === 'Ativo' && c.expiresIn && !c.expiresIn.includes('expirado'))
              .sort((a, b) => (a.expiresIn || '').localeCompare(b.expiresIn || ''))[0];
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, paddingBottom: 16 }}>
                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fdddc8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBox size={18} color={window.THEME.primary} /></div>
                    <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Produtos</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="num" style={{ fontSize: 28, color: '#52170c' }}>{produtosAtivos}</span>
                    <span style={{ fontSize: 13, color: '#87726e' }}>ativos</span>
                  </div>
                  {produtos.length > 0
                    ? <><div style={{ fontSize: 12, color: '#87726e', margin: '4px 0 14px' }}>de {produtos.length} cadastrados</div>
                       <ProgressBar value={produtosAtivos} max={Math.max(produtos.length, 1)} color="#d8a360" /></>
                    : <div style={{ fontSize: 12, color: '#87726e', marginTop: 8 }}>Nenhum produto cadastrado</div>}
                </div>

                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTicket size={18} color="#3949ab" /></div>
                    <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Cupons</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="num" style={{ fontSize: 28, color: '#52170c' }}>{cuponsAtivos}</span>
                    <span style={{ fontSize: 13, color: '#87726e' }}>ativos</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: cupomProximoVencer ? '#f57c00' : '#87726e', marginTop: 12, fontWeight: cupomProximoVencer ? 600 : 400 }}>
                    {cupomProximoVencer
                      ? <><IconHistory size={13} /> {cupomProximoVencer.code} vence {cupomProximoVencer.expiresIn}</>
                      : cupons.length === 0 ? 'Nenhum cupom cadastrado' : 'Nenhum vence em breve'}
                  </div>
                </div>

                <div className="card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fdecd6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconStar size={18} color="#f57c00" /></div>
                    <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Avaliações</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="num" style={{ fontSize: 28, color: '#52170c' }}>0</span>
                    <span style={{ fontSize: 13, color: '#87726e' }}>pendentes</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#87726e', marginTop: 12 }}>Nenhuma avaliação ainda</div>
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
