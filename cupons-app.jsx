const { useState, useEffect } = React;

// Transforma o documento do Firestore no formato esperado por CouponCard
function firestoreToCouponCard(c) {
  const expiresIn = (() => {
    if (!c.expires) return '';
    const [d, m, y] = c.expires.split('/');
    const end = new Date(`${y}-${m}-${d}T23:59:59`);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.floor((end - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'expirado';
    if (diff === 0) return 'hoje';
    return diff + (diff === 1 ? ' dia' : ' dias');
  })();
  const isDateExpired = expiresIn === 'expirado';
  const isInativo = c.status === 'Inativo';
  const expired = c.status === 'Expirado' || c.status === 'Esgotado' || isDateExpired;
  const isPerc = c.type === 'Percentual';
  const isFrete = c.type === 'Frete grátis';
  const icon = isFrete ? 'truck' : isPerc ? 'percent' : 'ticket';
  const iconBg = expired ? '#fbdedc' : isFrete ? '#e3f1e3' : isPerc ? '#e8eaf6' : '#fdddc8';
  const iconFg = expired ? '#ba1a1a' : isFrete ? '#2e7d32' : isPerc ? '#3949ab' : window.THEME.primary;
  const barColor = expired ? '#dac1bc' : isFrete ? '#2e7d32' : isPerc ? '#3949ab' : '#d8a360';
  const typeLabel = isFrete ? 'Frete grátis' : `${c.type} — ${c.value} de desconto`;
  const progress = c.limit ? Math.min(1, c.uses / c.limit) : 0;
  const validTone = expired ? 'expired' : expiresIn.includes('dia') && parseInt(expiresIn) <= 7 ? 'warn' : 'normal';
  const valid = expired ? `Expirou em ${c.expires}` : `Válido até ${c.expires}`;
  const warn = validTone === 'warn' ? `vence em ${expiresIn}` : undefined;
  return { id: c.id, code: c.code, icon, iconBg, iconFg, type: typeLabel,
    uses: c.uses, limit: c.limit, progress, barColor, valid, validTone, warn,
    status: expired ? 'expirado' : isInativo ? 'inativo' : 'ativo' };
}

const FILTERS = ['Todos', 'Ativos', 'Expirados', 'Desativados'];
const ICONS = { ticket: IconTicket, truck: IconTruck, percent: IconPercent };

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

// ─────────────────────────────────────────────────────────────────────────
// Coupon card
// ─────────────────────────────────────────────────────────────────────────
function CouponCard({ c, onDelete, onToggleStatus }) {
  const [confirming, setConfirming] = useState(false);
  const expired = c.status === 'expirado';
  const inativo = c.status === 'inativo';
  const Ic = ICONS[c.icon] || IconTicket;
  const codeColor = expired ? '#87726e' : '#52170c';

  return (
    <div className="card card-hover" style={{ padding: 0, display: 'flex', alignItems: 'stretch', opacity: expired ? 0.92 : 1, position: 'relative' }}>
      {/* perforated ticket edge */}
      <div style={{ width: 6, background: expired ? '#dac1bc' : c.barColor, flexShrink: 0, borderRadius: '16px 0 0 16px' }} />

      {/* left: icon + code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px', minWidth: 320 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic size={26} color={c.iconFg} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: codeColor, letterSpacing: '.02em' }}>{c.code}</div>
          <div style={{ fontSize: 13, color: '#87726e', marginTop: 4 }}>{c.type}</div>
        </div>
      </div>

      {/* center: usage + progress */}
      <div style={{ flex: 1, padding: '22px 24px', borderLeft: '1px dashed var(--border-soft)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: '#54433f', fontWeight: 600 }}>
            {c.limit ? `${c.uses} de ${c.limit} utilizações` : `${c.uses} utilizações`}
          </span>
          <span style={{ color: '#87726e' }}>{c.limit ? `${Math.round(c.progress * 100)}%` : 'ilimitado'}</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: '#f0ebe7', overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(c.progress * 100, 4)}%`, height: '100%', background: c.barColor, borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 12.5, color: c.validTone === 'warn' ? '#f57c00' : c.validTone === 'expired' ? '#ba1a1a' : '#87726e', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconCalendar size={14} color={c.validTone === 'warn' ? '#f57c00' : c.validTone === 'expired' ? '#ba1a1a' : '#87726e'} />
          {c.valid}
          {c.warn && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}><IconAlertTri size={13} color="#f57c00" /> {c.warn}</span>}
        </div>
      </div>

      {/* right: badge + actions */}
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, borderLeft: '1px solid var(--border-soft)', minWidth: 200 }}>
        <span className={`badge ${expired ? 'badge-error' : c.status === 'inativo' ? 'badge-gray' : 'badge-success'}`}>
          <span className="badge-dot" style={{ background: expired ? '#ba1a1a' : c.status === 'inativo' ? '#87726e' : '#2e7d32' }} />
          {expired ? 'Expirado' : c.status === 'inativo' ? 'Inativo' : 'Ativo'}
        </span>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <a href={'Editar Cupom.html?id=' + c.id} className="btn btn-outline" style={{ height: 34, padding: '0 12px', fontSize: 13, textDecoration: 'none' }}><IconEdit size={14} /> Editar</a>
          {expired ? (
            <button className="btn btn-outline"
              style={{ height: 34, padding: '0 12px', fontSize: 13, color: '#ba1a1a', borderColor: '#f0c4c0' }}
              onClick={() => onDelete && onDelete(c.id, c.code)}>
              <IconTrash size={14} /> Excluir
            </button>
          ) : inativo ? (
            <button className="btn btn-outline"
              style={{ height: 34, padding: '0 12px', fontSize: 13, color: '#2e7d32', borderColor: '#c3e6c3' }}
              onClick={() => onToggleStatus && onToggleStatus(c.id, 'Ativo')}>
              Reativar
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline" style={{ height: 34, padding: '0 12px', fontSize: 13 }} onClick={() => setConfirming(v => !v)}>Desativar</button>
              {confirming && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: '#1c1c1a', color: '#fff', borderRadius: 10, padding: 12, width: 190, boxShadow: 'var(--shadow-pop)', zIndex: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Tem certeza?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setConfirming(false); onToggleStatus && onToggleStatus(c.id, 'Inativo'); }}
                      style={{ flex: 1, height: 30, borderRadius: 7, background: window.THEME.primary, color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Desativar</button>
                    <button onClick={() => setConfirming(false)}
                      style={{ flex: 1, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Não</button>
                  </div>
                  <div style={{ position: 'absolute', bottom: -5, right: 24, width: 10, height: 10, background: '#1c1c1a', transform: 'rotate(45deg)' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// New coupon modal
// ─────────────────────────────────────────────────────────────────────────
function TypeCard({ icon: Ic, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '16px 12px', borderRadius: 12, border: `1.5px solid ${active ? window.THEME.primary : 'var(--border)'}`,
      background: active ? '#fff8f4' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      transition: 'all .14s', boxShadow: active ? '0 0 0 3px rgba(150,73,4,0.10)' : 'none',
    }}>
      <Ic size={22} color={active ? window.THEME.primary : '#87726e'} />
      <span style={{ fontSize: 13, fontWeight: 600, color: active ? window.THEME.primary : '#54433f' }}>{label}</span>
    </button>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>{children}</div>;
}
function Note({ children }) {
  return <div style={{ fontSize: 12, color: '#87726e', marginTop: 6 }}>{children}</div>;
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 999, background: on ? '#2e7d32' : '#d8ccc7',
      position: 'relative', transition: 'background .18s', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function NewCouponModal({ onClose, onCreate }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState('fixo');
  const [value, setValue] = useState('');
  const [noLimit, setNoLimit] = useState(false);
  const [limit, setLimit] = useState('');
  const [date, setDate] = useState('');
  const [activate, setActivate] = useState(true);
  const [saving, setSaving] = useState(false);

  const genRandom = () => {
    const words = ['CANASTRA', 'MINAS', 'QUEIJO', 'SERRA', 'EMPORIO'];
    setCode(words[Math.floor(Math.random() * words.length)] + Math.floor(Math.random() * 90 + 10));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 20px', overflowY: 'auto' }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 520, padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        {/* header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center' }}>
          <div className="h-jakarta" style={{ flex: 1, fontSize: 18, fontWeight: 700, color: '#52170c' }}>Criar novo cupom</div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>

        {/* body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* code */}
          <div>
            <FieldLabel>Código <span style={{ color: '#ba1a1a' }}>*</span></FieldLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input mono" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: CANASTRA10" style={{ flex: 1, fontWeight: 600, letterSpacing: '.02em' }} />
              <button className="btn btn-outline" onClick={genRandom} style={{ whiteSpace: 'nowrap' }}><IconRefresh size={15} /> Gerar aleatório</button>
            </div>
            <Note>Use apenas letras maiúsculas e números, sem espaços</Note>
          </div>

          {/* type */}
          <div>
            <FieldLabel>Tipo <span style={{ color: '#ba1a1a' }}>*</span></FieldLabel>
            <div style={{ display: 'flex', gap: 10 }}>
              <TypeCard icon={IconMoney} label="Valor fixo" active={type === 'fixo'} onClick={() => setType('fixo')} />
              <TypeCard icon={IconPercent} label="Percentual" active={type === 'percent'} onClick={() => setType('percent')} />
              <TypeCard icon={IconTruck} label="Frete grátis" active={type === 'frete'} onClick={() => setType('frete')} />
            </div>
          </div>

          {/* value */}
          {type !== 'frete' && (
            <div>
              <FieldLabel>Valor do desconto <span style={{ color: '#ba1a1a' }}>*</span></FieldLabel>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 14, color: '#87726e', fontWeight: 600 }}>{type === 'fixo' ? 'R$' : '%'}</span>
                <input className="input num" value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', paddingLeft: type === 'fixo' ? 38 : 32 }} />
              </div>
            </div>
          )}

          {/* limit */}
          <div>
            <FieldLabel>Limite de usos</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Toggle on={noLimit} onChange={setNoLimit} />
                <span style={{ fontSize: 13.5, color: '#54433f' }}>Sem limite</span>
              </div>
              <input className="input num" value={noLimit ? '' : limit} onChange={e => setLimit(e.target.value)} disabled={noLimit}
                placeholder={noLimit ? 'Ilimitado' : ''} style={{ width: 120, opacity: noLimit ? 0.5 : 1, background: noLimit ? '#f5f1ee' : '#fff' }} />
            </div>
            <Note>Deixe sem limite para cupons ilimitados</Note>
          </div>

          {/* date */}
          <div>
            <FieldLabel>Data de validade <span style={{ color: '#ba1a1a' }}>*</span></FieldLabel>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%' }} />
          </div>

          {/* activate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#faf7f3', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
            <Toggle on={activate} onChange={setActivate} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>Ativar imediatamente</span>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: 24, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving || !code.trim()}
            onClick={() => {
              if (!code.trim()) return;
              setSaving(true);
              onCreate({ code: code.trim().toUpperCase(), type, value, noLimit, limit, date, activate },
                () => setSaving(false));
            }}
            style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? <><span className="spinner" /> Salvando...</> : 'Criar cupom'}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [filter, setFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2400); return () => clearTimeout(id); }, [toast]);

  // ── Carregamento ──────────────────────────────────────────────────────────
  const loadCupons = () => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    setLoading(true);
    DB.getCupons()
      .then(data => { setCupons(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadCupons(); }, []);
  useEffect(() => { setPage(1); }, [filter]);

  const couponCards = cupons.map(firestoreToCouponCard);
  const filtered = filter === 'Todos' ? couponCards
    : filter === 'Ativos' ? couponCards.filter(c => c.status === 'ativo')
    : filter === 'Expirados' ? couponCards.filter(c => c.status === 'expirado')
    : filter === 'Desativados' ? couponCards.filter(c => c.status === 'inativo')
    : couponCards;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const ativos = couponCards.filter(c => c.status === 'ativo').length;
  const totalUsos = cupons.reduce((s, c) => s + (c.uses || 0), 0);

  // ── Criar cupom ───────────────────────────────────────────────────────────
  const create = (modalData, onDone) => {
    if (typeof DB === 'undefined') { onDone && onDone(); return; }
    const { code, type, value, noLimit, limit, date, activate } = modalData;

    // Converte data YYYY-MM-DD → DD/MM/YYYY
    const expires = date ? date.split('-').reverse().join('/') : '';
    const expiresIn = date ? (() => {
      const end = new Date(date + 'T23:59:59');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const diff = Math.floor((end - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) return 'expirado';
      if (diff === 0) return 'hoje';
      return diff + ' dias';
    })() : '';

    const fsData = {
      code,
      type: type === 'fixo' ? 'Valor fixo' : type === 'percent' ? 'Percentual' : 'Frete grátis',
      value: type === 'fixo' ? 'R$ ' + value : type === 'percent' ? value + '%' : 'Frete grátis',
      min: 'R$ 0,00',
      limit: noLimit ? 0 : (parseInt(limit) || 0),
      expires,
      expiresIn,
      status: activate ? 'Ativo' : 'Inativo',
    };

    DB.addCupom(fsData)
      .then(() => {
        setShowModal(false);
        setToast(`Cupom "${code}" criado com sucesso`);
        loadCupons();
      })
      .catch(e => {
        onDone && onDone();
        setToast('Erro ao criar cupom. Tente novamente.');
      });
  };

  // ── Excluir cupom ─────────────────────────────────────────────────────────
  const handleDelete = (id, code) => {
    if (!window.confirm(`Excluir o cupom "${code}" permanentemente?`)) return;
    DB.deleteCupom(id)
      .then(() => { setToast(`Cupom "${code}" excluído`); loadCupons(); })
      .catch(() => setToast('Erro ao excluir cupom'));
  };

  // ── Desativar / reativar cupom ────────────────────────────────────────────
  const handleToggleStatus = (id, newStatus) => {
    DB.updateCupom(id, { status: newStatus })
      .then(() => {
        setToast(`Cupom ${newStatus === 'Inativo' ? 'desativado' : 'ativado'} com sucesso`);
        loadCupons();
      })
      .catch(() => setToast('Erro ao atualizar status do cupom'));
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="cupons" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Cupons', href: 'Cupons.html' }, { label: 'Promoções' }]}
          search="Buscar cupom..."
          actions={<button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setShowModal(true)}><IconPlus size={16} /> Novo Cupom</button>} />

        <main style={{ padding: 32 }}>
          {/* metrics */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <Metric icon={IconTicket} iconBg="#e3f1e3" iconFg="#2e7d32" value={loading ? '—' : String(ativos)} label="cupons ativos" sub={loading ? '' : `de ${cupons.length} cadastrados`} />
            <Metric icon={IconChart} iconBg="#fdddc8" iconFg={window.THEME.primary} value={loading ? '—' : String(totalUsos)} label="utilizações totais" sub="acumulado" />
            <Metric icon={IconMoney} iconBg="#fdecd6" iconFg="#f57c00" value="—" label="em descontos este mês" sub="cálculo disponível em breve" />
          </div>

          {/* action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} className={`pill ${filter === f ? 'active' : ''}`}
                  style={filter === f ? { background: '#52170c', color: '#fff' } : undefined}
                  onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#87726e' }}><span style={{ fontWeight: 600, color: '#54433f' }}>{filtered.length}</span> cupons encontrados</div>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setShowModal(true)}><IconPlus size={16} /> Novo Cupom</button>
          </div>

          {/* coupon list */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
              Carregando cupons...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconTicket size={26} color="#3949ab" />
              </div>
              <div>
                <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>Nenhum cupom cadastrado ainda</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Crie o primeiro cupom de desconto para seus clientes.</div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus size={16} /> Novo Cupom</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {paginated.map(c => (
                  <CouponCard key={c.id} c={c}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 13, color: '#87726e' }}>Mostrando <span style={{ color: '#1c1c1a', fontWeight: 600 }}>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> de <span style={{ color: '#1c1c1a', fontWeight: 600 }}>{filtered.length}</span> resultados</div>
                <div style={{ display: 'inline-flex', gap: 4 }}>
                  <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><IconChevronLeft size={16} /></button>
                  {(() => {
                    const visiblePages = [];
                    if (page <= totalPages) visiblePages.push(page);
                    if (page + 1 <= totalPages) visiblePages.push(page + 1);
                    return visiblePages.map(p => (
                      <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ));
                  })()}
                  <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><IconChevronRight size={16} /></button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showModal && <NewCouponModal onClose={() => setShowModal(false)} onCreate={create} />}


      {toast && (
        <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toast}</span></div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
