const { useState, useEffect, useRef, useMemo } = React;

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

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ value, options, onChange, icon: Ic, minWidth = 200 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="dropdown" ref={ref} style={{ minWidth }}>
      <button className={`dd-button ${open ? 'open' : ''}`} style={{ width: '100%' }}
        onClick={() => setOpen(o => !o)}>
        {Ic ? <Ic size={16} color="#87726e" /> : null}
        <span className="truncate" style={{ flex: 1, textAlign: 'left' }}>{value}</span>
        <IconChevronDown size={16} color="#87726e" />
      </button>
      {open && (
        <div className="dd-menu">
          {options.map(opt => (
            <div key={opt}
              className={`dd-item ${opt === value ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}>
              {opt === value && <IconCheck size={14} color={window.THEME.primary} />}
              <span style={{ marginLeft: opt === value ? 0 : 22 }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// URLs de navegação — espelha PAGE_HREFS de shared.jsx
const NAV_HREFS = {
  dashboard:     'Dashboard.html',
  pedidos:       'Pedidos.html',
  produtos:      'Painel Admin.html',
  categorias:    'Categorias.html',
  estoque:       'Estoque.html',
  clientes:      'Clientes.html',
  cupons:        'Cupons.html',
  banners:       'Banners.html',
  relatorios:    'Relatorios.html',
  configuracoes: 'Configuracoes.html',
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active }) {
  const [userInitials, setUserInitials] = useState('AD');
  const [userEmail, setUserEmail]       = useState('');

  useEffect(() => {
    try {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user && user.email) {
          setUserEmail(user.email);
          const parts = user.displayName
            ? user.displayName.split(' ')
            : user.email.split('@')[0].split(/[._-]/);
          setUserInitials(parts.slice(0,2).map(p => p[0]).join('').toUpperCase() || 'AD');
        }
      });
    } catch(e) { /* firebase não disponível ainda */ }
  }, []);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 22px', borderBottom: '1px solid rgba(255,180,165,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg,#d8a360,#fe9b55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#52170c', fontSize: 18,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
          }}>e</div>
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div className="h-jakarta" style={{ color: '#fff7ec', fontWeight: 700, fontSize: 14, letterSpacing: '.005em' }}>
              Empório <span style={{ color: '#d8a360' }}>Coisas de Minas</span>
            </div>
            <div style={{ color: '#ffb4a5', fontSize: 11, marginTop: 4, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Painel Admin
            </div>
          </div>
        </div>
      </div>

      {/* Nav — usa <a href> reais para navegar entre páginas */}
      <nav style={{ flex: 1, padding: '14px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 8px', color: '#c98477', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Menu
        </div>
        {NAV.map(item => {
          const isActive = item.id === active;
          const Ic = item.Icon;
          const href = NAV_HREFS[item.id] || '#';
          return (
            <a key={item.id} href={href} style={{ textDecoration: 'none' }}
              className={`nav-item ${isActive ? 'active' : ''}`}>
              <Ic size={18} color={isActive ? '#fff' : '#ffb4a5'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span style={{
                  background: '#d8a360', color: '#52170c', fontSize: 11, fontWeight: 700,
                  borderRadius: 999, padding: '2px 8px', minWidth: 22, textAlign: 'center',
                }}>{item.badge}</span>
              ) : null}
            </a>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '14px 16px 18px', borderTop: '1px solid rgba(255,180,165,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#d8a360,#a85a32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fff', fontSize: 13,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
          }}>{userInitials}</div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ color: '#fff7ec', fontSize: 13, fontWeight: 600 }}>Administrador</div>
            <div style={{ color: '#ffb4a5', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
          </div>
          <button className="btn-icon" style={{ color: '#ffb4a5', height: 32, width: 32, flexShrink: 0 }}
            title="Sair" onClick={() => window.logout && window.logout()}>
            <IconLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
function TopBar({ title, query, setQuery, openBell, bellRef, showBell, onCloseBell }) {
  const [initials, setInitials] = React.useState('AD');
  React.useEffect(function() {
    try {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          var parts = user.displayName
            ? user.displayName.split(' ')
            : user.email.split('@')[0].split(/[._-]/);
          setInitials(parts.slice(0, 2).map(function(p) { return p[0]; }).join('').toUpperCase() || 'AD');
        }
      });
    } catch(e) {}
  }, []);
  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24,
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <h1 className="h-jakarta" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#52170c', letterSpacing: '-.01em' }}>
        {title}
      </h1>
      <div style={{ color: '#dac1bc', fontSize: 14 }}>/</div>
      <div style={{ color: '#87726e', fontSize: 13 }}>Catálogo</div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <IconSearch size={16} color="#87726e" />
        </div>
        <input
          className="input"
          placeholder="Buscar produtos, SKU, categoria..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: 320, paddingLeft: 36, background: '#faf7f3', borderColor: 'transparent' }}
          onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--primary)'; }}
          onBlur={e => { e.target.style.background = '#faf7f3'; e.target.style.borderColor = 'transparent'; }}
        />
        <div style={{
          position: 'absolute', right: 10, top: 10, padding: '2px 6px',
          fontSize: 11, color: '#87726e', border: '1px solid var(--border)',
          borderRadius: 4, background: '#fff', fontFamily: 'ui-monospace,monospace',
        }}>⌘K</div>
      </div>

      {/* Bell */}
      <div style={{ position: 'relative' }} ref={bellRef}>
        <button className="btn-icon" onClick={openBell} style={{ height: 40, width: 40, background: showBell ? 'var(--row-hover)' : 'transparent', color: showBell ? 'var(--primary)' : 'var(--text-2)' }}>
          <IconBell size={20} />
        </button>
        {showBell && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 340, background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: 'var(--shadow-pop)', padding: 8, zIndex: 50,
          }}>
            <div style={{ padding: '8px 12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="h-jakarta" style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Notificações</div>
              <button style={{ fontSize: 12, color: window.THEME.primary, fontWeight: 600 }}>Marcar como lidas</button>
            </div>
            {NOTIFICATIONS.map(n => (
              <div key={n.id} style={{ padding: 10, borderRadius: 8, display: 'flex', gap: 10, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 6,
                  background: n.kind === 'order' ? 'var(--success)' : n.kind === 'stock' ? 'var(--warning)' : 'var(--info)',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: `linear-gradient(135deg,#52170c,${window.THEME.primary})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', boxShadow: 'inset 0 0 0 2px #fff',
        outline: '1px solid var(--border)',
      }}>{initials}</div>
    </header>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function Metric({ icon: Ic, iconBg, iconColor, value, label, sub, trend, accent }) {
  return (
    <div className="card" style={{ padding: 22, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic size={22} color={iconColor} />
        </div>
        {trend ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: trend.dir === 'up' ? 'var(--success)' : 'var(--error)',
            fontSize: 12, fontWeight: 600,
            background: trend.dir === 'up' ? 'var(--success-soft)' : 'var(--error-soft)',
            padding: '3px 8px', borderRadius: 999,
          }}>
            {trend.dir === 'up' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
            {trend.value}
          </div>
        ) : null}
      </div>
      <div className="num" style={{ fontSize: 32, color: accent || '#52170c', marginTop: 18, lineHeight: 1.1, letterSpacing: '-.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, paddingTop: 10, borderTop: '1px dashed var(--border-soft)' }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Photo placeholder ───────────────────────────────────────────────────────
function Photo({ initials, tint, size = 48, imageUrl, images }) {
  const src = (Array.isArray(images) && images[0]) || imageUrl || null;
  if (src) {
    return (
      <div className="photo" style={{ width: size, height: size, background: tint, overflow: 'hidden', padding: 0 }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div className="photo" style={{ width: size, height: size, background: tint }}>
      {initials}
    </div>
  );
}

// ─── Checkbox ────────────────────────────────────────────────────────────────
function Checkbox({ state, onClick }) {
  return (
    <button className={`cb ${state === true ? 'checked' : state === 'mixed' ? 'indeterminate' : ''}`}
      onClick={onClick} aria-checked={state}>
      {state === true && <IconCheck size={12} color="#fff" stroke={3} />}
      {state === 'mixed' && <IconDash size={12} color="#fff" stroke={3} />}
    </button>
  );
}

// ─── Product table ───────────────────────────────────────────────────────────
function StockCell({ stock }) {
  if (stock === 0) return <span style={{ color: 'var(--error)', fontWeight: 600 }}>0 un</span>;
  if (stock <= 8) return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{stock} un</span>;
  return <span style={{ color: 'var(--success)', fontWeight: 600 }}>{stock} un</span>;
}

function StatusBadge({ status }) {
  if (status === 'Ativo') return <span className="badge badge-success"><span className="badge-dot" style={{ background:'var(--success)'}}/>Ativo</span>;
  if (status === 'Esgotado') return <span className="badge badge-error"><span className="badge-dot" style={{ background:'var(--error)'}}/>Esgotado</span>;
  if (status === 'Inativo') return <span className="badge badge-gray"><span className="badge-dot" style={{ background:'#87726e'}}/>Inativo</span>;
  return <span className="badge badge-warn">{status}</span>;
}

function ProductsTable({ rows, selected, toggleRow, toggleAll, onAction, catNameById }) {
  const allChecked = selected.size === rows.length && rows.length > 0;
  const someChecked = selected.size > 0 && !allChecked;
  const headerState = allChecked ? true : someChecked ? 'mixed' : false;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: 48 }} />
        <col style={{ width: 72 }} />
        <col />
        <col style={{ width: 150 }} />
        <col style={{ width: 130 }} />
        <col style={{ width: 110 }} />
        <col style={{ width: 130 }} />
        <col style={{ width: 130 }} />
      </colgroup>
      <thead>
        <tr style={{ background: 'var(--th)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' }}>
          <th style={th}>
            <Checkbox state={headerState} onClick={toggleAll} />
          </th>
          <th style={th}>Foto</th>
          <th style={th}>Produto</th>
          <th style={th}>Categoria</th>
          <th style={th}>Preço</th>
          <th style={th}>Estoque</th>
          <th style={th}>Status</th>
          <th style={{ ...th, textAlign: 'right', paddingRight: 24 }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr key={p.id} className="row"
            style={{
              background: i % 2 === 1 ? 'var(--row-alt)' : '#fff',
              borderBottom: '1px solid var(--border-soft)',
            }}>
            <td style={td}>
              <Checkbox state={selected.has(p.id)} onClick={() => toggleRow(p.id)} />
            </td>
            <td style={td}>
              <Photo initials={p.initials} tint={p.tint} imageUrl={p.imageUrl} images={p.images} />
            </td>
            <td style={td}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>#{p.sku}</div>
            </td>
            <td style={td}>
              <span className="badge-cat">{catNameById[p.category] || p.category}</span>
            </td>
            <td style={td}>
              {p.promo ? (
                <div>
                  <div style={{ color: 'var(--muted)', textDecoration: 'line-through', fontSize: 12, fontWeight: 500 }}>{fmtBRL(p.price)}</div>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>{fmtBRL(p.promo)}</div>
                </div>
              ) : (
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{fmtBRL(p.price)}</div>
              )}
            </td>
            <td style={td}><StockCell stock={p.stock} /></td>
            <td style={td}><StatusBadge status={p.status} /></td>
            <td style={{ ...td, textAlign: 'right', paddingRight: 16 }}>
              <div style={{ display: 'inline-flex', gap: 2 }}>
                <button className="btn-icon" title="Editar" onClick={() => onAction('edit', p)}><IconEdit size={16} /></button>
                <button className="btn-icon" title="Ver" onClick={() => onAction('view', p)}><IconEye size={16} /></button>
                <button className="btn-icon danger" title="Excluir" onClick={() => onAction('delete', p)}><IconTrash size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={8}>
            <div style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fdddc8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBox size={30} color={window.THEME.primary} />
              </div>
              <div>
                <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>
                  Nenhum produto cadastrado ainda
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Adicione o primeiro produto do catálogo do Empório.
                </div>
              </div>
              <a href="Editar Produto.html" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 4 }}>
                <IconPlus size={16} /> Novo Produto
              </a>
            </div>
          </td></tr>
        )}
      </tbody>
    </table>
  );
}

const th = {
  textAlign: 'left', padding: '14px 16px',
  fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
  letterSpacing: '.08em', textTransform: 'uppercase',
  fontFamily: 'Work Sans',
};
const td = { padding: '14px 16px', verticalAlign: 'middle', fontSize: 14, color: 'var(--text)' };

// ─── Pagination ──────────────────────────────────────────────────────────────
function Pagination({ page, setPage, totalPages }) {
  const pages = [];
  if (page <= totalPages) pages.push(page);
  if (page + 1 <= totalPages) pages.push(page + 1);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
        <IconChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
      ))}
      <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [active] = useState('produtos');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Todas as categorias');
  const [status, setStatus] = useState('Todos os status');
  const [sort, setSort] = useState('Mais recentes');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showBell, setShowBell] = useState(false);
  const [toast, setToast] = useState(null);
  const [produtos, setProdutos] = useState([]);   // sempre começa vazio — dados vêm do Firestore
  const [loading, setLoading] = useState(true);
  const [dbCats, setDbCats] = useState([]);
  const bellRef = useRef(null);

  function exportarProdutos() {
    const today = new Date().toISOString().slice(0, 10);
    const headers = ['SKU', 'Nome', 'Categoria', 'Subcategoria', 'Preço Normal', 'Preço Promocional', 'Estoque', 'Estoque Mínimo', 'Status', 'Visível', 'Destaque', 'Produtor', 'Localização'];
    const linhas = produtos.map(p => [
      p.sku || '',
      p.name || '',
      catNameById[p.category] || p.category || '',
      catNameById[p.subcategory] || p.subcategory || '',
      p.price != null ? String(p.price).replace('.', ',') : '0',
      p.promo != null ? String(p.promo).replace('.', ',') : '',
      p.stock != null ? p.stock : 0,
      p.minStock != null ? p.minStock : 5,
      p.status || '',
      p.visible !== false ? 'Sim' : 'Não',
      p.featured ? 'Sim' : 'Não',
      p.producer || '',
      p.location || '',
    ]);
    downloadCSV(`produtos-${today}.csv`, [headers, ...linhas]);
  }

  // ── Carrega produtos do Firestore ──────────────────────────────────────────
  useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getProdutos()
      .then(data => { setProdutos(data); setLoading(false); })
      .catch(err => { console.warn('[Firestore] Falha ao carregar produtos:', err); setLoading(false); });
  }, []);

  useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getCategorias()
      .then(data => setDbCats(data))
      .catch(err => console.warn('[Firestore] categorias:', err));
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const catNameById = Object.fromEntries(dbCats.map(c => [c.id, c.name]));
  const catOptions = ['Todas as categorias', ...dbCats.filter(c => !c.parentId).map(c => c.name)];

  // Filter / sort visible rows
  const filtered = useMemo(() => {
    let rows = produtos.slice();
    if (cat !== 'Todas as categorias') {
      const catId = dbCats.find(c => c.name === cat)?.id;
      rows = rows.filter(r => r.category === catId);
    }
    if (status !== 'Todos os status') rows = rows.filter(r => r.status === status);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || (catNameById[r.category] || '').toLowerCase().includes(q));
    }
    const sorters = {
      'Mais recentes': (a, b) => String(b.id).localeCompare(String(a.id)),
      'Nome A-Z': (a, b) => a.name.localeCompare(b.name),
      'Nome Z-A': (a, b) => b.name.localeCompare(a.name),
      'Maior preço': (a, b) => (b.promo ?? b.price) - (a.promo ?? a.price),
      'Menor preço': (a, b) => (a.promo ?? a.price) - (b.promo ?? b.price),
      'Maior estoque': (a, b) => b.stock - a.stock,
      'Menor estoque': (a, b) => a.stock - b.stock,
    };
    rows.sort(sorters[sort] || sorters['Mais recentes']);
    return rows;
  }, [cat, status, sort, query, produtos, dbCats]);

  const totalCount = filtered.length;
  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleRow = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    setSelected(s => s.size === pageRows.length ? new Set() : new Set(pageRows.map(r => r.id)));
  };
  const onAction = (kind, p) => {
    if (kind === 'edit') {
      window.location.href = 'Editar Produto.html?id=' + encodeURIComponent(p.id);
      return;
    }
    if (kind === 'delete') {
      if (!window.confirm(`Excluir "${p.name}"?`)) return;
      DB.deleteProduto(p.id)
        .then(() => {
          setProdutos(prev => prev.filter(x => x.id !== p.id));
          setSelected(s => { const n = new Set(s); n.delete(p.id); return n; });
          setToast('Produto excluído.');
        })
        .catch(() => setToast('Erro ao excluir produto.'));
      return;
    }
    setToast(`Visualizando: ${p.name}`);
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <Sidebar active={active} />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <TopBar title="Produtos" query={query} setQuery={setQuery}
          openBell={() => setShowBell(v => !v)} bellRef={bellRef} showBell={showBell} />

        <main style={{ padding: 32 }}>
          {/* Aviso quando há produtos esgotados */}
          {!loading && produtos.some(p => p.stock === 0) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
              background: 'linear-gradient(90deg,#fff3e6,#fdddc8)',
              border: '1px solid #f5c79a', borderRadius: 12, marginBottom: 20,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: window.THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <IconAlertTri size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#52170c' }}>
                  {produtos.filter(p => p.stock === 0).length} produto(s) esgotado(s) no catálogo
                </div>
                <div style={{ fontSize: 12, color: '#54433f', marginTop: 2 }}>
                  Acesse o Controle de Estoque para registrar entradas.
                </div>
              </div>
              <a href="Estoque.html" className="btn btn-outline" style={{ height: 34, background: '#fff', textDecoration: 'none' }}>
                Ver estoque <IconChevronRight size={14} />
              </a>
            </div>
          )}

          {/* ROW 1 — Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <Dropdown value={cat} options={catOptions} onChange={setCat} icon={IconFolder} minWidth={210} />
            <Dropdown value={status} options={STATUSES} onChange={setStatus} icon={IconFilter} minWidth={180} />
            <Dropdown value={sort} options={SORTS} onChange={setSort} icon={IconSort} minWidth={180} />
            <div style={{ flex: 1 }} />
            <button className="btn btn-outline" onClick={exportarProdutos}>
              <IconDownload size={16} /> Exportar CSV
            </button>
            <a href="Editar Produto.html" className="btn btn-primary" style={{ background: window.THEME.primary, textDecoration: 'none' }}>
              <IconPlus size={16} /> Novo Produto
            </a>
          </div>

          {/* ROW 2 — Metrics calculadas do Firestore */}
          {(() => {
            const emPromocao   = produtos.filter(p => p.promo).length;
            const estoqueBaixo = produtos.filter(p => p.stock > 0 && p.stock <= 10).length;
            const esgotados    = produtos.filter(p => p.stock === 0).length;
            const valorTotal   = produtos.reduce((s, p) => s + (p.promo || p.price) * p.stock, 0);
            return (
              <div style={{ display: 'flex', gap: 18, marginBottom: 22 }}>
                <Metric
                  icon={IconBox} iconBg="#fdddc8" iconColor={window.THEME.primary}
                  value={loading ? '—' : String(produtos.length)} label="produtos cadastrados"
                  sub={!loading && emPromocao > 0 ? `${emPromocao} em promoção` : 'nenhum em promoção'}
                />
                <Metric
                  icon={IconAlertTri} iconBg="#fdecd6" iconColor="#f57c00"
                  value={loading ? '—' : String(estoqueBaixo)} label="produtos com estoque baixo"
                  sub={estoqueBaixo > 0 ? 'reposição necessária' : 'todos acima do mínimo'}
                  accent="#f57c00"
                />
                <Metric
                  icon={IconXCircle} iconBg="#fbdedc" iconColor="#ba1a1a"
                  value={loading ? '—' : String(esgotados)} label="produtos esgotados"
                  sub={esgotados > 0 ? 'fora de venda no app' : 'todos com estoque'}
                  accent="#ba1a1a"
                />
                <Metric
                  icon={IconMoney} iconBg="#e3f1e3" iconColor="#2e7d32"
                  value={loading ? '—' : fmtBRL(valorTotal)} label="valor total em estoque"
                  sub="baseado no preço de venda"
                />
              </div>
            );
          })()}

          {/* ROW 3 — Products table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: '#52170c' }}>
                  Lista de Produtos
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  Gerencie o catálogo completo do empório
                </div>
              </div>
              <div style={{ flex: 1 }} />
              {loading ? (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Carregando...</div>
              ) : selected.size > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    fontSize: 13, color: 'var(--primary)', fontWeight: 600,
                    background: '#fdddc8', padding: '6px 12px', borderRadius: 999,
                  }}>
                    {selected.size} selecionado{selected.size > 1 ? 's' : ''}
                  </div>
                  <button className="btn btn-outline" style={{ height: 34, color: 'var(--error)', borderColor: 'var(--error-soft)' }}
                    onClick={() => {
                      if (!window.confirm(`Excluir ${selected.size} produto(s)?`)) return;
                      Promise.all([...selected].map(id => DB.deleteProduto(id)))
                        .then(() => {
                          setProdutos(prev => prev.filter(x => !selected.has(x.id)));
                          setSelected(new Set());
                          setToast(`${selected.size} produtos excluídos`);
                        })
                        .catch(() => setToast('Erro ao excluir produtos.'));
                    }}>
                    <IconTrash size={14} /> Excluir selecionados
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  <span className="num" style={{ color: 'var(--text)', fontWeight: 700 }}>{totalCount}</span> produtos encontrados
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
                Carregando produtos...
              </div>
            ) : (
              <ProductsTable rows={pageRows} selected={selected}
                toggleRow={toggleRow} toggleAll={toggleAll} onAction={onAction} catNameById={catNameById} />
            )}

            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Exibindo <span style={{ color: 'var(--text)', fontWeight: 600 }}>{Math.min((page-1)*PAGE_SIZE+1, totalCount)}–{Math.min(page*PAGE_SIZE, totalCount)}</span> de <span style={{ color: 'var(--text)', fontWeight: 600 }}>{totalCount}</span> produtos
              </div>
              <div style={{ flex: 1 }} />
              <Pagination page={page} setPage={setPage} totalPages={totalPages} />
            </div>
          </div>

          <div style={{ height: 32 }} />
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <IconCheck size={16} color="#7be288" stroke={3} />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
