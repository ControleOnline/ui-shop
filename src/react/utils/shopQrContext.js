/**
 * Shop QR context — consume secure backend contract (T4 / order_qr_contexts).
 * Client never interprets internal IDs; only opaque token + public minimal context.
 */

export const QR_LINK_NONE = 'none';
export const QR_LINK_TABLE = 'table';
export const QR_LINK_TAB = 'tab';

export const QR_PURPOSE_SESSION = 'session';
export const QR_PURPOSE_PERMANENT = 'permanent';

/** Fulfillment types that require a delivery address. */
export const FULFILLMENT_REQUIRES_ADDRESS = new Set(['delivery', 'shipping']);

/** Fulfillment types allowed without address when context authorizes them. */
export const FULFILLMENT_NO_ADDRESS = new Set([
  'pickup',
  'counter',
  'dine_in',
  'local',
]);

const STORAGE_KEY = 'shop_qr_context';

export const normalizeQrToken = value => {
  const token = String(value || '').trim();
  return token || null;
};

export const isLinkType = value => {
  const link = String(value || '')
    .trim()
    .toLowerCase();
  return [QR_LINK_NONE, QR_LINK_TABLE, QR_LINK_TAB].includes(link);
};

export const requiresDeliveryAddress = fulfillmentType => {
  const type = String(fulfillmentType || '')
    .trim()
    .toLowerCase();
  if (!type) return true; // fail-closed: unknown → require address
  if (FULFILLMENT_REQUIRES_ADDRESS.has(type)) return true;
  if (FULFILLMENT_NO_ADDRESS.has(type)) return false;
  return true;
};

export const extractPublicQrContext = payload => {
  const data =
    payload?.data && typeof payload.data === 'object'
      ? payload.data
      : payload || {};

  return {
    purpose: String(data.purpose || data.Purpose || '').toLowerCase() || null,
    linkType: String(data.linkType || data.link_type || '')
      .trim()
      .toLowerCase() || null,
    externalCode:
      data.externalCode != null
        ? String(data.externalCode)
        : data.external_code != null
          ? String(data.external_code)
          : null,
    // Public flags only — never trust client-supplied authority fields
    recoverable: data.recoverable !== false,
    status: data.status || data.error || null,
  };
};

export const extractConsumeResult = payload => {
  const data =
    payload?.data && typeof payload.data === 'object'
      ? payload.data
      : payload?.result && typeof payload.result === 'object'
        ? payload.result
        : payload || {};

  const cartId =
    data.cartId ||
    data.cart_id ||
    data.cart?.id ||
    (typeof data.cart === 'string' ? data.cart : null);

  const orderId =
    data.orderId ||
    data.order_id ||
    data.order?.id ||
    (typeof data.order === 'string' ? data.order : null);

  return {
    cartId: cartId != null ? String(cartId) : null,
    orderId: orderId != null ? String(orderId) : null,
    linkType: String(data.linkType || data.link_type || '')
      .trim()
      .toLowerCase() || null,
    purpose: String(data.purpose || '').toLowerCase() || null,
    externalCode:
      data.externalCode != null
        ? String(data.externalCode)
        : data.external_code != null
          ? String(data.external_code)
          : null,
    mainOrderPresent: Boolean(
      data.hasMainOrder || data.mainOrder || data.main_order,
    ),
  };
};

export const readStoredQrContext = () => {
  if (typeof localStorage === 'undefined' || !localStorage?.getItem) {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const writeStoredQrContext = context => {
  if (typeof localStorage === 'undefined' || !localStorage?.setItem) {
    return;
  }
  try {
    if (!context) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // ignore quota / private mode
  }
};

export const clearStoredQrContext = () => writeStoredQrContext(null);

/**
 * Resolve opaque QR token via public endpoint.
 * Body only carries the token — never company/mainOrder from client.
 */
export async function resolveQrToken(api, token) {
  const normalized = normalizeQrToken(token);
  if (!normalized) {
    throw new Error('qr_token_missing');
  }

  const response = await api.fetch('order_qr_contexts/resolve', {
    method: 'POST',
    body: {token: normalized},
  });

  return extractPublicQrContext(response);
}

/**
 * Consume opaque QR token (idempotent cart/round creation on backend).
 * Client must not send authority fields (company, mainOrder, local, …).
 */
export async function consumeQrToken(api, token, {idempotencyKey} = {}) {
  const normalized = normalizeQrToken(token);
  if (!normalized) {
    throw new Error('qr_token_missing');
  }

  const body = {token: normalized};
  if (idempotencyKey) {
    body.idempotencyKey = String(idempotencyKey);
  }

  const response = await api.fetch('order_qr_contexts/consume', {
    method: 'POST',
    body,
  });

  return extractConsumeResult(response);
}

/**
 * Build a stable client-side idempotency key for the same token+session.
 */
export const buildQrIdempotencyKey = (token, salt = '') => {
  const t = normalizeQrToken(token) || '';
  const s = String(salt || '').trim();
  return `shop-qr:${t.slice(0, 16)}:${s}`.slice(0, 64);
};
