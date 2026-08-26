const packageJson = require('../../../../../../../package.json');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');
const {
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
} = require('./shopPurchaseFlowData');

const APP_VERSION = packageJson?.version || '1.0.0';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const fulfillJson = (route, body, status = 200) =>
  route.fulfill({status, headers: jsonHeaders(), body: JSON.stringify(body)});

const fulfillOptions = route =>
  route.fulfill({status: 204, headers: CORS_HEADERS, body: ''});

const setupShopPurchaseApi = async page => {
  const state = createState();
  const products = [
    simpleProduct,
    customProduct,
    addonProduct,
    nestedAddonProduct,
    nestedSeasoningProduct,
  ];

  page.on('pageerror', error => {
    state.requests.push(`pageerror:${error.message}`);
  });

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();
    const fulfill = (body, status = 200) => fulfillJson(route, body, status);

    if (method !== 'OPTIONS') state.requests.push(`${method} ${pathname}`);
    if (method === 'OPTIONS') return fulfillOptions(route);
    if (pathname === 'themes-colors.css') {
      return route.fulfill({
        status: 200,
        headers: {...CORS_HEADERS, 'content-type': 'text/css; charset=utf-8'},
        body: ':root { --primary: #6b3924; --secondary: #d9a441; }',
      });
    }

    if (pathname === 'runtime/ip') return fulfill({ip: '127.0.0.1'});
    if (pathname === 'menus-people') return fulfill({modules: {}});
    if (pathname === 'people/company/default') return fulfill(company);
    if (pathname === 'people/companies/my') return fulfill(collection([company]));
    if (pathname === 'people/7') return fulfill(user);
    if (pathname === 'configs/discovery-configs') {
      return fulfill({configs: {...company.configs}});
    }

    if (pathname === 'token' && method === 'POST') {
      return fulfill({
        id: 7,
        people: '/people/7',
        api_key: 'test-api-key',
        token: 'test-api-key',
        active: 1,
        mycompany: 1,
        name: user.name,
        realname: user.name,
        username: 'cliente.smoke@example.test',
        roles: ['ROLE_CLIENT'],
      });
    }

    if (pathname === 'shop/categories') {
      return fulfill(
        collection([
          {
            id: 10,
            '@id': '/categories/10',
            name: 'Smoke',
            category: 'Smoke',
            description: 'Categoria de teste',
          },
        ]),
      );
    }

    if (pathname === 'product-showcases/catalog') {
      const requestedId = url.searchParams.get('id');
      const rows = requestedId
        ? products.filter(product => String(product.id) === String(requestedId))
        : products;
      return fulfill(collection(rows));
    }

    if (pathname === 'product_groups') {
      const requestedProduct = normalizeId(url.searchParams.get('product'));
      return fulfill(
        requestedProduct === String(customProduct.id)
          ? collection([
              {
                id: 401,
                '@id': '/product_groups/401',
                productGroup: 'Complementos smoke',
                minimum: 1,
                maximum: 1,
                priceCalculation: 'sum',
              },
            ])
          : requestedProduct === String(nestedAddonProduct.id)
            ? collection([{
                id: 402,
                '@id': '/product_groups/402',
                productGroup: 'Escolha o tempero smoke',
                required: true,
                minimum: 1,
                maximum: 1,
                priceCalculation: 'sum',
              }])
          : collection([]),
      );
    }

    if (pathname === 'product_group_products') {
      const requestedGroup = normalizeId(url.searchParams.get('productGroup'));
      return fulfill(
        requestedGroup === '402'
          ? collection([{
              id: 502,
              '@id': '/product_group_products/502',
              productGroup: '/product_groups/402',
              productChild: nestedSeasoningProduct,
              product: nestedSeasoningProduct,
              productType: 'component',
              quantity: 1,
              price: nestedSeasoningProduct.price,
            }])
          : collection([
          {
            id: 501,
            '@id': '/product_group_products/501',
            productGroup: '/product_groups/401',
            productChild: addonProduct,
            product: addonProduct,
            productType: 'component',
            quantity: 1,
            price: addonProduct.price,
          },
          {
            id: 503,
            '@id': '/product_group_products/503',
            productGroup: '/product_groups/401',
            productChild: nestedAddonProduct,
            product: nestedAddonProduct,
            productType: 'component',
            quantity: 1,
            price: nestedAddonProduct.price,
          },
        ]),
      );
    }

    if (pathname === 'products') return fulfill(collection([addonProduct]));
    if (pathname === `products/${addonProduct.id}`) return fulfill(addonProduct);
    if (pathname === `products/${simpleProduct.id}`) return fulfill(simpleProduct);
    if (pathname === `products/${customProduct.id}`) return fulfill(customProduct);

    if (pathname === 'cart' || pathname === 'anonymous-cart') {
      refreshOrderTotals(state);
      return fulfill(state.order);
    }
    if (pathname === 'order_products' && method === 'GET') {
      return fulfill(collection(state.orderProducts));
    }
    if (pathname === 'order_products' && method === 'POST') {
      return fulfill(saveSimpleQuantity(state, request.postDataJSON()), 201);
    }

    const orderProductMatch = pathname.match(/^order_products\/(\d+)$/);
    if (orderProductMatch && method === 'PUT') {
      return fulfill(
        saveSimpleQuantity(state, {
          ...request.postDataJSON(),
          id: orderProductMatch[1],
        }),
      );
    }
    if (orderProductMatch && method === 'DELETE') {
      removeOrderProductTree(state, orderProductMatch[1]);
      return fulfill({});
    }

    if (pathname === 'orders/72651/add-products' && method === 'PUT') {
      state.lastAddProductsPayload = request.postDataJSON();
      return fulfill(addCustomizedProduct(state, state.lastAddProductsPayload));
    }
    if (pathname === 'orders/72651' && method === 'GET') {
      refreshOrderTotals(state);
      return fulfill(state.order);
    }
    if (pathname === 'orders/72651' && (method === 'PUT' || method === 'PATCH')) {
      state.order = {...state.order, ...request.postDataJSON()};
      return fulfill(state.order);
    }
    if (pathname === 'orders/72651/confirm' && method === 'POST') {
      state.order = {...state.order, orderType: 'sale', status: 'sale'};
      return fulfill({errno: 0, order: state.order});
    }
    if (pathname === 'orders/72651/logistic') return fulfill({quotes: []});
    if (pathname === 'orders/72651/logistic/quote') return fulfill({quotes: []});

    if (pathname === 'addresses' && method === 'GET') {
      return fulfill(collection(state.addresses));
    }
    if (pathname === 'addresses' && method === 'POST') {
      const id = state.nextAddressId++;
      const address = {id, '@id': `/addresses/${id}`, people: '/people/7', ...request.postDataJSON()};
      state.addresses.push(address);
      return fulfill(address, 201);
    }
    const addressMatch = pathname.match(/^addresses\/(\d+)$/);
    if (addressMatch && method === 'PUT') {
      const index = state.addresses.findIndex(
        address => String(address.id) === String(addressMatch[1]),
      );
      state.addresses[index] = {
        ...(state.addresses[index] || {id: Number(addressMatch[1])}),
        ...request.postDataJSON(),
      };
      return fulfill(state.addresses[index]);
    }
    if (addressMatch && method === 'DELETE') {
      state.addresses = state.addresses.filter(
        address => String(address.id) !== String(addressMatch[1]),
      );
      return fulfill({});
    }

    if (pathname === 'wallet_payment_types') {
      return fulfill(
        collection([
          {
            id: 11,
            '@id': '/wallet_payment_types/11',
            paymentCode: 'pix',
            paymentType: {id: 21, '@id': '/payment_types/21', paymentType: 'Pix'},
            wallet: {id: 31, '@id': '/wallets/31', wallet: 'Pix'},
          },
          {
            id: 12,
            '@id': '/wallet_payment_types/12',
            paymentCode: 'credit',
            paymentType: {id: 22, '@id': '/payment_types/22', paymentType: 'Cartao'},
            wallet: {id: 32, '@id': '/wallets/32', wallet: 'Cartao'},
          },
          {
            id: 13,
            '@id': '/wallet_payment_types/13',
            paymentCode: '',
            paymentType: {id: 23, '@id': '/payment_types/23', paymentType: 'Dinheiro'},
            wallet: {id: 33, '@id': '/wallets/33', wallet: 'Dinheiro'},
          },
        ]),
      );
    }

    if (pathname === 'cards') {
      return fulfill(
        collection([
          {
            id: 701,
            '@id': '/cards/701',
            type: 'credit',
            number_group_1: '4111',
            number_group_4: '1111',
            name: 'Cliente Smoke',
          },
        ]),
      );
    }
    if (pathname === 'displays' || pathname.startsWith('displays')) {
      return fulfill(
        collection([
          {id: 2, display: 'Conferencia smoke', displayType: 'conference'},
        ]),
      );
    }

    if (pathname === 'statuses') {
      return fulfill(
        collection([
          {
            id: 91,
            '@id': '/statuses/91',
            status: 'Aguardando pagamento',
            realStatus: 'pending',
            context: 'invoice',
          },
          {
            id: 93,
            '@id': '/statuses/93',
            status: 'Conference',
            realStatus: 'conference',
            context: 'order',
          },
          {
            id: 94,
            '@id': '/statuses/94',
            status: 'Ready',
            realStatus: 'ready',
            context: 'order',
          },
        ]),
      );
    }
    if (pathname === 'invoices' && method === 'GET') return fulfill(collection(state.invoices));
    if (pathname === 'invoices' && method === 'POST') {
      const id = 800 + state.invoices.length;
      const invoice = {
        id,
        '@id': `/invoices/${id}`,
        status: {
          id: 91,
          '@id': '/statuses/91',
          status: 'Aguardando pagamento',
          realStatus: 'pending',
        },
        ...request.postDataJSON(),
      };
      state.invoices.unshift(invoice);
      return fulfill(invoice, 201);
    }

    const pixMatch = pathname.match(/^asaas\/([^/]+)\/pix$/);
    if (pixMatch && method === 'POST') {
      state.payments.push(`pix:${pixMatch[1]}`);
      return fulfill({member: {payload: '000201SMOKEPIX', encodedImage: ''}});
    }
    const cardMatch = pathname.match(/^asaas\/([^/]+)\/card$/);
    if (cardMatch && method === 'POST') {
      state.payments.push(`card:${cardMatch[1]}`);
      return fulfill({member: {status: 'paid'}});
    }

    return fulfill(collection([]));
  });

  await page.addInitScript(
    ({appVersion}) => {
      localStorage.setItem('config', JSON.stringify({language: 'pt-br'}));
      localStorage.setItem('app-type', 'MANAGER');
      localStorage.setItem(
        'device',
        JSON.stringify({
          id: 'web-shop-smoke',
          device: 'web-shop-smoke',
          type: 'MANAGER',
          appName: 'Browser Manager',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
    },
    {appVersion: APP_VERSION},
  );

  return state;
};

const browserApi = (page, path, {method = 'GET', body} = {}) =>
  page.evaluate(
    async ({apiOrigin, path: requestPath, method: requestMethod, body: payload}) => {
      const response = await fetch(`${apiOrigin}/${requestPath}`, {
        method: requestMethod,
        headers: {'content-type': 'application/json'},
        body: payload === undefined ? undefined : JSON.stringify(payload),
      });
      return response.json();
    },
    {apiOrigin: API_ORIGIN, path, method, body},
  );

module.exports = {browserApi, setupShopPurchaseApi};
