// data.jsx — Empório Coisas de Minas
// Dados reais vêm do Firestore via window.DB.
// Este arquivo contém apenas: enums, opções de filtro, constantes de navegação e helpers.
// Arrays de dados (produtos, pedidos, etc.) ficam SEMPRE VAZIOS — nunca use como fallback.

const PRODUCTS = []; // dados reais: DB.getProdutos()

const CATEGORIES = ['Todas as categorias','Queijos','Cafés','Doces','Embutidos','Bebidas','Conservas','Pães','Mel e Derivados'];
const STATUSES = ['Todos os status','Ativo','Esgotado','Inativo'];
const SORTS = ['Mais recentes','Nome A-Z','Nome Z-A','Maior preço','Menor preço','Maior estoque','Menor estoque'];

const NAV = [
  { id:'dashboard',     label:'Dashboard',     Icon: IconHome },
  { id:'pedidos',       label:'Pedidos',       Icon: IconOrders },
  { id:'produtos',      label:'Produtos',      Icon: IconProduct },
  { id:'categorias',    label:'Categorias',    Icon: IconFolder },
  { id:'estoque',       label:'Estoque',       Icon: IconStock },
  { id:'clientes',      label:'Clientes',      Icon: IconUsers },
  { id:'cupons',        label:'Cupons',        Icon: IconTicket },
  { id:'banners',       label:'Banners',       Icon: IconPhoto },
  { id:'relatorios',    label:'Relatórios',    Icon: IconChart },
  { id:'configuracoes', label:'Configurações', Icon: IconSettings },
];

const NOTIFICATIONS = []; // notificações reais virão do Firestore futuramente

const fmtBRL = (...args) => window.formatBRL(...args);

const ORDERS = []; // dados reais: DB.getPedidos()

const ORDER_STATUSES = ['Aguardando pagamento','Pago','Preparando','Em trânsito','Entregue','Cancelado'];

const ORDER_STATUS_STYLE = {
  'Aguardando pagamento': { cls:'badge-gray',    dot:'#87726e' },
  'Pendente':             { cls:'badge-gray',    dot:'#87726e' },
  'Pago':                 { cls:'badge-success', dot:'#2e7d32' },
  'Preparando':           { cls:'badge-warn',    dot:'#f57c00' },
  'Em trânsito':          { cls:'badge-info',    dot:'#3949ab' },
  'Entregue':             { cls:'badge-success', dot:'#2e7d32' },
  'Cancelado':            { cls:'badge-error',   dot:'#ba1a1a' },
};

const CUSTOMERS = []; // dados reais: DB.getClientes()
const COUPONS = [];   // dados reais: DB.getCupons()

const SALES_7D = [];    // dados reais: calculados a partir de DB.getPedidos()
const STOCK_ALERTS = []; // dados reais: DB.getAlertasEstoque()

Object.assign(window, {
  PRODUCTS, CATEGORIES, STATUSES, SORTS, NAV, NOTIFICATIONS, fmtBRL,
  ORDERS, ORDER_STATUSES, ORDER_STATUS_STYLE, CUSTOMERS, COUPONS,
  SALES_7D, STOCK_ALERTS,
});
