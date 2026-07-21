const { useState, useMemo } = React;

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

// Adapta cliente do Firestore para o formato da UI
function firestoreToClient(c, idx) {
  const GRAD_POOL = [
    ['#d8a360','#a85a32'], ['#52170c', window.THEME.primary], ['#2e7d32','#4caf50'],
    ['#1976d2','#42a5f5'], ['#7b1fa2','#ce93d8'], ['#f57c00','#ffb74d'],
    ['#4b2316','#8a4a14'], ['#52170c','#d8a360'],
  ];
  const name = c.name || 'Cliente';
  const parts = name.split(' ');
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  return {
    id: c.id,
    initials,
    grad: GRAD_POOL[idx % GRAD_POOL.length],
    name,
    city: c.city || '—',
    email: c.email || '—',
    phone: c.phone || '—',
    orders: c.orders || 0,
    spent: c.spent || 0,
    last: c.last || '—',
    since: c.since || '—',
    status: c.tier === 'Novo' ? 'novo' : c.status || 'ativo',
  };
}

const FILTERS = ['Todos', 'Ativos', 'Inativos', 'Novos este mês'];

// ─────────────────────────────────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────────────────────────────────
function Metric({ icon: Ic, iconBg, iconFg, value, label, sub, subTone }) {
  return (
    <div className="card" style={{ padding: 22, flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ic size={24} color={iconFg} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="num" style={{ fontSize: 32, color: '#52170c', lineHeight: 1.05, letterSpacing: '-.02em' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#87726e', marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, color: subTone === 'success' ? '#2e7d32' : '#87726e', display: 'flex', alignItems: 'center', gap: 4 }}>
          {subTone === 'success' && <IconArrowUp size={13} color="#2e7d32" />}{sub}
        </div>
      </div>
    </div>
  );
}

function Avatar({ c, size = 38 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: `linear-gradient(135deg,${c.grad[0]},${c.grad[1]})`, fontSize: size * 0.34 }}>{c.initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────────────────
function ProfileDrawer({ c, onClose }) {
  const orders = []; // pedidos recentes por cliente: futuro DB.getPedidosByCliente(c.id)
  const addr = null;
  const avg = c.orders > 0 ? c.spent / c.orders : 0;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: 420 }}>
        {/* header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border-soft)', background: '#fff', position: 'relative' }}>
          <button className="btn-icon" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }} title="Fechar"><IconX size={18} /></button>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar c={c} size={64} />
            <div style={{ minWidth: 0, paddingRight: 30 }}>
              <div className="h-jakarta" style={{ fontSize: 20, fontWeight: 700, color: '#1c1c1a' }}>{c.name}</div>
              <div style={{ fontSize: 13, color: '#54433f', marginTop: 3 }}>{c.email}</div>
              <div style={{ fontSize: 13, color: '#54433f', marginTop: 1 }}>{c.phone}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12.5, color: '#87726e', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconMapPin size={14} color="#87726e" /> {c.city}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconCalendar size={14} color="#87726e" /> Cliente desde {c.since}</span>
          </div>
        </div>

        {/* scroll body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[
              [c.orders, 'pedidos'],
              [formatBRL(c.spent), 'total gasto'],
              [formatBRL(avg), 'ticket médio'],
            ].map(([v, l], i) => (
              <div key={i} className="card" style={{ flex: 1, padding: '14px 12px', textAlign: 'center', boxShadow: 'none', background: '#fff' }}>
                <div className="num" style={{ fontSize: i === 0 ? 22 : 16, color: '#52170c' }}>{v}</div>
                <div style={{ fontSize: 11, color: '#87726e', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* recent orders */}
          <div style={{ marginBottom: 24 }}>
            <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c', marginBottom: 12 }}>Últimos pedidos</div>
            {orders.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>Nenhum pedido encontrado para este cliente.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {orders.map(o => (
                  <a key={o.id} href="Detalhe do Pedido.html" style={{ textDecoration: 'none' }}>
                    <div className="card card-hover" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'none', border: '1px solid var(--border-soft)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1c1a' }}>#{o.id}</div>
                        <div style={{ fontSize: 12, color: '#87726e', marginTop: 1 }}>{o.date} · {o.total}</div>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  </a>
                ))}
              </div>
            )}
            <a href="Pedidos.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 13, fontWeight: 600, color: window.THEME.primary, textDecoration: 'none' }}>
              Ver todos os pedidos <IconChevronRight size={14} />
            </a>
          </div>

          {/* address */}
          <div>
            <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c', marginBottom: 10 }}>Endereço principal</div>
            {addr ? (
              <div className="card" style={{ padding: '14px 16px', boxShadow: 'none', border: '1px solid var(--border-soft)', display: 'flex', gap: 12 }}>
                <IconMapPin size={18} color={window.THEME.primary} />
                <div style={{ fontSize: 13.5, color: '#54433f', lineHeight: 1.6 }}>
                  <div style={{ color: '#1c1c1a', fontWeight: 600 }}>{addr.line1}</div>
                  <div>{addr.district} · {addr.city} · {addr.state}</div>
                  <div>CEP {addr.cep}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Endereço não cadastrado.</div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: 20, borderTop: '1px solid var(--border-soft)', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="Pedidos.html" className="btn btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>Ver todos os pedidos</a>
          <button className="btn btn-outline" style={{ justifyContent: 'center' }}><IconMail size={16} /> Enviar mensagem</button>
        </div>
      </div>
    </>
  );
}

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [filter, setFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getClientes()
      .then(data => { setClientes(data.map(firestoreToClient)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  React.useEffect(() => { setPage(1); }, [filter]);

  const filtered = filter === 'Todos' ? clientes
    : filter === 'Ativos' ? clientes.filter(c => c.status === 'ativo')
    : filter === 'Inativos' ? clientes.filter(c => c.status === 'inativo')
    : clientes.filter(c => c.status === 'novo');

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [exportingCSV, setExportingCSV] = useState(false);
  const STATUS_LABEL = { ativo: 'Ativo', inativo: 'Inativo', novo: 'Novo' };
  const exportarCSV = () => {
    if (loading || filtered.length === 0) return;
    setExportingCSV(true);
    try {
      const csvRows = [
        ['Nome', 'E-mail', 'Telefone', 'Status', 'Total de pedidos', 'Total Gasto', 'Data de cadastro'],
        ...filtered.map(c => [
          c.name, c.email, c.phone,
          STATUS_LABEL[c.status] || c.status,
          c.orders, formatBRL(c.spent), c.since,
        ]),
      ];
      downloadCSV('clientes.csv', csvRows);
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="clientes" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Clientes', href: 'Clientes.html' }, { label: 'Base de clientes' }]}
          search="Buscar por nome, e-mail, telefone..." />

        <main style={{ padding: 32 }}>
          {/* metrics */}
          {(() => {
            const totalGasto = clientes.reduce((s, c) => s + (c.spent || 0), 0);
            const ticket = clientes.length > 0 ? totalGasto / clientes.length : 0;
            return (
              <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                <Metric icon={IconUsers} iconBg="#e8eaf6" iconFg="#3949ab"
                  value={loading ? '—' : String(clientes.length)} label="clientes cadastrados" sub="base completa" />
                <Metric icon={IconUserCheck} iconBg="#e3f1e3" iconFg="#2e7d32"
                  value={loading ? '—' : String(clientes.filter(c => c.status === 'ativo').length)} label="clientes ativos" sub="com ao menos 1 pedido" />
                <Metric icon={IconMoney} iconBg="#fdddc8" iconFg={window.THEME.primary}
                  value={loading ? '—' : formatBRL(ticket)} label="ticket médio por cliente" sub="total gasto ÷ total clientes" />
              </div>
            );
          })()}

          {/* action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} className={`pill ${filter === f ? 'active' : ''}`}
                  style={filter === f ? { background: '#52170c', color: '#fff' } : undefined}
                  onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#87726e' }}><span style={{ fontWeight: 600, color: '#54433f' }}>{filtered.length}</span> clientes encontrados</div>
            <div style={{ flex: 1 }} />
            <button className="btn btn-outline" onClick={exportarCSV} disabled={loading || exportingCSV || filtered.length === 0}>
              {exportingCSV ? <><span className="spinner" /> Gerando...</> : <><IconDownload size={16} /> Exportar CSV</>}
            </button>
          </div>

          {/* table */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconUsers size={26} color="#3949ab" /></div>
              <div>
                <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>Nenhum cliente ainda</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Os clientes aparecem aqui quando se cadastrarem no app.</div>
              </div>
            </div>
          ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--th)', borderBottom: '1px solid var(--border-soft)' }}>
                  {['Cliente', 'E-mail', 'Telefone', 'Pedidos', 'Total gasto', 'Último pedido', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i >= 3 && i <= 4 ? 'right' : 'left', padding: '13px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h || 'Ações'}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => {
                  const manyOrders = c.orders >= 10;
                  const bigSpend = c.spent >= 1000;
                  return (
                    <tr key={c.id} className="row clrow" style={{ background: i % 2 === 1 ? 'var(--row-alt)' : '#fff', borderBottom: i < paginated.length - 1 ? '1px solid #f0ede9' : 'none', cursor: 'pointer' }}
                      onClick={() => setSelected(c)}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar c={c} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: '#87726e', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><IconMapPin size={12} color="#a8978f" />{c.city}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#54433f' }}>{c.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#54433f', whiteSpace: 'nowrap' }}>{c.phone}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span className="num" style={{ fontSize: 14, color: manyOrders ? '#2e7d32' : '#54433f' }}>{c.orders}</span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="num" style={{ fontSize: 14, color: bigSpend ? '#d8a360' : '#1c1c1a' }}>{formatBRL(c.spent)}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#54433f', whiteSpace: 'nowrap' }}>{c.last}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button className="btn btn-outline view-btn" style={{ height: 32, padding: '0 12px', fontSize: 13 }}
                          onClick={(e) => { e.stopPropagation(); setSelected(c); }}>
                          <IconEye size={14} /> Ver perfil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#87726e' }}>Mostrando <strong style={{ color: '#54433f' }}>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> de <strong style={{ color: '#54433f' }}>{filtered.length}</strong> resultados</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><IconChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><IconChevronRight size={16} /></button>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>

      {selected && <ProfileDrawer c={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
