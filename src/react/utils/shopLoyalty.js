const LOYALTY_GIFT_COMMENT = 'Brinde fidelidade';

export const normalizeLoyaltyEntityId = value => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return normalizeLoyaltyEntityId(value?.['@id'] || value?.id);
  }

  const normalized = String(value).replace(/\D+/g, '').trim();
  return normalized ? Number(normalized) : null;
};

export const resolveOrderMainOrderId = order =>
  normalizeLoyaltyEntityId(
    order?.mainOrderId || order?.mainOrder?.id || order?.mainOrder?.['@id'],
  );

export const isPaidLoyaltySaleOrder = order => {
  const status = String(order?.status?.status || '').trim().toLowerCase();
  const realStatus = String(order?.status?.realStatus || '')
    .trim()
    .toLowerCase();

  return status === 'paid' || realStatus === 'paid' || realStatus === 'closed';
};

export const isLoyaltyGiftComment = comment =>
  String(comment || '').trim() === LOYALTY_GIFT_COMMENT;

export const orderBelongsToLoyaltyClient = (order, clientId) => {
  const normalizedClientId = normalizeLoyaltyEntityId(clientId);
  if (!normalizedClientId) {
    return false;
  }

  return (
    normalizeLoyaltyEntityId(order?.client) === normalizedClientId ||
    normalizeLoyaltyEntityId(order?.payer) === normalizedClientId
  );
};

export const hasEligibleLoyaltyProduct = (order, loyaltyProductIds = []) => {
  const eligibleProductIds = new Set(
    (Array.isArray(loyaltyProductIds) ? loyaltyProductIds : [])
      .map(normalizeLoyaltyEntityId)
      .filter(Boolean),
  );

  if (eligibleProductIds.size === 0) {
    return false;
  }

  const orderProducts = Array.isArray(order?.orderProducts)
    ? order.orderProducts
    : [];

  // The loyalty page reads orders from the collection payload, which often
  // omits orderProducts. In that case, a paid sale linked to the client still
  // needs to show up as a completed stamp.
  if (orderProducts.length === 0) {
    return true;
  }

  return orderProducts.some(orderProduct => {
    if (orderProduct?.orderProduct) {
      return false;
    }

    const productId = normalizeLoyaltyEntityId(orderProduct?.product);
    const total = Number(orderProduct?.total || 0);

    return (
      productId !== null &&
      eligibleProductIds.has(productId) &&
      total > 0 &&
      !isLoyaltyGiftComment(orderProduct?.comment)
    );
  });
};

export const dedupeLoyaltyOrders = orders => {
  const seen = new Set();

  return (Array.isArray(orders) ? orders : []).filter(order => {
    const orderId = normalizeLoyaltyEntityId(order);
    const key =
      orderId !== null
        ? `id:${orderId}`
        : `fallback:${order?.orderDate || ''}:${order?.price || ''}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const sortOrdersByDateAscending = (left, right) =>
  new Date(left?.orderDate || 0).getTime() -
  new Date(right?.orderDate || 0).getTime();

const buildSyntheticLoyaltyCards = ({
  requiredSales,
  sales,
  showHistory = false,
}) => {
  const normalizedRequiredSales = Math.max(
    0,
    Math.trunc(Number(requiredSales || 0) || 0),
  );
  if (normalizedRequiredSales < 1 || sales.length === 0) {
    return [];
  }

  const chunks = [];
  for (let index = 0; index < sales.length; index += normalizedRequiredSales) {
    chunks.push(sales.slice(index, index + normalizedRequiredSales));
  }

  const syntheticCards = chunks.map((stamps, index) => ({
    card: null,
    requiredSales: normalizedRequiredSales,
    stamps,
    syntheticKey: `loyalty-fallback-${index + 1}`,
  }));

  if (showHistory) {
    return [...syntheticCards].reverse();
  }

  return syntheticCards.length > 0
    ? [syntheticCards[syntheticCards.length - 1]]
    : [];
};

export const buildLoyaltyDisplayCards = ({
  cards = [],
  clientId,
  loyaltyProductIds = [],
  requiredSales,
  sales = [],
  showHistory = false,
}) => {
  const normalizedCards = (Array.isArray(cards) ? cards : []).map(card => ({
    ...card,
    stamps: [...(Array.isArray(card?.stamps) ? card.stamps : [])].sort(
      sortOrdersByDateAscending,
    ),
  }));
  const fallbackSales = dedupeLoyaltyOrders(sales)
    .filter(order => orderBelongsToLoyaltyClient(order, clientId))
    .filter(order => resolveOrderMainOrderId(order) === null)
    .filter(isPaidLoyaltySaleOrder)
    .filter(order => hasEligibleLoyaltyProduct(order, loyaltyProductIds))
    .sort(sortOrdersByDateAscending);

  if (normalizedCards.length === 0) {
    return buildSyntheticLoyaltyCards({
      requiredSales,
      sales: fallbackSales,
      showHistory,
    });
  }

  if (fallbackSales.length === 0) {
    return normalizedCards;
  }

  const currentCard = normalizedCards[0];
  const currentRequiredSales = Math.max(
    0,
    Math.trunc(Number(currentCard?.requiredSales || requiredSales || 0) || 0),
  );
  const currentStamps = Array.isArray(currentCard?.stamps)
    ? currentCard.stamps
    : [];
  let remainingFallbackSales = fallbackSales;
  const availableSlots = Math.max(currentRequiredSales - currentStamps.length, 0);
  const appendedFallbackSales = availableSlots
    ? remainingFallbackSales.slice(0, availableSlots)
    : [];
  if (appendedFallbackSales.length > 0) {
    remainingFallbackSales = remainingFallbackSales.slice(
      appendedFallbackSales.length,
    );
  }

  const updatedCards =
    currentRequiredSales > 0 && appendedFallbackSales.length > 0
      ? [
          {
            ...currentCard,
            stamps: [...currentStamps, ...appendedFallbackSales].sort(
              sortOrdersByDateAscending,
            ),
          },
          ...normalizedCards.slice(1),
        ]
      : normalizedCards;

  const syntheticFallbackCards = buildSyntheticLoyaltyCards({
    requiredSales: currentRequiredSales,
    sales: remainingFallbackSales,
    showHistory,
  });

  if (syntheticFallbackCards.length === 0) {
    return updatedCards;
  }

  if (showHistory) {
    return [...syntheticFallbackCards, ...updatedCards];
  }

  return syntheticFallbackCards;
};
