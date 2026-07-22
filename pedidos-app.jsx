const { useState, useMemo, useEffect } = React;

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

function MiniMetric({ label, value, tone }) {
  const colors = { all:'#52170c', warn:'#f57c00', info:'#3949ab', success:'#2e7d32', error:'#ba1a1a' };
  return (
    <div className="card" style={{ padding: '16px 20px', flex: 1 }}>
      <div className="num" style={{ fontSize: 26, color: colors[tone] || '#52170c' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const STEPS = ['Pago','Preparando','Em trânsito','Entregue'];
const STEPS_LABELS = ['Pagamento\nConfirmado','Preparando','Em trânsito','Entregue'];

function OrderDrawer({ order, onClose, onStatusChange, onArchive, onUnarchive, isArchived }) {
  if (!order) return null;
  const products = Array.isArray(order.products) ? order.products : [];
  const subtotal = products.reduce((s,p) => s + (p.p || 0) * (p.q || 1), 0);
  const stepIdx = (() => {
    const s = order.status || '';
    if (s === 'Pago' || s === 'Aguardando pagamento') return 0;
    if (s === 'Preparando') return 1;
    if (s === 'Em trânsito') return 2;
    if (s === 'Entregue') return 3;
    return -1;
  })();
  const stepDone = order.status === 'Pago' || order.status === 'Entregue' ||
    order.status === 'Em trânsito' || order.status === 'Preparando';
  const [gerandoEtiqueta, setGerandoEtiqueta] = useState(false);
  const [etiquetaUrl, setEtiquetaUrl] = useState(order.printUrl || null);
  const [trackingCode, setTrackingCode] = useState(order.tracking || null);

  async function gerarEtiqueta() {
    setGerandoEtiqueta(true);
    try {
      // Busca dados do remetente das configurações
      const cfg = await DB.getConfiguracoes();
      const remetente = cfg?.remetente;
      if (!remetente?.nome || !remetente?.cpf || !remetente?.cep) {
        alert('Configure os dados do remetente em Configurações → Frete e entrega antes de gerar etiquetas.');
        return;
      }

      const ETIQUETA_URL = 'https://emporio-coisas-de-minas.vercel.app/api/gerar-etiqueta';

      const authToken = await firebase.auth().currentUser?.getIdToken();
      if (!authToken) {
        alert('Sessão expirada. Faça login novamente.');
        return;
      }

      const res = await fetch(ETIQUETA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          remetente,
          pedido: {
            orderId: order.id,
            serviceId: order.serviceId || null,
            customerName: order.customer,
            customerEmail: order.customerEmail || '',
            customerPhone: order.customerPhone || '',
            customerCpf: order.customerCpf || '',
            deliveryAddress: order.deliveryAddress || order.address || {},
            items: Array.isArray(order.products) ? order.products.map(p => ({
              name: p.n,
              qty: p.q,
              price: p.p,
              weight: p.weight || 0.3,
            })) : [],
            total: order.total || 0,
            packageWeight: order.packageWeight || 0.5,
            packageHeight: order.packageHeight || 10,
            packageWidth: order.packageWidth || 15,
            packageLength: order.packageLength || 20,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar etiqueta');

      // Salva código de rastreio e URL no pedido
      await DB.updatePedido(order.id, {
        tracking: data.trackingCode || '',
        printUrl: data.printUrl || '',
        melhorEnvioOrderId: data.melhorEnvioOrderId || '',
        status: 'Preparando',
      });
      if (order.uid) {
        await DB.updateStatusPedido(order.id, 'Preparando', order.uid);
      }

      setEtiquetaUrl(data.printUrl);
      setTrackingCode(data.trackingCode);
      onStatusChange(order.id, 'Preparando');
      alert('✅ Etiqueta gerada com sucesso! Clique em "Imprimir Etiqueta" para baixar o PDF.');
    } catch (e) {
      console.error('[gerarEtiqueta]', e);
      alert('Erro ao gerar etiqueta: ' + e.message);
    } finally {
      setGerandoEtiqueta(false);
    }
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
          <div style={{ flex: 1 }}>
            <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c' }}>Pedido {order.number ? order.number : `#${String(order.id).slice(-6)}`}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{order.date} às {order.time}</div>
          </div>
          <StatusBadge status={order.status} />
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>

        {/* actions — movido para o topo */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', background: '#fafaf9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#87726e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Atualizar status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ORDER_STATUSES.map(s => (
              <button key={s} className={`pill ${order.status === s ? 'active' : ''}`}
                style={{ border: '1px solid var(--border-soft)', fontSize: 12 }}
                onClick={() => onStatusChange(order.id, s)}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <a href={`Detalhe do Pedido.html?id=${order.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', height: 36, fontSize: 13 }}>Ver detalhe completo <IconChevronRight size={13} /></a>
            {isArchived ? (
              <button
                className="btn btn-outline"
                style={{ height: 36, paddingInline: 14, fontSize: 13, color: '#87726e', borderColor: 'var(--border-soft)' }}
                onClick={() => onUnarchive(order.id)}
              >
                Desarquivar
              </button>
            ) : (
              <button
                className="btn btn-outline"
                style={{ height: 36, paddingInline: 14, fontSize: 13, color: '#87726e', borderColor: 'var(--border-soft)' }}
                onClick={() => onArchive(order.id)}
              >
                Arquivar
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* progress */}
          {order.status !== 'Cancelado' && (
            <div className="card" style={{ padding: 20, marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#52170c', marginBottom: 16 }}>Status da entrega</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 11, left: 16, right: 16, height: 2, background: '#f0ede9' }} />
                <div style={{ position: 'absolute', top: 11, left: 16, height: 2, background: '#2e7d32', width: `calc(${(stepIdx/(STEPS.length-1))*100}% - 32px * ${stepIdx/(STEPS.length-1)})`, transition: 'width .3s' }} />
                {STEPS.map((s, i) => {
                  const label = STEPS_LABELS[i];
                  const isDone = i <= stepIdx && stepDone;
                  return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, flex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDone ? '#2e7d32' : '#fff', border: `2px solid ${isDone ? '#2e7d32' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isDone && <IconCheck size={12} color="#fff" stroke={3} />}
                    </div>
                    <div style={{ fontSize: 10, color: isDone ? '#2e7d32' : '#87726e', fontWeight: 600, textAlign: 'center', maxWidth: 70 }}>{label.split('\n').map((l, j) => <span key={j} style={{ display: 'block' }}>{l}</span>)}</div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* customer */}
          <div className="card" style={{ padding: 20, marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#87726e', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 12 }}>Cliente</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ width: 44, height: 44, background: order.tint, fontSize: 15 }}>{order.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1a' }}>{order.customer}</div>
                <div style={{ fontSize: 13, color: '#87726e' }}>{order.city}</div>
              </div>
            </div>
          </div>

          {/* items */}
          <div className="card" style={{ padding: 20, marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#87726e', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 12 }}>Itens ({order.items})</div>
            {products.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < products.length-1 ? '1px solid #f0ede9' : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#fdddc8', color: '#7a4a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>{p.q}×</div>
                <div style={{ flex: 1, fontSize: 13, color: '#1c1c1a' }}>{p.n}</div>
                <div className="num" style={{ fontSize: 13, color: '#52170c' }}>{fmtBRL(p.p * p.q)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f0ede9', marginTop: 8, paddingTop: 12 }}>
              {[['Subtotal', fmtBRL(subtotal)], [`Frete (${order.shipping})`, fmtBRL(order.freight)]].map(([l,v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#54433f', padding: '3px 0' }}>
                  <span>{l}</span><span className="num">{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0ede9' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#52170c' }}>Total</span>
                <span className="num" style={{ fontSize: 18, color: '#52170c' }}>{fmtBRL(order.total)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#87726e', marginTop: 6 }}>Pagamento: {order.payment}</div>
            </div>
          </div>

          {/* etiqueta de envio */}
          {(order.status === 'Pago' || order.status === 'Preparando') && order.deliveryMode !== 'pickup' && (
            <div className="card" style={{ padding: 20, marginBottom: 18, background: etiquetaUrl ? '#f0fdf4' : '#fafaf9', borderColor: etiquetaUrl ? '#86efac' : 'var(--border)' }}>
              <div style={{ fontSize: 11, color: '#87726e', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 12 }}>
                📦 Etiqueta de Envio
              </div>
              {trackingCode && (
                <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>Rastreio:</span>
                  <span style={{ fontSize: 13, color: '#1c1c1a', fontFamily: 'monospace', fontWeight: 700 }}>{trackingCode}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {!etiquetaUrl ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', background: window.THEME.primary }}
                    onClick={gerarEtiqueta}
                    disabled={gerandoEtiqueta}
                  >
                    {gerandoEtiqueta ? '⏳ Gerando...' : '📦 Gerar Etiqueta'}
                  </button>
                ) : (
                  <>
                    <a
                      href={etiquetaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', background: '#2e7d32' }}
                    >
                      🖨️ Imprimir Etiqueta
                    </a>
                    <button
                      className="btn btn-outline"
                      style={{ paddingInline: 12 }}
                      onClick={gerarEtiqueta}
                      disabled={gerandoEtiqueta}
                      title="Regerar etiqueta"
                    >
                      🔄
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const PAGE_SIZE = 20;

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={onCancel} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 16, padding: 28, width: 360, zIndex: 1001,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#52170c', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Confirmar ação
        </div>
        <div style={{ fontSize: 14, color: '#87726e', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e0d8d4', background: '#fff', color: '#87726e', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#52170c', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
}

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Mais recentes');
  const [openOrder, setOpenOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [pickupResult, setPickupResult] = useState(null);
  const [pickupError, setPickupError] = useState('');
  const [pickupLoading, setPickupLoading] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2000); return () => clearTimeout(id); }, [toast]);

  async function buscarPedidoRetirada() {
    const code = pickupCode.trim().toUpperCase().replace('#', '');
    if (!code) {
      setPickupError('Digite o código do pedido.');
      return;
    }
    setPickupLoading(true);
    setPickupError('');
    setPickupResult(null);
    try {
      const allOrders = await DB.getPedidos();
      const found = allOrders.find(o =>
        String(o.id).slice(-6) === code ||
        String(o.id) === code ||
        (o.number || '').replace('#', '') === code
      );
      if (!found) {
        setPickupError('Pedido não encontrado. Verifique o código.');
      } else {
        setPickupResult(found);
      }
    } catch (e) {
      setPickupError('Erro ao buscar pedido. Tente novamente.');
    } finally {
      setPickupLoading(false);
    }
  }

  function exportarPedidos() {
    const today = new Date().toISOString().slice(0, 10);
    const headers = ['ID', 'Cliente', 'Data', 'Total', 'Status'];
    const linhas = orders.map(o => [o.id, o.customer, o.date, o.total, o.status]);
    downloadCSV(`pedidos-${today}.csv`, [headers, ...linhas]);
  }
  useEffect(() => { setPage(1); }, [tab, query, sort]);

  useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getPedidos()
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'Arquivados') return;
    if (typeof DB === 'undefined') return;
    setLoadingArchived(true);
    DB.getPedidosArquivados()
      .then(data => { setArchivedOrders(data); setLoadingArchived(false); })
      .catch(() => setLoadingArchived(false));
  }, [tab]);

  const tabs = ['Todos', ...ORDER_STATUSES, 'Arquivados'];
  const counts = useMemo(() => {
    const c = { Todos: orders.length };
    ORDER_STATUSES.forEach(s => c[s] = orders.filter(o => o.status === s).length);
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    if (tab === 'Arquivados') {
      let r = archivedOrders.slice();
      if (query.trim()) { const q = query.toLowerCase(); r = r.filter(o => o.customer.toLowerCase().includes(q) || String(o.id).includes(q) || o.city.toLowerCase().includes(q)); }
      if (sort === 'Maior valor') r.sort((a,b) => b.total - a.total);
      else if (sort === 'Menor valor') r.sort((a,b) => a.total - b.total);
      else r.sort((a,b) => b.id - a.id);
      return r;
    }
    let r = orders.slice();
    if (tab !== 'Todos') r = r.filter(o => o.status === tab);
    if (query.trim()) { const q = query.toLowerCase(); r = r.filter(o => o.customer.toLowerCase().includes(q) || String(o.id).includes(q) || o.city.toLowerCase().includes(q)); }
    if (sort === 'Maior valor') r.sort((a,b) => b.total - a.total);
    else if (sort === 'Menor valor') r.sort((a,b) => a.total - b.total);
    else r.sort((a,b) => b.id - a.id);
    return r;
  }, [orders, archivedOrders, tab, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeStatus = (id, status) => {
    // Busca o uid do pedido para propagar o novo status de volta
    // para /users/{uid}/orders/{id} no app mobile.
    const target = orders.find(o => o.id === id) || openOrder;
    const uid = target?.uid || null;
    if (typeof DB !== 'undefined') {
      DB.updateStatusPedido(id, status, uid).catch(console.warn);
    }
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
    setOpenOrder(o => o && o.id === id ? { ...o, status } : o);
    setToast(`Pedido #${id} → ${status}`);
  };

  const archiveOrder = (id) => {
    setConfirmModal({
      message: 'Arquivar este pedido? Ele não aparecerá mais na lista principal.',
      onConfirm: () => {
        setConfirmModal(null);
        DB.arquivarPedido(id)
          .then(() => {
            setOrders(os => os.filter(o => o.id !== id));
            setOpenOrder(null);
            setToast('Pedido arquivado!');
          })
          .catch(() => setToast('Erro ao arquivar pedido.'));
      },
    });
  };

  const unarchiveOrder = (id) => {
    DB.desarquivarPedido(id)
      .then(() => {
        setArchivedOrders(os => os.filter(o => o.id !== id));
        setOpenOrder(null);
        setToast('Pedido restaurado!');
      })
      .catch(() => setToast('Erro ao restaurar pedido.'));
  };

  const revenue = orders.filter(o => o.status !== 'Cancelado').reduce((s,o) => s + o.total, 0);

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="pedidos" />
      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar crumbs={[{ label: 'Pedidos', href: 'Pedidos.html' }, { label: 'Todos os pedidos' }]}
          search="Buscar pedido, cliente, cidade..." />

        <main style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <h1 className="h-jakarta" style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#52170c' }}>Pedidos</h1>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Acompanhe e atualize o status dos pedidos do empório</div>
            </div>
            <button className="btn btn-primary" style={{ marginRight: 8 }} onClick={() => { setShowPickupModal(true); setPickupCode(''); setPickupResult(null); setPickupError(''); }}>
              🏪 Retirada na Loja
            </button>
            <button className="btn btn-outline" onClick={exportarPedidos}><IconDownload size={16} /> Exportar</button>
          </div>

          {/* metrics */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 22 }}>
            <MiniMetric label="pedidos no total" value={orders.length} tone="all" />
            <MiniMetric label="preparando" value={counts['Preparando']} tone="warn" />
            <MiniMetric label="em trânsito" value={counts['Em trânsito']} tone="info" />
            <MiniMetric label="faturamento" value={fmtBRL(revenue)} tone="success" />
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', flexWrap: 'wrap' }}>
              {tabs.map(tb => (
                <button key={tb} className={`pill ${tab === tb ? 'active' : ''}`} onClick={() => setTab(tb)}>
                  {tb} <span style={{ marginLeft: 6, opacity: .7 }}>{counts[tb] ?? 0}</span>
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <Dropdown value={sort} options={['Mais recentes','Maior valor','Menor valor']} onChange={setSort} icon={IconSort} minWidth={170} />
            </div>

            {/* table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup><col style={{width:90}}/><col/><col style={{width:150}}/><col style={{width:120}}/><col style={{width:130}}/><col style={{width:150}}/><col style={{width:90}}/></colgroup>
              <thead>
                <tr style={{ background: 'var(--th)', borderBottom: '1px solid var(--border-soft)' }}>
                  {['Pedido','Cliente','Data','Itens','Total','Status','']
                    .map((h,i) => <th key={i} style={{ textAlign: i>=3&&i<5 ? 'left' : 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ color: 'var(--muted)', fontSize: 14 }}>Carregando pedidos...</div>
                  </td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e3f1e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconOrders size={26} color="#2e7d32" />
                      </div>
                      <div>
                        <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>Nenhum pedido ainda</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Os pedidos feitos pelo app aparecem aqui automaticamente.</div>
                      </div>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#87726e', fontSize: 14 }}>Nenhum pedido encontrado para este filtro.</td></tr>
                ) : paginated.map((o, i) => (
                  <tr key={o.id} className="row" style={{ background: i%2 ? 'var(--row-alt)' : '#fff', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer' }} onClick={() => setOpenOrder(o)}>
                    <td style={{ padding: '14px 16px' }}><span className="mono" style={{ fontSize: 13, color: window.THEME.primary, fontWeight: 600 }}>{o.number ? o.number : `#${String(o.id).slice(-6)}`}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 34, height: 34, background: o.tint, fontSize: 12 }}>{o.initials}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>{o.customer}</div>
                          <div style={{ fontSize: 12, color: '#87726e' }}>{o.city}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#54433f' }}>{o.date}<div style={{ fontSize: 12, color: '#87726e' }}>{o.time}</div></td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#54433f' }}>{o.items} itens</td>
                    <td style={{ padding: '14px 16px' }}><span className="num" style={{ fontSize: 14, color: '#52170c' }}>{fmtBRL(o.total)}</span></td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}><IconChevronRight size={16} color="#87726e" /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 13, color: '#87726e', flex: 1 }}>Mostrando <span style={{ color: '#1c1c1a', fontWeight: 600 }}>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> de <span style={{ color: '#1c1c1a', fontWeight: 600 }}>{filtered.length}</span> resultados</div>
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
          </div>
        </main>
      </div>

      {openOrder && <OrderDrawer order={openOrder} onClose={() => setOpenOrder(null)} onStatusChange={changeStatus} onArchive={archiveOrder} onUnarchive={unarchiveOrder} isArchived={tab === 'Arquivados'} />}
      {toast && <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toast}</span></div>}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {showPickupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-pop)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div className="h-jakarta" style={{ fontSize: 20, fontWeight: 700, color: '#52170c' }}>🏪 Retirada na Loja</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Digite o código que o cliente apresentou</div>
              </div>
              <button className="btn-icon" onClick={() => setShowPickupModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                className="search-input"
                style={{ flex: 1, height: 48, borderRadius: 10, border: '1.5px solid var(--border)', padding: '0 16px', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}
                placeholder="Ex: 884369"
                value={pickupCode}
                onChange={e => { setPickupCode(e.target.value); setPickupError(''); setPickupResult(null); }}
                onKeyDown={e => e.key === 'Enter' && buscarPedidoRetirada()}
                autoFocus
              />
              <button className="btn btn-primary" style={{ height: 48, paddingInline: 20 }} onClick={buscarPedidoRetirada} disabled={pickupLoading}>
                {pickupLoading ? '...' : 'Buscar'}
              </button>
            </div>

            {pickupError && (
              <div style={{ background: '#fdecea', color: '#ba1a1a', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                ❌ {pickupError}
              </div>
            )}

            {pickupResult && (
              <div style={{ background: '#f6f3ef', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c' }}>
                      {pickupResult.number ? pickupResult.number : `#${String(pickupResult.id).slice(-6)}`}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{pickupResult.date} às {pickupResult.time}</div>
                  </div>
                  <StatusBadge status={pickupResult.status} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ width: 40, height: 40, background: pickupResult.tint, fontSize: 14 }}>{pickupResult.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1a' }}>{pickupResult.customer}</div>
                    <div style={{ fontSize: 12, color: '#87726e' }}>{(pickupResult.payment || 'PIX').toUpperCase()}</div>
                  </div>
                  <div className="num" style={{ marginLeft: 'auto', fontSize: 18, color: '#52170c', fontWeight: 700 }}>{fmtBRL(pickupResult.total)}</div>
                </div>

                {Array.isArray(pickupResult.products) && pickupResult.products.length > 0 && (
                  <div style={{ borderTop: '1px solid #e8e0d8', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: '#87726e', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>Itens</div>
                    {pickupResult.products.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < pickupResult.products.length - 1 ? '1px solid #f0ede9' : 'none' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fdddc8', color: '#7a4a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{p.q}×</div>
                        <div style={{ flex: 1, fontSize: 13, color: '#1c1c1a' }}>{p.n}</div>
                        <div className="num" style={{ fontSize: 13, color: '#52170c' }}>{fmtBRL(p.p * p.q)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', background: '#2e7d32' }}
                    onClick={() => {
                      DB.updateStatusPedido(pickupResult.id, 'Entregue', pickupResult.uid);
                      setPickupResult(prev => ({ ...prev, status: 'Entregue' }));
                      setOrders(os => os.map(o => o.id === pickupResult.id ? { ...o, status: 'Entregue' } : o));
                      setToast('Pedido marcado como Entregue!');
                    }}
                  >
                    ✅ Entregar pedido
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { setOpenOrder(pickupResult); setShowPickupModal(false); }}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
