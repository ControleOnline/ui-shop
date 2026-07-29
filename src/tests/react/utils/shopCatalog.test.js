const {jest} = require('@jest/globals');

jest.mock('@controleonline/ui-common/src/api', () => ({
  api: {
    fetch: jest.fn(),
  },
}));

const {
  getShopCategoryDescription,
  normalizeShopCollectionResponse,
} = require('@controleonline/ui-shop/src/react/utils/shopCatalog');
const {describe, expect, it} = global;

describe('shopCatalog public categories', () => {
  it('normalizes API Platform collection payloads', () => {
    expect(normalizeShopCollectionResponse({
      member: [{id: 1}],
      totalItems: 4,
    })).toEqual({
      items: [{id: 1}],
      totalItems: 4,
    });
  });

  it('uses only API description fields for category descriptions', () => {
    expect(getShopCategoryDescription({description: 'Oferta do dia'})).toBe('Oferta do dia');
    expect(getShopCategoryDescription({subtitle: 'Mais pedidos'})).toBe('Mais pedidos');
    expect(getShopCategoryDescription({category: 'Refeicoes'})).toBe('');
    expect(getShopCategoryDescription({productCategory: 'Combos'})).toBe('');
  });
});
