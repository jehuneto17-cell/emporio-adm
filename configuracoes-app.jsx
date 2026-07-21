const { useState, useEffect } = React;

// ─────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────
function SettingsCard({ title, sub, danger, children, footer }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 22, ...(danger ? { background: '#fff5f5', borderColor: '#fbdedc' } : {}) }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${danger ? '#fbdedc' : '#f0ede9'}` }}>
        <div className="h-jakarta" style={{ fontSize: 16, fontWeight: 700, color: danger ? '#ba1a1a' : '#52170c' }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: '#87726e', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
      {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ede9', display: 'flex', justifyContent: 'flex-end' }}>{footer}</div>}
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 7 }}>
        {label}{required && <span style={{ color: '#ba1a1a' }}> *</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, prefixIcon: Pi, iconColor, ...rest }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      {Pi && <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><Pi size={17} color={iconColor || '#87726e'} /></div>}
      <input className="input" value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', paddingLeft: Pi ? 38 : 12, borderColor: focus ? '#52170c' : 'var(--border)', boxShadow: focus ? '0 0 0 3px rgba(82,23,12,0.10)' : 'none', ...rest.style }} />
    </div>
  );
}

function Toggle({ on, onChange, size = 'md' }) {
  const w = size === 'sm' ? 38 : 44, h = size === 'sm' ? 22 : 26, k = h - 6;
  return (
    <button onClick={() => onChange(!on)} style={{ width: w, height: h, borderRadius: 999, background: on ? '#2e7d32' : '#d8ccc7', position: 'relative', transition: 'background .18s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? w - k - 3 : 3, width: k, height: k, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function SaveBtn({ label, onSave, accent }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const go = async () => {
    setSaving(true);
    try {
      await onSave?.();
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch (_) {}
    finally { setSaving(false); }
  };
  return (
    <button className="btn btn-primary" onClick={go} disabled={saving} style={{ background: done ? '#2e7d32' : accent }}>
      {saving ? <><span className="spinner" /> Salvando...</> : done ? <><IconCheck size={16} stroke={3} /> Salvo!</> : <><IconSave size={16} /> {label}</>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Internal nav
// ─────────────────────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { id: 'loja', icon: IconStore, label: 'Dados da loja' },
  { id: 'frete', icon: IconTruck, label: 'Frete e entrega' },
  { id: 'pagamento', icon: IconCard, label: 'Formas de pagamento' },
  { id: 'notificacoes', icon: IconBell, label: 'Notificações' },
  { id: 'seguranca', icon: IconLock, label: 'Segurança' },
  { id: 'integracoes', icon: IconPlug, label: 'Integrações' },
];

const DAYS = [
  { d: 'Segunda-feira', on: true, open: '08:00', close: '18:00' },
  { d: 'Terça-feira',   on: true, open: '08:00', close: '18:00' },
  { d: 'Quarta-feira',  on: true, open: '08:00', close: '18:00' },
  { d: 'Quinta-feira',  on: true, open: '08:00', close: '18:00' },
  { d: 'Sexta-feira',   on: true, open: '08:00', close: '18:00' },
  { d: 'Sábado',        on: true, open: '09:00', close: '14:00' },
  { d: 'Domingo',       on: false, open: '09:00', close: '13:00' },
];

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 };

// ─────────────────────────────────────────────────────────────────────────
// Time input
// ─────────────────────────────────────────────────────────────────────────
function TimeInput({ value, onChange }) {
  return <input className="input num" type="time" value={value} onChange={e => onChange(e.target.value)} style={{ width: 116 }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// Dados da loja tab
// ─────────────────────────────────────────────────────────────────────────
function LojaTab({ accent, toast, saveAllRef }) {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [desc, setDesc] = useState('');
  const [cep, setCep] = useState('');
  const [cepFound, setCepFound] = useState(false);
  const [addr, setAddr] = useState({ rua: '', num: '', comp: '', bairro: '', cidade: '', estado: '' });
  const [days, setDays] = useState(DAYS);
  const [maint, setMaint] = useState(false);
  const [social, setSocial] = useState({ ig: '', fb: '', wa: '', site: '' });
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  const UF_MAP = {
    MG: 'MG — Minas Gerais', SP: 'SP — São Paulo', RJ: 'RJ — Rio de Janeiro',
    ES: 'ES — Espírito Santo', GO: 'GO — Goiás', BA: 'BA — Bahia',
  };

  // Carrega configurações salvas do Firestore
  React.useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getConfiguracoes().then(function(cfg) {
      if (!cfg || Object.keys(cfg).length === 0) return;
      if (cfg.nome)     setNome(cfg.nome);
      if (cfg.cnpj)     setCnpj(cfg.cnpj);
      if (cfg.email)    setEmail(cfg.email);
      if (cfg.whatsapp) setWhatsapp(cfg.whatsapp);
      if (cfg.desc)     setDesc(cfg.desc);
      if (cfg.cep)      { setCep(cfg.cep); setCepFound(true); }
      if (cfg.addr)     setAddr(cfg.addr);
      if (cfg.days)     setDays(cfg.days);
      if (cfg.maint != null) setMaint(cfg.maint);
      if (cfg.social)   setSocial(cfg.social);
      if (cfg.logoUrl)  setLogoUrl(cfg.logoUrl);
    }).catch(console.warn);
  }, []);

  const buscarCep = async () => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) { toast('CEP inválido — informe 8 dígitos.'); return; }
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const json = await res.json();
      if (json.erro) { toast('CEP não encontrado.'); return; }
      setAddr(prev => ({
        ...prev,
        rua:    json.logradouro || prev.rua,
        bairro: json.bairro     || prev.bairro,
        cidade: json.localidade || prev.cidade,
        estado: UF_MAP[json.uf] || prev.estado,
      }));
      setCepFound(true);
      toast('Endereço preenchido pelo CEP');
    } catch (_) {
      toast('Erro ao buscar CEP. Tente novamente.');
    }
  };
  const setDay = (i, patch) => setDays(p => p.map((d, j) => j === i ? { ...d, ...patch } : d));

  const saveBasicos = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); throw new Error(); }
    try { await DB.saveConfiguracoes({ nome, cnpj, email, whatsapp, desc }); toast('Informações básicas salvas'); }
    catch (e) { toast('Erro ao salvar. Tente novamente.'); throw e; }
  };
  const saveEndereco = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); throw new Error(); }
    try { await DB.saveConfiguracoes({ cep, addr }); toast('Endereço salvo'); }
    catch (e) { toast('Erro ao salvar endereço. Tente novamente.'); throw e; }
  };
  const saveSocial = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); throw new Error(); }
    try { await DB.saveConfiguracoes({ social }); toast('Redes sociais salvas'); }
    catch (e) { toast('Erro ao salvar. Tente novamente.'); throw e; }
  };
  const saveHorarios = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); throw new Error(); }
    try { await DB.saveConfiguracoes({ days }); toast('Horários salvos'); }
    catch (e) { toast('Erro ao salvar horários. Tente novamente.'); throw e; }
  };
  const saveTudo = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); throw new Error(); }
    try {
      await DB.saveConfiguracoes({ nome, cnpj, email, whatsapp, desc, cep, addr, days, maint, social, logoUrl });
      toast('Todas as alterações foram salvas');
    } catch (e) { toast('Erro ao salvar. Tente novamente.'); throw e; }
  };
  React.useEffect(() => {
    if (!saveAllRef) return;
    saveAllRef.current = saveTudo;
    return () => { saveAllRef.current = null; };
  });

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (typeof STORAGE === 'undefined' || typeof DB === 'undefined') { toast('Upload não disponível.'); return; }
    setLogoUploading(true);
    try {
      const url = await STORAGE.uploadProductImage(file, 'loja', 'logo');
      await DB.setConfiguracao('loja', { logoUrl: url });
      setLogoUrl(url);
      toast('Logo atualizada');
    } catch (err) {
      toast('Erro ao enviar logo. Tente novamente.');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const removeLogo = async () => {
    if (typeof DB === 'undefined') { toast('Firestore não disponível.'); return; }
    setLogoUploading(true);
    try {
      await DB.setConfiguracao('loja', { logoUrl: '' });
      setLogoUrl('');
      toast('Logo removida');
    } catch (err) {
      toast('Erro ao remover logo. Tente novamente.');
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div>
      {/* Logo & identity */}
      <SettingsCard title="Logo da loja">
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 120, height: 120, borderRadius: 16, background: logoUrl ? '#fff' : `linear-gradient(135deg,#52170c,${window.THEME.primary})`, border: logoUrl ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(82,23,12,0.28)', overflow: 'hidden' }}>
              {logoUrl
                ? <img src={logoUrl} alt="Logo da loja" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span className="h-jakarta" style={{ fontSize: 64, fontWeight: 800, color: '#d8a360', lineHeight: 1 }}>e</span>}
            </div>
            {logoUrl
              ? <span className="badge badge-success"><IconCheck size={13} stroke={3} /> Logo ativa</span>
              : <span className="badge badge-gray">Logo padrão</span>}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <label className="btn btn-outline" style={{ color: accent, borderColor: '#e7c9b3', cursor: logoUploading ? 'default' : 'pointer', opacity: logoUploading ? 0.6 : 1 }}>
                {logoUploading ? <><span className="spinner" /> Enviando...</> : <><IconCamera size={16} /> Alterar logo</>}
                <input type="file" accept="image/*" onChange={uploadLogo} disabled={logoUploading} style={{ display: 'none' }} />
              </label>
              <button className="btn btn-outline" onClick={removeLogo} disabled={logoUploading || !logoUrl}><IconTrash size={16} /> Remover</button>
            </div>
            <div style={{ fontSize: 13, color: '#87726e', lineHeight: 1.7 }}>
              <div>PNG ou JPG · Mínimo 200×200px · Máx 2MB</div>
              <div>Aparece na sidebar do painel e no app da loja</div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Basic info */}
      <SettingsCard title="Dados da loja" footer={<SaveBtn label="Salvar informações básicas" accent={accent} onSave={saveBasicos} />}>
        <div style={{ ...grid2, marginBottom: 18 }}>
          <Field label="Nome da loja" required><TextInput value={nome} onChange={setNome} placeholder="Nome da loja" /></Field>
          <Field label="CNPJ"><TextInput value={cnpj} onChange={setCnpj} placeholder="00.000.000/0001-00" /></Field>
          <Field label="E-mail de contato" required><TextInput value={email} onChange={setEmail} placeholder="email@loja.com" prefixIcon={IconMail} /></Field>
          <Field label="WhatsApp / Telefone"><TextInput value={whatsapp} onChange={setWhatsapp} placeholder="(35) 99000-0000" /></Field>
        </div>
        <Field label="Descrição da loja" full>
          <textarea className="input" rows={3} value={desc} maxLength={500} onChange={e => setDesc(e.target.value)}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'Work Sans', lineHeight: 1.55 }} />
          <div style={{ textAlign: 'right', fontSize: 12, color: '#87726e', marginTop: 6 }}>{desc.length}/500 caracteres</div>
        </Field>
      </SettingsCard>

      {/* Address */}
      <SettingsCard title="Endereço" footer={<SaveBtn label="Salvar endereço" accent={accent} onSave={saveEndereco} />}>
        <div style={{ marginBottom: 18 }}>
          <Field label="CEP">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TextInput value={cep} onChange={setCep} style={{ width: 160 }} />
              <button className="btn btn-outline" onClick={buscarCep}><IconSearch size={15} /> Buscar CEP</button>
              {cepFound && <span className="badge badge-success"><IconCheck size={13} stroke={3} /> Endereço encontrado</span>}
            </div>
          </Field>
        </div>
        <div style={{ ...grid2, marginBottom: 18 }}>
          <Field label="Rua / Avenida" required><TextInput value={addr.rua} onChange={v => setAddr({ ...addr, rua: v })} /></Field>
          <Field label="Número" required><TextInput value={addr.num} onChange={v => setAddr({ ...addr, num: v })} /></Field>
          <Field label="Complemento"><TextInput value={addr.comp} onChange={v => setAddr({ ...addr, comp: v })} /></Field>
          <Field label="Bairro" required><TextInput value={addr.bairro} onChange={v => setAddr({ ...addr, bairro: v })} /></Field>
        </div>
        <div style={grid2}>
          <Field label="Cidade" required><TextInput value={addr.cidade} onChange={v => setAddr({ ...addr, cidade: v })} /></Field>
          <Field label="Estado" required>
            <Dropdown value={addr.estado} options={['MG — Minas Gerais', 'SP — São Paulo', 'RJ — Rio de Janeiro', 'ES — Espírito Santo', 'GO — Goiás', 'BA — Bahia']} onChange={v => setAddr({ ...addr, estado: v })} minWidth={240} />
          </Field>
        </div>
      </SettingsCard>

      {/* Social */}
      <SettingsCard title="Presença online" footer={<SaveBtn label="Salvar redes sociais" accent={accent} onSave={saveSocial} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['ig', IconInstagram, '#e1306c', 'Instagram', '@emporiocoisasdeminas'],
            ['fb', IconFacebook, '#1877f2', 'Facebook', 'facebook.com/suapagina'],
            ['wa', IconWhatsapp, '#25d366', 'WhatsApp Business', '(35) 99000-0000'],
            ['site', IconGlobe, window.THEME.primary, 'Site / Link externo', 'www.seusite.com.br'],
          ].map(([key, Ic, color, label, ph]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic size={20} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#54433f', marginBottom: 5 }}>{label}</div>
                <TextInput value={social[key]} onChange={v => setSocial({ ...social, [key]: v })} placeholder={ph} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: '#87726e', marginTop: 16 }}>Links aparecem no rodapé do app da loja</div>
      </SettingsCard>

      {/* Hours */}
      <SettingsCard title="Horários de atendimento" sub="Exibidos no perfil da loja no app"
        footer={<SaveBtn label="Salvar horários" accent={accent} onSave={saveHorarios} />}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {days.map((day, i) => (
            <div key={day.d} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < days.length - 1 ? '1px solid #f0ede9' : 'none', opacity: day.on ? 1 : 0.6 }}>
              <Toggle on={day.on} onChange={v => setDay(i, { on: v })} size="sm" />
              <span style={{ fontSize: 14, fontWeight: 600, color: day.on ? '#1c1c1a' : '#87726e', width: 130 }}>{day.d}</span>
              {day.on ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TimeInput value={day.open} onChange={v => setDay(i, { open: v })} />
                  <IconChevronRight size={16} color="#87726e" />
                  <TimeInput value={day.close} onChange={v => setDay(i, { close: v })} />
                </div>
              ) : (
                <span style={{ fontSize: 14, color: '#87726e', fontStyle: 'italic' }}>Fechado</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: '#87726e', marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconHistory size={14} color="#87726e" /> Horário de Brasília (GMT-3)
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard title="Ações críticas" danger>
        {maint && (
          <div style={{ background: '#fdecd6', border: '1px solid #f5d9b0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#8a4a00', fontSize: 13.5, fontWeight: 600 }}>
            <IconAlertTri size={17} color="#f57c00" /> Loja em manutenção para clientes
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1c1c1a' }}>Modo manutenção</div>
            <div style={{ fontSize: 13, color: '#87726e', marginTop: 2 }}>Exibe aviso de manutenção no app para os clientes</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: maint ? '#2e7d32' : '#87726e' }}>{maint ? 'Ativado' : 'Desativado'}</span>
            <Toggle on={maint} onChange={setMaint} />
          </div>
        </div>
        <div style={{ borderTop: '1px solid #fbdedc', margin: '20px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1c1c1a' }}>Exportar todos os dados</div>
            <div style={{ fontSize: 13, color: '#87726e', marginTop: 2 }}>Baixar backup completo de produtos, pedidos e clientes em CSV</div>
          </div>
          <button className="btn btn-outline" onClick={() => toast('Backup sendo gerado...')}><IconDownload size={16} /> Exportar backup</button>
        </div>
      </SettingsCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Frete e entrega tab
// ─────────────────────────────────────────────────────────────────────────
function FreteTab({ accent, toast }) {
  const [remetente, setRemetente] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'MG',
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepOrigem] = useState('37900-900');

  React.useEffect(() => {
    if (typeof DB === 'undefined') return;
    DB.getConfiguracoes().then(function(cfg) {
      if (cfg?.remetente) setRemetente(r => ({ ...r, ...cfg.remetente }));
    }).catch(console.warn);
  }, []);

  function formatCPF(v) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatPhone(v) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  function formatCEP(v) {
    return v.replace(/\D/g, '').slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  async function buscarCep() {
    const cleaned = remetente.cep.replace(/\D/g, '');
    if (cleaned.length !== 8) { toast('CEP inválido — informe 8 dígitos.'); return; }
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const json = await res.json();
      if (json.erro) { toast('CEP não encontrado.'); return; }
      setRemetente(r => ({
        ...r,
        rua:    json.logradouro || r.rua,
        bairro: json.bairro     || r.bairro,
        cidade: json.localidade || r.cidade,
        estado: json.uf         || r.estado,
      }));
      toast('Endereço preenchido pelo CEP');
    } catch (e) {
      toast('Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  }

  async function saveRemetente() {
    if (!remetente.nome || !remetente.cpf || !remetente.cep) {
      toast('Preencha nome, CPF e CEP do remetente.');
      throw new Error('campos obrigatórios');
    }
    await DB.setConfiguracao('remetente', remetente);
    toast('Dados do remetente salvos!');
  }

  return (
    <div>
      <SettingsCard
        title="📦 Dados do Remetente"
        sub="Informações que aparecerão nas etiquetas de envio geradas automaticamente pelo Melhor Envio"
        footer={<SaveBtn label="Salvar dados do remetente" accent={accent} onSave={saveRemetente} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nome completo" required>
              <TextInput value={remetente.nome} onChange={v => setRemetente(r => ({ ...r, nome: v }))} placeholder="Nome do remetente" />
            </Field>
            <Field label="CPF" required>
              <TextInput value={remetente.cpf} onChange={v => setRemetente(r => ({ ...r, cpf: formatCPF(v) }))} placeholder="000.000.000-00" />
            </Field>
            <Field label="E-mail">
              <TextInput value={remetente.email} onChange={v => setRemetente(r => ({ ...r, email: v }))} placeholder="seu@email.com" />
            </Field>
            <Field label="Telefone / WhatsApp">
              <TextInput value={remetente.telefone} onChange={v => setRemetente(r => ({ ...r, telefone: formatPhone(v) }))} placeholder="(35) 99999-9999" />
            </Field>
          </div>

          <div style={{ borderTop: '1px solid #f0ede9', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#54433f', marginBottom: 12 }}>Endereço de coleta</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 14 }}>
              <Field label="CEP de origem" required>
                <TextInput value={remetente.cep} onChange={v => setRemetente(r => ({ ...r, cep: formatCEP(v) }))} placeholder="37975-000" />
              </Field>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-outline" onClick={buscarCep} disabled={cepLoading} style={{ height: 40, marginTop: 22 }}>
                  {cepLoading ? '...' : '🔍 Buscar CEP'}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14, marginBottom: 14 }}>
              <Field label="Rua / Logradouro" required>
                <TextInput value={remetente.rua} onChange={v => setRemetente(r => ({ ...r, rua: v }))} placeholder="Nome da rua" />
              </Field>
              <Field label="Número" required>
                <TextInput value={remetente.numero} onChange={v => setRemetente(r => ({ ...r, numero: v }))} placeholder="Nº" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="Complemento">
                <TextInput value={remetente.complemento} onChange={v => setRemetente(r => ({ ...r, complemento: v }))} placeholder="Apto, sala, bloco..." />
              </Field>
              <Field label="Bairro" required>
                <TextInput value={remetente.bairro} onChange={v => setRemetente(r => ({ ...r, bairro: v }))} placeholder="Seu bairro" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 14 }}>
              <Field label="Cidade" required>
                <TextInput value={remetente.cidade} onChange={v => setRemetente(r => ({ ...r, cidade: v }))} placeholder="Sua cidade" />
              </Field>
              <Field label="Estado" required>
                <TextInput value={remetente.estado} onChange={v => setRemetente(r => ({ ...r, estado: v }))} placeholder="MG" />
              </Field>
            </div>
          </div>

          <div style={{ background: '#fef3e2', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: '#7a4a00' }}>
              <strong>CEP de origem para cálculo de frete:</strong> {cepOrigem}<br />
              Esses dados serão usados automaticamente ao gerar etiquetas pelo Melhor Envio quando um pedido for confirmado.
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Formas de pagamento
// ─────────────────────────────────────────────────────────────────────────
function PagamentoTab({ accent, toast }) {
  const [taxaCredito, setTaxaCredito] = useState(3.0);
  const [taxaDebito, setTaxaDebito] = useState(1.5);
  const [pixAtivo, setPixAtivo] = useState(true);
  const [cartaoAtivo, setCartaoAtivo] = useState(true);
  const [boletoAtivo, setBoletoAtivo] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    function tryLoad() {
      if (typeof DB === 'undefined' || typeof firebase === 'undefined') {
        setTimeout(tryLoad, 300);
        return;
      }
      DB.getConfiguracoes().then(function(cfg) {
        console.log('[PagamentoTab] cfg carregado:', JSON.stringify(cfg));
        if (cfg && cfg.pagamento) {
          var p = cfg.pagamento;
          setTaxaCredito(p.taxaCredito != null ? p.taxaCredito : 3.0);
          setTaxaDebito(p.taxaDebito != null ? p.taxaDebito : 1.5);
          setPixAtivo(p.pixAtivo != null ? p.pixAtivo : true);
          setCartaoAtivo(p.cartaoAtivo != null ? p.cartaoAtivo : true);
          setBoletoAtivo(p.boletoAtivo != null ? p.boletoAtivo : false);
        }
      }).catch(function(e) {
        console.warn('[PagamentoTab] erro:', e);
      }).finally(function() {
        setLoading(false);
      });
    }
    tryLoad();
  }, []);

  async function savePagamento() {
    await DB.setConfiguracao('pagamento', {
      taxaCredito: parseFloat(taxaCredito) || 0,
      taxaDebito: parseFloat(taxaDebito) || 0,
      pixAtivo,
      cartaoAtivo,
      boletoAtivo,
    });
    toast('Configurações de pagamento salvas!');
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>;

  return (
    <div>
      <SettingsCard
        title="💳 Acréscimo por Forma de Pagamento"
        sub="Repasse a taxa das operadoras ao cliente. O valor é adicionado automaticamente ao total no checkout."
        footer={<SaveBtn label="Salvar configurações" accent={accent} onSave={savePagamento} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* PIX */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#f6f3ef', borderRadius: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#1976d2', fontWeight: 800, fontSize: 13 }}>PIX</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1a' }}>PIX</div>
              <div style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600, marginTop: 2 }}>Sem acréscimo — incentiva pagamento instantâneo</div>
            </div>
            <Toggle on={pixAtivo} onChange={setPixAtivo} />
          </div>

          {/* Cartão de Crédito */}
          <div style={{ padding: '16px', background: '#f6f3ef', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: cartaoAtivo ? 16 : 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#2e7d32', fontWeight: 800, fontSize: 11 }}>CC</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1a' }}>Cartão de Crédito</div>
                <div style={{ fontSize: 13, color: '#87726e', marginTop: 2 }}>
                  {cartaoAtivo ? `Acréscimo de ${taxaCredito}% aplicado no checkout` : 'Desabilitado'}
                </div>
              </div>
              <Toggle on={cartaoAtivo} onChange={setCartaoAtivo} />
            </div>
            {cartaoAtivo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#54433f', fontWeight: 600 }}>Taxa de acréscimo:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    className="input num"
                    value={taxaCredito}
                    onChange={e => setTaxaCredito(e.target.value)}
                    min="0" max="20" step="0.1"
                    style={{ width: 80, textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#54433f' }}>%</span>
                </div>
                <div style={{ fontSize: 12, color: '#87726e' }}>
                  Ex: produto R$ 100 → cliente paga R$ {(100 * (1 + parseFloat(taxaCredito || 0) / 100)).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Boleto */}
          <div style={{ padding: '16px', background: '#f6f3ef', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#f57c00', fontWeight: 800, fontSize: 10 }}>BOL</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1c1a' }}>Boleto Bancário</div>
                <div style={{ fontSize: 13, color: '#87726e', marginTop: 2 }}>
                  {boletoAtivo ? 'Habilitado — sem acréscimo' : 'Desabilitado'}
                </div>
              </div>
              <Toggle on={boletoAtivo} onChange={setBoletoAtivo} />
            </div>
          </div>

          {/* Info */}
          <div style={{ background: '#fef3e2', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: '#7a4a00' }}>
              O acréscimo é informado ao cliente no checkout com uma mensagem explicativa.
              O valor total já inclui o acréscimo antes da confirmação do pedido.
              <br /><br />
              <strong>Legislação:</strong> O Código de Defesa do Consumidor permite cobrar acréscimo
              por forma de pagamento, desde que o cliente seja informado antes da compra.
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Placeholder for other tabs
// ─────────────────────────────────────────────────────────────────────────
function Placeholder({ icon: Ic, label }) {
  return (
    <div className="card" style={{ padding: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#faf7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ic size={30} color={window.THEME.primary} />
      </div>
      <div>
        <div className="h-jakarta" style={{ fontSize: 18, fontWeight: 700, color: '#52170c' }}>{label}</div>
        <div style={{ fontSize: 14, color: '#87726e', marginTop: 6, maxWidth: 360 }}>Esta seção será configurada em breve. As opções de {label.toLowerCase()} aparecerão aqui.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState('loja');
  const [toastMsg, setToastMsg] = useState(null);
  const toast = (m) => setToastMsg(m);
  useEffect(() => { if (!toastMsg) return; const id = setTimeout(() => setToastMsg(null), 2400); return () => clearTimeout(id); }, [toastMsg]);
  const current = SETTINGS_NAV.find(n => n.id === tab);

  const saveAllRef = React.useRef(null);
  const [savingAll, setSavingAll] = useState(false);
  const handleSaveAll = async () => {
    if (!saveAllRef.current) { toast('Nada para salvar nesta aba.'); return; }
    setSavingAll(true);
    try { await saveAllRef.current(); }
    catch (e) { /* toast já emitido pela aba */ }
    finally { setSavingAll(false); }
  };

  return (
    <div className="stage" style={{ display: 'flex', position: 'relative' }}>
      <SharedSidebar active="configuracoes" />

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }}>
        <SharedTopBar
          crumbs={[{ label: 'Configurações', href: 'Configuracoes.html' }, { label: 'Dados da loja' }]}
          search="Buscar configuração..."
          actions={
            <button className="btn btn-primary" style={{ background: window.THEME.primary }} onClick={handleSaveAll} disabled={savingAll}>
              {savingAll ? <><span className="spinner" /> Salvando...</> : <><IconSave size={16} /> Salvar todas as alterações</>}
            </button>
          } />

        <main style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* internal sidebar */}
          <nav className="card" style={{ width: 220, flexShrink: 0, padding: 8, position: 'sticky', top: 96 }}>
            {SETTINGS_NAV.map(n => {
              const active = tab === n.id;
              return (
                <button key={n.id} onClick={() => setTab(n.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 10, marginBottom: 2, textAlign: 'left',
                    borderLeft: `3px solid ${active ? window.THEME.primary : 'transparent'}`,
                    background: active ? '#fff8f4' : 'transparent', transition: 'background .14s' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#faf7f3'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <n.icon size={18} color={active ? window.THEME.primary : '#87726e'} />
                  <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? '#52170c' : '#54433f' }}>{n.label}</span>
                </button>
              );
            })}
          </nav>

          {/* content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'loja' ? <LojaTab accent={window.THEME.primary} toast={toast} saveAllRef={saveAllRef} /> :
             tab === 'frete' ? <FreteTab accent={window.THEME.primary} toast={toast} /> :
             tab === 'pagamento' ? <PagamentoTab accent={window.THEME.primary} toast={toast} /> :
             <Placeholder icon={current.icon} label={current.label} />}
          </div>
        </main>
      </div>

      {toastMsg && <div className="toast"><IconCheck size={16} color="#7be288" stroke={3} /><span>{toastMsg}</span></div>}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
