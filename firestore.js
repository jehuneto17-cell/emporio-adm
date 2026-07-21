// ── Serviço Firestore do Painel Admin ────────────────────────────────────────
// Usa Firebase Compat SDK (window.firebase já inicializado em firebase-config.js).
// Expõe window.DB com todas as funções CRUD de cada coleção.
//
// REGRA: cada função NUNCA rejeita — sempre resolve com valor padrão em caso de erro.
// Isso evita que erros de permissão ou índice travem a UI / navegação.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  var db = firebase.firestore();

  // ── Helpers ────────────────────────────────────────────────────────────────

  function docToObj(doc) {
    return Object.assign({ id: doc.id }, doc.data());
  }

  function tsToDate(ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('pt-BR');
  }

  function tsToTime(ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // ── PRODUTOS ───────────────────────────────────────────────────────────────

  async function getProdutos() {
    try {
      var snap = await db.collection('produtos').orderBy('createdAt', 'desc').get();
      return snap.docs.map(function (doc) {
        var d = doc.data();
        return {
          id: doc.id,
          sku: d.sku || '',
          name: d.name || '',
          category: d.category || '',
          subcategory: d.subcategory || '',
          price: d.price || 0,
          promo: d.promo || null,
          stock: d.stock != null ? d.stock : 0,
          status: d.status || 'Ativo',
          initials: d.initials || (d.name || '').substring(0, 2).toUpperCase(),
          tint: d.tint || '#a85a32',
          description: d.description || '',
          longDesc: d.longDesc || '',
          producer:     d.producer     || '',
          location:     d.location     || '',
          verified:     !!d.verified,
          featured:     !!d.featured,
          visible:      d.visible      !== false,
          allowReviews: d.allowReviews !== false,
          meta:         d.meta         || '',
          tags:         Array.isArray(d.tags) ? d.tags : [],
          minStock:     d.minStock     != null ? d.minStock : 5,
          variations:   Array.isArray(d.variations) ? d.variations : [],
          imageUrl: d.imageUrl || null,
          images: Array.isArray(d.images) ? d.images : [],
          weight:       d.weight       || 0,
          weightHeight: d.weightHeight || 0,
          weightWidth:  d.weightWidth  || 0,
          weightLength: d.weightLength || 0,
          updatedAt: d.updatedAt ? tsToDate(d.updatedAt) + ' às ' + tsToTime(d.updatedAt) : null,
        };
      });
    } catch (e) {
      console.warn('[DB.getProdutos]', e.code || e.message);
      return [];
    }
  }

  async function addProduto(data) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var ref = await db.collection('produtos').add(Object.assign({}, data, { createdAt: now, updatedAt: now }));
      return ref.id;
    } catch (e) {
      console.warn('[DB.addProduto]', e.code || e.message);
      throw e; // relança para o formulário tratar
    }
  }

  async function updateProduto(id, data) {
    try {
      await db.collection('produtos').doc(id).update(
        Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
      );
    } catch (e) {
      console.warn('[DB.updateProduto]', e.code || e.message);
      throw e;
    }
  }

  async function deleteProduto(id) {
    try {
      await db.collection('produtos').doc(id).delete();
    } catch (e) {
      console.warn('[DB.deleteProduto]', e.code || e.message);
      throw e;
    }
  }

  async function updateEstoqueProduto(id, novoEstoque) {
    try {
      var status = novoEstoque === 0 ? 'Esgotado' : 'Ativo';
      await db.collection('produtos').doc(id).update({
        stock: novoEstoque,
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn('[DB.updateEstoqueProduto]', e.code || e.message);
      throw e;
    }
  }

  // ── PEDIDOS ────────────────────────────────────────────────────────────────

  async function getPedidos() {
    try {
      var snap = await db.collection('pedidos').orderBy('createdAt', 'desc').limit(50).get();
      var mapped = snap.docs.map(function (doc) {
        var d = doc.data();
        return {
          id: doc.id,
          uid: d.uid || null,
          number: d.number || doc.id,
          customer: String(d.customer || ''),
          initials: String(d.initials || ''),
          tint: d.tint || '#a85a32',
          city: String(d.city || ''),
          total: d.total || 0,
          // d.items pode ser um array (novo app) ou um número (legado).
          // Normalizamos sempre para o count numérico que o painel exibe.
          items: Array.isArray(d.items) ? d.items.length : (d.items || 0),
          date: d.createdAt ? tsToDate(d.createdAt) : (d.date || ''),
          time: d.createdAt ? tsToTime(d.createdAt) : (d.time || ''),
          status: String(d.status || 'Aguardando pagamento'),
          payment: String(d.payment || ''),
          shipping: String(d.shipping || ''),
          freight: d.freight || 0,
          products: Array.isArray(d.products) ? d.products : [],
          address: d.address || {},
          arquivado: !!d.arquivado,
        };
      });
      return mapped.filter(function(o) { return !o.arquivado; });
    } catch (e) {
      console.warn('[DB.getPedidos]', e.code || e.message);
      return [];
    }
  }

  async function getPedido(id) {
    try {
      var doc = await db.collection('pedidos').doc(id).get();
      if (!doc.exists) return null;
      var d = doc.data();
      return Object.assign({ id: doc.id }, d, {
        date: d.createdAt ? tsToDate(d.createdAt) : (d.date || ''),
        time: d.createdAt ? tsToTime(d.createdAt) : (d.time || ''),
      });
    } catch (e) {
      console.warn('[DB.getPedido]', e.code || e.message);
      return null;
    }
  }

  async function addPedido(data) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var number = '#' + Date.now().toString().slice(-6);
      var ref = await db.collection('pedidos').add(Object.assign({}, data, { number: number, createdAt: now, updatedAt: now }));
      return ref.id;
    } catch (e) {
      console.warn('[DB.addPedido]', e.code || e.message);
      throw e;
    }
  }

  async function updatePedido(id, data) {
    try {
      await db.collection('pedidos').doc(id).update(
        Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
      );
    } catch (e) {
      console.warn('[DB.updatePedido]', e.code || e.message);
      throw e;
    }
  }

  async function updateStatusPedido(id, status, uid) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('pedidos').doc(id).update({
        status: status,
        updatedAt: now,
      });
      if (uid) {
        await db.collection('users').doc(uid).collection('orders').doc(id).update({
          status: status,
          updatedAt: now,
        });
      }
    } catch (e) {
      console.warn('[DB.updateStatusPedido]', e.code || e.message);
      throw e;
    }
  }

  async function arquivarPedido(id) {
    try {
      await db.collection('pedidos').doc(id).update({
        arquivado: true,
        arquivadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn('[DB.arquivarPedido]', e.code || e.message);
      throw e;
    }
  }

  async function desarquivarPedido(id) {
    try {
      await db.collection('pedidos').doc(id).update({
        arquivado: false,
        arquivadoEm: null,
      });
    } catch (e) {
      console.warn('[DB.desarquivarPedido]', e.code || e.message);
      throw e;
    }
  }

  // ── CLIENTES ───────────────────────────────────────────────────────────────

  async function getClientes() {
    try {
      var snap = await db.collection('clientes').orderBy('name').get();
      return snap.docs.map(function (doc) {
        var d = doc.data();
        return {
          id: doc.id,
          name: d.name || '',
          initials: d.initials || (d.name || '').substring(0, 2).toUpperCase(),
          tint: d.tint || '#a85a32',
          email: d.email || '',
          phone: d.phone || '',
          city: d.city || '',
          orders: d.orders || 0,
          spent: d.spent || 0,
          since: d.since || '',
          tier: d.tier || 'Novo',
          last: d.last || '',
        };
      });
    } catch (e) {
      console.warn('[DB.getClientes]', e.code || e.message);
      return [];
    }
  }

  async function getCliente(id) {
    try {
      var doc = await db.collection('clientes').doc(id).get();
      return doc.exists ? docToObj(doc) : null;
    } catch (e) {
      console.warn('[DB.getCliente]', e.code || e.message);
      return null;
    }
  }

  async function upsertCliente(id, data) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      if (id) {
        await db.collection('clientes').doc(id).set(Object.assign({}, data, { updatedAt: now }), { merge: true });
      } else {
        await db.collection('clientes').add(Object.assign({}, data, { createdAt: now, updatedAt: now }));
      }
    } catch (e) {
      console.warn('[DB.upsertCliente]', e.code || e.message);
      throw e;
    }
  }

  // ── CUPONS ─────────────────────────────────────────────────────────────────

  async function getCupons() {
    try {
      var snap = await db.collection('cupons').get();
      return snap.docs.map(function (doc) {
        var d = doc.data();
        return {
          id: doc.id,
          code: d.code || '',
          type: d.type || 'Percentual',
          value: d.value || '',
          min: d.min || 'R$ 0,00',
          uses: d.uses || 0,
          limit: d.limit || 0,
          status: d.status || 'Ativo',
          expires: d.expires || '',
          expiresIn: d.expiresIn || '',
        };
      });
    } catch (e) {
      console.warn('[DB.getCupons]', e.code || e.message);
      return [];
    }
  }

  async function getCupom(id) {
    try {
      var doc = await db.collection('cupons').doc(id).get();
      if (!doc.exists) return null;
      var d = doc.data();
      return {
        id: doc.id,
        code: d.code || '',
        type: d.type || 'Percentual',
        value: d.value || '',
        min: d.min || 'R$ 0,00',
        uses: d.uses || 0,
        limit: d.limit || 0,
        status: d.status || 'Ativo',
        expires: d.expires || '',
        expiresIn: d.expiresIn || '',
        desc: d.desc || '',
        perClient: d.perClient || 'Ilimitado',
        start: d.start || '',
        allCats: d.allCats !== false,
        cats: d.cats || [],
      };
    } catch (e) {
      console.warn('[DB.getCupom]', e.code || e.message);
      return null;
    }
  }

  async function addCupom(data) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var ref = await db.collection('cupons').add(Object.assign({}, data, { uses: 0, createdAt: now, updatedAt: now }));
      return ref.id;
    } catch (e) {
      console.warn('[DB.addCupom]', e.code || e.message);
      throw e;
    }
  }

  async function updateCupom(id, data) {
    try {
      await db.collection('cupons').doc(id).update(
        Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
      );
    } catch (e) {
      console.warn('[DB.updateCupom]', e.code || e.message);
      throw e;
    }
  }

  async function deleteCupom(id) {
    try {
      await db.collection('cupons').doc(id).delete();
    } catch (e) {
      console.warn('[DB.deleteCupom]', e.code || e.message);
      throw e;
    }
  }

  // ── CATEGORIAS ─────────────────────────────────────────────────────────────

  async function getCategorias() {
    try {
      var snap = await db.collection('categorias').orderBy('order').get();
      return snap.docs.map(docToObj);
    } catch (e) {
      console.warn('[DB.getCategorias]', e.code || e.message);
      return [];
    }
  }

  async function addCategoria(data) {
    try {
      var snap = await db.collection('categorias').orderBy('order', 'desc').limit(1).get();
      var nextOrder = snap.empty ? 1 : (snap.docs[0].data().order || 0) + 1;
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var ref = await db.collection('categorias').add(Object.assign({}, data, { order: nextOrder, visible: true, createdAt: now }));
      return ref.id;
    } catch (e) {
      console.warn('[DB.addCategoria]', e.code || e.message);
      throw e;
    }
  }

  async function updateCategoria(id, data) {
    try {
      await db.collection('categorias').doc(id).update(data);
    } catch (e) {
      console.warn('[DB.updateCategoria]', e.code || e.message);
      throw e;
    }
  }

  async function deleteCategoria(id) {
    try {
      await db.collection('categorias').doc(id).delete();
    } catch (e) {
      console.warn('[DB.deleteCategoria]', e.code || e.message);
      throw e;
    }
  }

  // ── CONFIGURAÇÕES DA LOJA ──────────────────────────────────────────────────

  async function getConfiguracoes() {
    try {
      var snap = await db.collection('configuracoes').get();
      var result = {};
      snap.docs.forEach(function(doc) {
        if (doc.id === 'loja') {
          Object.assign(result, doc.data());
        } else {
          result[doc.id] = doc.data();
        }
      });
      return result;
    } catch (e) {
      console.warn('[DB.getConfiguracoes]', e.code || e.message);
      return {};
    }
  }

  async function saveConfiguracoes(data) {
    try {
      await db.collection('configuracoes').doc('loja').set(
        Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }),
        { merge: true }
      );
    } catch (e) {
      console.warn('[DB.saveConfiguracoes]', e.code || e.message);
      throw e;
    }
  }

  async function setConfiguracao(key, value) {
    try {
      await db.collection('configuracoes').doc(key).set(
        Object.assign({}, value, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }),
        { merge: true }
      );
    } catch (e) {
      console.warn('[DB.setConfiguracao]', e.code || e.message);
      throw e;
    }
  }

  // ── MÉTRICAS / DASHBOARD ───────────────────────────────────────────────────
  // ATENÇÃO: usa query simples (só filtro por data) para evitar exigir índice composto.
  // Filtro de status é feito em JS depois de receber os documentos.

  async function getMetricasHoje() {
    try {
      var hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      var amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      var inicioHoje  = firebase.firestore.Timestamp.fromDate(hoje);
      var inicioAmanha = firebase.firestore.Timestamp.fromDate(amanha);

      var snap = await db.collection('pedidos')
        .where('createdAt', '>=', inicioHoje)
        .where('createdAt', '<', inicioAmanha)
        .get();

      var totalVendas = 0;
      var totalPedidos = 0;
      snap.forEach(function (doc) {
        var d = doc.data();
        if (d.status !== 'Cancelado') {
          totalVendas += d.total || 0;
          totalPedidos++;
        }
      });

      return {
        vendas: totalVendas,
        pedidos: totalPedidos,
        ticket: totalPedidos > 0 ? totalVendas / totalPedidos : 0,
      };
    } catch (e) {
      console.warn('[DB.getMetricasHoje]', e.code || e.message);
      return { vendas: 0, pedidos: 0, ticket: 0 };
    }
  }

  // Retorna produtos com estoque abaixo do limite.
  // Usa query simples + ordenação em JS (evita índice composto).
  async function getAlertasEstoque(limite) {
    try {
      var limiteEstoque = limite != null ? limite : 10;
      var snap = await db.collection('produtos')
        .where('stock', '<=', limiteEstoque)
        .get();

      var results = snap.docs.map(function (doc) {
        var d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          qty: d.stock,
          level: d.stock === 0 ? 'Esgotado' : d.stock <= 5 ? 'Crítico' : 'Baixo',
          tone: (d.stock === 0 || d.stock <= 5) ? 'error' : 'warn',
        };
      });

      // Ordenação em JS — evita exigir índice composto no Firestore
      results.sort(function (a, b) { return a.qty - b.qty; });
      return results;
    } catch (e) {
      console.warn('[DB.getAlertasEstoque]', e.code || e.message);
      return [];
    }
  }

  // ── BANNERS ────────────────────────────────────────────────────────────────

  async function getBanners() {
    try {
      var snap = await db.collection('banners').orderBy('order').get();
      return snap.docs.map(function(doc) {
        var d = doc.data();
        return { id: doc.id, badge: d.badge || '', title: d.title || '', subtitle: d.subtitle || '', bg: d.bg || '#52170c', bg2: d.bg2 || '#964904', order: d.order || 0, active: d.active !== false, imageUrl: d.imageUrl || '', productId: d.productId || '' };
      });
    } catch(e) { console.warn('[DB.getBanners]', e.code || e.message); return []; }
  }

  async function addBanner(data) {
    try {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var ref = await db.collection('banners').add(Object.assign({}, data, { createdAt: now, updatedAt: now }));
      return ref.id;
    } catch(e) { console.warn('[DB.addBanner]', e.code || e.message); throw e; }
  }

  async function updateBanner(id, data) {
    try {
      await db.collection('banners').doc(id).update(Object.assign({}, data, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    } catch(e) { console.warn('[DB.updateBanner]', e.code || e.message); throw e; }
  }

  async function deleteBanner(id) {
    try { await db.collection('banners').doc(id).delete(); }
    catch(e) { console.warn('[DB.deleteBanner]', e.code || e.message); throw e; }
  }

  // ── SEED DE DADOS INICIAIS ─────────────────────────────────────────────────
  // Execute DB.seedDadosIniciais() UMA VEZ no console do browser para popular
  // o Firestore com os dados de exemplo. Ignora se já existir algum produto.

  async function seedDadosIniciais() {
    try {
      var check = await db.collection('produtos').limit(1).get();
      if (!check.empty) {
        console.log('[Seed] Dados já existem — seed ignorado.');
        return;
      }

      var batch = db.batch();
      var now = firebase.firestore.FieldValue.serverTimestamp();

      var produtosMock = [
        {
          sku: 'QJ-001', name: 'Queijo Canastra Meia Cura 400g', category: 'queijos',
          price: 45.90, promo: 38.00, stock: 24, status: 'Ativo', initials: 'QC', tint: '#a85a32',
          visible: true, featured: true,
          description: 'Queijo artesanal de leite cru, curado por 30 dias na Serra da Canastra.',
          longDesc: 'Produzido com leite cru de vacas criadas a pasto na Serra da Canastra, curado por 30 dias em câmara úmida. Desenvolvendo casca natural e interior cremoso com sabor intenso e levemente picante.',
          producer: 'Laticínio Família Borges', location: 'Serra da Canastra · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'CF-002', name: 'Café Especial Canastra 250g', category: 'cafes',
          price: 32.90, promo: null, stock: 8, status: 'Ativo', initials: 'CC', tint: '#4b2316',
          visible: true, featured: true,
          description: 'Café de altitude torrado artesanalmente, notas de caramelo e frutas amarelas.',
          longDesc: 'Grãos colhidos seletivamente na altitude da Serra da Canastra, processados via cereja descascado e torrados em micro-lote. Perfil suave com acidez cítrica, corpo médio e finalização adocicada.',
          producer: 'Sítio Pedra Branca', location: 'São Roque de Minas · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'DL-003', name: 'Doce de Leite Artesanal 400g', category: 'doces',
          price: 22.50, promo: null, stock: 0, status: 'Esgotado', initials: 'DL', tint: '#8a4a14',
          visible: true, featured: false,
          description: 'Doce de leite cremoso feito em tacho de cobre, receita de família mineira.',
          longDesc: 'Preparado em tacho de cobre com leite integral e açúcar cristal, cozido em fogo lento por horas até atingir consistência cremosa perfeita. Sem conservantes, sabor puro da tradição mineira.',
          producer: 'Doçaria Canastra', location: 'Medeiros · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'LG-004', name: 'Linguiça Defumada 500g', category: 'embutidos',
          price: 28.90, promo: null, stock: 31, status: 'Ativo', initials: 'LD', tint: '#6e2a18',
          visible: true, featured: false,
          description: 'Linguiça suína defumada em lenha de aroeira, temperada com ervas nativas.',
          longDesc: 'Preparada com carne suína selecionada, temperada com alho, pimenta-do-reino e ervas da região. Defumada lentamente em lenha de aroeira, conferindo aroma e sabor únicos.',
          producer: 'Charcutaria Minas', location: 'São João Batista do Glória · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'CC-005', name: 'Cachaça Artesanal 700ml', category: 'bebidas',
          price: 89.00, promo: null, stock: 15, status: 'Ativo', initials: 'CA', tint: '#b58444',
          visible: true, featured: false,
          description: 'Cachaça de alambique envelhecida 2 anos em barril de carvalho.',
          longDesc: 'Produzida em alambique de cobre a partir de cana-de-açúcar colhida à mão. Envelhecida por 24 meses em barris de carvalho, com notas de baunilha, especiarias e cor amadeirada.',
          producer: 'Engenho São Bento', location: 'Tapiraí · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'GJ-006', name: 'Geleia de Jabuticaba 300g', category: 'conservas',
          price: 19.90, promo: 15.90, stock: 5, status: 'Ativo', initials: 'GJ', tint: '#5a1e3a',
          visible: true, featured: false,
          description: 'Geleia rústica de jabuticaba colhida na roça, sem conservantes.',
          longDesc: 'Feita com jabuticabas maduras colhidas diretamente do tronco, cozidas com açúcar demerara até o ponto certo. Consistência firme, cor vinho intenso e sabor levemente adstringente.',
          producer: 'Quintal da Serra', location: 'Delfinópolis · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'PQ-007', name: 'Pão de Queijo Congelado 500g', category: 'padaria',
          price: 24.90, promo: null, stock: 0, status: 'Inativo', initials: 'PQ', tint: '#c89a5e',
          visible: true, featured: false,
          description: 'Pão de queijo artesanal congelado, feito com queijo Canastra e polvilho azedo.',
          longDesc: 'Receita tradicional mineira com polvilho azedo, queijo Canastra ralado e ovos caipiras. Congelado individualmente para assar quando quiser, saindo crocante por fora e macio por dentro.',
          producer: 'Padaria Mineira da Serra', location: 'Vargem Bonita · MG',
          imageUrl: '', images: [],
        },
        {
          sku: 'ML-008', name: 'Mel Puro Serra da Canastra 500g', category: 'mel',
          price: 42.00, promo: null, stock: 18, status: 'Ativo', initials: 'MP', tint: '#a96b14',
          visible: true, featured: false,
          description: 'Mel silvestre puro coletado de colmeias na reserva da Canastra.',
          longDesc: 'Extraído de colmeias posicionadas em área de cerrado preservado, próximo à reserva do Parque Nacional da Serra da Canastra. Mel cru, não filtrado, com alto teor de pólen e enzimas naturais.',
          producer: 'Apiário Canastra', location: 'Sacramento · MG',
          imageUrl: '', images: [],
        },
      ];

      produtosMock.forEach(function (p) {
        batch.set(db.collection('produtos').doc(), Object.assign({}, p, { createdAt: now, updatedAt: now }));
      });

      var categoriasMock = [
        { name:'Queijos',          icon:'🧀', order:1, visible:true },
        { name:'Cafés',            icon:'☕', order:2, visible:true },
        { name:'Doces',            icon:'🍬', order:3, visible:true },
        { name:'Embutidos',        icon:'🥩', order:4, visible:true },
        { name:'Bebidas',          icon:'🍶', order:5, visible:true },
        { name:'Conservas',        icon:'🫙', order:6, visible:true },
        { name:'Pães',             icon:'🥖', order:7, visible:true },
        { name:'Mel e Derivados',  icon:'🍯', order:8, visible:true },
      ];

      categoriasMock.forEach(function (c) {
        batch.set(db.collection('categorias').doc(), Object.assign({}, c, { createdAt: now }));
      });

      var cupomsMock = [
        { code:'CANASTRA10',     type:'Valor fixo',   value:'R$ 11,00',    min:'R$ 80,00',  uses:0, limit:200, status:'Ativo',   expires:'04/06/2026', expiresIn:'5 dias'   },
        { code:'FRETEGRATIS',    type:'Frete grátis', value:'Frete grátis',min:'R$ 150,00', uses:0, limit:500, status:'Ativo',   expires:'30/06/2026', expiresIn:'31 dias'  },
        { code:'PRIMEIRACOMPRA', type:'Percentual',   value:'15%',         min:'R$ 0,00',   uses:0, limit:1000,status:'Ativo',   expires:'31/12/2026', expiresIn:'215 dias' },
      ];

      cupomsMock.forEach(function (c) {
        batch.set(db.collection('cupons').doc(), Object.assign({}, c, { createdAt: now, updatedAt: now }));
      });

      await batch.commit();
      console.log('[Seed] Dados iniciais criados com sucesso!');
    } catch (e) {
      console.error('[Seed] Falha:', e.code || e.message);
    }
  }

  // ── RASTREAMENTO ───────────────────────────────────────────────────────────

  async function updateRastreamentoPedido(id, trackingData) {
    try {
      await db.collection('pedidos').doc(id).update(
        Object.assign({}, trackingData, {
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      );
    } catch (e) {
      console.warn('[DB.updateRastreamentoPedido]', e.code || e.message);
      throw e;
    }
  }

  // ── Exporta tudo para window.DB ────────────────────────────────────────────
  window.DB = {
    getProdutos:          getProdutos,
    addProduto:           addProduto,
    updateProduto:        updateProduto,
    deleteProduto:        deleteProduto,
    updateEstoqueProduto: updateEstoqueProduto,
    getPedidos:           getPedidos,
    getPedido:            getPedido,
    addPedido:            addPedido,
    updatePedido:         updatePedido,
    updateStatusPedido:          updateStatusPedido,
    arquivarPedido:              arquivarPedido,
    desarquivarPedido:           desarquivarPedido,
    updateRastreamentoPedido:    updateRastreamentoPedido,
    getClientes:          getClientes,
    getCliente:           getCliente,
    upsertCliente:        upsertCliente,
    getCupons:            getCupons,
    getCupom:             getCupom,
    addCupom:             addCupom,
    updateCupom:          updateCupom,
    deleteCupom:          deleteCupom,
    getCategorias:        getCategorias,
    addCategoria:         addCategoria,
    updateCategoria:      updateCategoria,
    deleteCategoria:      deleteCategoria,
    getConfiguracoes:     getConfiguracoes,
    saveConfiguracoes:    saveConfiguracoes,
    setConfiguracao:      setConfiguracao,
    getBanners:           getBanners,
    addBanner:            addBanner,
    updateBanner:         updateBanner,
    deleteBanner:         deleteBanner,
    getMetricasHoje:      getMetricasHoje,
    getAlertasEstoque:    getAlertasEstoque,
    seedDadosIniciais:    seedDadosIniciais,
    tsToDate:             tsToDate,
    tsToTime:             tsToTime,
  };

  console.log('[DB] Firestore pronto. Para popular dados: DB.seedDadosIniciais()');
})();
