const { useState, useEffect, useRef } = React;

const STATUS_OPTIONS = ['Pendente', 'Preparando', 'Enviado', 'Em trânsito', 'Entregue', 'Cancelado'];

// Normaliza os dados brutos do Firestore para o shape esperado pelo JSX.
// DB.getPedido() retorna campos planos — customer/payment/shipping são strings.
// Esta função garante que ORDER.items, ORDER.customer, ORDER.payment etc.
// sejam sempre objetos com as propriedades que o componente acessa.
function normalizeOrder(raw) {
  if (!raw) return null;

  var products = Array.isArray(raw.products) ? raw.products : [];
  var subtotal  = products.reduce(function(s, p) { return s + (p.p || 0) * (p.q || 1); }, 0);

  var items = products.map(function(p) {
    var name = p.n || p.name || '—';
    return {
      sku:      p.sku      || '—',
      name:     name,
      variant:  p.variant  || '—',
      qty:      p.q        || 1,
      unit:     p.p        || 0,
      sub:      (p.p || 0) * (p.q || 1),
      off:      p.off      || null,
      producer: p.producer || '—',
      tint:     p.tint     || '#a85a32',
      initials: p.initials || name.substring(0, 2).toUpperCase(),
    };
  });

  var customerName = typeof raw.customer === 'string' ? raw.customer
    : (raw.customer && raw.customer.name ? raw.customer.name : '—');
  var customer = (typeof raw.customer === 'object' && raw.customer && raw.customer.name)
    ? raw.customer
    : {
        name:     customerName,
        email:    raw.customerEmail || raw.email || '—',
        phone:    raw.customerPhone || raw.phone || '—',
        orders:   raw.customerOrders || 0,
        spent:    raw.customerSpent != null ? formatBRL(raw.customerSpent) : '—',
        tint:     raw.tint     || '#a85a32',
        initials: raw.initials || customerName.substring(0, 2).toUpperCase(),
      };

  var paymentMethod = raw.paymentMethod || (typeof raw.payment === 'string' ? raw.payment : '');
  var payment = (typeof raw.payment === 'object' && raw.payment)
    ? raw.payment
    : {
        method: paymentMethod,
        detail: paymentMethod,
        date:   raw.date  || '—',
        value:  raw.total || 0,
        txn:    raw.txn   || '—',
      };

  var shippingMethod = typeof raw.shipping === 'string' ? raw.shipping
    : (raw.shipping && raw.shipping.method ? raw.shipping.method : '—');
  var shipping = { method: shippingMethod, cost: raw.freight || 0 };

  var delivery = (typeof raw.delivery === 'object' && raw.delivery)
    ? raw.delivery
    : {
        method:   shippingMethod,
        tracking: raw.tracking || '—',
        eta:      raw.eta      || '—',
        forecast: raw.forecast || '—',
      };

  var discount = (typeof raw.discount === 'object' && raw.discount)
    ? raw.discount
    : { code: raw.coupon || '—', value: raw.discountValue || 0 };

  return Object.assign({}, raw, {
    placed:   raw.date ? (raw.time ? raw.date + ' às ' + raw.time : raw.date) : '—',
    items:    items,
    subtotal: subtotal,
    customer: customer,
    payment:  payment,
    shipping: shipping,
    delivery: delivery,
    discount: discount,
    address:  raw.address || {},
    notes:    raw.notes   || '',
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────
function Card({ title, right, children, pad = 24, sub, icon: Ic }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 20 }}>
      {title && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center', gap: 10 }}>
          {Ic && <Ic size={18} color={window.THEME.primary} />}
          <div style={{ flex: 1 }}>
            <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c' }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: '#87726e', marginTop: 2 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

function CopyButton({ text, label, variant = 'chip' }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard?.writeText(text);
    } catch (e) { /* noop */ }
    setDone(true);
  };
  useEffect(() => { if (!done) return; const id = setTimeout(() => setDone(false), 2000); return () => clearTimeout(id); }, [done]);

  if (variant === 'full') {
    return (
      <button className="btn btn-outline" style={{ justifyContent: 'center', width: '100%', color: done ? '#2e7d32' : undefined, borderColor: done ? '#2e7d32' : undefined }} onClick={copy}>
        {done ? <><IconCheck size={15} stroke={3} color="#2e7d32" /> Copiado!</> : <><IconCopy size={15} /> {label || 'Copiar código'}</>}
      </button>
    );
  }
  return (
    <button onClick={copy} title="Copiar"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 9px', borderRadius: 7, border: `1px solid ${done ? '#2e7d32' : 'var(--border)'}`, background: done ? '#e3f1e3' : '#fff', color: done ? '#2e7d32' : '#87726e', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}>
      {done ? <><IconCheck size={12} stroke={3} /> Copiado!</> : <><IconCopy size={12} /> Copiar</>}
    </button>
  );
}

function LargeStatusBadge({ status }) {
  const map = {
    'Pendente':    { bg: '#eee8e6', fg: '#54433f', Ic: IconHistory },
    'Preparando':  { bg: '#fdecd6', fg: '#8a4a00', Ic: IconBox },
    'Enviado':     { bg: '#fdecd6', fg: '#f57c00', Ic: IconTruck },
    'Em trânsito': { bg: '#fdecd6', fg: '#f57c00', Ic: IconTruck },
    'Entregue':    { bg: '#e3f1e3', fg: '#2e7d32', Ic: IconCheck },
    'Cancelado':   { bg: '#fbdedc', fg: '#ba1a1a', Ic: IconXCircle },
  };
  const m = map[status] || map['Pendente'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: m.bg, color: m.fg, fontWeight: 700, fontSize: 14, padding: '8px 16px', borderRadius: 999 }}>
      <m.Ic size={17} color={m.fg} stroke={2.2} /> {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────
function Timeline({ steps = [] }) {
  return (
    <div style={{ position: 'relative' }}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const done = step.state === 'done';
        const current = step.state === 'current';
        const dotBg = done ? '#52170c' : current ? '#f57c00' : '#fff';
        const dotBorder = done ? '#52170c' : current ? '#f57c00' : 'var(--border)';
        return (
          <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* connector + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: dotBg, border: `2px solid ${dotBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: current ? '0 0 0 4px rgba(245,124,0,0.18)' : 'none', zIndex: 1 }}>
                {done && <IconCheck size={15} color="#fff" stroke={3} />}
                {current && <IconTruck size={15} color="#fff" stroke={2.3} />}
              </div>
              {!last && <div style={{ width: 2, flex: 1, background: done ? '#52170c' : 'var(--border-soft)', minHeight: step.tracking ? 72 : 28 }} />}
            </div>
            {/* content */}
            <div style={{ paddingBottom: last ? 0 : 22, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: current ? '#f57c00' : done ? '#1c1c1a' : '#87726e' }}>{step.title}</div>
              <div style={{ fontSize: 12.5, color: '#87726e', marginTop: 3 }}>{step.date}</div>
              {step.note && <div style={{ fontSize: 13, color: '#54433f', marginTop: 4 }}>{step.note}</div>}
              {step.tracking && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, background: '#fdf2e6', border: '1px solid #f6d8b4', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#8a4a00', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Código de rastreio</div>
                    <div className="mono" style={{ fontSize: 14, color: '#52170c', fontWeight: 600, marginTop: 2 }}>{step.tracking}</div>
                  </div>
                  <CopyButton text={step.tracking} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Print modal
// ─────────────────────────────────────────────────────────────────────────
function PrintModal({ order, onClose, onConfirm }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 420, padding: 0, animation: 'slideIn .22s ease' }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fdddc8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconPrinter size={22} color={window.THEME.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="h-jakarta" style={{ fontSize: 17, fontWeight: 700, color: '#52170c' }}>Imprimir etiqueta de envio</div>
            <div style={{ fontSize: 13.5, color: '#54433f', marginTop: 6, lineHeight: 1.5 }}>
              Será gerada a etiqueta dos Correios (PAC) para o pedido <strong style={{ color: '#1c1c1a' }}>#{order.id}</strong> com o código de rastreio <span className="mono" style={{ color: window.THEME.primary }}>{order.delivery.tracking}</span>.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 24, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onConfirm}><IconPrinter size={16} /> Imprimir etiqueta</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Right column info row
// ─────────────────────────────────────────────────────────────────────────
function InfoLine({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: '#87726e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1c1c1a' }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function getPaymentInfo(method) {
  var m = (method || '').toLowerCase();
  if (m === 'card' || m === 'cartao' || m === 'cartão')
    return { label: 'Cartão de Crédito', abbr: 'CC', bg: '#e8f5e9', color: '#2e7d32' };
  if (m === 'boleto')
    return { label: 'Boleto Bancário', abbr: 'BOL', bg: '#fff3e0', color: '#f57c00' };
  return { label: 'PIX', abbr: 'PIX', bg: '#e8f0fe', color: '#1976d2' };
}

function App() {
  // Pedido carregado do Firestore via ?id= na URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Preparando');
  const [savedStatus, setSavedStatus] = useState('Preparando');
  const [savingStatus, setSavingStatus] = useState(false);
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingCodeDirty, setTrackingCodeDirty] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2400); return () => clearTimeout(id); }, [toast]);

  useEffect(() => {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id || typeof DB === 'undefined') { setLoading(false); return; }
    DB.getPedido(id)
      .then(function(data) {
        if (data) {
          var normalized = normalizeOrder(data);
          setOrder(normalized);
          setStatus(normalized.status || 'Preparando');
          setSavedStatus(normalized.status || 'Preparando');
          setNote(normalized.notes || '');
          setSavedNote(normalized.notes || '');
          setTrackingCode(normalized.delivery?.tracking !== '—' ? (normalized.delivery?.tracking || '') : '');
        }
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando pedido...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="stage" style={{ display: 'flex', position: 'relative' }}>
        <SharedSidebar active="pedidos" />
        <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#e3f1e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconOrders size={30} color="#2e7d32" />
          </div>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c' }}>Pedido não encontrado</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Acesse esta página a partir da lista de pedidos com o ID correto.</div>
          <a href="Pedidos.html" className="btn btn-primary" style={{ textDecoration: 'none' }}><IconArrowLeft size={16} /> Ver todos os pedidos</a>
        </div>
      </div>
    );
  }

  // Alias para manter compatibilidade com o JSX abaixo
  var ORDER = order;
  var TIMELINE = order.timeline || [];

  const statusDirty = status !== savedStatus;
  const noteDirty = note !== savedNote;

  const saveStatus = () => {
    if (typeof DB === 'undefined') return;
    setSavingStatus(true);
    DB.updateStatusPedido(order.id, status, ORDER?.uid)
      .then(function() {
        setSavingStatus(false);
        setSavedStatus(status);
        setToast({ msg: `Status atualizado para "${status}"` });
      })
      .catch(function() {
        setSavingStatus(false);
        setToast({ msg: 'Erro ao atualizar status. Tente novamente.' });
      });
  };
  const saveNote = () => {
    setSavedNote(note);
    if (typeof DB !== 'undefined') {
      DB.updatePedido(order.id, { notes: note }).catch(console.warn);
    }
    setToast({ msg: 'Observação salva' });
  };
  const showToast = (msg) => setToast({ msg });

  const saveTracking = async () => {
    if (!ORDER || !trackingCode.trim()) return;
    setSavingTracking(true);
    try {
      await DB.updateRastreamentoPedido(ORDER.id, {
        tracking: trackingCode.trim(),
        'delivery.tracking': trackingCode.trim(),
      });
      showToast('Código de rastreio salvo!');
      setTrackingCodeDirty(false);
    } catch (e) {
      showToast('Erro ao salvar código de rastreio.');
    } finally {
      setSavingTracking(false);
    }
  };

  const confirmPrint = () => { setShowPrint(false); showToast('Etiqueta enviada para impressão'); };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="pedidos" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Pedidos', href: 'Pedidos.html' }, { label: `Pedido #${ORDER.id}` }]}
          search="Buscar pedido, cliente, cidade..." />

        {/* Order header band */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--border-soft)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <a href="Pedidos.html" className="btn btn-outline" style={{ textDecoration: 'none' }}><IconArrowLeft size={16} /> Voltar para pedidos</a>
          <div style={{ width: 1, height: 38, background: 'var(--border-soft)' }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <h1 className="h-jakarta" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#52170c', letterSpacing: '-.01em' }}>Pedido #{ORDER.id}</h1>
              <LargeStatusBadge status={savedStatus} />
            </div>
            <div style={{ fontSize: 13.5, color: '#87726e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCalendar size={14} /> Realizado em {ORDER.placed}
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => setShowPrint(true)}><IconPrinter size={16} /> Imprimir etiqueta</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faf7f3', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '10px 14px' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#54433f', whiteSpace: 'nowrap' }}>Atualizar status:</span>
            <Dropdown value={status} options={STATUS_OPTIONS} onChange={setStatus} minWidth={150} />
            <button className="btn" onClick={saveStatus} disabled={!statusDirty || savingStatus}
              style={{ background: statusDirty ? window.THEME.primary : '#e7ddd8', color: statusDirty ? '#fff' : '#a8978f', minWidth: 130, justifyContent: 'center', transition: 'all .18s', boxShadow: statusDirty ? '0 4px 14px rgba(150,73,4,0.28)' : 'none' }}>
              {savingStatus ? <><span className="spinner" /> Salvando...</> : <><IconSave size={15} /> Salvar status</>}
            </button>
          </div>
        </div>

        <main style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 24, alignItems: 'start' }}>
            {/* ── LEFT ───────────────────────────────────────────── */}
            <div>
              {/* Items */}
              <Card title="Itens do pedido" right={<span className="badge badge-gray">{ORDER.items.length} itens</span>} pad={0}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--th)', borderBottom: '1px solid var(--border-soft)' }}>
                      {['Produto', 'Variação', 'Qtd', 'Preço unit.', 'Subtotal'].map((h, i) => (
                        <th key={h} style={{ textAlign: i === 0 ? 'left' : i >= 2 ? 'right' : 'left', padding: '11px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDER.items.map((it, i) => (
                      <tr key={it.sku} className="row" style={{ borderBottom: i < ORDER.items.length - 1 ? '1px solid #f0ede9' : 'none' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="photo" style={{ width: 46, height: 46, background: it.tint }}>{it.initials}</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>{it.name}</div>
                              <div style={{ fontSize: 12, color: '#87726e', marginTop: 2 }}>Produzido por {it.producer} · SKU: <span className="mono">{it.sku}</span></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13.5, color: '#54433f' }}>{it.variant}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 14, color: '#54433f' }}>{it.qty}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}><span className="num" style={{ fontSize: 13.5, color: '#54433f' }}>{formatBRL(it.unit)}</span></td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span className="num" style={{ fontSize: 14, color: '#52170c' }}>{formatBRL(it.sub)}</span>
                          {it.off && <span className="badge badge-warn" style={{ marginLeft: 8, padding: '2px 7px' }}>{it.off}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* financial summary */}
                <div style={{ borderTop: '1px solid var(--border-soft)', padding: '18px 20px', display: 'flex' }}>
                  <div style={{ flex: 1 }} />
                  <div style={{ width: 300 }}>
                    {[
                      ['Subtotal', formatBRL(ORDER.subtotal), '#54433f'],
                      [`Frete (${ORDER.shipping.method})`, formatBRL(ORDER.shipping.cost), '#54433f'],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5, color: c }}>
                        <span>{l}</span><span className="num" style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5, color: '#2e7d32' }}>
                      <span>Desconto ({ORDER.discount.code})</span>
                      <span className="num" style={{ fontWeight: 600 }}>− {formatBRL(ORDER.discount.value)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Total pago</span>
                      <span className="num" style={{ fontSize: 20, color: '#52170c' }}>{formatBRL(ORDER.total)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment */}
              <Card title="Forma de pagamento">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  {(() => {
                    var pi = getPaymentInfo(ORDER.payment.method || ORDER.payment.detail);
                    return (<>
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: pi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="h-jakarta" style={{ color: pi.color, fontWeight: 800, fontSize: 13, letterSpacing: '.02em' }}>{pi.abbr}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1c1c1a' }}>{pi.label} — {ORDER.payment.date}</div>
                        <div style={{ fontSize: 12.5, color: '#87726e', marginTop: 2 }}>Pago em {ORDER.payment.date}</div>
                      </div>
                    </>);
                  })()}
                  <span className="badge badge-success"><IconCheck size={13} stroke={3} /> Aprovado</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 150, background: '#faf7f3', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: 11.5, color: '#87726e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Valor</div>
                    <div className="num" style={{ fontSize: 17, color: '#52170c', marginTop: 3 }}>{formatBRL(ORDER.payment.value)}</div>
                  </div>
                  <div style={{ flex: 2, minWidth: 200, background: '#faf7f3', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: '#87726e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Código da transação</div>
                      <div className="mono truncate" style={{ fontSize: 13.5, color: '#1c1c1a', marginTop: 3 }}>{ORDER.payment.txn}</div>
                    </div>
                    <CopyButton text={ORDER.payment.txn} />
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card title="Histórico de status" sub="Acompanhe cada etapa da jornada do pedido">
                <Timeline steps={TIMELINE} />
              </Card>
            </div>

            {/* ── RIGHT ──────────────────────────────────────────── */}
            <div>
              {/* Customer */}
              <Card title="Cliente">
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  <div className="avatar" style={{ width: 52, height: 52, background: `linear-gradient(135deg,#d8a360,${ORDER.customer.tint})`, fontSize: 17 }}>{ORDER.customer.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1a' }}>{ORDER.customer.name}</div>
                    <div style={{ fontSize: 13, color: '#87726e', marginTop: 2 }}>{ORDER.customer.orders} pedidos · {ORDER.customer.spent} em compras</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13.5, borderBottom: '1px solid #f0ede9' }}>
                    <span style={{ color: '#87726e' }}>E-mail</span><span style={{ color: '#1c1c1a' }}>{ORDER.customer.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13.5 }}>
                    <span style={{ color: '#87726e' }}>Telefone</span><span style={{ color: '#1c1c1a' }}>{ORDER.customer.phone}</span>
                  </div>
                </div>
                <a href="Clientes.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 600, color: window.THEME.primary, textDecoration: 'none' }}>
                  Ver perfil completo <IconChevronRight size={15} />
                </a>
              </Card>

              {/* Address */}
              <Card title="Endereço de entrega" icon={IconMapPin}>
                <div style={{ fontSize: 14, color: '#1c1c1a', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600 }}>{ORDER.address.name}</div>
                  <div style={{ color: '#54433f' }}>{ORDER.address.line1}</div>
                  <div style={{ color: '#54433f' }}>Bairro: {ORDER.address.district}</div>
                  <div style={{ color: '#54433f' }}>{ORDER.address.city} · {ORDER.address.state} · CEP {ORDER.address.cep}</div>
                </div>
                <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 600, color: window.THEME.primary, textDecoration: 'none' }}>
                  Ver no mapa <IconChevronRight size={15} />
                </a>
              </Card>

              {/* Shipping */}
              <Card title="Informações de entrega" icon={IconTruck}>
                <InfoLine label="Método">{ORDER.delivery.method}</InfoLine>
                <InfoLine label="Prazo">{ORDER.delivery.eta}</InfoLine>
                <InfoLine label="Previsão de entrega">
                  <span style={{ fontWeight: 600 }}>{ORDER.delivery.forecast}</span>
                </InfoLine>

                {/* Código de rastreio — editável */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11.5, color: '#87726e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>
                    Código de rastreio
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={e => { setTrackingCode(e.target.value); setTrackingCodeDirty(true); }}
                      placeholder="Ex: AA123456789BR"
                      style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'monospace', fontSize: 14, color: '#52170c', background: '#faf7f3', outline: 'none' }}
                    />
                    <button
                      onClick={saveTracking}
                      disabled={!trackingCodeDirty || savingTracking || !trackingCode.trim()}
                      style={{ padding: '9px 16px', borderRadius: 8, background: trackingCodeDirty && trackingCode.trim() ? '#52170c' : '#e0d8d4', color: trackingCodeDirty && trackingCode.trim() ? '#fff' : '#87726e', border: 'none', fontWeight: 600, fontSize: 13, cursor: trackingCodeDirty && trackingCode.trim() ? 'pointer' : 'default', transition: 'all .15s' }}
                    >
                      {savingTracking ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <CopyButton text={trackingCode || ORDER.delivery.tracking} label="Copiar código" variant="full" />
                  <a
                    href={`https://rastreamento.correios.com.br/app/index.php?objeto=${trackingCode || ORDER.delivery.tracking}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <IconExternal size={15} /> Rastrear nos Correios
                  </a>
                </div>
              </Card>

              {/* Notes */}
              <Card title="Observações">
                <NoteArea value={note} onChange={setNote} />
                <button className="btn btn-outline" onClick={saveNote} disabled={!noteDirty}
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center', opacity: noteDirty ? 1 : 0.55 }}>
                  <IconSave size={15} /> Salvar observação
                </button>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {showPrint && <PrintModal order={ORDER} onClose={() => setShowPrint(false)} onConfirm={confirmPrint} />}

      {toast && (
        <div className="toast">
          <IconCheck size={16} color="#7be288" stroke={3} /><span>{toast.msg}</span>
        </div>
      )}

    </div>
  );
}

function NoteArea({ value, onChange }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      placeholder="Adicione uma observação interna sobre este pedido..."
      style={{ width: '100%', padding: '10px 12px', border: `1px solid ${focus ? '#52170c' : 'var(--border)'}`, borderRadius: 8, background: '#fff', resize: 'vertical', fontFamily: 'Work Sans', fontSize: 14, color: '#1c1c1a', outline: 'none', lineHeight: 1.5, boxShadow: focus ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', transition: 'border .15s, box-shadow .15s' }} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
