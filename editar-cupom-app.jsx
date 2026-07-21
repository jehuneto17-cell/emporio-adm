const { useState, useEffect } = React;

// ─────────────────────────────────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────────────────────────────────
function Card({ title, sub, children, danger }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 20, ...(danger ? { background: '#fff5f5', borderColor: '#fbdedc' } : {}) }}>
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${danger ? '#fbdedc' : '#f0ede9'}` }}>
        <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: danger ? '#ba1a1a' : '#52170c' }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: '#87726e', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, note, noteTone, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 8 }}>
        {label}{required && <span style={{ color: '#ba1a1a' }}> *</span>}
      </div>
      {children}
      {note && (
        <div style={{ fontSize: 12, marginTop: 7, display: 'flex', alignItems: 'center', gap: 5,
          color: noteTone === 'warn' ? '#f57c00' : noteTone === 'success' ? '#2e7d32' : '#87726e' }}>
          {note}
        </div>
      )}
    </div>
  );
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

function ToggleRow({ on, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <Toggle on={on} onChange={onChange} />
      <span style={{ fontSize: 14, color: '#1c1c1a', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

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

// ─────────────────────────────────────────────────────────────────────────
// Delete confirmation modal
// ─────────────────────────────────────────────────────────────────────────
function DeleteModal({ code, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const match = text === code;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 460, padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '22px 24px 0', display: 'flex', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fbdedc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconTrash size={22} color="#ba1a1a" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="h-jakarta" style={{ fontSize: 17, fontWeight: 700, color: '#ba1a1a' }}>Excluir cupom permanentemente</div>
            <div style={{ fontSize: 13.5, color: '#54433f', marginTop: 6, lineHeight: 1.5 }}>
              Esta ação <strong>não pode ser desfeita</strong>. Todo o histórico de uso do cupom <span className="mono" style={{ color: '#1c1c1a', fontWeight: 600 }}>{code}</span> será removido.
            </div>
          </div>
        </div>
        <div style={{ padding: '18px 24px 0' }}>
          <div style={{ fontSize: 13, color: '#54433f', marginBottom: 8 }}>Digite <span className="mono" style={{ fontWeight: 700, color: '#1c1c1a' }}>{code}</span> para confirmar:</div>
          <input className="input mono" value={text} onChange={e => setText(e.target.value)} autoFocus placeholder={code} style={{ width: '100%', fontWeight: 600, letterSpacing: '.02em' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 24, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn" onClick={onConfirm} disabled={!match}
            style={{ background: match ? '#ba1a1a' : '#f0d4d2', color: match ? '#fff' : '#c99', cursor: match ? 'pointer' : 'not-allowed' }}>
            <IconTrash size={15} /> Excluir cupom
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// UsageChart — sem dados hardcoded, mostra mensagem quando vazio
function UsageChart() {
  return (
    <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
      Nenhum dado disponível ainda
    </div>
  );
}

const CATS = ['Queijos', 'Cafés', 'Doces', 'Conservas', 'Pães', 'Bebidas'];
const PER_CLIENT = ['Ilimitado', '1 vez', '2 vezes', '3 vezes', '5 vezes'];
const STATUS_OPTS = ['Ativo', 'Inativo', 'Expirado'];

// ── Helpers de conversão de dados ─────────────────────────────────────────

// 'DD/MM/YYYY' → 'YYYY-MM-DD' (formato do <input type="date">)
function brDateToInput(s) {
  if (!s) return '';
  var parts = s.split('/');
  if (parts.length !== 3) return '';
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

// 'YYYY-MM-DD' → 'DD/MM/YYYY' (formato do Firestore)
function inputDateToBr(s) {
  if (!s) return '';
  var parts = s.split('-');
  if (parts.length !== 3) return '';
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Calcula "vence em X dias" a partir de 'YYYY-MM-DD'
function calcExpiresIn(endDateStr) {
  if (!endDateStr) return '';
  var end = new Date(endDateStr + 'T23:59:59');
  var today = new Date(); today.setHours(0,0,0,0);
  var diff = Math.floor((end - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'expirado';
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'amanhã';
  return diff + ' dias';
}

// Converte tipo Firestore → seletor do formulário
function fsTypeToForm(t) {
  if (t === 'Valor fixo') return 'fixo';
  if (t === 'Percentual') return 'percent';
  if (t === 'Frete grátis') return 'frete';
  return 'fixo';
}

// Converte seletor do formulário → tipo Firestore
function formTypeToFs(t) {
  if (t === 'fixo') return 'Valor fixo';
  if (t === 'percent') return 'Percentual';
  if (t === 'frete') return 'Frete grátis';
  return 'Valor fixo';
}

// Extrai valor numérico de string formatada: 'R$ 11,00' → '11,00' | '15%' → '15'
function extractValue(formattedValue, type) {
  if (!formattedValue) return '';
  if (type === 'Valor fixo') return formattedValue.replace('R$ ', '').trim();
  if (type === 'Percentual') return formattedValue.replace('%', '').trim();
  return '';
}

// Extrai valor mínimo: 'R$ 80,00' → { noMin: false, minVal: '80,00' }
function extractMin(formattedMin) {
  if (!formattedMin || formattedMin === 'R$ 0,00') return { noMin: true, minVal: '' };
  return { noMin: false, minVal: formattedMin.replace('R$ ', '').trim() };
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  // Estado de carregamento
  const [cupomId, setCupomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Dados do cupom carregado (para métricas de desempenho)
  const [uses, setUses] = useState(0);

  // Campos do formulário
  const [code, setCode] = useState('');
  const [type, setType] = useState('fixo');
  const [value, setValue] = useState('');
  const [desc, setDesc] = useState('');
  const [noLimit, setNoLimit] = useState(true);
  const [limit, setLimit] = useState('');
  const [perClient, setPerClient] = useState('Ilimitado');
  const [noMin, setNoMin] = useState(true);
  const [minVal, setMinVal] = useState('');
  const [allCats, setAllCats] = useState(true);
  const [cats, setCats] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [activate, setActivate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2400); return () => clearTimeout(id); }, [toast]);

  // ── Carrega cupom do Firestore via ?id= na URL ──────────────────────────
  useEffect(() => {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) { setLoading(false); setNotFound(true); return; }
    setCupomId(id);
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getCupom(id).then(function(c) {
      if (!c) { setNotFound(true); setLoading(false); return; }
      // Popula formulário com dados do Firestore
      setCode(c.code);
      setType(fsTypeToForm(c.type));
      setValue(extractValue(c.value, c.type));
      setDesc(c.desc || '');
      setNoLimit(!c.limit || c.limit === 0);
      setLimit(c.limit ? String(c.limit) : '');
      setPerClient(c.perClient || 'Ilimitado');
      var minData = extractMin(c.min);
      setNoMin(minData.noMin);
      setMinVal(minData.minVal);
      setAllCats(c.allCats !== false);
      setCats(c.cats || []);
      setStart(c.start ? brDateToInput(c.start) : '');
      setEnd(c.expires ? brDateToInput(c.expires) : '');
      setStatus(c.status || 'Ativo');
      setUses(c.uses || 0);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  // ── Salva no Firestore e redireciona ────────────────────────────────────
  const save = () => {
    if (!cupomId || typeof DB === 'undefined') return;
    setSaving(true);
    var expiresDate = inputDateToBr(end);
    var data = {
      code: code,
      type: formTypeToFs(type),
      value: type === 'fixo' ? 'R$ ' + value : type === 'percent' ? value + '%' : 'Frete grátis',
      min: noMin ? 'R$ 0,00' : 'R$ ' + minVal,
      limit: noLimit ? 0 : (parseInt(limit) || 0),
      perClient: perClient,
      desc: desc,
      start: inputDateToBr(start),
      expires: expiresDate,
      expiresIn: calcExpiresIn(end),
      allCats: allCats,
      cats: allCats ? [] : cats,
      status: status,
    };
    DB.updateCupom(cupomId, data)
      .then(function() { window.location.href = 'Cupons.html'; })
      .catch(function(e) {
        setSaving(false);
        setToast('Erro ao salvar: ' + (e.message || 'tente novamente'));
      });
  };

  const genCode = () => {
    const w = ['CANASTRA', 'MINAS', 'SERRA', 'EMPORIO']; setCode(w[Math.floor(Math.random() * w.length)] + Math.floor(Math.random() * 90 + 10));
  };
  const toggleCat = (c) => { if (allCats) return; setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]); };

  // ── Estados de loading / not found ──────────────────────────────────────
  if (loading) {
    return (
      <div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando cupom...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="stage" style={{ display: 'flex', position: 'relative' }}>
        <SharedSidebar active="cupons" />
        <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconTicket size={30} color="#3949ab" />
          </div>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c' }}>Cupom não encontrado</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Acesse esta página a partir da lista de cupons.</div>
          <a href="Cupons.html" className="btn btn-primary" style={{ textDecoration: 'none' }}><IconArrowLeft size={16} /> Ver todos os cupons</a>
        </div>
      </div>
    );
  }

  const SaveBtn = ({ full }) => (
    <button className="btn btn-primary" onClick={save} disabled={saving}
      style={{ background: window.THEME.primary, ...(full ? { width: '100%', justifyContent: 'center' } : {}) }}>
      {saving ? <><span className="spinner" /> Salvando...</> : <><IconSave size={16} /> Salvar alterações</>}
    </button>
  );

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="cupons" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Cupons', href: 'Cupons.html' }, { label: 'Promoções', href: 'Cupons.html' }, { label: code }]}
          search="Buscar cupom..."
          actions={<>
            <a href="Cupons.html" className="btn btn-outline" style={{ textDecoration: 'none' }}><IconArrowLeft size={16} /> Voltar para cupons</a>
            <SaveBtn />
          </>} />

        <main style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 24, alignItems: 'start' }}>
            {/* ── LEFT ─────────────────────────────────────────── */}
            <div>
              <Card title="Informações do cupom">
                <Field label="Código do cupom" required note={<><IconAlertTri size={13} color="#f57c00" /> Alterar o código invalida links já compartilhados</>} noteTone="warn">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input className="input mono" value={code} onChange={e => setCode(e.target.value.toUpperCase())} style={{ flex: 1, fontWeight: 700, fontSize: 16, letterSpacing: '.03em' }} />
                    <button className="btn btn-outline" onClick={genCode} style={{ whiteSpace: 'nowrap' }}><IconRefresh size={15} /> Gerar novo código</button>
                  </div>
                </Field>

                <Field label="Tipo de desconto" required>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <TypeCard icon={IconMoney} label="Valor fixo" active={type === 'fixo'} onClick={() => setType('fixo')} />
                    <TypeCard icon={IconPercent} label="Percentual" active={type === 'percent'} onClick={() => setType('percent')} />
                    <TypeCard icon={IconTruck} label="Frete grátis" active={type === 'frete'} onClick={() => setType('frete')} />
                  </div>
                </Field>

                {type !== 'frete' && (
                  <Field label="Valor do desconto" required note="Desconto aplicado no subtotal do pedido">
                    <div style={{ position: 'relative', maxWidth: 240 }}>
                      <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 14, color: '#87726e', fontWeight: 600 }}>{type === 'fixo' ? 'R$' : '%'}</span>
                      <input className="input num" value={value} onChange={e => setValue(e.target.value)} style={{ width: '100%', paddingLeft: type === 'fixo' ? 38 : 32 }} />
                    </div>
                  </Field>
                )}

                <Field label="Descrição interna" note="Visível apenas para você no painel">
                  <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Cupom de boas-vindas para novos clientes" style={{ width: '100%' }} />
                </Field>
                <div style={{ marginBottom: -22 }} />
              </Card>

              <Card title="Regras de uso">
                <Field label="Limite de usos" note="Com limite desativado, o cupom pode ser usado infinitas vezes">
                  <ToggleRow on={noLimit} onChange={setNoLimit} label="Sem limite de usos" />
                  <input className="input num" value={noLimit ? '' : limit} onChange={e => setLimit(e.target.value)} disabled={noLimit}
                    placeholder={noLimit ? '—' : '100'} style={{ width: 160, opacity: noLimit ? 0.5 : 1, background: noLimit ? '#f5f1ee' : '#fff', color: noLimit ? '#a8978f' : '#1c1c1a' }} />
                </Field>

                <Field label="Usos por cliente">
                  <Dropdown value={perClient} options={PER_CLIENT} onChange={setPerClient} minWidth={200} />
                </Field>

                <Field label="Valor mínimo do pedido">
                  <ToggleRow on={noMin} onChange={setNoMin} label="Sem valor mínimo" />
                  <div style={{ position: 'relative', width: 160 }}>
                    <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 14, color: '#87726e', fontWeight: 600 }}>R$</span>
                    <input className="input num" value={noMin ? '' : minVal} onChange={e => setMinVal(e.target.value)} disabled={noMin}
                      placeholder={noMin ? '—' : '50,00'} style={{ width: '100%', paddingLeft: 38, opacity: noMin ? 0.5 : 1, background: noMin ? '#f5f1ee' : '#fff', color: noMin ? '#a8978f' : '#1c1c1a' }} />
                  </div>
                </Field>

                <Field label="Válido para categorias" note="Desative para restringir a categorias específicas">
                  <ToggleRow on={allCats} onChange={setAllCats} label="Todas as categorias" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {CATS.map(c => {
                      const sel = !allCats && cats.includes(c);
                      return (
                        <button key={c} onClick={() => toggleCat(c)} disabled={allCats}
                          style={{ height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                            border: `1px solid ${sel ? window.THEME.primary : 'var(--border)'}`,
                            background: allCats ? '#f5f1ee' : sel ? '#fdddc8' : '#fff',
                            color: allCats ? '#b5a39d' : sel ? '#7a4a14' : '#54433f',
                            cursor: allCats ? 'not-allowed' : 'pointer', opacity: allCats ? 0.7 : 1, transition: 'all .14s' }}>{c}</button>
                      );
                    })}
                  </div>
                </Field>
                <div style={{ marginBottom: -22 }} />
              </Card>

              <Card title="Período de validade">
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Válido a partir de">
                      <input className="input" type="date" value={start} onChange={e => setStart(e.target.value)} style={{ width: '100%' }} />
                    </Field>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Field label="Válido até" required
                      note={end ? <><IconHistory size={13} color={calcExpiresIn(end) === 'expirado' ? '#ba1a1a' : '#2e7d32'} /> {calcExpiresIn(end) === 'expirado' ? 'Cupom expirado' : `Faltam ${calcExpiresIn(end)} para expirar`}</> : null}
                      noteTone={end && calcExpiresIn(end) === 'expirado' ? 'warn' : 'success'}>
                      <input className="input" type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ width: '100%' }} />
                    </Field>
                  </div>
                </div>
                <div style={{ marginBottom: -22 }} />
              </Card>
            </div>

            {/* ── RIGHT ────────────────────────────────────────── */}
            <div>
              <Card title="Status do cupom">
                <Field label="Status atual">
                  <Dropdown value={status} options={STATUS_OPTS} onChange={setStatus} minWidth={200}
                    icon={() => <span className="badge-dot" style={{ background: status === 'Ativo' ? '#2e7d32' : status === 'Expirado' ? '#ba1a1a' : '#87726e', width: 8, height: 8 }} />} />
                </Field>
                <ToggleRow on={activate} onChange={setActivate} label="Ativar imediatamente ao salvar" />
                <div style={{ borderTop: '1px solid var(--border-soft)', margin: '8px 0 18px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SaveBtn full />
                  <a href="Cupons.html" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Cancelar</a>
                </div>
                <div style={{ fontSize: 12, color: '#87726e', marginTop: 14, textAlign: 'center' }}>Preencha e salve para ativar o cupom</div>
              </Card>

              <Card title="Desempenho do cupom">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    ['Total de usos', String(uses), '#52170c'],
                    ['Usos este mês', '—', '#52170c'],
                    ['Desconto total', '—', window.THEME.primary],
                    ['Economia média', '—', window.THEME.primary],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ background: '#faf7f3', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-soft)' }}>
                      <div className="num" style={{ fontSize: 19, color: c }}>{v}</div>
                      <div style={{ fontSize: 11.5, color: '#87726e', marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#54433f', marginBottom: 12 }}>Usos nos últimos 6 meses</div>
                  <UsageChart />
                </div>
              </Card>

              <Card title="Ações irreversíveis" danger>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: '#ba1a1a', borderColor: '#f0c4c0' }}
                  onClick={() => {
                    if (!cupomId || typeof DB === 'undefined') return;
                    DB.updateCupom(cupomId, { status: 'Inativo' })
                      .then(function() { setStatus('Inativo'); setToast('Cupom desativado'); })
                      .catch(function() { setToast('Erro ao desativar cupom'); });
                  }}>
                  <IconXCircle size={16} /> Desativar cupom
                </button>
                <div style={{ fontSize: 12, color: '#87726e', marginTop: 7 }}>Cupom fica inativo mas histórico é preservado</div>
                <div style={{ borderTop: '1px solid #fbdedc', margin: '18px 0' }} />
                <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#ba1a1a', color: '#fff' }}
                  onClick={() => setShowDelete(true)}>
                  <IconTrash size={16} /> Excluir cupom permanentemente
                </button>
                <div style={{ fontSize: 12, color: '#ba1a1a', marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}><IconAlertTri size={13} color="#ba1a1a" /> Esta ação não pode ser desfeita</div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {showDelete && <DeleteModal code={code} onClose={() => setShowDelete(false)} onConfirm={() => {
        setShowDelete(false);
        if (!cupomId || typeof DB === 'undefined') { window.location.href = 'Cupons.html'; return; }
        DB.deleteCupom(cupomId)
          .then(function() { window.location.href = 'Cupons.html'; })
          .catch(function() { setToast('Erro ao excluir cupom'); });
      }} />}

      {toast && <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toast}</span></div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
