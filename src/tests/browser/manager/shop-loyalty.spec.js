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
  summary: {},
});

const createCompany = (configs = {}) => ({
  id: 3,
  name: 'Gyros',
  alias: 'GYROS',
  panel_enabled: true,
  enabled: true,
  commercial_enabled: true,
  theme: {
    colors: {
      primary: '#0EA5E9',
      secondary: '#F97316',
    },
  },
  configs,
});

const createProduct = (id, product) => ({
  id,
  '@id': `/products/${id}`,
  product,
  name: product,
  active: true,
  description: product,
});

const createCardSnapshot = ({
  id,
  requiredSales,
  stampIds = [],
  closed = false,
  provider = {id: 3, name: 'Gyros', alias: 'GYROS'},
}) => ({
  provider,
  card: {
    id,
    '@id': `/orders/${id}`,
    orderType: 'fidelity',
    status: closed ? 'closed' : 'open',
    realStatus: closed ? 'closed' : 'open',
    comments: 'Cartao fidelidade',
  },
  requiredSales,
  stamps: stampIds.map(stampId => ({
    id: stampId,
    '@id': `/orders/${stampId}`,
    orderType: 'sale',
    status: 'closed',
    realStatus: 'closed',
    comments: `Pedido ${stampId}`,
  })),
});

const createSnapshotResponse = (clientId, providerId, cards, summary = {}) => ({
  clientId,
  providerId,
  count: cards.length,
  member: cards,
  'hydra:member': cards,
  totalItems: cards.length,
  'hydra:totalItems': cards.length,
  summary: {
    historyRequested: Boolean(summary.historyRequested),
    historyEmpty: Boolean(summary.historyEmpty),
  },
});

/*
 * @agents This smoke verifies the loyalty page renders the backend snapshot,
 * keeps the empty state stable, distinguishes "no open card" from "no history found",
 * and switches to history without rebuilding stamps locally.
 */
const mockShopLoyaltyApi = async (
  page,
  {
    currentCards = [],
    historyCards = [],
  } = {},
) => {
  const companyConfigs = {
    'shop-sales-page-enabled': '0',
    'shop-loyalty-coupons-enabled': '1',
    'shop-loyalty-product-ids': '[30]',
    'shop-loyalty-required-sales': '3',
    'shop-loyalty-gift-product-id': '40',
  };
  const company = createCompany(companyConfigs);
  const savedCartRequests = [];

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

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
        body: ':root { --primary: #0ea5e9; --secondary: #f97316; }',
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

    if (pathname === 'people/companies/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([company])),
      });
    }

    if (pathname === 'people/company/default') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {...companyConfigs}}),
      });
    }

    if (pathname === 'cart') {
      savedCartRequests.push({
        url: request.url(),
        params: Object.fromEntries(url.searchParams.entries()),
      });

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({
          id: 900,
          '@id': '/orders/900',
          orderType: 'cart',
          status: 'cart',
          realStatus: 'cart',
          provider: '/people/3',
          client: '/people/3',
          orderProducts: [],
        }),
      });
    }

    if (pathname === 'orders/fidelityById/7') {
      const isHistory = url.searchParams.get('history') === '1';
      const cards = isHistory ? historyCards : currentCards;

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(
          createSnapshotResponse(3, 3, cards, {
            historyRequested: isHistory,
            historyEmpty: isHistory && cards.length === 0,
          }),
        ),
      });
    }

    if (pathname === 'products/30') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createProduct(30, 'Hamburguer participante')),
      });
    }

    if (pathname === 'products/40') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createProduct(40, 'Brinde promocional')),
      });
    }

    if (pathname.startsWith('products/')) {
      const productId = Number(pathname.split('/').pop());

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createProduct(productId, `Produto ${productId}`)),
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
      const setLocalStorageItem = (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Some initial documents do not expose storage.
        }
      };

      setLocalStorageItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
          name: 'Test User',
          realname: 'Test User',
          username: 'tester',
          roles: ['ROLE_SUPER'],
        }),
      );
      setLocalStorageItem('config', JSON.stringify({language: 'pt-br'}));
      setLocalStorageItem('app-type', 'MANAGER');
      setLocalStorageItem(
        'device',
        JSON.stringify({
          id: 'web-manager',
          device: 'web-manager',
          type: 'WEB',
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

  return {
    company,
    savedCartRequests,
  };
};

test.describe('shop loyalty browser smoke', () => {
  test('shows the empty current card state when no open card exists', async ({
    page,
  }) => {
    await mockShopLoyaltyApi(page);

    await page.goto('/shop/loyalty');

    await expect(page.getByText('Cartão atual', {exact: true})).toBeVisible();
    await expect(page.getByText('Nenhum cartão aberto foi encontrado para este cliente.')).toBeVisible();
    await expect(page.getByText('Hamburguer participante')).toBeVisible();
    await expect(page.getByText('Brinde promocional')).toBeVisible();
  });

  test('shows one active loyalty card per franchise without a selector', async ({
    page,
  }) => {
    await mockShopLoyaltyApi(page, {
      currentCards: [
        createCardSnapshot({
          id: 600,
          requiredSales: 5,
          stampIds: [701, 702, 703],
          provider: {
            id: 31458,
            name: 'S. Cozer Ltda',
            alias: 'MT - SORRISO (6)',
          },
        }),
        createCardSnapshot({
          id: 500,
          requiredSales: 5,
          stampIds: [801],
          provider: {
            id: 2,
            name: 'J V R II Estetica Automotiva Ltda',
            alias: 'MT - CUIABÁ - JD. PETRÓPOLIS (2)',
          },
        }),
      ],
    });

    const snapshotRequestPromise = page.waitForRequest(request =>
      request.url().includes('/orders/fidelityById/7'),
    );

    await page.goto('/shop/loyalty');
    await snapshotRequestPromise;

    await expect(page.getByText('MT - SORRISO (6)', {exact: true})).toBeVisible();
    await expect(
      page.getByText('MT - CUIABÁ - JD. PETRÓPOLIS (2)', {exact: true}),
    ).toBeVisible();
    await expect(page.getByText('Cartão #600', {exact: true})).toBeVisible();
    await expect(page.getByText('Cartão #500', {exact: true})).toBeVisible();
    await expect(page.getByText('3 / 5', {exact: true})).toBeVisible();
    await expect(page.getByText('1 / 5', {exact: true})).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveCount(0);
  });

  test('switches to history without rebuilding the snapshot locally', async ({
    page,
  }) => {
    await mockShopLoyaltyApi(page, {
      currentCards: [
        createCardSnapshot({
          id: 600,
          requiredSales: 3,
          stampIds: [701, 702],
          provider: {id: 31458, alias: 'MT - SORRISO'},
        }),
      ],
      historyCards: [
        createCardSnapshot({
          id: 600,
          requiredSales: 3,
          stampIds: [701, 702],
          provider: {id: 31458, alias: 'MT - SORRISO'},
        }),
        createCardSnapshot({
          id: 500,
          requiredSales: 3,
          stampIds: [601, 602, 603],
          closed: true,
          provider: {id: 31458, alias: 'MT - SORRISO'},
        }),
      ],
    });

    await page.goto('/shop/loyalty');

    await expect(page.getByText('Cartão atual', {exact: true})).toBeVisible();
    await expect(page.getByText('Cartão #600')).toBeVisible();
    await expect(page.getByText('2 / 3')).toBeVisible();
    await expect(page.getByText('Faltam 1 pedido(s) para liberar o brinde.')).toBeVisible();

    const historyRequestPromise = page.waitForRequest(request => {
      return (
        request.url().includes('/orders/fidelityById/7') &&
        request.url().includes('history=1')
      );
    });

    await page.getByText('Ver últimos', {exact: true}).click();
    await historyRequestPromise;

    await expect(page.getByText('Últimos cartões', {exact: true})).toBeVisible();
    await expect(page.getByText('Cartão #500')).toBeVisible();
    await expect(page.getByText('MT - SORRISO', {exact: true})).toHaveCount(1);
    await expect(
      page.getByText('1 franquia(s), 2 cartão(ões) carregado(s)', {exact: true}),
    ).toBeVisible();
    await expect(page.getByText('Ver atual', {exact: true})).toBeVisible();
  });

  test('shows the no-history empty state when the history snapshot is empty', async ({
    page,
  }) => {
    await mockShopLoyaltyApi(page, {
      currentCards: [
        createCardSnapshot({
          id: 600,
          requiredSales: 3,
          stampIds: [701],
        }),
      ],
      historyCards: [],
    });

    await page.goto('/shop/loyalty');

    await expect(page.getByText('Cartão #600')).toBeVisible();

    const historyRequestPromise = page.waitForRequest(request => {
      return (
        request.url().includes('/orders/fidelityById/7') &&
        request.url().includes('history=1')
      );
    });

    await page.getByText('Ver últimos', {exact: true}).click();
    await historyRequestPromise;

    await expect(
      page.getByText('Nenhum histórico encontrado para este cliente.'),
    ).toBeVisible();
  });
});
