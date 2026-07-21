# Empório Coisas de Minas — Painel Admin

> **Leia este arquivo antes de iniciar qualquer tarefa.**
> Ao concluir, atualize as seções ✅ / 🔲 e registre o que mudou.

---

## O que é este projeto

Painel administrativo web do **Empório Coisas de Minas** — e-commerce de produtos artesanais da Serra da Canastra, MG. O admin gerencia produtos, pedidos, clientes, cupons, estoque, categorias, relatórios e configurações da loja.

O app mobile do cliente existe em paralelo (`C:\Projetos\Apps\Loja Virtual\Emporio Coisas de Minas\emporio-app`) e compartilha o mesmo projeto Firebase.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 18.3.1 via CDN (sem build tool) |
| Transpilação | Babel Standalone 7.29.0 via CDN |
| Estilo | CSS puro + CSS variables (sem framework) |
| Backend | Firebase (Auth + Firestore) |
| SDK | Firebase Compat 10.12.2 via CDN (`gstatic.com`) |
| Deploy | Arquivos estáticos (Live Server ou qualquer servidor HTTP) |

> **Sem npm, sem webpack, sem bundler.** Tudo carregado via `<script>` no HTML.
> Os arquivos `.jsx` são transpilados pelo Babel no browser em runtime.

---

## Firebase

```
Projeto:            emporio-coisas-de-minas
Auth domain:        emporio-coisas-de-minas.firebaseapp.com
Storage bucket:     emporio-coisas-de-minas.firebasestorage.app
Messaging sender:   623158539642
App ID:             1:623158539642:web:94977507f34e77cdbd12c3
API Key:            AIzaSyA6ll77eLqckEbbyiQoJVZuYQ6VI470kIY
Admin e-mail:       emporiominas00@gmail.com
```

**Coleções Firestore — painel admin (português):**

| Coleção | Conteúdo |
|---------|---------|
| `produtos` | Catálogo completo de produtos |
| `pedidos` | Pedidos dos clientes |
| `clientes` | Perfis dos clientes (criados pelo app mobile) |
| `cupons` | Cupons de desconto |
| `categorias` | Categorias de produtos com ordem |
| `configuracoes/loja` | Configurações gerais da loja (doc único) |

**✅ Nomenclatura padronizada:** Ambos os projetos usam `/produtos` (português). O `firestore.js` do app mobile (`src/services/firestore.js`) define `const COL = 'produtos'`. Não há risco de dados separados.

**Schema de produto salvo por `edit-app.jsx`:**
```
name, description (shortDesc), longDesc, price, promo (R$), stock, minStock,
category (id), subcategory, status, visible, featured, allowReviews, producer,
location, verified, tags, meta, initials,
images[] (array de URLs Cloudinary — até 6 fotos),
imageUrl (mirrors images[0] — campo legado lido pelo app mobile)
```
O app mobile converte `promo` em `sale` (%) via `mapProduct()` em `src/services/firestore.js`.
Campos `rating`, `reviewCount`, `weights`, `colors` ainda não são gerenciados pelo admin.

---

## Design System — Regras invioláveis

- **Não alterar cores, fontes ou espaçamento** do design original
- Paleta: `#52170c` (sidebar), `#964904` (primária), `#d8a360` (accent/dourado), `#fcf9f5` (fundo)
- Fontes: **Plus Jakarta Sans** (títulos/números) + **Work Sans** (corpo)
- Layout **100% fluido** — `.stage` ocupa `width:100%` sem `max-width` nem `margin: 0 auto`
- Manter o padrão de cards, badges, dropdowns e tabelas já existente
- **Jamais usar dados mock como fallback** — arrays em `data.jsx` ficam sempre vazios

---

## Arquivos — o que cada um faz

### Infraestrutura (criados neste projeto)

| Arquivo | Função |
|---------|--------|
| `firebase-config.js` | Inicializa o app Firebase (compat SDK). Deve ser carregado antes de `auth-guard.js` e `firestore.js`. Firebase Storage **não** é usado (substituído pelo Cloudinary) |
| `auth-guard.js` | Protege todas as páginas: oculta o DOM, verifica Auth, redireciona não-admins para `login.html`. Expõe `window.checkAuth()` e `window.logout()` |
| `firestore.js` | CRUD completo de todas as coleções via `window.DB`. Também tem `DB.seedDadosIniciais()` para popular o Firestore na primeira vez |
| `storage.js` | Upload de fotos via **Cloudinary** (plano free — sem SDK, XHR puro). Expõe `window.STORAGE`: `uploadProductImage(file, productId, onProgress)` → `secure_url`; `deleteProductImage()` → no-op (exclusão via Media Library do Cloudinary). `CLOUD_NAME = 'dv62fwdtv'`, `UPLOAD_PRESET = 'emporio-produtos'` |
| `responsive.css` | Torna o layout fluido abaixo de 1440px. Sidebar colapsa em telas menores |
| `login.html` | Tela de login standalone (sem React). Firebase Auth, erros em PT-BR, toggle de senha |

### Páginas HTML (12 arquivos)

Cada HTML carrega, nesta ordem no `<head>`:
1. Google Fonts
2. `styles.css` (ou inline no Painel Admin.html)
3. `responsive.css`
4. `firebase-app-compat.js` + `firebase-auth-compat.js` + `firebase-firestore-compat.js`
5. `firebase-config.js`
6. `auth-guard.js`
7. `firestore.js`

Depois, no `<body>`, os scripts React/Babel na ordem correta para cada página.

| HTML | Página | JSX principal |
|------|--------|--------------|
| `Dashboard.html` | Dashboard com métricas e gráficos | `dashboard-app.jsx` |
| `Painel Admin.html` | Lista de produtos (tem CSS inline, sem `styles.css`) | `app.jsx` |
| `Pedidos.html` | Lista de pedidos com drawer | `pedidos-app.jsx` |
| `Detalhe do Pedido.html` | Detalhe de um pedido específico | `order-detail-app.jsx` |
| `Clientes.html` | Lista de clientes | `clientes-app.jsx` |
| `Categorias.html` | Gerenciamento de categorias | `categorias-app.jsx` |
| `Cupons.html` | Lista de cupons | `cupons-app.jsx` |
| `Editar Cupom.html` | Formulário de cupom | `editar-cupom-app.jsx` |
| `Estoque.html` | Controle de estoque | `estoque-app.jsx` |
| `Configuracoes.html` | Configurações da loja | `configuracoes-app.jsx` |
| `Relatorios.html` | Relatórios financeiros | `relatorios-app.jsx` |
| `Editar Produto.html` | Formulário de produto | `edit-app.jsx` |

### Componentes JSX compartilhados

| Arquivo | Função |
|---------|--------|
| `shared.jsx` | `SharedSidebar` (com logout real + user Firebase) e `SharedTopBar` (avatar com iniciais reais do Firebase Auth). `PAGE_HREFS` com links de todas as páginas. `Dropdown` e `StatusBadge` reutilizáveis. **`formatBRL(n)`** — função canônica de formatação de moeda (R$), exposta via `window.formatBRL` |
| `data.jsx` | Dados mock como fallback (PRODUCTS, ORDERS, CUSTOMERS, COUPONS, etc.). Expõe tudo via `window.*`. `fmtBRL` é agora um alias para `window.formatBRL` — não define implementação própria |
| `icons.jsx` | ~50 ícones SVG no estilo Lucide. Todos expostos via `window.Icon*` |
| `charts.jsx` | Componentes de gráfico: `BarChart`, `LineChart`, `DonutChart`, `ProgressBar` |
| `tweaks-panel.jsx` | Painel flutuante de ajuste de tema (só em modo design — pode ser ignorado) |

### Componentes JSX de página

| Arquivo | Conteúdo |
|---------|---------|
| `app.jsx` | Página de Produtos: tabela com filtros, paginação real, CRUD com Firestore |
| `dashboard-app.jsx` | Dashboard: métricas do dia via Firestore, gráfico de vendas, pedidos recentes, alertas de estoque |
| `pedidos-app.jsx` | Lista de pedidos com drawer lateral de detalhes |
| `order-detail-app.jsx` | Detalhe completo de um pedido (timeline, produtos, endereço) |
| `clientes-app.jsx` | Lista de clientes com drawer de perfil |
| `categorias-app.jsx` | Cards de categorias com toggle de visibilidade |
| `cupons-app.jsx` | Lista de cupons com modal de criação rápida |
| `editar-cupom-app.jsx` | Formulário completo de cupom |
| `estoque-app.jsx` | Tabela de estoque com ajustes e alertas críticos |
| `configuracoes-app.jsx` | Formulário de dados da loja, horários, redes sociais |
| `relatorios-app.jsx` | Relatórios com gráficos de faturamento e produtos top |
| `edit-app.jsx` | Formulário completo de produto (novo/editar) |

---

## O que já está feito ✅

### Autenticação e segurança
- ✅ `firebase-config.js` com credenciais reais do projeto
- ✅ `auth-guard.js`: protege todas as páginas, redireciona não-admins, expõe `logout()`
- ✅ `login.html`: tela de login com Firebase Auth, erros em PT-BR, toggle de senha, redirecionamento automático se já logado
- ✅ Auth-guard adicionado nos 12 HTMLs do painel

### Responsividade
- ✅ Layout 100% fluido: `.stage` usa `width:100%` sem `max-width` e sem `margin:0 auto`
- ✅ Removido letterbox escuro (`background:#2a0f08` no body) — fundo agora sempre `var(--bg)`
- ✅ `responsive.css` com breakpoints: sidebar 200px em < 1280px, colapsa para 64px em < 1024px
- ✅ Viewport corrigido nos 12 HTMLs: `width=1440` → `width=device-width, initial-scale=1`
- ✅ Inline CSS do `Painel Admin.html` também corrigido (tinha `.stage{width:1440px}` inline)

### Firestore
- ✅ `firestore.js` com CRUD completo: produtos, pedidos, clientes, cupons, categorias, configurações
- ✅ `DB.getMetricasHoje()` e `DB.getAlertasEstoque()` para o dashboard
- ✅ `DB.seedDadosIniciais()` para popular o Firestore na primeira vez
- ✅ Firestore SDK adicionado nos 12 HTMLs

### Componentes conectados ao Firestore
- ✅ `app.jsx` (Produtos): estado inicial vazio, carrega do Firestore, métricas computadas do state, paginação real, deletar produto real, empty state
- ✅ `dashboard-app.jsx`: métricas, alertas, pedidos recentes, cards de produtos/cupons/avaliações — todos computados do Firestore ou zerados
- ✅ `pedidos-app.jsx`: carrega do Firestore, spinner de loading, empty state, updateStatusPedido() no drawer
- ✅ `cupons-app.jsx`: remove COUPON_LIST, carrega do Firestore via `firestoreToCouponCard()`, métricas computadas, empty state. `loadCupons()` é chamado após criar, excluir e desativar — lista sempre sincronizada com Firestore. `NewCouponModal` passa todos os campos e mostra spinner durante salvamento.
- ✅ `estoque-app.jsx`: remove STOCK, carrega produtos do Firestore via `produtoToStockItem()`, banner e métricas computados dinamicamente, empty state
- ✅ `categorias-app.jsx`: remove CATS, carrega do Firestore via `firestoreToCat()`, métricas computadas, empty state
- ✅ `clientes-app.jsx`: remove CLIENTS/RECENT_ORDERS/ADDRESS, carrega do Firestore, métricas computadas, drawer sem dados hardcoded, empty state
- ✅ `relatorios-app.jsx`: dados reais do Firestore — `Promise.all([DB.getPedidos(), DB.getProdutos()])`, `computeMetrics()` calcula faturamento/ticket/pedidos/descontos/frete, `DailyChart` aceita prop `data`, `CATEGORIES`/`TOP5` computados do cruzamento de pedidos × catálogo, botões de período conectados ao filtro real
- ✅ `order-detail-app.jsx`: remove ORDER/TIMELINE hardcoded, loading state e empty state quando pedido não encontrado, carrega via DB.getPedido(id). `saveStatus()` persiste via `DB.updateStatusPedido()`. `saveNote()` persiste via `DB.updatePedido()`. Função `normalizeOrder()` adapta dados brutos do Firestore (customer/payment/shipping como strings) para o shape esperado pelo JSX (objetos com subcampos). `firestore.js` ganhou `DB.updatePedido()`.
- ✅ `configuracoes-app.jsx`: formulário de loja carrega via DB.getConfiguracoes(). Campos nome/cnpj/email/whatsapp/desc/cep/addr/social/days/maint todos conectados ao estado React e persistem via DB.saveConfiguracoes() com spinner real e toast de sucesso/erro. CEP usa ViaCEP API e preenche endereço automaticamente. SaveBtn é async-aware.
- ✅ `edit-app.jsx`: todos os campos do formulário de produto começam vazios (sem defaults hardcoded)
- ✅ `editar-cupom-app.jsx`: carrega cupom do Firestore via `?id=` na URL, popula formulário, salva via `DB.updateCupom()` e redireciona para `Cupons.html`. Desativar/Excluir conectados ao Firestore. Dias para expirar calculados dinamicamente.

### shared.jsx
- ✅ Links de Categorias e Estoque corrigidos (apontavam para `#`)
- ✅ Botão logout conectado ao `window.logout()` (Firebase signOut)
- ✅ Avatar e e-mail do usuário mostram dados reais do Firebase Auth

---

## O que ainda falta fazer 🔲

### Dados reais no Firestore
- ✅ `relatorios-app.jsx`: faturamento, ticket médio, top 5 e categorias calculados de `DB.getPedidos()` + `DB.getProdutos()` com filtro por período
- ✅ Dashboard: gráfico de vendas 7/30/90 dias com dados reais de `DB.getPedidos()` — barras diárias (7/30 dias) ou semanais (90 dias)
- ✅ Dashboard: clientes ativos calculados como unique `customerId||customer` nos pedidos do período

### Navegação e UX
- ✅ Badge de "novos pedidos" na sidebar atualizado em tempo real via `onSnapshot` — filtra `status === 'Aguardando pagamento'`, cancela listener no cleanup

### Funcionalidades adicionais
- ✅ Paginação real implementada em `pedidos-app.jsx`, `clientes-app.jsx` e `cupons-app.jsx` — PAGE_SIZE 20, botões dinâmicos, "Mostrando X–Y de Z resultados", reset ao trocar filtro
- ✅ Exportar CSV de produtos e pedidos — `downloadCSV(filename, rows)` helper adicionado em `app.jsx` e `pedidos-app.jsx`; botões conectados ao `onClick`
- ✅ Upload de imagem de produto via Cloudinary — `storage.js` criado, `edit-app.jsx` com progresso e preview, `app.jsx` exibe foto real na tabela, `imageUrl` salvo no Firestore
- ✅ Regras de segurança do Firestore em `FIRESTORE_RULES.md` — unificadas para cobrir coleções em português (admin) e inglês (app mobile). Bug `email_verified` corrigido.

### Técnico
- 🔲 Primeiro uso: executar `DB.seedDadosIniciais()` no console para popular o Firestore
- ✅ React trocado para production builds nos 12 HTMLs (`react.production.min.js` + `react-dom.production.min.js`)

---

## Padrão de carregamento de dados nos JSX

O padrão obrigatório para todos os componentes:

```jsx
const { useState, useEffect } = React;

function App() {
  const [items, setItems] = useState([]);  // SEMPRE começa vazio — nunca com mock
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof DB === 'undefined') { setLoading(false); return; }
    DB.getXxx()
      .then(data => { setItems(data); setLoading(false); })  // sem condicional — usa o que veio
      .catch(err => { console.warn('[Firestore]', err); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) return <EmptyState />;  // mostra empty state quando Firestore vazio

  // ...resto do componente usando `items`
}
```

**Regras:**
- `useState([])` — nunca `useState(MOCK_DATA)`
- `setItems(data)` — sem condicional `if (data.length > 0)` (a ausência de dados é um estado válido)
- Sempre exibir empty state quando a coleção Firestore está vazia
- O empty state de produtos usa botão "+ Novo Produto" com link para `Editar Produto.html`

---

## Como testar localmente

1. Abrir a pasta no VS Code
2. Clicar com botão direito em `login.html` → **Open with Live Server**
3. Login com `emporiominas00@gmail.com`
4. Se for o primeiro uso: abrir console do browser e executar `DB.seedDadosIniciais()`

> **Nunca abrir como `file://`** — Firebase Auth bloqueia autenticação sem servidor HTTP.

---

## Histórico de alterações

| Data | O que foi feito |
|------|----------------|
| 2026-06-01 | Criação de `firebase-config.js`, `auth-guard.js`, `login.html`. Auth-guard adicionado nos 12 HTMLs |
| 2026-06-01 | `responsive.css` criado. Viewports corrigidos. Firestore SDK e `firestore.js` adicionados. `shared.jsx` corrigido (logout, links, user). `app.jsx` e `dashboard-app.jsx` conectados ao Firestore |
| 2026-06-01 | `CLAUDE.md` criado |
| 2026-06-01 | Layout 100% fluido: removido `width:1440px` e `margin:0 auto` de `styles.css`, `responsive.css` e inline do `Painel Admin.html`. Removido letterbox escuro. `data.jsx` limpo (arrays de dados agora vazios). `app.jsx` e `dashboard-app.jsx` corrigidos para estado inicial vazio + empty state |
| 2026-06-01 | Correção de navegação: Sidebar de `app.jsx` migrada para `<a href>` reais com `NAV_HREFS`. `firestore.js` reescrito com try/catch em todas as funções + `getMetricasHoje` simplificado (query de data simples, sem índice composto). `FIRESTORE_RULES.md` criado com regras prontas para copiar no Console |
| 2026-06-01 | `FIRESTORE_RULES.md` atualizado: regras unificadas cobrindo coleções em português (painel) e inglês (app mobile). Risco de nomenclatura documentado no CLAUDE.md e no FIRESTORE_RULES.md |
| 2026-06-01 | `cupons-app.jsx`: `loadCupons()` extraída e chamada após criar/excluir/desativar. `create()` salva no Firestore e recarrega. `NewCouponModal` passa todos os campos e tem spinner. `CouponCard` recebe `onDelete` e `onToggleStatus`. Defaults hardcoded do modal removidos. |
| 2026-06-01 | Fluxo Editar Cupom: `cupons-app.jsx` botão Editar → link `Editar Cupom.html?id=ID`. `editar-cupom-app.jsx` carrega do Firestore via `DB.getCupom(id)`, popula formulário com conversão de tipos/datas/valores, salva via `DB.updateCupom()` e redireciona. Desativar e Excluir conectados ao Firestore. `firestore.js` ganhou `getCupom(id)`. |
| 2026-06-01 | Remoção completa de todos os dados mock: `data.jsx` totalmente limpo (NOTIFICATIONS=[], badge NAV removido). Todos os 12 JSX de página conectados ao Firestore ou zerados. Métricas computadas de dados reais. Empty states com mensagem e botão de ação em todas as listas. Gráficos sem dados mostram "Nenhum dado disponível ainda". Formulários (edit-app, editar-cupom-app) começam com campos vazios. configuracoes-app carrega do Firestore. |
| 2026-06-01 | Verificação e padronização de coleções: confirmado que painel admin e app mobile já usam `/produtos`. Documentado schema completo dos produtos. `mapProduct()` adicionado ao `firestore.js` do app mobile para adaptar campos (promo→sale, filtrar visible/status). Fallback automático para `SEED_PRODUCTS` removido do app mobile. Ambos os CLAUDE.md atualizados. |
| 2026-06-01 | `app.jsx`: botão de editar (ícone lápis) corrigido — navega para `Editar Produto.html?id=ID` via `window.location.href`. Botão "Novo Produto" convertido de `<button>` para `<a href="Editar Produto.html">`. |
| 2026-06-01 | Upload de fotos implementado com Cloudinary (plano free, sem SDK). `storage.js` usa XHR puro para POST direto ao endpoint `/v1_1/{cloud}/image/upload` com preset Unsigned. Progresso via `xhr.upload.onprogress`. Interface `window.STORAGE` mantida. `firebase-storage-compat.js` removido do HTML. `firebase-config.js` não chama mais `firebase.storage()`. Requer configurar `CLOUD_NAME` e `UPLOAD_PRESET` em `storage.js`. |
| 2026-06-01 | Galeria multi-foto implementada: `edit-app.jsx` suporta até 6 fotos com upload sequencial, barra de progresso por foto, grid de miniaturas 3 colunas, botão × para remover individual, badge "Principal" na primeira. `storage.js` ganhou parâmetro `slot` → public_id `foto-{n}` por produto. Firestore salva `images[]` + `imageUrl` (legado = images[0]). `firestore.js` admin inclui `images[]`. `app.jsx` Photo usa `images[0]` com fallback `imageUrl`. Compatível com produtos antigos que só têm `imageUrl`. |
| 2026-06-01 | Corrigido erro "Identifier 'PhotoThumb' has already been declared": removida a declaração duplicada antiga (versão com `photo.tint`/initials sem suporte a imagem real) em `edit-app.jsx`. Mantida apenas a versão nova com `<img src={url}>`. |
| 2026-06-04 | Corrigido erro de sintaxe JSX em `estoque-app.jsx` linha 387: "Adjacent JSX elements must be wrapped in an enclosing tag". O `</div>}` que fecha o bloco condicional `{(loading || stockItems.length > 0) && <div className="card">}` estava posicionado após `</main>` e `</div>`, fora da sua hierarquia correta. Movido para antes do `</main>`. |
| 2026-06-05 | `order-detail-app.jsx`: corrigidos 3 bugs críticos — (1) `saveStatus()` agora chama `DB.updateStatusPedido()` com tratamento de erro; (2) `normalizeOrder()` adicionada para adaptar dados brutos do Firestore (customer/payment/shipping planos) ao shape de objetos esperado pelo JSX; (3) `saveNote()` persiste via `DB.updatePedido()`. `firestore.js` ganhou `DB.updatePedido(id, data)`. |
| 2026-06-05 | `configuracoes-app.jsx`: corrigidos 3 bugs críticos — (1) campos nome/cnpj/email/whatsapp agora têm estado React e são editáveis; (2) `SaveBtn` reescrito para ser async-aware (`onSave` em vez de `onClick`), cada card salva os seus campos via `DB.saveConfiguracoes()` com spinner e toast de erro real; (3) `buscarCep()` agora usa ViaCEP API e preenche rua/bairro/cidade/estado automaticamente. `UF_MAP` adicionado para converter sigla em nome completo. |
| 2026-06-05 | `estoque-app.jsx`: corrigidos 5 bugs — (1) `EntryModal`/`AdjustModal` agora chamam `DB.updateEstoqueProduto(id, novoEstoque)` e atualizam `stockItems` localmente; botão "Entrada" da linha passou a incluir `id`; (2) `useMemo` de `rows` ganhou `stockItems` nas dependências; (3) defaults hardcoded removidos dos modais (`'Café Especial...'`, `'20'`, `'Torrefação Mineira'`, `'NF-2841'`); (4) `produtoToStockItem` mapeia `price`, `valorTotal` usa `p.stock * p.price`; (5) `STOCK_CATEGORIES` substituído por state carregado via `DB.getCategorias()` com `Promise.all`. |
| 2026-06-05 | `pedidos-app.jsx`: link "Abrir detalhe completo" corrigido de `href="Detalhe do Pedido.html"` para `href={\`Detalhe do Pedido.html?id=${order.id}\`}`. |
| 2026-06-05 | `relatorios-app.jsx`: 2 bugs visuais corrigidos — (1) `Sparkline` com `points.length === 0` quebrava SVG com `NaN`; adicionado early return que exibe `"—"` no lugar; (2) `delta={null}` renderizava a string literal `"null"` na tela; bloco do delta envolvido em `{(delta != null) && (...)}`. |
| 2026-06-05 | `categorias-app.jsx`: 3 bugs corrigidos — (1) botão Excluir não tinha `onClick`; adicionado `ConfirmDeleteModal` com confirmação antes de chamar `DB.deleteCategoria(id)`; (2) `toggleVis` usava valor stale do closure: captura `newVisible` antes do `setCats` e envia o mesmo valor ao Firestore; (3) botão "Editar" apontava para `Editar Produto.html`; substituído por `EditCatModal` inline com nome, emoji e gradiente pré-populados que salva via `DB.updateCategoria()`. |
| 2026-06-05 | Limpeza de código: (1) `formatBRL(n)` criada em `shared.jsx` como função canônica de moeda (via `toLocaleString pt-BR`), exposta como `window.formatBRL`; `fmtBRL` em `data.jsx` vira alias; funções duplicadas (`brl`, `money`, `fmtBRL` local) removidas de `clientes-app.jsx`, `estoque-app.jsx`, `relatorios-app.jsx` e `order-detail-app.jsx`. (2) `TweaksPanel`/`useTweaks` removidos de `estoque-app.jsx`, `relatorios-app.jsx`, `configuracoes-app.jsx`, `categorias-app.jsx` e `order-detail-app.jsx`; `t.accent` substituído por `'#964904'` hardcoded. (3) `SharedTopBar` corrigido: badge de notificações "3" removido; avatar "JA" substituído por iniciais reais do Firebase Auth via `onAuthStateChanged`. |
| 2026-06-05 | Paginação real implementada em `pedidos-app.jsx`, `clientes-app.jsx` e `cupons-app.jsx`: `PAGE_SIZE = 20`, estado `page`, botões dinâmicos com `Array.from`, prev desabilitado na pág 1 / next na última, "Mostrando X–Y de Z resultados", reset de página ao trocar filtro/tab/sort. `clientes-app.jsx` também ganhou filtro real por status (Ativos/Inativos/Novos) e corrigiu referência stale `CLIENTS.length → paginated.length`. |
| 2026-06-05 | React trocado de development para production builds nos 12 HTMLs: `react.development.js` → `react.production.min.js`, `react-dom.development.js` → `react-dom.production.min.js`. Atributos `integrity` removidos junto (os hashes são específicos por arquivo — manter o hash do dev com a URL do prod causaria falha de SRI no browser). |
| 2026-06-05 | `app.jsx`: (1) `TopBar` local corrigido — avatar "JA" substituído por iniciais reais do Firebase Auth via `onAuthStateChanged`; badge fixo "3" removido do sino. (2) `TweaksPanel`/`useTweaks` removidos (limpeza pendente da sessão anterior); `t.accent` → `'#964904'` hardcoded. A `Sidebar` já tinha logout (`window.logout()`), avatar/e-mail via Firebase Auth e NAV_HREFS implementados desde 2026-06-01. |
| 2026-06-05 | Corrigida ordem de carregamento de scripts em todos os 12 HTMLs: `shared.jsx` movido para antes de `data.jsx` (posição 2 de 0-indexed). `Painel Admin.html` não carregava `shared.jsx` — adicionado. `data.jsx` corrigido: `fmtBRL` trocado de atribuição direta (`= window.formatBRL`) para função lazy (`(...args) => window.formatBRL(...args)`), evitando erro se `window.formatBRL` ainda não estiver definido no momento do carregamento. |
| 2026-06-05 | `app.jsx` e `pedidos-app.jsx`: exportação CSV implementada. `downloadCSV(filename, rows)` gera string CSV com aspas, BOM UTF-8 (`﻿`) para compatibilidade com Excel, Blob + `URL.createObjectURL` + link temporário. Produtos: Nome/Categoria/Preço/Estoque/Status/Visível a partir do state. Pedidos: ID/Cliente/Data/Total/Status a partir do state. Sem nova chamada ao Firestore. |
| 2026-06-05 | `shared.jsx` — `SharedSidebar`: badge em tempo real no item "Pedidos" via `firebase.firestore().collection('pedidos').where('status','==','Aguardando pagamento').onSnapshot(...)`. Estado `newOrders` atualizado automaticamente; listener cancelado no cleanup do `useEffect`. Badge usa mesmo estilo inline já existente no projeto. |
| 2026-06-05 | `dashboard-app.jsx`: `Promise.all([getPedidos, getClientes, getAlertasEstoque, getProdutos, getCupons])`. Helpers `parseDateBR`, `getWindowStart`, `buildChartData`, `computeDashMetrics` adicionados. Métricas (faturamento/pedidos/ticket/clientesAtivos) e gráfico de barras filtrados pelo período selecionado (7/30/90 dias). 7 e 30 dias: barras diárias; 90 dias: 13 barras semanais. `recent` ordenado por `createdAt.seconds` com fallback para `date`. Link de pedido recente corrigido para `?id=`. `TweaksPanel`/`useTweaks` removidos. `DB.getMetricasHoje()` substituído por cálculo local. |
| 2026-06-05 | `relatorios-app.jsx`: reescrito com dados reais do Firestore. `computeMetrics(orders, produtos, period)` filtra por período, calcula faturamento/ticket/descontos/frete, monta `daily[]` (um ponto por dia), `categories[]` (por cruzamento com catálogo) e `top5[]` (top 5 por receita). `DailyChart` refatorado para aceitar prop `data` (niceMax/peakIdx/xLabels dinâmicos). Botões de período ("Este mês", "Mês anterior", "Últimos 3 meses", "Este ano") conectados ao filtro real. `parseDateBR()` e `getPeriodBounds()` adicionados como helpers. |
| 2026-06-07 | `categorias-app.jsx`: suporte a subcategorias implementado. `firestoreToCat` passa a mapear `parentId`. `NewCatModal` recebe prop `cats`, expõe select "Categoria pai" (lista apenas categorias principais para evitar sub-sub-categorias) e inclui `parentId` no objeto enviado ao `onCreate`. `createCat` salva `parentId` no Firestore e no state local. Filtros "Principais" e "Subcategorias" conectados ao campo `parentId` via variável `filtered` (usada no grid e na contagem). `CatCard` exibe badge "SUBCATEGORIA" quando `c.parentId` está preenchido. |
| 2026-06-07 | `edit-app.jsx`: dropdowns de Categoria e Subcategoria conectados ao Firestore. Estado `dbCats` carregado via `DB.getCategorias()` em `useEffect`. `mainCats` filtra categorias sem `parentId`; `subCats` filtra pelo `category` selecionado. Select de Categoria usa `mainCats.map(c => c.id)` com `renderValue` por nome. Select de Subcategoria exibe `subCats` quando há itens ou mensagem contextual ("Selecione uma categoria primeiro" / "Nenhuma subcategoria cadastrada") quando vazio. Ao trocar categoria, `subcategory` é resetado. |
| 2026-06-07 | `categorias-app.jsx`: contagem de produtos por categoria corrigida — `c.count` do Firestore (sempre 0) substituído por cálculo dinâmico. Estado `dbProdutos` carregado via `DB.getProdutos()`. `catsWithCount` derivado cruza `cats` com `dbProdutos` (filtra `p.category === c.id`). Métricas "produtos catalogados", "categorias cadastradas", "visíveis no app" e "1ª categoria" passaram a usar `catsWithCount`. Grid e filtros Principais/Subcategorias também usam `catsWithCount`. Lógica de CRUD (`toggleVis`, `saveCat`, `deleteCat`, `createCat`) continua usando `cats`/`setCats` sem alteração. |
| 2026-06-07 | Dois bugs de subcategoria corrigidos: (1) `edit-app.jsx` — `setSubcategory(p.subcategory || '')` adicionado no useEffect de carregamento do produto, logo após `setCategory`, para restaurar a subcategoria ao editar um produto existente. (2) `categorias-app.jsx` — `catsWithCount` agora usa `p.subcategory === c.id` para categorias com `parentId` e `p.category === c.id` para categorias principais, corrigindo a contagem que sempre retornava 0 para subcategorias. |
| 2026-06-07 | `app.jsx`: campo `category` dos produtos armazena ID do Firestore — corrigida exibição, filtro, busca e CSV para resolver o nome real. Estado `dbCats` carregado via `DB.getCategorias()`. Mapa `catNameById` derivado de `dbCats`. Dropdown de filtro usa `catOptions` (nomes das categorias principais). Filtro por categoria resolve o ID via `dbCats.find(c => c.name === cat)?.id`. Busca usa `catNameById[r.category]` em vez de `r.category` direto. Célula da tabela exibe `catNameById[p.category] || p.category`. CSV exporta o nome resolvido. `catNameById` passado como prop para `ProductsTable`. `dbCats` adicionado às dependências do `useMemo`. |
| 2026-06-07 | `firestore.js` — `getProdutos`: adicionado campo `subcategory: d.subcategory || ''` ao objeto retornado no `.map`, logo após `category`. Campo estava ausente, causando perda do valor ao carregar produtos em componentes como `categorias-app.jsx` e `estoque-app.jsx`. |
| 2026-06-07 | `firestore.js` — `getProdutos`: adicionado campo `longDesc: d.longDesc || ''` ao objeto retornado no `.map`, logo após `description`. Campo estava ausente, causando perda da descrição completa do produto ao carregar para edição em `edit-app.jsx`. |
| 2026-06-07 | `firestore.js` — `getProdutos`: adicionados 10 campos faltantes ao `.map` (salvos por `edit-app.jsx` mas nunca lidos de volta): `producer`, `location`, `verified`, `featured`, `visible`, `allowReviews`, `meta`, `tags`, `minStock`, `variations`. Inseridos logo após `longDesc`. |
| 2026-06-07 | `edit-app.jsx`: adicionado `setLongDesc(p.longDesc || '')` no `useEffect` de carregamento do produto, logo após `setShortDesc`. Campo `longDesc` sempre aparecia vazio ao editar porque o estado não era populado com o valor do Firestore. |
| 2026-06-07 | `edit-app.jsx`: corrigidos campo SKU e minStock — (1) estado `sku`/`setSku` adicionado; (2) `setSku(p.sku \|\| '')` e `setMinStock(p.minStock != null ? String(p.minStock) : '5')` adicionados no useEffect de carregamento; (3) `sku: sku.trim()` adicionado ao objeto `data` do `handleSave`; (4) campo SKU no formulário passou de `value="QJ-001" readOnly` para editável via state; (5) header da página exibe `#{sku}` dinamicamente (oculto quando vazio). |
| 2026-06-07 | `app.jsx` — exportação CSV melhorada: (1) `downloadCSV` trocou `.join(',')` por `.join(';')` para compatibilidade com Excel BR; (2) `exportarProdutos` expandida para 13 colunas: SKU, Nome, Categoria, Subcategoria, Preço Normal, Preço Promocional, Estoque, Estoque Mínimo, Status, Visível, Destaque, Produtor, Localização — preços com vírgula decimal, subcategoria resolvida via `catNameById`. |
| 2026-06-07 | `firestore.js` + `edit-app.jsx`: data "Última atualização" corrigida — `getProdutos` passa a mapear `updatedAt` via `tsToDate`/`tsToTime`; `edit-app.jsx` ganha estado `updatedAt`, populado ao carregar o produto e atualizado localmente após salvar com sucesso; texto hardcoded "24 Mai 2026 às 14:32" substituído por valor dinâmico — exibe "Ainda não salvo" quando produto nunca foi salvo. |
| 2026-06-07 | `cupons-app.jsx`: 4 bugs de status/contagem corrigidos — (1) `expiresIn` em `firestoreToCouponCard` agora calculado dinamicamente a partir de `c.expires` (DD/MM/YYYY), eliminando dependência do campo estático salvo no Firestore; (2) `expired` passa a incluir cupons com data vencida (`isDateExpired`) além dos status `Expirado`/`Esgotado`; (3) `status` retornado inclui novo valor `'inativo'` para cupons com `c.status === 'Inativo'`; (4) `validTone` usa `expiresIn` calculado; (5) métrica `ativos` corrigida de `cupons.filter(status==='Ativo')` para `couponCards.filter(status==='ativo')`; (6) filtro `Desativados` corrigido — antes retornava todos os cupons, agora filtra `status === 'inativo'`; (7) badge no `CouponCard` exibe "Inativo" com `badge-gray` quando `status === 'inativo'`. |
| 2026-06-08 | `banners-app.jsx`: URL do Cloudinary em `uploadImagem` corrigida — `emporiominas` substituído por `dv62fwdtv` (mesmo cloud name usado em `storage.js`). |
| 2026-06-08 | `banners-app.jsx`: upload de imagem via Cloudinary adicionado ao `NewBannerModal` — estados `imageUrl`/`uploading`, função `uploadImagem` (XHR para `emporiominas` cloud com preset `emporio_unsigned`), campo de upload com prévia/remoção e nota de tamanho recomendado (1170 × 550 px — proporção 3:1) entre Subtítulo e Cor de fundo. `BannerPreview` passa a sobrepor a imagem com `opacity: 0.35` quando `b.imageUrl` está preenchido. `live` e `handleSave` incluem `imageUrl`. |
| 2026-06-08 | `banners-app.jsx`: `upload_preset` em `uploadImagem` corrigido de `'emporio_unsigned'` para `'emporio-produtos'`; adicionado `fd.append('folder', 'emporio-minas/banners')` para organizar uploads na pasta correta do Cloudinary. |
| 2026-06-08 | `banners-app.jsx` — `BannerPreview`: `opacity` da imagem corrigido de `0.35` para `1`. Elementos decorativos (textura e dois orbs) envolvidos em `{!b.imageUrl && ...}` para não sobrepor a foto quando há imagem. |
| 2026-06-08 | Tela de Banners integrada ao painel admin. (1) `icons.jsx`: adicionados `IconPhoto`, `IconLayers` e `IconGrip` (usados por `banners-app.jsx` e pela sidebar). (2) `firestore.js`: 4 funções adicionadas — `getBanners`, `addBanner`, `updateBanner`, `deleteBanner` — com CRUD na coleção `banners`, ordenado por `order`. Todas expostas via `window.DB`. (3) `data.jsx`: item `{ id:'banners', label:'Banners', Icon: IconPhoto }` adicionado ao `NAV` após Cupons. (4) `shared.jsx`: `banners: 'Banners.html'` adicionado ao `PAGE_HREFS`. (5) `banners-app.jsx`: `BANNER_LIST` hardcoded removido; estado inicial `useState([])` com `loading`; `useEffect` carrega via `DB.getBanners()`; `toggle`/`remove`/`create` chamam `DB.updateBanner`/`deleteBanner`/`addBanner` e recarregam lista; spinner de loading e empty state adicionados; `TweaksPanel`/`useTweaks` removidos; avatar dinâmico via Firebase Auth; campos do modal iniciam vazios. (6) `Banners.html`: viewport corrigido para `device-width`, Firebase + auth-guard + firestore adicionados, `responsive.css` incluído, React trocado para production builds, ordem de scripts padronizada. |
| 2026-06-08 | `banners-app.jsx`: campo "Produto vinculado" adicionado ao `NewBannerModal` — estados `produtos`/`productId`, `useEffect` carrega via `DB.getProdutos()`, select exibe nome + SKU (`p.name · #p.sku`) de cada produto, `productId` incluído no objeto enviado ao `onCreate`. Campo posicionado entre Subtítulo e Imagem do banner. |
| 2026-06-08 | `banners-app.jsx`: validação visual do campo Título no `NewBannerModal` — estado `erro` adicionado; `handleSave` exibe mensagem "O título é obrigatório" e interrompe o salvamento quando `title.trim()` está vazio; mensagem renderizada acima do botão "Salvar banner" com cor `#ba1a1a`. |
| 2026-06-08 | `banners-app.jsx`: botão "Editar" do `BannerCard` corrigido — antes chamava `onToggle` por engano; agora chama `onEdit(b)`. `BannerCard` ganhou prop `onEdit`. Estado `editing` adicionado no `App`; `BannerCard` recebe `onEdit={setEditing}`. Modal de edição (`{editing && <NewBannerModal ... initial={editing} />}`) persiste via `DB.updateBanner`. `NewBannerModal` aceita prop `initial` para pré-preencher todos os campos (badge, title, subtitle, order, active, imageUrl, productId, cor de fundo); título do modal muda para "Editar banner" quando `initial` está presente. |
| 2026-06-08 | `firestore.js` — `getBanners`: adicionados campos `imageUrl: d.imageUrl \|\| ''` e `productId: d.productId \|\| ''` ao objeto retornado no `.map`. Campos estavam ausentes, impedindo que imagem e produto vinculado fossem pré-preenchidos ao editar um banner. |
| 2026-06-08 | `banners-app.jsx`: título deixou de ser obrigatório quando há imagem — `handleSave` valida `!title.trim() && !imageUrl` (erro "Preencha o título ou adicione uma imagem"); asterisco vermelho removido do label Título; `disabled={saving \|\| !title.trim()}` simplificado para `disabled={saving}`. |
| 2026-06-08 | `banners-app.jsx` — `BannerPreview`: dots do carrossel envolvidos em `{!b.imageUrl && (...)}` para não aparecerem sobre a imagem quando `imageUrl` está preenchido. |
| 2026-06-08 | `edit-app.jsx`: sistema de variações substituído por modelo flexível. Estado `varType` adicionado (padrão `'peso'`). `useEffect` de carregamento popula `variations` e `varType` do Firestore. `handleSave` salva `variations` (filtradas por `label.trim()`) e `varType`. Bloco `<Field label="Variações disponíveis">` refeito: seletor de tipo (Peso / Unidade / Tamanho / Personalizado) com botões pill; lista dinâmica com campo label + campo preço (R$) + botão × por linha; botão "+ Adicionar variação" ao final. |
| 2026-06-29 | `dashboard-app.jsx`: ID do pedido truncado para últimos 6 dígitos com ellipsis; nome do cliente com overflow hidden para evitar sobreposição de texto na lista Pedidos Recentes. |
| 2026-06-29 | `cupons-app.jsx`: botão de ação do `CouponCard` corrigido — cupons inativos agora exibem botão "Reativar" (verde) em vez de "Desativar"; lógica ternária expandida para tratar três estados: expirado → Excluir, inativo → Reativar, ativo → Desativar com confirmação. |
| 2026-06-29 | `order-detail-app.jsx`: forma de pagamento deixou de ser hardcoded como PIX — `normalizeOrder` passa a ler `raw.paymentMethod`; helper `getPaymentInfo` resolve label/cor/abreviação para pix, cartão e boleto. |
| 2026-07-04 | `pedidos-app.jsx`: corrigida numeração dupla ##XXXXXX — lista e drawer agora exibem `o.number` (quando disponível, já inclui `#`) ou `#${últimos 6 dígitos do id}`, eliminando o `#` duplicado. |
| 2026-07-05 | `pedidos-app.jsx`: modal Retirada na Loja adicionado — botão "🏪 Retirada na Loja" no header abre modal onde admin digita código de 6 dígitos do pedido; `buscarPedidoRetirada()` chama `DB.getPedidos()` e localiza pelo ID completo, últimos 6 dígitos ou `o.number`; resultado exibe cliente/itens/total/status; botão "✅ Entregar pedido" chama `DB.updateStatusPedido()` e atualiza state local; botão "Ver detalhes" abre o `OrderDrawer` existente. |
| 2026-07-06 | `pedidos-app.jsx`: STEPS atualizado para incluir Pago como primeiro passo; `stepIdx` calculado via função que mapeia todos os status incluindo "Aguardando pagamento" e "Pago" para o índice 0; `STEPS_LABELS` com label multi-linha "Pagamento\nConfirmado"; `ORDER_STATUSES` em `data.jsx` atualizado com "Pago" logo após "Aguardando pagamento". |
| 2026-07-06 | `data.jsx`: `ORDER_STATUS_STYLE` atualizado — adicionadas entradas para `Pago` (verde) e `Pendente` (cinza); corrige badge sem cor para esses status. |
| 2026-07-06 | `configuracoes-app.jsx`: aba Frete e entrega implementada com formulário de dados do remetente (nome, CPF, telefone, email, endereço completo com busca por CEP via ViaCEP); dados salvos em `configuracoes/remetente` no Firestore via `DB.setConfiguracao()` — necessário para geração automática de etiquetas pelo Melhor Envio. `firestore.js`: `setConfiguracao(key, value)` adicionada — salva em `configuracoes/{key}` com merge e `updatedAt`; exposta via `window.DB`. |
| 2026-07-06 | `firestore.js`: `getConfiguracoes` reescrito para buscar todos os documentos da coleção `configuracoes` — doc `loja` fica flat no objeto, demais docs ficam como subchaves (`cfg.remetente`, etc.); resolve bug de dados do remetente não persistindo após reload. |
| 2026-07-06 | `pedidos-app.jsx`: botões de status movidos para o topo do drawer — agora aparecem imediatamente ao abrir o pedido sem precisar rolar a tela. |
| 2026-07-06 | `pedidos-app.jsx`: botão Gerar Etiqueta adicionado no drawer para pedidos Pago/Preparando — chama `/api/gerar-etiqueta`, salva tracking code e printUrl no Firestore, exibe código de rastreio e link de impressão PDF. |
| 2026-07-11 | `configuracoes-app.jsx`: aba Formas de pagamento implementada — controle de taxa de acréscimo para cartão de crédito (padrão 3%) e débito (1.5%), toggle para habilitar/desabilitar PIX/cartão/boleto, salva em DB.setConfiguracao('pagamento', {...}). |
| 2026-07-11 | `configuracoes-app.jsx`: PagamentoTab corrigida — useEffect aguarda DB e firebase estarem prontos antes de carregar configurações de pagamento. |
| 2026-07-20 | `order-detail-app.jsx`: removido token JWT hardcoded do Melhor Envio (código morto), exposto publicamente no arquivo estático. |
| 2026-07-20 | `order-detail-app.jsx`: corrigido crash do PrintModal — variável ORDER (escopo de App()) não era passada como prop, causando ReferenceError ao abrir o modal de impressão de etiqueta. Agora recebida via prop order. |
| 2026-07-20 | `configuracoes-app.jsx`: corrigidos 3 botões sem onClick — "salvar tudo" agora persiste dados gerais da loja via DB.saveConfiguracoes(); upload/remoção de logo implementados via Cloudinary (window.STORAGE), com feedback visual de loading e sucesso/erro em todos os três. Campo `logoUrl` adicionado ao doc `configuracoes/loja`. |
| 2026-07-20 | `shared.jsx`: logo da loja (logoUrl, salva em configuracoes/loja) agora exibida no topo da SharedSidebar, com fallback para o elemento visual original quando não configurada. |
| 2026-07-20 | `relatorios-app.jsx`: corrigidos 3 botões sem onClick — exportar CSV e exportar relatório completo agora geram arquivos reais via downloadCSV() (reaproveitada de outras páginas); exportar PDF implementado via window.print() com CSS de impressão dedicado (`@media print` em styles.css, oculta sidebar/topbar/botões via classe `.no-print`). |
| 2026-07-20 | `estoque-app.jsx`: corrigido botão "Exportar CSV" sem onClick — agora gera arquivo real via downloadCSV() com dados de estoque atualmente exibidos (Nome, SKU, Categoria, Estoque, Estoque mínimo, Valor unitário, Valor total, Status). |
| 2026-07-20 | `clientes-app.jsx`: corrigido botão "Exportar CSV" sem onClick — agora gera arquivo real via downloadCSV() com dados de clientes filtrados (Nome, E-mail, Telefone, Status, Total de pedidos, Data de cadastro). |
| 2026-07-20 | `clientes-app.jsx`: adicionada coluna "Total Gasto" (c.spent, formatada via formatBRL) ao CSV de exportação de clientes, entre Total de pedidos e Data de cadastro. |
| 2026-07-20 | Removido TweaksPanel/useTweaks residual de edit-app.jsx, clientes-app.jsx, cupons-app.jsx e editar-cupom-app.jsx — limpeza que havia ficado incompleta desde 2026-06-05. Valores de tema (t.xxx) substituídos pelos hex fixos da paleta oficial. |
| 2026-07-20 | cupons-app.jsx e editar-cupom-app.jsx: headers duplicados (com avatar falso "JA" e badge fixo "3") substituídos pelo componente compartilhado SharedTopBar, já usado nas demais páginas do painel. |
| 2026-07-20 | app.jsx: adicionada entrada "banners: 'Banners.html'" faltante em NAV_HREFS — o link de Banners na sidebar não funcionava quando o admin estava na página de Produtos. |
| 2026-07-20 | pedidos-app.jsx: delimitador do CSV exportado padronizado de vírgula (,) para ponto-e-vírgula (;), consistente com as demais páginas do painel (compatibilidade com Excel BR). |
| 2026-07-20 | estoque-app.jsx: removido padrão frágil window.stockItemsRef (dados agora passados via props para EntryModal); implementada paginação real (PAGE_SIZE=20), seguindo o mesmo padrão já usado em pedidos-app.jsx/clientes-app.jsx/cupons-app.jsx. |
| 2026-07-20 | shared.jsx: adicionado window.THEME com a cor primária centralizada (#964904); todas as ocorrências hardcoded dessa cor nos arquivos *-app.jsx (mais app.jsx e charts.jsx) substituídas por window.THEME.primary, facilitando manutenção futura da identidade visual. |
