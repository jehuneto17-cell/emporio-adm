const { useState, useEffect } = React;

const BG_PRESETS = [
  { bg: '#52170c', bg2: window.THEME.primary },
  { bg: '#7a3a12', bg2: '#d8a360' },
  { bg: '#5b4a1f', bg2: '#a98a3c' },
  { bg: '#2e4d2e', bg2: '#6a9a4a' },
  { bg: '#3a2740', bg2: '#8a5fa8' },
  { bg: '#1c3a52', bg2: '#4a8ac0' },
];

// ─────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────
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
function FieldLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>{children}</div>;
}
function Note({ children }) {
  return <div style={{ fontSize: 12, color: '#87726e', marginTop: 6 }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────
// Banner preview (the way it appears in the app carousel)
// ─────────────────────────────────────────────────────────────────────────
function BannerPreview({ b, width = 392, height = 184 }) {
  return (
    <div style={{
      width, height, borderRadius: 16, overflow: 'hidden', position: 'relative', flexShrink: 0,
      background: `linear-gradient(115deg, ${b.bg} 0%, ${b.bg2} 100%)`,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
    }}>
      {!b.imageUrl && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 10px, rgba(0,0,0,0.04) 10px 20px)', opacity: 0.5 }} />}
      {!b.imageUrl && <div style={{ position: 'absolute', right: -34, top: -34, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />}
      {!b.imageUrl && <div style={{ position: 'absolute', right: 22, bottom: -40, width: 110, height: 110, borderRadius: '50%', background: 'rgba(0,0,0,0.10)' }} />}
      {b.imageUrl && (
        <img src={b.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1 }} />
      )}

      <div style={{ position: 'absolute', inset: 0, padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 9 }}>
        <span style={{
          alignSelf: 'flex-start', fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em',
          color: '#52170c', background: '#fcf9f5', padding: '5px 10px', borderRadius: 999,
          fontFamily: 'Plus Jakarta Sans', whiteSpace: 'nowrap',
        }}>{b.badge}</span>
        <div className="h-jakarta" style={{ color: '#fff7ec', fontSize: 20, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-.01em', maxWidth: 270, textWrap: 'balance' }}>
          {b.title}
        </div>
        <div style={{ color: 'rgba(255,247,236,0.86)', fontSize: 13, fontWeight: 500, maxWidth: 290 }}>
          {b.subtitle}
        </div>
      </div>

      {!b.imageUrl && (
        <div style={{ position: 'absolute', bottom: 12, left: 22, display: 'flex', gap: 5 }}>
          <span style={{ width: 16, height: 5, borderRadius: 999, background: '#fff' }} />
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.45)' }} />
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.45)' }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Banner card
// ─────────────────────────────────────────────────────────────────────────
function BannerCard({ b, onToggle, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="card card-hover" style={{ padding: 18, display: 'flex', gap: 22, alignItems: 'center', opacity: b.active ? 1 : 0.96 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#c0a59f', flexShrink: 0 }}>
        <span title="Arrastar para reordenar" style={{ cursor: 'grab', display: 'flex' }}><IconGrip size={18} color="#c0a59f" /></span>
        <div className="num" style={{ width: 30, height: 30, borderRadius: 9, background: '#f6f0ec', color: window.THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{b.order}</div>
      </div>

      <BannerPreview b={b} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge-cat">{b.badge}</span>
          <span className={`badge ${b.active ? 'badge-success' : 'badge-gray'}`}>
            <span className="badge-dot" style={{ background: b.active ? '#2e7d32' : '#87726e' }} />
            {b.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="h-jakarta" style={{ fontSize: 17, fontWeight: 700, color: '#52170c', letterSpacing: '-.01em' }}>{b.title}</div>
        <div style={{ fontSize: 13.5, color: '#87726e' }}>{b.subtitle}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 12.5, color: '#a08a85' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: `linear-gradient(135deg, ${b.bg}, ${b.bg2})` }} />
            {b.bg.toUpperCase()}
          </span>
          <span style={{ color: '#dac1bc' }}>•</span>
          <span>Posição {b.order} no carrossel</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexShrink: 0, alignSelf: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 12.5, color: '#87726e', fontWeight: 500 }}>{b.active ? 'Ativo' : 'Inativo'}</span>
          <Toggle on={b.active} onChange={() => onToggle(b.id)} />
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button className="btn btn-outline" style={{ height: 34, padding: '0 12px', fontSize: 13 }} onClick={() => onEdit(b)}><IconEdit size={14} /> Editar</button>
          <button className="btn btn-outline" style={{ height: 34, padding: '0 12px', fontSize: 13, color: '#ba1a1a', borderColor: '#f0c4c0' }} onClick={() => setConfirming(v => !v)}><IconTrash size={14} /> Excluir</button>
          {confirming && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: '#1c1c1a', color: '#fff', borderRadius: 10, padding: 12, width: 200, boxShadow: 'var(--shadow-pop)', zIndex: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Excluir este banner?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setConfirming(false); onDelete(b.id); }} style={{ flex: 1, height: 30, borderRadius: 7, background: '#ba1a1a', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Excluir</button>
                <button onClick={() => setConfirming(false)} style={{ flex: 1, height: 30, borderRadius: 7, background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Cancelar</button>
              </div>
              <div style={{ position: 'absolute', bottom: -5, right: 24, width: 10, height: 10, background: '#1c1c1a', transform: 'rotate(45deg)' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// New banner modal
// ─────────────────────────────────────────────────────────────────────────
function NewBannerModal({ onClose, onCreate, nextOrder, initial }) {
  const [badge, setBadge] = useState(initial?.badge || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle || '');
  const [preset, setPreset] = useState(() => {
    if (!initial?.bg) return 0;
    const i = BG_PRESETS.findIndex(p => p.bg === initial.bg);
    return i >= 0 ? i : 0;
  });
  const [custom, setCustom] = useState(initial?.bg && BG_PRESETS.findIndex(p => p.bg === initial.bg) < 0 ? { bg: initial.bg, bg2: initial.bg2 || initial.bg } : null);
  const [order, setOrder] = useState(String(initial?.order || nextOrder));
  const [active, setActive] = useState(initial?.active !== false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [uploading, setUploading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [productId, setProductId] = useState(initial?.productId || '');
  useEffect(function() {
    if (typeof DB === 'undefined') return;
    DB.getProdutos().then(setProdutos).catch(function() {});
  }, []);

  const chosen = custom || BG_PRESETS[preset];
  const live = { badge, title, subtitle, bg: chosen.bg, bg2: chosen.bg2, imageUrl };

  async function uploadImagem(e) {
    var file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    var fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'emporio-produtos');
    fd.append('folder', 'emporio-minas/banners');
    try {
      var res = await fetch('https://api.cloudinary.com/v1_1/dv62fwdtv/image/upload', { method: 'POST', body: fd });
      var data = await res.json();
      setImageUrl(data.secure_url || '');
    } catch(err) {
      console.warn('[upload]', err);
    }
    setUploading(false);
  }

  function handleSave() {
    if (!title.trim() && !imageUrl) { setErro('Preencha o título ou adicione uma imagem'); return; }
    setErro('');
    setSaving(true);
    onCreate({ badge, title, subtitle, bg: chosen.bg, bg2: chosen.bg2, order: Number(order) || nextOrder, active, imageUrl: imageUrl || '', productId: productId || '' });
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,8,0.42)', zIndex: 80, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px', overflowY: 'auto' }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: 560, padding: 0, animation: 'slideIn .22s ease', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center' }}>
          <div className="h-jakarta" style={{ flex: 1, fontSize: 18, fontWeight: 700, color: '#52170c' }}>
            {initial ? 'Editar banner' : 'Novo banner do carrossel'}
          </div>
          <button className="btn-icon" onClick={onClose}><IconX size={18} /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <FieldLabel>Pré-visualização</FieldLabel>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16, background: '#faf7f3', borderRadius: 14, border: '1px solid var(--border-soft)' }}>
              <BannerPreview b={live} width={420} height={188} />
            </div>
          </div>

          <div>
            <FieldLabel>Badge</FieldLabel>
            <input className="input" value={badge} onChange={e => setBadge(e.target.value.toUpperCase())} placeholder="Ex: DESTAQUE DA SEMANA" style={{ width: '100%' }} />
            <Note>Etiqueta curta exibida no topo do banner</Note>
          </div>

          <div>
            <FieldLabel>Título</FieldLabel>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Queijos artesanais da serra" style={{ width: '100%' }} />
          </div>

          <div>
            <FieldLabel>Subtítulo</FieldLabel>
            <input className="input" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ex: Frete grátis acima de R$ 150" style={{ width: '100%' }} />
          </div>

          <div>
            <FieldLabel>Produto vinculado <span style={{ fontSize: 11, color: '#87726e', fontWeight: 400 }}>(opcional)</span></FieldLabel>
            <select
              className="input"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Nenhum — banner institucional</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.sku ? ' · #' + p.sku : ''}</option>
              ))}
            </select>
            <Note>Ao clicar no banner, o cliente é levado direto para este produto</Note>
          </div>

          <div>
            <FieldLabel>Imagem do banner (opcional)</FieldLabel>
            <div style={{ fontSize: 12, color: '#87726e', marginBottom: 10, padding: '8px 12px', background: '#faf7f3', borderRadius: 8, border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconPhoto size={14} color={window.THEME.primary} />
              <span>Tamanho recomendado: <strong>1170 × 550 px</strong> — proporção 3:1, JPG ou PNG</span>
            </div>
            {imageUrl ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                <img src={imageUrl} alt="Banner" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setImageUrl('')} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 6, color: '#fff', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Remover</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 0', borderRadius: 10, border: '1.5px dashed var(--border)', background: '#faf7f3', cursor: uploading ? 'wait' : 'pointer' }}>
                {uploading
                  ? <span style={{ fontSize: 13, color: window.THEME.primary, fontWeight: 600 }}>Enviando...</span>
                  : <>
                      <IconPhoto size={28} color="#d8a360" />
                      <span style={{ fontSize: 13, color: '#87726e' }}>Clique para enviar uma imagem</span>
                      <span style={{ fontSize: 11.5, color: '#b0a09c' }}>JPG, PNG — máx. 5 MB</span>
                    </>
                }
                <input type="file" accept="image/*" onChange={uploadImagem} style={{ display: 'none' }} disabled={uploading} />
              </label>
            )}
          </div>

          <div>
            <FieldLabel>Cor de fundo <span style={{ color: '#ba1a1a' }}>*</span></FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {BG_PRESETS.map((p, i) => (
                <button key={i} onClick={() => { setCustom(null); setPreset(i); }} title={p.bg} style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${p.bg}, ${p.bg2})`,
                  boxShadow: (!custom && preset === i) ? `0 0 0 2px #fff, 0 0 0 4px ${window.THEME.primary}` : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                  transition: 'box-shadow .14s',
                }} />
              ))}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 4, cursor: 'pointer', padding: 2, borderRadius: 12, boxShadow: custom ? `0 0 0 2px #fff, 0 0 0 4px ${window.THEME.primary}` : 'none' }}>
                <input type="color" value={chosen.bg}
                  onChange={e => { const v = e.target.value; setCustom({ bg: v, bg2: chosen.bg2 }); }}
                  style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)', background: '#fff', padding: 2, cursor: 'pointer' }} />
                <span style={{ fontSize: 12.5, color: '#87726e' }}>Cor personalizada</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 140 }}>
              <FieldLabel>Ordem</FieldLabel>
              <input className="input num" type="number" min="1" value={order} onChange={e => setOrder(e.target.value)} style={{ width: '100%' }} />
              <Note>Posição no carrossel</Note>
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Status</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 14px', background: '#faf7f3', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <Toggle on={active} onChange={setActive} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1a' }}>{active ? 'Ativo no carrossel' : 'Inativo'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 12 }}>
          {erro && <div style={{ color: '#ba1a1a', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{erro}</div>}
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? 'Salvando…' : 'Salvar banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  React.useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2400); return () => clearTimeout(id); }, [toast]);

  function loadBanners() {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    return DB.getBanners()
      .then(function(data) { setBanners(data); setLoading(false); })
      .catch(function(err) { console.warn('[banners]', err); setLoading(false); });
  }

  useEffect(function() { loadBanners(); }, []);

  const toggle = (id) => {
    var banner = banners.find(function(b) { return b.id === id; });
    if (!banner) return;
    var newActive = !banner.active;
    DB.updateBanner(id, { active: newActive })
      .then(loadBanners)
      .catch(function(e) { setToast('Erro ao atualizar banner'); });
  };

  const remove = (id) => {
    DB.deleteBanner(id)
      .then(function() { setToast('Banner excluído'); return loadBanners(); })
      .catch(function(e) { setToast('Erro ao excluir banner'); });
  };

  const create = (data) => {
    DB.addBanner(data)
      .then(function() {
        setShowModal(false);
        setToast('Banner "' + data.title + '" salvo com sucesso');
        return loadBanners();
      })
      .catch(function(e) { setToast('Erro ao salvar banner'); });
  };

  const [userInitials, setUserInitials] = React.useState('AD');
  React.useEffect(function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var parts = user.displayName ? user.displayName.split(' ') : user.email.split('@')[0].split(/[._-]/);
        setUserInitials(parts.slice(0, 2).map(function(p) { return p[0]; }).join('').toUpperCase() || 'AD');
      }
    });
  }, []);

  const activeCount = banners.filter(b => b.active).length;

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="banners" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ color: '#87726e', fontWeight: 500 }}>Banners</span>
            <span style={{ color: '#dac1bc' }}>/</span>
            <span className="h-jakarta" style={{ color: '#52170c', fontWeight: 700, fontSize: 15 }}>Carrossel</span>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-icon" style={{ height: 40, width: 40 }}><IconBell size={20} /></button>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,#52170c,${window.THEME.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13, boxShadow: 'inset 0 0 0 2px #fff', outline: '1px solid var(--border)' }}>{userInitials}</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus size={16} /> Novo Banner</button>
        </header>

        <main style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <h2 className="h-jakarta" style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#52170c', letterSpacing: '-.02em' }}>Banners do carrossel</h2>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#87726e' }}>
                Gerencie os banners exibidos na Home do app. <span style={{ color: '#54433f', fontWeight: 600 }}>{activeCount} de {banners.length}</span> ativos no momento.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#87726e', background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 12px' }}>
              <IconLayers size={15} color={window.THEME.primary} /> Arraste para reordenar
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: window.THEME.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : banners.length === 0 ? (
            <div className="card" style={{ padding: 60, textAlign: 'center', color: '#87726e' }}>
              <IconPhoto size={40} color="#dac1bc" />
              <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c', margin: '16px 0 8px' }}>Nenhum banner cadastrado</div>
              <div style={{ fontSize: 14, marginBottom: 24 }}>Crie o primeiro banner do carrossel da Home do app.</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus size={16} /> Novo Banner</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {banners.map(b => <BannerCard key={b.id} b={b} onToggle={toggle} onDelete={remove} onEdit={setEditing} />)}
            </div>
          )}

          {!loading && (
            <button onClick={() => setShowModal(true)} style={{
              width: '100%', marginTop: 16, padding: '22px 0', borderRadius: 16,
              border: '1.5px dashed var(--border)', background: 'transparent', color: window.THEME.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 14, fontWeight: 600, transition: 'all .15s',
            }} onMouseEnter={e => { e.currentTarget.style.background = '#fff8f4'; e.currentTarget.style.borderColor = window.THEME.primary; }}
               onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <IconPlus size={18} /> Adicionar novo banner
            </button>
          )}
        </main>
      </div>

      {showModal && <NewBannerModal onClose={() => setShowModal(false)} onCreate={create} nextOrder={banners.length + 1} />}
      {editing && <NewBannerModal
        onClose={() => setEditing(null)}
        onCreate={(data) => {
          DB.updateBanner(editing.id, data)
            .then(() => { setEditing(null); setToast('Banner atualizado!'); return loadBanners(); })
            .catch(() => setToast('Erro ao atualizar banner'));
        }}
        nextOrder={banners.length + 1}
        initial={editing}
      />}

      {toast && (
        <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toast}</span></div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
