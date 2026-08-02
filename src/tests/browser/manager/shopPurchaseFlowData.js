const collection = (member = []) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary: {},
});

const normalizeId = value =>
  String(value?.id || value?.['@id'] || value || '').replace(/\D+/g, '');

const productIri = id => `/products/${id}`;
const orderProductIri = id => `/order_products/${id}`;

const createProduct = (id, product, price, type = 'product', extra = {}) => ({
  id,
  '@id': productIri(id),
  product,
  name: product,
  description: `${product} para smoke de compra`,
  type,
  price,
  active: true,
  productFiles: [],
  ...extra,
});

const simpleProduct = createProduct(101, 'Produto simples smoke', 10);
const customProduct = createProduct(202, 'Produto customizado smoke', 20, 'custom', {
  hasCustomizationGroups: true,
});
const addonProduct = createProduct(303, 'Adicional smoke', 3);

const company = {
  id: 1,
  '@id': '/people/1',
  name: 'Loja Smoke',
  alias: 'LOJA SMOKE',
  enabled: true,
  panel_enabled: true,
  commercial_enabled: true,
  configs: {
    'shop-sales-page-enabled': '1',
    'shop-bottom-bar-enabled': '0',
    'asaas-key': 'test-asaas-key',
    'asaas-receiver-pix-key': 'test-pix-key',
    'order-charge-on-delivery-enabled': '1',
    'payment-type-ids': '[11,12,13]',
  },
  theme: {colors: {primary: '#6B3924', secondary: '#D9A441'}},
};

const user = {
  id: 7,
  '@id': '/people/7',
  name: 'Cliente Smoke',
  alias: 'CLIENTE SMOKE',
  active: 1,
  enabled: true,
};

const createOrderProduct = ({id, product, quantity, components = []}) => ({
  id,
  '@id': orderProductIri(id),
  order: '/orders/72651',
  product,
  quantity,
  price: Number(product.price || 0),
  total:
    (Number(product.price || 0) +
      components.reduce((sum, item) => sum + Number(item.price || 0), 0)) *
    Number(quantity || 0),
  orderProductComponents: components.map(component => ({
    id: component.id,
    '@id': orderProductIri(component.id),
    order: '/orders/72651',
    parentProduct: orderProductIri(id),
    product: component.product,
    productGroup: component.productGroup,
    quantity: component.quantity,
    price: component.price,
  })),
});

const createState = () => ({
  requests: [],
  payments: [],
  nextOrderProductId: 900,
  nextAddressId: 500,
  orderProducts: [],
  addresses: [],
  invoices: [],
  order: {
    id: 72651,
    '@id': '/orders/72651',
    orderType: 'cart',
    status: 'cart',
    realStatus: 'cart',
    provider: company,
    client: user,
    price: 0,
    payable: 0,
    orderProducts: [],
  },
});

const refreshOrderTotals = state => {
  const total = state.orderProducts.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0,
  );
  state.order = {
    ...state.order,
    price: total,
    payable: total,
    orderProducts: state.orderProducts,
  };
};

const saveSimpleQuantity = (state, payload) => {
  const quantity = Number(payload.quantity || 0);
  const targetId = normalizeId(payload.id);
  const productId = normalizeId(payload.product);
  let row = state.orderProducts.find(item =>
    targetId
      ? normalizeId(item.id) === targetId
      : normalizeId(item.product) === productId,
  );

  if (quantity <= 0) {
    state.orderProducts = state.orderProducts.filter(item =>
      targetId
        ? normalizeId(item.id) !== targetId
        : normalizeId(item.product) !== productId,
    );
    refreshOrderTotals(state);
    return null;
  }

  if (!row) {
    row = createOrderProduct({
      id: state.nextOrderProductId++,
      product: productId === String(customProduct.id) ? customProduct : simpleProduct,
      quantity,
    });
    state.orderProducts.push(row);
  }

  row.quantity = quantity;
  row.total = Number(row.price || 0) * quantity;
  refreshOrderTotals(state);
  return row;
};

const addCustomizedProduct = (state, payloadRows) => {
  const payload = Array.isArray(payloadRows) ? payloadRows[0] : payloadRows;
  const quantity = Number(payload?.quantity || 1);
  const components = (Array.isArray(payload?.sub_products)
    ? payload.sub_products
    : []
  ).map(subProduct => ({
    id: state.nextOrderProductId++,
    product: addonProduct,
    productGroup: {
      id: 401,
      '@id': '/product_groups/401',
      productGroup: 'Complementos smoke',
    },
    quantity: Number(subProduct.quantity || 1),
    price: Number(addonProduct.price || 0),
  }));

  state.orderProducts.push(
    createOrderProduct({
      id: state.nextOrderProductId++,
      product: customProduct,
      quantity,
      components,
    }),
  );
  refreshOrderTotals(state);
  return state.order;
};

module.exports = {
  addonProduct,
  addCustomizedProduct,
  collection,
  company,
  customProduct,
  createState,
  normalizeId,
  refreshOrderTotals,
  saveSimpleQuantity,
  simpleProduct,
  user,
};
