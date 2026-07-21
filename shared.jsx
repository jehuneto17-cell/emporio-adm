// Shared UI: sidebar + top bar. Loaded via <script type="text/babel"> before page app.

window.THEME = {
  primary: '#964904',
  sidebar: '#52170c',
  accent: '#d8a360',
  bg: '#fcf9f5',
};

const formatBRL = (n) => 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PAGE_HREFS = {
  dashboard: 'Dashboard.html',
  pedidos: 'Pedidos.html',
  produtos: 'Painel Admin.html',
  categorias: 'Categorias.html',
  estoque: 'Estoque.html',
  clientes: 'Clientes.html',
  cupons: 'Cupons.html',
  banners: 'Banners.html',
  relatorios: 'Relatorios.html',
  configuracoes: 'Configuracoes.html',
};

function SharedSidebar({ active = 'produtos' }) {
  const [userInitials, setUserInitials] = React.useState('AD');
  const [userEmail, setUserEmail] = React.useState('');
  const [newOrders, setNewOrders] = React.useState(0);
  const [logoUrl, setLogoUrl] = React.useState('');

  React.useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getConfiguracoes()
      .then((cfg) => setLogoUrl(cfg?.logoUrl || ''))
      .catch((err) => console.warn('[Sidebar] erro ao carregar logo:', err));
  }, []);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user && user.email) {
        setUserEmail(user.email);
        // Gera iniciais a partir do e-mail (ex: "emporiominas00" → "EM")
        var parts = user.displayName
          ? user.displayName.split(' ')
          : user.email.split('@')[0].split(/[._-]/);
        var initials = parts.slice(0, 2).map(function(p) { return p[0]; }).join('').toUpperCase();
        setUserInitials(initials || 'AD');
      }
    });
  }, []);

  React.useEffect(() => {
    try {
      var unsubscribe = firebase.firestore()
        .collection('pedidos')
        .where('status', '==', 'Aguardando pagamento')
        .onSnapshot(
          function(snap) { setNewOrders(snap.size); },
          function() { /* silent — badge fica em 0 */ }
        );
      return function() { unsubscribe(); };
    } catch(e) {}
  }, []);

  return (
    <aside className="sidebar">
      <div style={{ padding: '24px 20px 22px', borderBottom: '1px solid rgba(255,180,165,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Empório Coisas de Minas" style={{
              width: 40, height: 40, borderRadius: 10, objectFit: 'cover',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)', flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#d8a360,#fe9b55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#52170c', fontSize: 18,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
            }}>e</div>
          )}
          <div style={{ lineHeight: 1.1, minWidth: 0 }}>
            <div className="h-jakarta" style={{ color: '#fff7ec', fontWeight: 700, fontSize: 14 }}>
              Empório <span style={{ color: '#d8a360' }}>Coisas de Minas</span>
            </div>
            <div style={{ color: '#ffb4a5', fontSize: 11, marginTop: 4, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Painel Admin
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 8px', color: '#c98477', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          Menu
        </div>
        {NAV.map(item => {
          const isActive = item.id === active;
          const Ic = item.Icon;
          const href = PAGE_HREFS[item.id] || '#';
          const badgeCount = item.id === 'pedidos' ? newOrders : 0;
          return (
            <a key={item.id} href={href} style={{ textDecoration: 'none' }}
              className={`nav-item ${isActive ? 'active' : ''}`}>
              <Ic size={18} color={isActive ? '#fff' : '#ffb4a5'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {badgeCount > 0 && (
                <span style={{
                  background: '#d8a360', color: '#52170c', fontSize: 11, fontWeight: 700,
                  borderRadius: 999, padding: '2px 8px', minWidth: 22, textAlign: 'center',
                }}>{badgeCount}</span>
              )}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: '14px 16px 18px', borderTop: '1px solid rgba(255,180,165,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg,#d8a360,#a85a32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fff', fontSize: 13,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
            flexShrink: 0,
          }}>{userInitials}</div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ color: '#fff7ec', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Administrador</div>
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

function SharedTopBar({ crumbs, title, search = 'Buscar produtos, SKU, categoria...', actions }) {
  const [initials, setInitials] = React.useState('AD');
  React.useEffect(function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var parts = user.displayName
          ? user.displayName.split(' ')
          : user.email.split('@')[0].split(/[._-]/);
        setInitials(parts.slice(0, 2).map(function(p) { return p[0]; }).join('').toUpperCase() || 'AD');
      }
    });
  }, []);
  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16,
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      {title ? (
        <h1 className="h-jakarta" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#52170c', letterSpacing: '-.01em' }}>
          {title}
        </h1>
      ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: '#dac1bc' }}>/</span>}
              {c.href && !last ? (
                <a href={c.href} style={{
                  color: '#87726e', textDecoration: 'none', fontWeight: 500,
                }} onMouseEnter={e => e.currentTarget.style.color = '#964904'}
                   onMouseLeave={e => e.currentTarget.style.color = '#87726e'}>{c.label}</a>
              ) : (
                <span className={last ? 'h-jakarta' : ''} style={{
                  color: last ? '#52170c' : '#87726e',
                  fontWeight: last ? 700 : 500,
                  fontSize: last ? 15 : 14,
                }}>{c.label}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
      )}

      <div style={{ flex: 1 }} />

      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <IconSearch size={16} color="#87726e" />
        </div>
        <input className="input"
          placeholder={search}
          style={{ width: 340, paddingLeft: 36, background: '#faf7f3', borderColor: 'transparent' }}
          onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--primary)'; }}
          onBlur={e => { e.target.style.background = '#faf7f3'; e.target.style.borderColor = 'transparent'; }} />
        <div style={{
          position: 'absolute', right: 10, top: 10, padding: '2px 6px',
          fontSize: 11, color: '#87726e', border: '1px solid var(--border)',
          borderRadius: 4, background: '#fff', fontFamily: 'ui-monospace,monospace',
        }}>⌘K</div>
      </div>

      <button className="btn-icon" style={{ height: 40, width: 40, position: 'relative' }}>
        <IconBell size={20} />
      </button>

      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'linear-gradient(135deg,#52170c,#964904)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', boxShadow: 'inset 0 0 0 2px #fff',
        outline: '1px solid var(--border)',
      }}>{initials}</div>
    </header>
  );
}

Object.assign(window, { SharedSidebar, SharedTopBar, PAGE_HREFS, formatBRL });

// ─── Shared Dropdown ──────────────────────────────────────────────────────
function Dropdown({ value, options, onChange, icon: Ic, minWidth = 180 }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  return (
    <div className="dropdown" ref={ref} style={{ minWidth }}>
      <button className={`dd-button ${open ? 'open' : ''}`} style={{ width: '100%' }} onClick={() => setOpen(o => !o)}>
        {Ic ? <Ic size={16} color="#87726e" /> : null}
        <span className="truncate" style={{ flex: 1, textAlign: 'left' }}>{value}</span>
        <IconChevronDown size={16} color="#87726e" />
      </button>
      {open && (
        <div className="dd-menu">
          {options.map(opt => (
            <div key={opt} className={`dd-item ${opt === value ? 'selected' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>
              {opt === value && <IconCheck size={14} color="#964904" />}
              <span style={{ marginLeft: opt === value ? 0 : 22 }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared status badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const st = ORDER_STATUS_STYLE[status] || { cls: 'badge-gray', dot: '#87726e' };
  return <span className={`badge ${st.cls}`}><span className="badge-dot" style={{ background: st.dot }} />{status}</span>;
}

Object.assign(window, { Dropdown, StatusBadge });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('[PWA] falha ao registrar service worker:', e.message);
    });
  });
}
