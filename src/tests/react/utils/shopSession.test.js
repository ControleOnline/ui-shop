import {
  normalizeNumericId,
  resolveShopSessionClientId,
} from '@controleonline/ui-shop/src/react/utils/shopSession';

describe('shopSession', () => {
  it('prefers the selected company id from session when available', () => {
    expect(
      resolveShopSessionClientId({
        mycompany: '/people/88',
        people: '/people/44',
      }),
    ).toBe(88);
  });

  it('falls back to the authenticated people id when no company is selected', () => {
    expect(
      resolveShopSessionClientId({
        people: '/people/44',
      }),
    ).toBe(44);
  });

  it('normalizes mixed id values into numbers', () => {
    expect(normalizeNumericId('abc-123')).toBe(123);
    expect(normalizeNumericId(null)).toBe(null);
  });
});
