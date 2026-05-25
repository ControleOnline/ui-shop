const STORAGE_PREFIX = 'shop-anonymous-cart:';
const EVENT_NAME = 'shop-anonymous-cart-changed';

const normalizeId = value =>
  String(value?.id || value?.['@id'] || value || '')
    .replace(/\D+/g, '')
    .trim();

const resolveProductName = product =>
  String(product?.product || product?.name || product?.title || '').trim();

const resolveProductPrice = product =>
  Number(product?.price ?? product?.unitPrice ?? product?.value ?? 0) || 0;

const buildStorageKey = providerId => `${STORAGE_PREFIX}${normalizeId(providerId)}`;

const readJson = key => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeCart = (providerId, cart) => {
  const key = buildStorageKey(providerId);
  localStorage.setItem(key, JSON.stringify(cart));
  window.dispatchEvent(new window.CustomEvent(EVENT_NAME, {detail: {providerId}}));
};

export const readAnonymousCart = providerId => {
  const normalizedProviderId = normalizeId(providerId);
  if (!normalizedProviderId || typeof localStorage === 'undefined') {
    return null;
  }

  const stored = readJson(buildStorageKey(normalizedProviderId));
  const items = Array.isArray(stored.items) ? stored.items.filter(Boolean) : [];
  const orderProducts = items
    .map(item => {
      const productId = normalizeId(item.product?.id || item.product?.['@id']);
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || item.product?.price || 0);

      if (!productId || quantity <= 0) {
        return null;
      }

      return {
        id: `anonymous-${productId}`,
        anonymous: true,
        product: {
          ...item.product,
          id: Number(productId),
          '@id': item.product?.['@id'] || `/products/${productId}`,
        },
        quantity,
        price,
        total: price * quantity,
      };
    })
    .filter(Boolean);

  const price = orderProducts.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  return {
    id: null,
    anonymous: true,
    providerId: normalizedProviderId,
    orderProducts,
    price,
  };
};

export const updateAnonymousCartProduct = ({providerId, product, quantity}) => {
  const normalizedProviderId = normalizeId(providerId);
  const productId = normalizeId(product);

  if (!normalizedProviderId || !productId || typeof localStorage === 'undefined') {
    return readAnonymousCart(normalizedProviderId);
  }

  const current = readJson(buildStorageKey(normalizedProviderId));
  const items = Array.isArray(current.items) ? current.items.filter(Boolean) : [];
  const nextQuantity = Math.max(0, Number(quantity || 0));
  const productIri = product?.['@id'] || `/products/${productId}`;
  const nextItems = items.filter(
    item => normalizeId(item.product?.id || item.product?.['@id']) !== productId,
  );

  if (nextQuantity > 0) {
    nextItems.push({
      product: {
        id: Number(productId),
        '@id': productIri,
        product: resolveProductName(product),
        name: resolveProductName(product),
        price: resolveProductPrice(product),
        productFiles: product?.productFiles || [],
        type: product?.type || '',
      },
      quantity: nextQuantity,
      price: resolveProductPrice(product),
    });
  }

  writeCart(normalizedProviderId, {
    providerId: normalizedProviderId,
    updatedAt: new Date().toISOString(),
    items: nextItems,
  });

  return readAnonymousCart(normalizedProviderId);
};

export const clearAnonymousCart = providerId => {
  const normalizedProviderId = normalizeId(providerId);
  if (!normalizedProviderId || typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(buildStorageKey(normalizedProviderId));
  window.dispatchEvent(new window.CustomEvent(EVENT_NAME, {detail: {providerId}}));
};

export const subscribeAnonymousCart = callback => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = event => callback(event?.detail || {});
  window.addEventListener(EVENT_NAME, listener);

  return () => window.removeEventListener(EVENT_NAME, listener);
};
