const {expect, test} = require('playwright/test');
const packageJson = require('../../../../../../../package.json');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');

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

const textHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'text/css; charset=utf-8',
});

const collection = (member = []) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
});

const baseCompany = {
  id: 1,
  '@id': '/people/1',
  name: 'Jagunços',
  alias: 'JAGUNÇOS',
  enabled: true,
  commercial_enabled: true,
  configs: {
    'shop-sales-page-enabled': '1',
    'shop-bottom-bar-enabled': '0',
    'asaas-key': 'test-asaas-key',
    'asaas-receiver-pix-key': 'test-pix-key',
  },
  theme: {
    colors: {
      primary: '#6B3924',
      secondary: '#D9A441',
    },
  },
};

const walletPaymentTypes = [
  {
    id: 11,
    '@id': '/wallet_payment_types/11',
    paymentCode: 'pix',
    paymentType: {
      id: 21,
      '@id': '/payment_types/21',
      paymentType: 'Pix',
    },
    wallet: {
      id: 31,
      '@id': '/wallets/31',
      wallet: 'Pix',
    },
  },
];

const cashWalletPaymentType = {
  id: 12,
  '@id': '/wallet_payment_types/12',
  paymentCode: '',
  paymentType: {
    id: 22,
    '@id': '/payment_types/22',
    paymentType: 'Dinheiro',
  },
  wallet: {
    id: 32,
    '@id': '/wallets/32',
    wallet: 'Dinheiro',
  },
};

const setupCheckoutApi = async (page, options = {}) => {
  const apiRequests = [];
  const pageErrors = [];
  const company = {
    ...baseCompany,
    configs: {
      ...baseCompany.configs,
      ...(options.companyConfigs || {}),
    },
  };
  const cartResponse = {
    id: 72651,
    '@id': '/orders/72651',
    orderType: 'cart',
    status: 'cart',
    realStatus: 'cart',
    provider: '/people/1',
    client: '/people/1',
    price: 174.6,
    orderProducts: [
      {
        id: 1,
        quantity: 4,
      },
    ],
    ...(options.cart || {}),
  };
  const walletPaymentTypeItems =
    options.walletPaymentTypes || walletPaymentTypes;
  const addresses = options.addresses || [];
  const deviceConfigs = options.deviceConfigs || [];
  const invoices = [];

  page.on('pageerror', error => {
    pageErrors.push(error);
  });

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method !== 'OPTIONS') {
      apiRequests.push(`${pathname}?${url.searchParams.toString()}`);
    }

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
        body: '',
      });
    }

    if (pathname === 'themes-colors.css') {
      return route.fulfill({
        status: 200,
        headers: textHeaders(),
        body: ':root { --primary: #6b3924; --secondary: #d9a441; }',
      });
    }

    if (pathname === 'runtime/ip') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({ip: '127.0.0.1'}),
      });
    }

    if (pathname === 'menus-people') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({modules: {}}),
      });
    }

    if (pathname === 'people/company/default') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'people/companies/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([company])),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {...company.configs}}),
      });
    }

    if (pathname === 'cart' || pathname === 'anonymous-cart') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(cartResponse),
      });
    }

    if (pathname === 'wallet_payment_types') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(walletPaymentTypeItems)),
      });
    }

    if (pathname === 'card') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([])),
      });
    }

    if (pathname === 'statuses') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(
          collection([
            {
              id: 91,
              status: 'Aguardando pagamento',
              realStatus: 'pending',
              context: 'invoice',
            },
          ]),
        ),
      });
    }

    if (pathname === 'invoices' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(invoices)),
      });
    }

    if (pathname === 'invoices' && method === 'POST') {
      const payload = request.postDataJSON();
      const invoice = {
        id: 802,
        '@id': '/invoices/802',
        status: {
          id: 91,
          '@id': '/statuses/91',
          status: 'Aguardando pagamento',
          realStatus: 'pending',
        },
        ...payload,
      };
      invoices.unshift(invoice);
      return route.fulfill({
        status: 201,
        headers: jsonHeaders(),
        body: JSON.stringify(invoice),
      });
    }

    if (pathname === 'addresses') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(addresses)),
      });
    }

    if (pathname === 'device_configs' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(deviceConfigs)),
      });
    }

    if (pathname === 'device_configs' && method === 'POST') {
      const payload = request.postDataJSON();
      const deviceConfig = {
        ...(deviceConfigs[0] || {}),
        id: deviceConfigs[0]?.id || 501,
        '@id': deviceConfigs[0]?.['@id'] || '/device_configs/501',
        ...payload,
      };
      return route.fulfill({
        status: 201,
        headers: jsonHeaders(),
        body: JSON.stringify(deviceConfig),
      });
    }

    if (pathname === 'orders/72651/confirm' && method === 'POST') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({
          errno: 0,
          order: {...cartResponse, orderType: 'sale'},
        }),
      });
    }

    if (pathname === 'orders/72651/logistic') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({quotes: []}),
      });
    }

    if (pathname === 'orders/72651/logistic/quote') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({quotes: []}),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({appVersion}) => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/1',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 1,
          name: 'Test User',
          realname: 'Test User',
          username: 'tester',
          roles: ['ROLE_SUPER'],
        }),
      );
      localStorage.setItem('config', JSON.stringify({language: 'pt-br'}));
      localStorage.setItem('app-type', 'MANAGER');
      localStorage.setItem(
        'device',
        JSON.stringify({
          id: 'web-7',
          device: 'web-7',
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

  return {apiRequests, pageErrors};
};

test.describe('checkout browser smoke', () => {
  test('loads checkout with a single payment discovery cycle', async ({
    page,
  }) => {
    const {apiRequests, pageErrors} = await setupCheckoutApi(page);

    await page.goto('/shop/checkout');

    await expect(page.getByText('CHECKOUT', {exact: true})).toBeVisible();
    await expect(page.getByText('Pedido #72651')).toBeVisible();
    await page.waitForTimeout(500);

    const walletRequests = apiRequests.filter(pathname =>
      pathname.startsWith('wallet_payment_types?'),
    );
    expect(walletRequests).toHaveLength(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('statuses?')),
    ).toHaveLength(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('addresses?')),
    ).toHaveLength(0);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('invoices?')),
    ).toHaveLength(1);
    expect(pageErrors.map(error => error.message)).toEqual([]);
  });

  test('confirms charge on delivery without repeating checkout discovery', async ({
    page,
  }) => {
    const {apiRequests, pageErrors} = await setupCheckoutApi(page, {
      companyConfigs: {
        'order-charge-on-delivery-enabled': '1',
        'payment-type-ids': '[12]',
      },
      cart: {
        addressDestination: {
          id: 101,
          '@id': '/addresses/101',
          street: 'Rua Teste',
          number: 10,
        },
      },
      walletPaymentTypes: [cashWalletPaymentType],
      deviceConfigs: [
        {
          id: 501,
          '@id': '/device_configs/501',
          people: '/people/1',
          type: 'MANAGER',
          device: {
            id: 7,
            device: 'web-7',
            type: 'MANAGER',
          },
          configs: {
            'payment-type-ids': '[12]',
          },
        },
      ],
      addresses: [
        {
          id: 101,
          '@id': '/addresses/101',
          street: 'Rua Teste',
          number: 10,
          city: 'Sao Paulo',
          state: 'SP',
          country: 'BR',
          cep: '01001000',
        },
      ],
    });

    await page.goto('/shop/checkout');

    await expect(page.getByText('Pedido #72651')).toBeVisible();
    await page.getByText('Cobrar na entrega').last().click();
    await expect(page.getByText('Dinheiro na entrega')).toBeVisible();
    await page.getByText('Confirmar').click();
    await page.waitForURL('**/orders/my/id/72651', {timeout: 10000});

    expect(
      apiRequests.filter(pathname =>
        pathname.startsWith('wallet_payment_types?'),
      ),
    ).toHaveLength(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('statuses?')),
    ).toHaveLength(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('addresses?')).length,
    ).toBeLessThanOrEqual(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('invoices?')),
    ).toHaveLength(2);
    expect(
      apiRequests.filter(pathname => pathname === 'invoices?'),
    ).toHaveLength(1);
    expect(
      apiRequests.filter(pathname => pathname.startsWith('orders/72651/confirm?')),
    ).toHaveLength(1);
    expect(pageErrors.map(error => error.message)).toEqual([]);
  });
});
