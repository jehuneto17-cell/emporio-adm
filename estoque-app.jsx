const { useState, useEffect, useMemo } = React;

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

// Converte produto do Firestore para o formato de estoque
function produtoToStockItem(p) {
  return {
    id: p.id,
    initials: p.initials || (p.name || '').substring(0, 2).toUpperCase(),
    tint: p.tint || '#a85a32',
    name: p.name || '',
    sku: p.sku || '',
    cat: p.category || '',
    price: p.price || 0,
    stock: p.stock != null ? p.stock : 0,
    min: 5,
    cap: Math.max(30, (p.stock || 0) * 2),
    last: '—',
  };
}

function statusOf(s) {
  if (s.stock === 0) return 'esgotado';
  if (s.stock < s.min) return 'baixo';
  return 'normal';
}
const STATUS_META = {
  normal:   { label: 'Normal',   dot: '#2e7d32', cls: 'badge-success' },
  baixo:    { label: 'Baixo',    dot: '#f57c00', cls: 'badge-warn' },
  esgotado: { label: 'Esgotado', dot: '#ba1a1a', cls: 'badge-error' },
};
function barColor(pct) { return pct < 20 ? '#ba1a1a' : pct <= 50 ? '#f57c00' : '#2e7d32'; }
function stockColor(st) { return st === 'esgotado' ? '#ba1a1a' : st === 'baixo' ? '#f57c00' : '#2e7d32'; }

const STOCK_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'criticos', label: 'Críticos', dot: '#ba1a1a' },
  { id: 'baixo', label: 'Estoque baixo', dot: '#f57c00' },
  { id: 'normal', label: 'Normal', dot: '#2e7d32' },
  { id: 'esgotados', label: 'Esgotados', dot: '#1c1c1a' },
];
const STOCK_CATEGORIES = ['Todas as categorias', 'Queijos', 'Cafés', 'Doces', 'Embutidos', 'Bebidas', 'Conservas', 'Pães', 'Mel e Derivados'];

// ─────────────────────────────────────────────────────────────────────────
// Metric
// ─────────────────────────────────────────────────────────────────────────
function Metric({ icon: Ic, iconBg, iconFg, value, label, sub, borderColor }) {
  return (
    <div className="card" style={{ padding: 22, flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start', ...(borderColor ? { borderColor, borderWidth: 1 } : {}) }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ic size={24} color={iconFg} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="num" style={{ fontSize: 30, color: '#52170c', lineHeight: 1.1, letterSpacing: '-.02em' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#87726e', marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: '#54433f', marginTop: 8 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared form bits
// ─────────────────────────────────────────────────────────────────────────
function FieldLabel({ children, required, optional }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>{children}{required && <span style={{ color: '#ba1a1a' }}> *</span>}{optional && <span style={{ color: '#87726e', fontWeight: 400 }}> (opcional)</span>}</div>;
}
function TextField({ value, onChange, placeholder, type = 'text', ...rest }) {
  const [f, setF] = useState(false);
  return <input className="input" type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)}
    style={{ width: '100%', borderColor: f ? '#52170c' : 'var(--border)', boxShadow: f ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', ...rest.style }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// Registrar entrada modal
// ─────────────────────────────────────────────────────────────────────────
function EntryModal({ initial, stockItems, onClose, onConfirm, toast }) {
  const [prod, setProd] = useState(initial?.name || '');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Compra de fornecedor');
  const [supplier, setSupplier] = useState('');
  const [nf, setNf] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const stockItem = (stockItems || []).find(s => s.name === prod);
  const itemId = initial?.id || stockItem?.id;
  const cur = initial?.stock != null ? initial.stock : (stockItem?.stock ?? 0);
  const total = cur + (parseInt(qty) || 0);
  const opts = (stockItems || []).map(s => s.name);

  const handleConfirm = async () => {
    if (!itemId) { toast('Selecione um produto válido.'); return; }
    setSaving(true);
    try {
      await onConfirm(itemId, total);
      toast('Entrada registrada com sucesso');
      onClose();
    } catch (_) {
      toast('Erro ao registrar entrada. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <ModalShell width={480} title="Registrar entrada de estoque" onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>{saving ? 'Salvando…' : <><IconPlus size={16} /> Registrar entrada</>}</button></>}>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel required>Produto</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dropdown value={prod} options={opts} onChange={setProd} minWidth={280} />
          <span className="badge badge-warn" style={{ whiteSpace: 'nowrap' }}>Estoque atual: {cur} un</span>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel required>Quantidade entrada</FieldLabel>
        <input className="input num" value={qty} onChange={e => setQty(e.target.value.replace(/\D/g, ''))} style={{ width: 160, fontSize: 18, fontWeight: 700 }} />
        <div style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600, marginTop: 8 }}>Novo total após entrada: {total} unidades</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Motivo</FieldLabel>
        <Dropdown value={reason} options={['Compra de fornecedor', 'Devolução', 'Ajuste manual', 'Inventário']} onChange={setReason} minWidth={280} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div><FieldLabel optional>Fornecedor</FieldLabel><TextField value={supplier} onChange={setSupplier} placeholder="Nome do fornecedor" /></div>
        <div><FieldLabel optional>Nota fiscal</FieldLabel><TextField value={nf} onChange={setNf} placeholder="Nº da nota fiscal" /></div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Data da entrada</FieldLabel>
        <TextField type="date" value={date} onChange={setDate} style={{ width: 200 }} />
      </div>
      <div>
        <FieldLabel optional>Observações</FieldLabel>
        <textarea className="input" rows={2} value={obs} onChange={e => setObs(e.target.value)} placeholder="Observações sobre este lote" style={{ width: '100%', resize: 'vertical', fontFamily: 'Work Sans' }} />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Ajustar estoque modal
// ─────────────────────────────────────────────────────────────────────────
function AdjustModal({ product, onClose, onConfirm, toast }) {
  const [mode, setMode] = useState('add');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Inventário');
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const cur = product.stock;
  const n = parseInt(qty) || 0;
  const next = mode === 'add' ? cur + n : Math.max(0, cur - n);
  const nextColor = next === 0 ? '#ba1a1a' : next < product.min ? '#f57c00' : '#2e7d32';

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(product.id, next);
      toast('Estoque ajustado');
      onClose();
    } catch (_) {
      toast('Erro ao ajustar estoque. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <ModalShell width={400} title={`Ajustar estoque — ${product.name.replace(/\s\d.*$/, '')}`} onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleConfirm} disabled={saving}>{saving ? 'Salvando…' : <><IconCheck size={16} /> Confirmar ajuste</>}</button></>}>
      <div style={{ background: '#faf7f3', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 12.5, color: '#87726e', marginBottom: 4 }}>Estoque atual</div>
        <div className="num" style={{ fontSize: 28, color: stockColor(statusOf(product)) }}>{cur} unidades</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Tipo de ajuste</FieldLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['add', 'Adicionar', IconPlus], ['remove', 'Remover', IconDash]].map(([m, lbl, Ic]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: `1.5px solid ${mode === m ? window.THEME.primary : 'var(--border)'}`, background: mode === m ? '#fff8f4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, color: mode === m ? window.THEME.primary : '#54433f', boxShadow: mode === m ? '0 0 0 3px rgba(150,73,4,0.10)' : 'none', transition: 'all .12s' }}>
              <Ic size={16} color={mode === m ? window.THEME.primary : '#87726e'} /> {lbl}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Quantidade</FieldLabel>
        <input className="input num" value={qty} onChange={e => setQty(e.target.value.replace(/\D/g, ''))} style={{ width: 140, fontSize: 17, fontWeight: 700 }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Motivo</FieldLabel>
        <Dropdown value={reason} options={['Inventário', 'Ajuste manual', 'Perda', 'Devolução']} onChange={setReason} minWidth={200} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <FieldLabel optional>Observação</FieldLabel>
        <textarea className="input" rows={2} value={obs} onChange={e => setObs(e.target.value)} placeholder="Detalhe o motivo do ajuste" style={{ width: '100%', resize: 'vertical', fontFamily: 'Work Sans' }} />
      </div>
      <div style={{ background: nextColor + '14', border: `1px solid ${nextColor}40`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13.5, color: '#54433f' }}>Novo estoque:</span>
        <span className="num" style={{ fontSize: 18, color: nextColor, fontWeight: 700 }}>{next} unidades</span>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────────────────
function ModalShell({ width, title, onClose, footer, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width, maxHeight: '90vh', overflowY: 'auto', padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c', flex: 1 }}>{title}</div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, padding: 24, borderTop: '1px solid #f0ede9', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: '#fff' }}>{footer}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [filter, setFilter] = useState('todos');
  const [cat, setCat] = useState('Todas as categorias');
  const [entry, setEntry] = useState(null);
  const [adjust, setAdjust] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [categories, setCategories] = useState(['Todas as categorias']);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!toastMsg) return; const id = setTimeout(() => setToastMsg(null), 2200); return () => clearTimeout(id); }, [toastMsg]);
  const toast = (m) => setToastMsg(m);
  const handleStockConfirm = (id, novoEstoque) => {
    return DB.updateEstoqueProduto(id, novoEstoque).then(() => {
      const updated = stockItems.map(s => s.id === id ? { ...s, stock: novoEstoque } : s);
      setStockItems(updated);
    });
  };

  useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    Promise.all([DB.getProdutos(), DB.getCategorias()])
      .then(([produtos, cats]) => {
        const items = produtos.map(produtoToStockItem);
        setStockItems(items);
        setCategories(['Todas as categorias', ...cats.map(c => c.name).filter(Boolean)]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filter, cat]);

  const rows = useMemo(() => stockItems.filter(s => {
    const st = statusOf(s);
    if (cat !== 'Todas as categorias' && s.cat !== cat) return false;
    if (filter === 'todos') return true;
    if (filter === 'criticos') return st === 'esgotado' || st === 'baixo';
    if (filter === 'baixo') return st === 'baixo';
    if (filter === 'normal') return st === 'normal';
    if (filter === 'esgotados') return st === 'esgotado';
    return true;
  }), [filter, cat, stockItems]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [exportingCSV, setExportingCSV] = useState(false);
  const exportarCSV = () => {
    if (loading || rows.length === 0) return;
    setExportingCSV(true);
    try {
      const csvRows = [
        ['Nome', 'SKU', 'Categoria', 'Estoque atual', 'Estoque mínimo', 'Valor unitário', 'Valor total em estoque', 'Status'],
        ...rows.map(s => [
          s.name, s.sku, s.cat, s.stock, s.min,
          s.price.toFixed(2).replace('.', ','),
          (s.stock * s.price).toFixed(2).replace('.', ','),
          STATUS_META[statusOf(s)].label,
        ]),
      ];
      downloadCSV('estoque.csv', csvRows);
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="estoque" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Estoque', href: 'Estoque.html' }, { label: 'Controle de estoque' }]}
          search="Buscar produto, SKU..."
          actions={<>
            <button className="btn btn-outline" onClick={exportarCSV} disabled={loading || exportingCSV || rows.length === 0}>
              {exportingCSV ? <><span className="spinner" /> Gerando...</> : <><IconDownload size={16} /> Exportar CSV</>}
            </button>
            <button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setEntry({})}><IconPlus size={16} /> Registrar entrada</button>
          </>} />

        <main style={{ padding: 32 }}>
          {/* alert banner — só aparece quando há problemas reais */}
          {!loading && (() => {
            const esgotados = stockItems.filter(s => s.stock === 0).length;
            const baixo = stockItems.filter(s => s.stock > 0 && s.stock < s.min).length;
            if (esgotados === 0 && baixo === 0) return null;
            return (
              <div style={{ background: '#fdecd6', borderLeft: '4px solid #f57c00', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
                <IconAlertTri size={22} color="#f57c00" />
                <div style={{ flex: 1, fontSize: 14, color: '#8a4a00', fontWeight: 500 }}>
                  <strong style={{ fontWeight: 700 }}>Atenção</strong> —
                  {esgotados > 0 && ` ${esgotados} produto(s) esgotado(s)`}
                  {esgotados > 0 && baixo > 0 && ' e'}
                  {baixo > 0 && ` ${baixo} com estoque baixo`}
                  {' '}precisam de reposição
                </div>
                <button onClick={() => setFilter('criticos')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: window.THEME.primary }}>
                  Ver críticos <IconChevronRight size={15} />
                </button>
              </div>
            );
          })()}

          {/* metrics calculadas do Firestore */}
          {(() => {
            const totalUnidades = stockItems.reduce((s, p) => s + p.stock, 0);
            const baixo = stockItems.filter(s => s.stock > 0 && s.stock < s.min).length;
            const esgotados = stockItems.filter(s => s.stock === 0).length;
            const valorTotal = stockItems.reduce((s, p) => s + p.stock * (p.price || 0), 0);
            return (
              <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                <Metric icon={IconBox} iconBg="#e8eaf6" iconFg="#3949ab"
                  value={loading ? '—' : String(totalUnidades)} label="unidades em estoque"
                  sub={`em ${stockItems.length} produto(s) cadastrado(s)`} />
                <Metric icon={IconAlertTri} iconBg="#fdecd6" iconFg="#f57c00"
                  value={loading ? '—' : String(baixo)} label="produtos com estoque baixo"
                  sub="abaixo do mínimo definido" borderColor="#f7c98f" />
                <Metric icon={IconXCircle} iconBg="#fbdedc" iconFg="#ba1a1a"
                  value={loading ? '—' : String(esgotados)} label="produtos esgotados"
                  sub="fora de venda no app" borderColor="#f0b3ae" />
                <Metric icon={IconMoney} iconBg="#fdddc8" iconFg={window.THEME.primary}
                  value={loading ? '—' : formatBRL(valorTotal)} label="valor total em estoque"
                  sub="preço de venda × quantidade em estoque" />
              </div>
            );
          })()}

          {/* action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STOCK_FILTERS.map(f => (
                <button key={f.id} className={`pill ${filter === f.id ? 'active' : ''}`} style={filter === f.id ? { background: '#52170c', color: '#fff' } : undefined} onClick={() => setFilter(f.id)}>
                  {f.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.dot, display: 'inline-block', marginRight: 6 }} />}{f.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#87726e' }}><span style={{ fontWeight: 600, color: '#54433f' }}>{rows.length}</span> produtos</div>
            <div style={{ flex: 1 }} />
            <Dropdown value={cat} options={categories} onChange={setCat} minWidth={200} />
            <button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setEntry({})}><IconPlus size={16} /> Registrar entrada</button>
          </div>

          {/* empty state */}
          {!loading && stockItems.length === 0 && (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBox size={26} color="#3949ab" /></div>
              <div>
                <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>Nenhum produto no estoque</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Cadastre produtos na página de Produtos para que apareçam aqui.</div>
              </div>
              <a href="Painel Admin.html" className="btn btn-primary" style={{ textDecoration: 'none' }}><IconPlus size={16} /> Cadastrar produtos</a>
            </div>
          )}

          {/* table */}
          {(loading || stockItems.length > 0) && <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--th)', borderBottom: '1px solid var(--border-soft)' }}>
                  {['Produto', 'SKU', 'Categoria', 'Estoque atual', 'Estoque mín.', 'Status', 'Última entrada', 'Ações'].map((h, i) => (
                    <th key={h} style={{ textAlign: i >= 3 && i <= 4 ? 'center' : 'left', padding: '12px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => {
                  const st = statusOf(s);
                  const meta = STATUS_META[st];
                  const pct = Math.min(100, Math.round((s.stock / s.cap) * 100));
                  const crit = st === 'esgotado';
                  return (
                    <tr key={s.id} className="row stockrow" style={{ background: crit ? '#fff5f5' : '#fff', borderBottom: i < paginated.length - 1 ? '1px solid #f0ede9' : 'none' }}>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="photo" style={{ width: 40, height: 40, background: s.tint, fontSize: 13 }}>{s.initials}</div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1c1a', maxWidth: 200 }}>{s.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px' }}><span className="mono" style={{ fontSize: 12.5, color: '#87726e' }}>{s.sku}</span></td>
                      <td style={{ padding: '13px 18px', fontSize: 13, color: '#54433f', whiteSpace: 'nowrap' }}>{s.cat}</td>
                      <td style={{ padding: '13px 18px', minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, justifyContent: 'center' }}>
                          <span className="num" style={{ fontSize: 15, fontWeight: 700, color: stockColor(st) }}>{s.stock}</span>
                          <span style={{ fontSize: 12, color: '#87726e' }}>un</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: '#f0ede9', overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ width: pct + '%', height: '100%', background: barColor(pct), borderRadius: 999, transition: 'width .4s' }} />
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center', fontSize: 13.5, color: '#54433f' }}><span className="num">{s.min}</span> un</td>
                      <td style={{ padding: '13px 18px' }}><span className={`badge ${meta.cls}`}><span className="badge-dot" style={{ background: meta.dot }} />{meta.label}</span></td>
                      <td style={{ padding: '13px 18px', fontSize: 13, color: '#54433f', whiteSpace: 'nowrap' }}>{s.last}</td>
                      <td style={{ padding: '13px 18px' }}>
                        <div className="stock-actions" style={{ display: 'flex', gap: 7, whiteSpace: 'nowrap' }}>
                          <button className="btn btn-outline" style={{ height: 32, padding: '0 11px', fontSize: 12.5 }} onClick={() => setAdjust(s)}><IconEdit size={13} /> Ajustar</button>
                          <button className="btn btn-outline" style={{ height: 32, padding: '0 11px', fontSize: 12.5, color: window.THEME.primary, borderColor: '#e7c9b3' }} onClick={() => setEntry({ id: s.id, name: s.name, stock: s.stock })}><IconPlus size={13} /> Entrada</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#87726e' }}>Mostrando <strong style={{ color: '#54433f' }}>{rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)}</strong> de <strong style={{ color: '#54433f' }}>{rows.length}</strong> resultados</div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
              <div style={{ flex: 1 }} />
            </div>
          </div>
          }
        </main>
      </div>

      {entry && <EntryModal initial={entry} stockItems={stockItems} onClose={() => setEntry(null)} onConfirm={handleStockConfirm} toast={toast} />}
      {adjust && <AdjustModal product={adjust} onClose={() => setAdjust(null)} onConfirm={handleStockConfirm} toast={toast} />}
      {toastMsg && <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toastMsg}</span></div>}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
