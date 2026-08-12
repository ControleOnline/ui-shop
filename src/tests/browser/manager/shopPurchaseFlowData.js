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
const nestedAddonProduct = createProduct(
  304,
  'Batata smoke personalizavel',
  0,
  'custom',
  {hasCustomizationGroups: true},
);
const nestedSeasoningProduct = createProduct(305, 'Tempero smoke', 1);

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
  lastAddProductsPayload: null,
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
  const total = state.orderProducts
    .filter(row => !row?.orderProduct)
    .reduce(
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

const removeOrderProductTree = (state, orderProductId) => {
  const removedIds = new Set([normalizeId(orderProductId)]);
  let foundDescendant = true;

  while (foundDescendant) {
    foundDescendant = false;
    state.orderProducts.forEach(item => {
      const itemId = normalizeId(item?.id || item?.['@id']);
      const parentId = normalizeId(
        item?.orderProduct || item?.order_product,
      );
      if (
        itemId &&
        parentId &&
        removedIds.has(parentId) &&
        !removedIds.has(itemId)
      ) {
        removedIds.add(itemId);
        foundDescendant = true;
      }
    });
  }

  state.orderProducts = state.orderProducts.filter(
    item => !removedIds.has(normalizeId(item?.id || item?.['@id'])),
  );
  refreshOrderTotals(state);
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
    const removedRoot = row || state.orderProducts.find(
      item => normalizeId(item.product) === productId,
    );
    if (removedRoot) {
      removeOrderProductTree(state, removedRoot.id || removedRoot['@id']);
    }
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
  const root = createOrderProduct({
    id: state.nextOrderProductId++,
    product: customProduct,
    quantity,
  });
  state.orderProducts.push(root);

  const productsById = new Map([
    [String(addonProduct.id), addonProduct],
    [String(nestedAddonProduct.id), nestedAddonProduct],
    [String(nestedSeasoningProduct.id), nestedSeasoningProduct],
  ]);
  const groupsById = {
    401: {
      id: 401,
      '@id': '/product_groups/401',
      productGroup: 'Complementos smoke',
      required: true,
      minimum: 1,
    },
    402: {
      id: 402,
      '@id': '/product_groups/402',
      productGroup: 'Escolha o tempero smoke',
      required: true,
      minimum: 1,
    },
  };

  const appendChildren = (parent, childPayloads) => {
    parent.orderProductComponents = (Array.isArray(childPayloads)
      ? childPayloads
      : []
    ).map(childPayload => {
      const product = productsById.get(normalizeId(childPayload.product));
      const groupId = normalizeId(childPayload.productGroup);
      const child = {
        id: state.nextOrderProductId++,
        '@id': orderProductIri(state.nextOrderProductId - 1),
        order: '/orders/72651',
        orderProduct: orderProductIri(parent.id),
        parentProduct: productIri(parent.product.id),
        product,
        productGroup: groupsById[groupId],
        quantity: Number(childPayload.quantity || 1),
        price: Number(product?.price || 0),
        total:
          Number(product?.price || 0) * Number(childPayload.quantity || 1),
        showInParentQueue: normalizeId(product) === String(addonProduct.id),
        orderProductComponents: [],
      };
      appendChildren(child, childPayload.sub_products);
      child.price += child.orderProductComponents.reduce(
        (sum, component) => sum + Number(component.price || 0),
        0,
      );
      child.total = child.price * child.quantity;
      state.orderProducts.push(child);
      return child;
    });
  };

  appendChildren(root, payload?.sub_products);
  root.price = Number(customProduct.price || 0) + root.orderProductComponents.reduce(
    (sum, component) => sum + Number(component.price || 0),
    0,
  );
  root.total = root.price * root.quantity;
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
  nestedAddonProduct,
  nestedSeasoningProduct,
  refreshOrderTotals,
  removeOrderProductTree,
  saveSimpleQuantity,
  simpleProduct,
  user,
};
