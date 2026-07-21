const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────────────────────────────────
function Label({ children, required, hint }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#52170c', marginBottom: 8 }}>
      <span>{children}</span>
      {required && <span style={{ color: '#ba1a1a', fontWeight: 700 }}>*</span>}
      {hint && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#87726e', fontWeight: 400 }}>{hint}</span>}
    </label>
  );
}

function Field({ label, required, hint, children, helper, error }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <Label required={required} hint={hint}>{label}</Label>}
      {children}
      {error && <div style={{ fontSize: 12, color: '#ba1a1a', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}><IconAlertTri size={13} /> {error}</div>}
      {helper && !error && <div style={{ fontSize: 12, color: '#87726e', marginTop: 6 }}>{helper}</div>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly, prefix, suffix, error, style }) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? '#ba1a1a' : focus ? '#52170c' : 'var(--border)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 40, borderRadius: 8,
      border: `1px solid ${borderColor}`, background: readOnly ? '#f6f3ef' : '#fff',
      transition: 'border .15s, box-shadow .15s',
      boxShadow: focus && !error ? '0 0 0 3px rgba(82,23,12,0.10)' : error ? '0 0 0 3px rgba(186,26,26,0.10)' : 'none',
      ...style,
    }}>
      {prefix && <div style={{ paddingLeft: 12, color: '#87726e', fontSize: 14, fontWeight: 500 }}>{prefix}</div>}
      <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ flex: 1, height: '100%', padding: '0 12px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Work Sans', fontSize: 14, color: readOnly ? '#54433f' : '#1c1c1a', minWidth: 0 }} />
      {suffix && <div style={{ paddingRight: 12, color: '#87726e', fontSize: 13, fontWeight: 500 }}>{suffix}</div>}
    </div>
  );
}

function Textarea({ value, onChange, rows = 3, maxLength, error }) {
  const [focus, setFocus] = useState(false);
  const borderColor = error ? '#ba1a1a' : focus ? '#52170c' : 'var(--border)';
  return (
    <div>
      <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={rows} maxLength={maxLength}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${borderColor}`, borderRadius: 8, background: '#fff', resize: 'vertical', fontFamily: 'Work Sans', fontSize: 14, color: '#1c1c1a', outline: 'none', lineHeight: 1.5, boxShadow: focus && !error ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', transition: 'border .15s, box-shadow .15s' }} />
      {maxLength && <div style={{ textAlign: 'right', fontSize: 12, color: value.length > maxLength * 0.9 ? '#f57c00' : '#87726e', marginTop: 4 }}>{value.length}/{maxLength} caracteres</div>}
    </div>
  );
}

function RichTextarea({ value, onChange, rows = 5 }) {
  const tools = [
    { Ic: IconBold, label: 'Negrito' }, { Ic: IconItalic, label: 'Itálico' },
    { sep: true }, { Ic: IconList, label: 'Lista' }, { Ic: IconLink, label: 'Link' },
  ];
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 6, borderBottom: '1px solid var(--border-soft)', background: '#faf7f3' }}>
        {tools.map((t, i) => t.sep
          ? <div key={i} style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
          : <button key={i} className="btn-icon" style={{ height: 30, width: 30, borderRadius: 6 }} title={t.label}><t.Ic size={15} /></button>)}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#87726e', paddingRight: 8 }}>Markdown suportado</span>
      </div>
      <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={rows}
        style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontFamily: 'Work Sans', fontSize: 14, lineHeight: 1.55, color: '#1c1c1a', resize: 'vertical', display: 'block', background: '#fff' }} />
    </div>
  );
}

function Toggle({ value, onChange, size = 'md' }) {
  const w = size === 'md' ? 38 : 32, h = size === 'md' ? 22 : 18, k = h - 4;
  return (
    <button onClick={() => onChange(!value)} style={{ width: w, height: h, borderRadius: h, background: value ? '#2e7d32' : '#d9d2cf', position: 'relative', transition: 'background .18s', flexShrink: 0, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)' }}>
      <span style={{ position: 'absolute', top: 2, left: value ? w - h + 2 : 2, width: k, height: k, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${checked ? window.THEME.primary : 'var(--border)'}`, background: checked ? window.THEME.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s', flexShrink: 0 }}>
      {checked && <IconCheck size={12} color="#fff" stroke={3.5} />}
    </button>
  );
}

function Select({ value, options, onChange, renderValue }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(o => !o); setFocus(true); }}
        style={{ width: '100%', height: 40, padding: '0 12px', background: '#fff', border: `1px solid ${(open || focus) ? '#52170c' : 'var(--border)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Work Sans', fontSize: 14, color: '#1c1c1a', textAlign: 'left', boxShadow: (open || focus) ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', transition: 'border .15s, box-shadow .15s' }}>
        <span style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center' }}>{renderValue ? renderValue(value) : value}</span>
        <IconChevronDown size={16} color="#87726e" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-pop)', padding: 6, zIndex: 50, maxHeight: 280, overflowY: 'auto' }}>
          {options.map(opt => (
            <div key={opt} className={`dd-item ${opt === value ? 'selected' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>
              {opt === value && <IconCheck size={14} color={window.THEME.primary} />}
              <span style={{ marginLeft: opt === value ? 0 : 22, display: 'flex', alignItems: 'center' }}>{renderValue ? renderValue(opt) : opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TagChips({ tags, onAdd, onRemove }) {
  const [draft, setDraft] = useState('');
  const [focus, setFocus] = useState(false);
  const commit = () => { const v = draft.trim().toLowerCase(); if (v && !tags.includes(v)) onAdd(v); setDraft(''); };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, minHeight: 40, border: `1px solid ${focus ? '#52170c' : 'var(--border)'}`, borderRadius: 8, background: '#fff', boxShadow: focus ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', transition: 'border .15s, box-shadow .15s' }}>
      {tags.map(t => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fdddc8', color: '#7a4a14', fontSize: 13, fontWeight: 600, padding: '4px 8px 4px 12px', borderRadius: 999 }}>
          {t}
          <button onClick={() => onRemove(t)} title="Remover" style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a4a14', background: 'rgba(216,163,96,0.25)' }}>
            <IconX size={11} stroke={2.5} />
          </button>
        </span>
      ))}
      <input value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } else if (e.key === 'Backspace' && !draft && tags.length) onRemove(tags[tags.length - 1]); }}
        onBlur={() => { setFocus(false); commit(); }} onFocus={() => setFocus(true)}
        placeholder={tags.length === 0 ? 'Adicionar tag e pressionar Enter' : 'adicionar...'}
        style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', height: 24, fontFamily: 'Work Sans', fontSize: 13, color: '#1c1c1a', background: 'transparent' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Card shell
// ─────────────────────────────────────────────────────────────────────────
function Card({ title, sub, right, children, pad = 24 }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 20 }}>
      {title && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0ede9', display: 'flex', alignItems: 'center', gap: 12 }}>
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

function DropZone({ onAdd }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onAdd(); }}
      onClick={onAdd}
      style={{ border: `2px dashed ${over ? window.THEME.primary : 'var(--border)'}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: over ? '#fdf2e6' : '#faf7f3', transition: 'all .15s', marginBottom: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fdddc8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <IconUpload size={20} color={window.THEME.primary} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#52170c' }}>Arraste fotos aqui ou clique para selecionar</div>
      <div style={{ fontSize: 12, color: '#87726e', marginTop: 4 }}>PNG, JPG até 5MB cada</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Photo thumbnail (grid de fotos)
// ─────────────────────────────────────────────────────────────────────────
function PhotoThumb({ url, isMain, onRemove }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1/1', background: '#f0ede9' }}
    >
      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {isMain && (
        <div style={{ position: 'absolute', bottom: 6, left: 6, background: '#2e7d32', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: '.03em', display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconCheck size={9} stroke={3} /> Principal
        </div>
      )}
      {hover && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,28,26,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn-icon" style={{ background: '#fff' }} title="Remover foto" onClick={onRemove}>
            <IconX size={14} color="#ba1a1a" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sidebar status row
// ─────────────────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? 'none' : '1px solid #f0ede9' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#87726e', marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

const STATUS_META = {
  'Ativo':     { dot: '#2e7d32', cls: 'badge-success' },
  'Inativo':   { dot: '#87726e', cls: 'badge-gray' },
  'Esgotado':  { dot: '#ba1a1a', cls: 'badge-error' },
};

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  // basic
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  // price & stock
  const [price, setPrice] = useState('');
  const [promo, setPromo] = useState('');
  const [hasPromo, setHasPromo] = useState(false);
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [variations, setVariations] = useState([]);
  const [varType, setVarType] = useState('peso');
  // embalagem e frete
  const [weight, setWeight] = useState('');
  const [weightHeight, setWeightHeight] = useState('');
  const [weightWidth, setWeightWidth] = useState('');
  const [weightLength, setWeightLength] = useState('');
  // fotos (até 6)
  const [images, setImages]         = useState([]);   // array de URLs enviadas
  const [uploading, setUploading]   = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const [uploadLabel, setUploadLabel] = useState('');
  const fileInputRef = useRef(null);
  // producer
  const [producer, setProducer] = useState('');
  const [location, setLocation] = useState('Serra da Canastra · MG');
  const [verified, setVerified] = useState(false);
  // SEO
  const [tags, setTags] = useState([]);
  const [meta, setMeta] = useState('');
  // publish
  const [status, setStatus] = useState('Ativo');
  const [visible, setVisible] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [allowReviews, setAllowReviews] = useState(true);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [dbCats, setDbCats] = useState([]);
  // ui
  const [productId, setProductId] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2400); return () => clearTimeout(id); }, [toast]);

  // Carrega produto do Firestore se ?id= estiver na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id || typeof DB === 'undefined') return;
    setProductId(id);
    DB.getProdutos().then(list => {
      const p = list.find(x => x.id === id);
      if (!p) return;
      setName(p.name || '');
      setSku(p.sku || '');
      setShortDesc(p.description || '');
      setLongDesc(p.longDesc || '');
      setPrice(p.price != null ? String(p.price) : '');
      setPromo(p.promo != null ? String(p.promo) : '');
      setHasPromo(p.promo != null);
      setStock(p.stock != null ? String(p.stock) : '0');
      setMinStock(p.minStock != null ? String(p.minStock) : '5');
      setCategory(p.category || '');
      setSubcategory(p.subcategory || '');
      setVariations(Array.isArray(p.variations) ? p.variations : []);
      setVarType(p.varType || 'peso');
      setWeight(p.weight != null ? String(p.weight) : '');
      setWeightHeight(p.weightHeight != null ? String(p.weightHeight) : '');
      setWeightWidth(p.weightWidth != null ? String(p.weightWidth) : '');
      setWeightLength(p.weightLength != null ? String(p.weightLength) : '');
      setStatus(p.status || 'Ativo');
      setTags(p.tags || []);
      setProducer(p.producer || '');
      setLocation(p.location || 'Serra da Canastra · MG');
      setVerified(!!p.verified);
      setFeatured(!!p.featured);
      setVisible(p.visible !== false);
      setAllowReviews(p.allowReviews !== false);
      setMeta(p.meta || '');
      setUpdatedAt(p.updatedAt || null);
      // Carrega galeria — compatível com campo legado imageUrl (foto única)
      setImages(Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : (p.imageUrl ? [p.imageUrl] : []));
    }).catch(err => console.warn('[edit-app] carregar produto:', err));
  }, []);

  useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getCategorias()
      .then(data => setDbCats(data))
      .catch(err => console.warn('[edit-app] carregar categorias:', err));
  }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'O nome do produto é obrigatório';
    if (!price.trim()) e.price = 'Informe o preço normal';
    if (!category) e.category = 'Selecione uma categoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { setToast({ type: 'error', msg: 'Verifique os campos obrigatórios' }); return; }
    if (typeof DB === 'undefined') { setToast({ type: 'error', msg: 'Firestore não disponível' }); return; }
    setSaving(true);
    const data = {
      name: name.trim(),
      sku: sku.trim(),
      description: shortDesc.trim(),
      longDesc: longDesc.trim(),
      price: parseFloat(price.replace(',', '.')) || 0,
      promo: hasPromo && promo ? (parseFloat(promo.replace(',', '.')) || null) : null,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 5,
      category: category,
      subcategory: subcategory,
      status: status,
      visible: visible,
      featured: featured,
      allowReviews: allowReviews,
      producer: producer.trim(),
      location: location.trim(),
      verified: verified,
      tags: tags,
      meta: meta.trim(),
      initials: name.trim().substring(0, 2).toUpperCase(),
      images: images,
      imageUrl: images[0] || null,  // campo legado — app mobile lê este campo
      variations: variations.filter(v => v.label.trim()),
      varType: varType,
      weight: parseFloat(weight) || 0,
      weightHeight: parseFloat(weightHeight) || 0,
      weightWidth: parseFloat(weightWidth) || 0,
      weightLength: parseFloat(weightLength) || 0,
    };
    try {
      if (productId) {
        await DB.updateProduto(productId, data);
      } else {
        await DB.addProduto(data);
      }
      setToast({ type: 'ok', msg: 'Alterações salvas com sucesso' });
      const now = new Date();
      setUpdatedAt(now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => { window.location.href = 'Painel Admin.html'; }, 1200);
    } catch (err) {
      console.warn('[edit-app] salvar:', err);
      setToast({ type: 'error', msg: 'Erro ao salvar. Tente novamente.' });
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const remaining = 6 - images.length;
    if (remaining <= 0) {
      setToast({ type: 'error', msg: 'Máximo de 6 fotos atingido.' });
      return;
    }
    const toUpload = files.slice(0, remaining);
    const oversized = toUpload.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setToast({ type: 'error', msg: `"${oversized.name}" excede 5 MB.` });
      return;
    }
    if (typeof STORAGE === 'undefined') {
      setToast({ type: 'error', msg: 'Serviço de Storage não disponível.' });
      return;
    }

    const storageId = productId || ('draft-' + Date.now());
    const baseSlot = images.length; // próximo índice 0-based → slot 1-based = baseSlot + i + 1
    setUploading(true);

    const newUrls = [];
    for (let i = 0; i < toUpload.length; i++) {
      const slot = baseSlot + i + 1;
      setUploadLabel(toUpload.length > 1
        ? `Enviando foto ${i + 1} de ${toUpload.length}…`
        : 'Enviando foto…');
      setUploadPct(0);
      try {
        const url = await STORAGE.uploadProductImage(toUpload[i], storageId, slot, pct => setUploadPct(pct));
        newUrls.push(url);
      } catch (err) {
        console.warn('[edit-app] upload foto:', err);
        setToast({ type: 'error', msg: `Erro ao enviar foto ${slot}. Tente novamente.` });
        break;
      }
    }

    if (newUrls.length > 0) {
      setImages(prev => [...prev, ...newUrls]);
      setToast({ type: 'ok', msg: newUrls.length === 1 ? 'Foto enviada!' : `${newUrls.length} fotos enviadas!` });
    }
    setUploading(false);
  };

  const curPrice = hasPromo ? promo : price;
  const mainCats = dbCats.filter(c => !c.parentId);
  const subCats  = dbCats.filter(c => c.parentId === category);

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="produtos" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar crumbs={[
          { label: 'Produtos', href: 'Painel Admin.html' },
          { label: 'Catálogo', href: 'Painel Admin.html' },
          { label: 'Editar Produto' },
        ]} />

        <main style={{ padding: 32, paddingBottom: 96 }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <a href="Painel Admin.html" className="btn-icon" style={{ height: 40, width: 40, marginTop: 2, background: '#fff', border: '1px solid var(--border-soft)' }}><IconArrowLeft size={18} /></a>
            <div style={{ flex: 1 }}>
              <h1 className="h-jakarta" style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#52170c', letterSpacing: '-.02em' }}>Editar Produto</h1>
              <div style={{ fontSize: 14, color: '#87726e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#54433f', fontWeight: 500 }}>{name}</span>
                {sku && <><span style={{ color: '#dac1bc' }}>·</span><span className="mono">#{sku}</span></>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="Painel Admin.html" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancelar</a>
              <button className="btn btn-primary" style={{ background: window.THEME.primary, minWidth: 160, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" /> Salvando...</> : <><IconSave size={16} /> Salvar alterações</>}
              </button>
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
            {/* LEFT */}
            <div>
              <Card title="Informações básicas">
                <Field label="Nome do produto" required error={errors.name}>
                  <TextInput value={name} onChange={v => { setName(v); if (errors.name) setErrors({ ...errors, name: undefined }); }} error={errors.name} placeholder="Ex: Queijo Canastra Meia Cura 400g" />
                </Field>
                <Field label="SKU / Código" hint={undefined}>
                  <div style={{ maxWidth: 240 }}><TextInput value={sku} onChange={setSku} placeholder="Ex: QJ-001" /></div>
                </Field>
                <Field label="Descrição curta" required error={errors.shortDesc} helper="Aparece nas listagens e cards do app">
                  <Textarea value={shortDesc} onChange={v => { setShortDesc(v); if (errors.shortDesc) setErrors({ ...errors, shortDesc: undefined }); }} rows={2} error={errors.shortDesc} />
                </Field>
                <Field label="Descrição completa">
                  <RichTextarea value={longDesc} onChange={setLongDesc} rows={5} />
                </Field>
              </Card>

              <Card title="Preço e estoque">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Preço normal" required error={errors.price}>
                    <TextInput value={price} onChange={v => { setPrice(v); if (errors.price) setErrors({ ...errors, price: undefined }); }} prefix="R$" error={errors.price} />
                  </Field>
                  <Field label="Preço promocional"
                    hint={undefined}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Toggle size="sm" value={hasPromo} onChange={setHasPromo} />
                      <span style={{ fontSize: 13, color: hasPromo ? '#2e7d32' : '#87726e', fontWeight: 600 }}>Em promoção</span>
                    </div>
                    {hasPromo && (
                      <div style={{ marginTop: 10 }}>
                        <TextInput value={promo} onChange={setPromo} prefix="R$" style={{ borderColor: '#2e7d32' }} />
                      </div>
                    )}
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Estoque atual" required>
                    <TextInput value={stock} onChange={setStock} suffix="un" />
                  </Field>
                  <Field label="Estoque mínimo (alerta)" helper="Alerta quando atingir este valor">
                    <TextInput value={minStock} onChange={setMinStock} suffix="un" />
                  </Field>
                </div>
                <Field label="Variações disponíveis" helper="Defina os tamanhos/pesos disponíveis e o preço de cada um">
                  {/* Tipo de variação */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    {[
                      { id: 'peso', label: '⚖️ Peso' },
                      { id: 'unidade', label: '📦 Unidade' },
                      { id: 'tamanho', label: '📐 Tamanho' },
                      { id: 'personalizado', label: '✏️ Personalizado' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setVarType(t.id)}
                        style={{ padding: '6px 14px', borderRadius: 999, border: '1.5px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                          borderColor: varType === t.id ? '#52170c' : 'var(--border)',
                          background: varType === t.id ? '#52170c' : '#fff',
                          color: varType === t.id ? '#fff' : '#54433f' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Lista de variações */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {variations.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-soft)', background: '#fff' }}>
                        <div style={{ flex: 1 }}>
                          <TextInput
                            value={v.label}
                            onChange={val => setVariations(vs => vs.map((x, j) => j === i ? { ...x, label: val } : x))}
                            placeholder={varType === 'peso' ? 'Ex: 350g' : varType === 'tamanho' ? 'Ex: Pequeno' : varType === 'unidade' ? 'Ex: 1 unidade' : 'Ex: Opção A'}
                          />
                        </div>
                        <div style={{ width: 140 }}>
                          <TextInput
                            value={v.price}
                            onChange={val => setVariations(vs => vs.map((x, j) => j === i ? { ...x, price: val } : x))}
                            prefix="R$"
                            placeholder="0,00"
                          />
                        </div>
                        <button onClick={() => setVariations(vs => vs.filter((_, j) => j !== i))}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#ffeaea', color: '#ba1a1a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Botão adicionar */}
                  <button onClick={() => setVariations(vs => [...vs, { label: '', price: '' }])}
                    style={{ marginTop: 10, width: '100%', height: 38, borderRadius: 8, border: '1.5px dashed var(--border)', background: '#faf7f3', color: window.THEME.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    + Adicionar variação
                  </button>
                </Field>
              </Card>

              <Card title="Embalagem e Frete">
                <div style={{ fontSize: 13, color: '#87726e', marginBottom: 14 }}>
                  Informe as medidas da embalagem com o produto dentro. Usadas para calcular o frete automaticamente no checkout.
                </div>
                <Field label="Peso (com embalagem)" required helper="Em quilogramas. Ex: 0.5 para 500g">
                  <TextInput
                    value={weight}
                    onChange={setWeight}
                    placeholder="0.00"
                    suffix="kg"
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Field label="Altura">
                    <TextInput value={weightHeight} onChange={setWeightHeight} placeholder="0" suffix="cm" />
                  </Field>
                  <Field label="Largura">
                    <TextInput value={weightWidth} onChange={setWeightWidth} placeholder="0" suffix="cm" />
                  </Field>
                  <Field label="Comprimento">
                    <TextInput value={weightLength} onChange={setWeightLength} placeholder="0" suffix="cm" />
                  </Field>
                </div>
              </Card>

              <Card title="Fotos do produto" sub="A primeira foto é a principal. Passe o mouse para remover.">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {/* DropZone — visível apenas quando há espaço e não está enviando */}
                {!uploading && images.length < 6 && (
                  <DropZone onAdd={() => fileInputRef.current && fileInputRef.current.click()} />
                )}

                {/* Barra de progresso durante upload */}
                {uploading && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', fontSize: 13, color: '#54433f', fontWeight: 600, marginBottom: 10 }}>
                      {uploadLabel} {uploadPct}%
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: '#f0ede9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: window.THEME.primary, width: uploadPct + '%', transition: 'width .2s ease' }} />
                    </div>
                  </div>
                )}

                {/* Grid de miniaturas */}
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {images.map((url, i) => (
                      <PhotoThumb
                        key={url + i}
                        url={url}
                        isMain={i === 0}
                        onRemove={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#87726e', marginTop: images.length > 0 ? 10 : 0 }}>
                  {images.length}/6 fotos · PNG, JPG, WebP até 5 MB cada · Proporção 1:1 recomendada
                </div>
              </Card>

              <Card title="Informações do produtor">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Nome do produtor"><TextInput value={producer} onChange={setProducer} /></Field>
                  <Field label="Localização"><TextInput value={location} onChange={setLocation} /></Field>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#faf7f3', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                  <Toggle value={verified} onChange={setVerified} />
                  <div style={{ flex: 1, fontSize: 14, color: '#1c1c1a', fontWeight: 500 }}>Produtor verificado</div>
                  {verified && (
                    <span className="badge badge-success"><IconShield size={13} stroke={2.2} /> Verificado</span>
                  )}
                </div>
              </Card>

              <Card title="SEO e busca">
                <Field label="Tags / palavras-chave" helper="Pressione Enter para adicionar. Ajuda os clientes a encontrar o produto.">
                  <TagChips tags={tags} onAdd={tg => setTags([...tags, tg])} onRemove={tg => setTags(tags.filter(x => x !== tg))} />
                </Field>
                <Field label="Meta descrição" hint="para mecanismos de busca">
                  <Textarea value={meta} onChange={setMeta} rows={2} maxLength={160} />
                </Field>
              </Card>
            </div>

            {/* RIGHT */}
            <div>
              <Card title="Status e publicação">
                <Field label="Status">
                  <Select value={status} options={['Ativo', 'Inativo', 'Esgotado']} onChange={setStatus}
                    renderValue={v => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[v].dot }} />{v}</span>} />
                </Field>
                <div style={{ marginTop: 4 }}>
                  <ToggleRow label="Visível na loja" sub="Produto aparece no app" value={visible} onChange={setVisible} />
                  <ToggleRow label="Destaque na Home" sub="Aparece na seção de destaques" value={featured} onChange={setFeatured} />
                  <ToggleRow label="Permite avaliações" sub="Clientes podem avaliar" value={allowReviews} onChange={setAllowReviews} last />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: window.THEME.primary }} onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner" /> Salvando...</> : <><IconSave size={16} /> Salvar alterações</>}
                  </button>
                  <a href="Painel Admin.html" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Cancelar</a>
                </div>
                <div style={{ fontSize: 12, color: '#87726e', marginTop: 14, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <IconHistory size={12} /> {updatedAt ? `Última atualização: ${updatedAt}` : 'Ainda não salvo'}
                </div>
              </Card>

              <Card title="Categoria">
                <Field label="Categoria">
                  <Select
                    value={category}
                    options={mainCats.map(c => c.id)}
                    onChange={v => { setCategory(v); setSubcategory(''); }}
                    renderValue={id => mainCats.find(c => c.id === id)?.name || (id ? id : 'Selecione uma categoria')}
                  />
                </Field>
                <Field label="Subcategoria">
                  {subCats.length > 0 ? (
                    <Select
                      value={subcategory}
                      options={subCats.map(c => c.id)}
                      onChange={setSubcategory}
                      renderValue={id => subCats.find(c => c.id === id)?.name || (id ? id : 'Selecione...')}
                    />
                  ) : (
                    <div style={{ fontSize: 13, color: '#87726e', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: '#faf7f3' }}>
                      {category ? 'Nenhuma subcategoria cadastrada para esta categoria' : 'Selecione uma categoria primeiro'}
                    </div>
                  )}
                </Field>
                <button style={{ fontSize: 13, fontWeight: 600, color: window.THEME.primary, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconPlus size={14} /> Criar nova categoria
                </button>
              </Card>

              <Card title="Resumo">
                {[
                  { l: 'Preço atual', el: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {hasPromo && <span style={{ color: '#87726e', textDecoration: 'line-through', fontSize: 13 }}>R$ {price}</span>}
                      <span className="num" style={{ color: '#2e7d32', fontSize: 15 }}>R$ {curPrice}</span>
                    </span>
                  ) },
                  { l: 'Estoque', el: <span className="num" style={{ color: parseInt(stock) > parseInt(minStock) ? '#2e7d32' : '#f57c00', fontSize: 14 }}>{stock} unidades</span> },
                  { l: 'Status', el: <span className={`badge ${STATUS_META[status].cls}`}><span className="badge-dot" style={{ background: STATUS_META[status].dot }} />{status}</span> },
                  { l: 'Fotos', el: <span className="num" style={{ color: images.length > 0 ? '#1c1c1a' : '#87726e', fontWeight: 700, fontSize: 14 }}>{images.length}/6</span> },
                  { l: 'Avaliação', el: <span style={{ color: '#f57c00', fontWeight: 700, fontSize: 14 }}>★ 4,9 <span style={{ color: '#87726e', fontWeight: 400, fontSize: 13 }}>(128)</span></span> },
                ].map((r, i, arr) => (
                  <div key={r.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px solid #f0ede9' }}>
                    <span style={{ fontSize: 13, color: '#87726e' }}>{r.l}</span>
                    {r.el}
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </main>

        {/* Sticky bar */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid var(--border-soft)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 -4px 16px rgba(82,23,12,0.06)', zIndex: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f57c00', animation: 'pulse 1.6s infinite' }} />
          <div style={{ fontSize: 13, color: '#54433f' }}>Você tem <span style={{ fontWeight: 700, color: '#1c1c1a' }}>alterações não salvas</span>.</div>
          <div style={{ flex: 1 }} />
          <a href="Painel Admin.html" className="btn btn-outline" style={{ textDecoration: 'none' }}>Descartar</a>
          <button className="btn btn-primary" style={{ background: window.THEME.primary, minWidth: 160, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Salvando...</> : <><IconSave size={16} /> Salvar alterações</>}
          </button>
        </div>
      </div>

      {toast && (
        <div className="toast" style={{ background: toast.type === 'error' ? '#ba1a1a' : '#1c1c1a' }}>
          {toast.type === 'error' ? <IconAlertTri size={16} color="#fff" /> : <IconCheck size={16} color="#7be288" stroke={3} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
