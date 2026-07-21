const { useState } = React;

// Gradientes padrão para categorias sem gradiente definido
const DEFAULT_GRADS = [
  ['#a85a32','#d8a360'], ['#4b2316','#8a4a14'], ['#8a4a14','#d8a360'],
  ['#2e5a2e','#4a8a4a'], ['#8a6a2e','#c8a45e'], ['#1a3a5c','#2e6a9e'],
  ['#5c2a1a','#8a4a2e'], ['#8a6a00','#d4a800'],
];
function firestoreToCat(c, idx) {
  return {
    id: c.id,
    name: c.name || 'Sem nome',
    emoji: c.icon || '📦',
    count: c.count || 0,
    grad: c.grad || DEFAULT_GRADS[idx % DEFAULT_GRADS.length],
    visible: c.visible !== false,
    badge: null,
    accent: idx === 0,
    parentId: c.parentId || null,
  };
}

const CAT_FILTERS = ['Todas', 'Principais', 'Subcategorias'];
const EMOJIS = ['🧀','☕','🍬','🫙','🍞','🍶','🥩','🍯','🌽','🫒','🧈','🥛'];
const SWATCHES = [
  { name:'Marrom escuro', grad:['#4b2316','#8a4a14'] },
  { name:'Terracota',     grad:['#a85a32','#d8a360'] },
  { name:'Dourado',       grad:['#8a6a2e','#c8a45e'] },
  { name:'Verde',         grad:['#2e5a2e','#4a8a4a'] },
  { name:'Azul',          grad:['#1a3a5c','#2e6a9e'] },
  { name:'Vinho',         grad:['#5c1a2a','#8a2e4a'] },
];

// ─────────────────────────────────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────────────────────────────────
function Metric({ icon: Ic, iconBg, iconFg, value, label, sub }) {
  return (
    <div className="card" style={{ padding: 22, flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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
// Toggle
// ─────────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange, light }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onChange(!on); }} style={{ width: 40, height: 23, borderRadius: 999, background: on ? (light ? 'rgba(255,255,255,0.95)' : '#2e7d32') : (light ? 'rgba(255,255,255,0.35)' : '#d8ccc7'), position: 'relative', transition: 'background .18s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 17, height: 17, borderRadius: '50%', background: on && light ? '#2e7d32' : '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Category card
// ─────────────────────────────────────────────────────────────────────────
function CatCard({ c, reorder, onToggle, onEdit, onDelete }) {
  const hidden = !c.visible;
  return (
    <div className="card cat-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex' }}>
      {reorder && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, background: '#faf7f3', borderRight: '1px solid var(--border-soft)', cursor: 'grab', flexShrink: 0 }}>
          <IconDrag size={18} color="#87726e" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* gradient banner */}
        <div style={{ position: 'relative', padding: '16px 22px 18px', minHeight: 116, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: hidden ? 'linear-gradient(90deg,#b8aca6,#cfc4be)' : `linear-gradient(90deg,${c.grad[0]},${c.grad[1]})`,
          borderLeft: c.accent ? '3px solid #d8a360' : 'none', transition: 'background .25s' }}>
          {/* emoji */}
          <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 46, lineHeight: 1, opacity: hidden ? 0.5 : 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}>{c.emoji}</div>
          {/* badges */}
          <div style={{ display: 'flex', gap: 8, minHeight: 22, flexWrap: 'wrap' }}>
            {c.badge && !hidden && (
              <span style={{ background: c.badge.bg, color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', padding: '4px 9px', borderRadius: 999, alignSelf: 'flex-start' }}>{c.badge.label}</span>
            )}
            {hidden && <span style={{ background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', padding: '4px 9px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}><IconEyeOff size={12} color="#fff" /> OCULTO</span>}
            {c.parentId && <span style={{ background: 'rgba(0,0,0,0.30)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', padding: '4px 9px', borderRadius: 999 }}>SUBCATEGORIA</span>}
          </div>
          {/* name + count */}
          <div style={{ paddingRight: 56 }}>
            <div className="h-jakarta" style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-.01em', lineHeight: 1.15 }}>{c.name}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>{c.count} produtos</div>
          </div>
        </div>
        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px' }}>
          <Toggle on={c.visible} onChange={() => onToggle(c.id)} />
          <span style={{ fontSize: 13, color: c.visible ? '#2e7d32' : '#87726e', fontWeight: 600 }}>Visível no app</span>
          <div style={{ flex: 1 }} />
          <div className="cat-actions" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ height: 34, padding: '0 13px', fontSize: 13 }} onClick={() => onEdit(c)}><IconEdit size={14} /> Editar</button>
            <button className="btn-icon" style={{ width: 34, height: 34, color: '#ba1a1a' }} title="Excluir" onClick={() => onDelete(c.id, c.name)}><IconTrash size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// New category modal
// ─────────────────────────────────────────────────────────────────────────
function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function NewCatModal({ onClose, onCreate, cats }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🧀');
  const [swatch, setSwatch] = useState(1);
  const [desc, setDesc] = useState('');
  const [visible, setVisible] = useState(true);
  const [parentId, setParentId] = useState(null);
  const slug = name ? slugify(name) : 'queijos-artesanais';
  const mainCats = (cats || []).filter(c => !c.parentId);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 500, maxHeight: '88vh', overflowY: 'auto', padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c', flex: 1 }}>Nova categoria</div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>

        <div style={{ padding: 24 }}>
          {/* name */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>Nome da categoria <span style={{ color: '#ba1a1a' }}>*</span></div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Queijos Artesanais" style={{ width: '100%' }} autoFocus />
          </div>

          {/* parent category */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>Categoria pai</div>
            <select className="input" style={{ width: '100%' }} value={parentId || ''} onChange={e => setParentId(e.target.value || null)}>
              <option value="">Nenhuma (categoria principal)</option>
              {mainCats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>

          {/* slug */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
              Slug / URL <span className="badge badge-gray" style={{ fontSize: 10.5, fontWeight: 600 }}>gerado automaticamente</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: '#faf7f3' }}>
              <span className="mono" style={{ fontSize: 13, color: '#87726e', padding: '0 0 0 12px', whiteSpace: 'nowrap' }}>emporio.com/categoria/</span>
              <span className="mono" style={{ fontSize: 13, color: '#1c1c1a', fontWeight: 600, padding: '10px 12px 10px 2px' }}>{slug}</span>
            </div>
          </div>

          {/* emoji */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 9 }}>Ícone</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setEmoji(em)} style={{ aspectRatio: '1', borderRadius: 10, fontSize: 24, border: `1.5px solid ${emoji === em ? window.THEME.primary : 'var(--border)'}`, background: emoji === em ? '#fff8f4' : '#fff', boxShadow: emoji === em ? '0 0 0 3px rgba(150,73,4,0.10)' : 'none', transition: 'all .12s' }}>{em}</button>
              ))}
            </div>
          </div>

          {/* color */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 9 }}>Cor / gradiente</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                {SWATCHES.map((sw, i) => (
                  <button key={i} onClick={() => setSwatch(i)} title={sw.name} style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${sw.grad[0]},${sw.grad[1]})`, border: `2px solid ${swatch === i ? window.THEME.primary : 'transparent'}`, boxShadow: swatch === i ? '0 0 0 2px #fff inset' : 'none', transition: 'all .12s' }} />
                ))}
              </div>
              {/* preview */}
              <div style={{ width: 88, height: 56, borderRadius: 12, background: `linear-gradient(135deg,${SWATCHES[swatch].grad[0]},${SWATCHES[swatch].grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{emoji}</div>
            </div>
          </div>

          {/* description */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>Descrição <span style={{ color: '#87726e', fontWeight: 400 }}>(opcional)</span></div>
            <textarea className="input" rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descreva brevemente esta categoria" style={{ width: '100%', resize: 'vertical', fontFamily: 'Work Sans' }} />
          </div>

          {/* visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf7f3', borderRadius: 10, padding: '12px 14px' }}>
            <Toggle on={visible} onChange={setVisible} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>Visível no app</div>
              <div style={{ fontSize: 12.5, color: '#87726e' }}>Categoria aparece para os clientes</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: 24, borderTop: '1px solid #f0ede9', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: '#fff' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onCreate({ name: name || 'Nova categoria', emoji, grad: SWATCHES[swatch].grad, parentId: parentId || null })}><IconPlus size={16} /> Criar categoria</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Edit category modal
// ─────────────────────────────────────────────────────────────────────────
function EditCatModal({ cat, onClose, onSave }) {
  const [name, setName] = useState(cat.name);
  const [emoji, setEmoji] = useState(cat.emoji);
  const [swatch, setSwatch] = useState(() => {
    const idx = SWATCHES.findIndex(sw => sw.grad[0] === cat.grad[0] && sw.grad[1] === cat.grad[1]);
    return idx >= 0 ? idx : 0;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(cat.id, { name: name.trim(), emoji, grad: SWATCHES[swatch].grad });
      onClose();
    } catch (_) {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 500, maxHeight: '88vh', overflowY: 'auto', padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c', flex: 1 }}>Editar categoria</div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>Nome da categoria <span style={{ color: '#ba1a1a' }}>*</span></div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 9 }}>Ícone</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setEmoji(em)} style={{ aspectRatio: '1', borderRadius: 10, fontSize: 24, border: `1.5px solid ${emoji === em ? window.THEME.primary : 'var(--border)'}`, background: emoji === em ? '#fff8f4' : '#fff', boxShadow: emoji === em ? '0 0 0 3px rgba(150,73,4,0.10)' : 'none', transition: 'all .12s' }}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 9 }}>Cor / gradiente</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                {SWATCHES.map((sw, i) => (
                  <button key={i} onClick={() => setSwatch(i)} title={sw.name} style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${sw.grad[0]},${sw.grad[1]})`, border: `2px solid ${swatch === i ? window.THEME.primary : 'transparent'}`, boxShadow: swatch === i ? '0 0 0 2px #fff inset' : 'none', transition: 'all .12s' }} />
                ))}
              </div>
              <div style={{ width: 88, height: 56, borderRadius: 12, background: `linear-gradient(135deg,${SWATCHES[swatch].grad[0]},${SWATCHES[swatch].grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{emoji}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 24, borderTop: '1px solid #f0ede9', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: '#fff' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>{saving ? 'Salvando…' : <><IconCheck size={16} /> Salvar alterações</>}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Confirm delete modal
// ─────────────────────────────────────────────────────────────────────────
function ConfirmDeleteModal({ catName, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (_) {
      setDeleting(false);
    }
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 420, padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center' }}>
          <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c', flex: 1 }}>Excluir categoria</div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 14, color: '#54433f' }}>Deseja excluir a categoria <strong>{catName}</strong>?</div>
          <div style={{ fontSize: 13, color: '#87726e', marginTop: 8 }}>Esta ação não pode ser desfeita. Os produtos desta categoria não serão excluídos.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 24, borderTop: '1px solid #f0ede9', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ background: '#ba1a1a', borderColor: '#ba1a1a' }} onClick={handleConfirm} disabled={deleting}>{deleting ? 'Excluindo…' : <><IconTrash size={15} /> Excluir</>}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [filter, setFilter] = useState('Todas');
  const [reorder, setReorder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbProdutos, setDbProdutos] = useState([]);
  const [toast, setToast] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  React.useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2200); return () => clearTimeout(id); }, [toast]);

  React.useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getCategorias()
      .then(data => { setCats(data.map(firestoreToCat)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getProdutos()
      .then(data => setDbProdutos(data))
      .catch(err => console.warn('[categorias-app] produtos:', err));
  }, []);

  const toggleVis = (id) => {
    const cat = cats.find(c => c.id === id);
    const newVisible = !cat?.visible;
    setCats(prev => prev.map(c => c.id === id ? { ...c, visible: newVisible } : c));
    if (typeof DB !== 'undefined') DB.updateCategoria(id, { visible: newVisible }).catch(console.warn);
  };
  const saveCat = async (id, data) => {
    if (typeof DB !== 'undefined') await DB.updateCategoria(id, { name: data.name, icon: data.emoji, grad: data.grad });
    setCats(prev => prev.map(c => c.id === id ? { ...c, name: data.name, emoji: data.emoji, grad: data.grad } : c));
    setToast('Categoria atualizada');
  };
  const deleteCat = async (id) => {
    if (typeof DB !== 'undefined') await DB.deleteCategoria(id);
    setCats(prev => prev.filter(c => c.id !== id));
    setToast('Categoria excluída');
  };
  const createCat = (data) => {
    if (typeof DB !== 'undefined') {
      DB.addCategoria({ name: data.name, icon: data.emoji, grad: data.grad, visible: true, parentId: data.parentId || null })
        .then(id => setCats(p => [...p, { ...data, id, count: 0, visible: true, badge: null, parentId: data.parentId || null }]))
        .catch(console.warn);
    }
    setShowModal(false); setToast('Categoria criada com sucesso');
  };

  const catsWithCount = cats.map(c => ({
    ...c,
    count: c.parentId
      ? dbProdutos.filter(p => p.subcategory === c.id).length
      : dbProdutos.filter(p => p.category === c.id).length,
  }));

  const filtered = filter === 'Principais' ? catsWithCount.filter(c => !c.parentId)
                 : filter === 'Subcategorias' ? catsWithCount.filter(c => !!c.parentId)
                 : catsWithCount;

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="categorias" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Categorias', href: 'Categorias.html' }, { label: 'Catálogo' }]}
          search="Buscar categoria..."
          actions={<button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setShowModal(true)}><IconPlus size={16} /> Nova Categoria</button>} />

        <main style={{ padding: 32 }}>
          {/* metrics */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <Metric icon={IconFolder} iconBg="#e8eaf6" iconFg="#3949ab"
              value={loading ? '—' : String(catsWithCount.length)} label="categorias cadastradas"
              sub={catsWithCount.length > 0 ? `${catsWithCount.filter(c => c.visible).length} visíveis no app` : 'nenhuma cadastrada'} />
            <Metric icon={IconBox} iconBg="#e3f1e3" iconFg="#2e7d32"
              value={loading ? '—' : String(catsWithCount.reduce((s, c) => s + (c.count || 0), 0))} label="produtos catalogados"
              sub="contagem por categoria" />
            <Metric icon={IconStar} iconBg="#fdddc8" iconFg={window.THEME.primary}
              value={catsWithCount.length > 0 ? catsWithCount[0].name : '—'} label="1ª categoria"
              sub={catsWithCount.length > 0 ? 'Primeira na ordem do catálogo' : 'Nenhuma categoria ainda'} />
          </div>

          {/* action bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {CAT_FILTERS.map(f => (
                <button key={f} className={`pill ${filter === f ? 'active' : ''}`} style={filter === f ? { background: '#52170c', color: '#fff' } : undefined} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#87726e' }}><span style={{ fontWeight: 600, color: '#54433f' }}>{filtered.length}</span> categorias encontradas</div>
            <div style={{ flex: 1 }} />
            <button className={`btn btn-outline ${reorder ? 'reorder-on' : ''}`} onClick={() => setReorder(r => !r)}
              style={reorder ? { background: '#fff8f4', borderColor: window.THEME.primary, color: window.THEME.primary } : undefined}>
              <IconDrag size={16} /> {reorder ? 'Concluir' : 'Reordenar'}
            </button>
            <button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={() => setShowModal(true)}><IconPlus size={16} /> Nova Categoria</button>
          </div>

          {/* grid */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
              Carregando categorias...
            </div>
          ) : cats.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconFolder size={26} color="#3949ab" /></div>
              <div>
                <div className="h-jakarta" style={{ fontSize: 15, fontWeight: 700, color: '#52170c', marginBottom: 6 }}>Nenhuma categoria ainda</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Crie categorias para organizar os produtos no app.</div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus size={16} /> Nova Categoria</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {filtered.map(c => <CatCard key={c.id} c={c} reorder={reorder} onToggle={toggleVis} onEdit={cat => setEditCat(cat)} onDelete={(id, name) => setDeleteTarget({ id, name })} />)}
            </div>
          )}
        </main>
      </div>

      {showModal && <NewCatModal onClose={() => setShowModal(false)} onCreate={createCat} cats={cats} />}
      {editCat && <EditCatModal cat={editCat} onClose={() => setEditCat(null)} onSave={saveCat} />}
      {deleteTarget && <ConfirmDeleteModal catName={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteCat(deleteTarget.id)} />}
      {toast && <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toast}</span></div>}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
