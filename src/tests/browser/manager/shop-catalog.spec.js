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

const collection = member => ({
  member,
  totalItems: member.length,
});

const company = {
  id: 1,
  '@id': '/people/1',
  name: 'Empresa de Teste',
  alias: 'EMPRESA DE TESTE',
  enabled: true,
  commercial_enabled: true,
  configs: {
    'shop-sales-page-enabled': '1',
    'shop-bottom-bar-enabled': '0',
  },
  theme: {
    colors: {
      primary: '#6B3924',
      secondary: '#D9A441',
    },
  },
};

const categories = [
  {
    id: 10,
    '@id': '/categories/10',
    name: 'Utilidades',
    category: 'Utilidades',
    description: 'Produtos para a casa',
  },
];

const products = [
  {
    id: 381,
    '@id': '/product-showcases/381',
    product: 'Tesoura Aviação Eda Corte Reto',
    description: 'Produto de alta qualidade para teste.',
    price: 148.92,
    active: true,
    type: 'product',
    productFiles: [],
  },
];

const setupShopCatalogApi = async page => {
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error);
  });

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

    if (pathname === 'shop/categories') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(categories)),
      });
    }

    if (pathname === 'shop/categories/10') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(categories[0]),
      });
    }

    if (pathname === 'product-showcases/catalog') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(products)),
      });
    }

    if (pathname === 'cart') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({
          id: 900,
          '@id': '/orders/900',
          orderType: 'cart',
          status: 'cart',
          realStatus: 'cart',
          provider: '/people/1',
          client: '/people/1',
          orderProducts: [],
        }),
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
          people: '/people/7',
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
          id: 'web-shop',
          device: 'web-shop',
          type: 'WEB',
          appName: 'Browser Shop',
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

  return pageErrors;
};

test.describe('shop catalog browser smoke', () => {
  test('loads catalog products and keeps product detail open after click', async ({
    page,
  }) => {
    const pageErrors = await setupShopCatalogApi(page);

    await page.goto('/shop?store=categories&q=');

    await expect(page.getByText('Utilidades', {exact: true}).first()).toBeVisible();
    await expect(page.getByText('Tesoura Aviação Eda Corte Reto')).toBeVisible();

    await page.getByText('Tesoura Aviação Eda Corte Reto').click();

    await expect(page).toHaveURL(/\/shop\/product\/381/);
    await expect(page.getByText('Detalhes do produto')).toBeVisible();
    await expect(page.getByText('Tesoura Aviação Eda Corte Reto')).toBeVisible();
    expect(pageErrors.map(error => error.message)).toEqual([]);
  });
});
