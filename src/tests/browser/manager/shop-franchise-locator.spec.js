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
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
});

const defaultCompany = {
  id: 3,
  '@id': '/people/3',
  name: 'Matriz',
  alias: 'MATRIZ',
  enabled: true,
  commercial_enabled: true,
  configs: {
    'shop-franchise-locator-enabled': '1',
    'shop-franchise-visible-company-ids': '[11,12]',
    'shop-franchise-address-category-ids': '[81]',
  },
  theme: {
    colors: {
      primary: '#6B3924',
      secondary: '#D9A441',
    },
  },
};

const franchiseDirectory = [
  {
    id: 11,
    '@id': '/people/11',
    name: 'Franquia Elegivel',
    alias: 'CENTRO',
    shopAddresses: [
      {
        id: 101,
        '@id': '/addresses/101',
        street: 'Rua A',
        number: '100',
        categories: [{id: 81, '@id': '/categories/81'}],
      },
    ],
  },
  {
    id: 12,
    '@id': '/people/12',
    name: 'Franquia Fora da Categoria',
    alias: 'BAIRRO',
    shopAddresses: [
      {
        id: 102,
        '@id': '/addresses/102',
        street: 'Rua B',
        number: '200',
        categories: [{id: 82, '@id': '/categories/82'}],
      },
    ],
  },
];

const setupFranchiseLocatorApi = async page => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error));

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({status: 204, headers: CORS_HEADERS, body: ''});
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
        body: JSON.stringify(defaultCompany),
      });
    }

    if (pathname === 'people/companies/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([defaultCompany])),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {...defaultCompany.configs}}),
      });
    }

    if (pathname.startsWith('shop/franchises')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(franchiseDirectory)),
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
      localStorage.setItem('config', JSON.stringify({language: 'pt-br'}));
      localStorage.setItem('app-type', 'SHOP');
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

  return {pageErrors};
};

test.describe('shop franchise locator browser smoke', () => {
  test('shows only franchises with an address in a selected map category', async ({
    page,
  }) => {
    const {pageErrors} = await setupFranchiseLocatorApi(page);

    await page.goto('/shop/franchises');

    await expect(page.getByText('CENTRO', {exact: true})).toBeVisible();
    await expect(page.getByText('BAIRRO', {exact: true})).toHaveCount(0);
    await expect(page.getByText('Escolha a franquia para comprar')).toBeVisible();
    expect(pageErrors.map(error => error.message)).toEqual([]);
  });
});
