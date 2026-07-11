import {
  buildLoyaltyDisplayCards,
  hasEligibleLoyaltyProduct,
} from '@controleonline/ui-shop/src/react/utils/shopLoyalty';

const buildSale = ({
  client = 7,
  id,
  mainOrderId = null,
  orderDate = '2026-07-11T10:00:00Z',
  orderProducts,
  payer = null,
  productId = 99,
  comment = '',
  total = 25,
  status = 'paid',
  realStatus = 'paid',
} = {}) => ({
  id,
  client: {id: client},
  payer: {id: payer || client},
  mainOrderId,
  orderDate,
  orderProducts:
    orderProducts ||
    [
      {
        comment,
        product: {id: productId},
        total,
      },
    ],
  status: {
    realStatus,
    status,
  },
});

describe('shopLoyalty', () => {
  it('builds a synthetic loyalty card from paid eligible client sales', () => {
    const cards = buildLoyaltyDisplayCards({
      cards: [],
      clientId: 7,
      loyaltyProductIds: [99],
      requiredSales: 3,
      sales: [
        buildSale({id: 1, orderDate: '2026-07-01T10:00:00Z'}),
        buildSale({id: 2, orderDate: '2026-07-02T10:00:00Z'}),
      ],
    });

    expect(cards).toEqual([
      expect.objectContaining({
        card: null,
        requiredSales: 3,
        stamps: [
          expect.objectContaining({id: 1}),
          expect.objectContaining({id: 2}),
        ],
      }),
    ]);
  });

  it('supplements the current loyalty card with orphan eligible sales from the same client', () => {
    const linkedSale = buildSale({
      id: 1,
      mainOrderId: 500,
      orderDate: '2026-07-01T10:00:00Z',
    });
    const cards = buildLoyaltyDisplayCards({
      cards: [
        {
          card: {id: 500},
          requiredSales: 3,
          stamps: [linkedSale],
        },
      ],
      clientId: 7,
      loyaltyProductIds: [99],
      requiredSales: 3,
      sales: [
        buildSale({id: 2, orderDate: '2026-07-02T10:00:00Z'}),
        buildSale({id: 2, orderDate: '2026-07-02T10:00:00Z'}),
        buildSale({id: 3, client: 8, payer: 8}),
        buildSale({id: 4, comment: 'Brinde fidelidade'}),
        buildSale({id: 5, productId: 100}),
      ],
    });

    expect(cards).toHaveLength(1);
    expect(cards[0].stamps.map(order => order.id)).toEqual([1, 2]);
  });

  it('requires a configured loyalty product with positive value to stamp the card', () => {
    expect(
      hasEligibleLoyaltyProduct(
        buildSale({id: 1, productId: 99, total: 0}),
        [99],
      ),
    ).toBe(false);
    expect(
      hasEligibleLoyaltyProduct(
        buildSale({id: 2, productId: 99, total: 25}),
        [99],
      ),
    ).toBe(true);
  });

  it('treats a paid client sale as eligible when the collection payload omits orderProducts', () => {
    expect(
      hasEligibleLoyaltyProduct(
        buildSale({id: 3, orderProducts: []}),
        [99],
      ),
    ).toBe(true);
  });
});
