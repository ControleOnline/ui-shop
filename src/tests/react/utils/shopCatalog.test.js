const {jest} = require('@jest/globals');
const {beforeEach, describe, expect, it} = global;

jest.mock('@controleonline/ui-common/src/api', () => ({
  api: {
    fetch: jest.fn(),
  },
}));

const {api} = require('@controleonline/ui-common/src/api');
const {
  fetchShopCollectionPage,
  SHOP_CATEGORIES_RESOURCE,
} = require('@controleonline/ui-shop/src/react/utils/shopCatalog');

describe('shopCatalog public categories', () => {
  beforeEach(() => {
    api.fetch.mockReset();
  });

  it('uses the dedicated anonymous Shop resource', async () => {
    api.fetch.mockResolvedValue({member: [], totalItems: 0});

    await fetchShopCollectionPage(SHOP_CATEGORIES_RESOURCE, {
      company: 21,
      context: 'products',
    });

    expect(api.fetch).toHaveBeenCalledWith('shop/categories', {
      params: {
        company: 21,
        context: 'products',
        itemsPerPage: 30,
      },
    });
  });
});
