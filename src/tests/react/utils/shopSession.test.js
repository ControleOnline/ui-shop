import {
  normalizeNumericId,
  resolveShopAuthenticatedPeopleId,
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

  it('uses the authenticated people id for customer loyalty', () => {
    expect(
      resolveShopAuthenticatedPeopleId({
        mycompany: '/people/88',
        people: '/people/44',
      }),
    ).toBe(44);
    expect(resolveShopAuthenticatedPeopleId({people: {id: 45}})).toBe(45);
  });

  it('normalizes mixed id values into numbers', () => {
    expect(normalizeNumericId('abc-123')).toBe(123);
    expect(normalizeNumericId(null)).toBe(null);
  });
});
