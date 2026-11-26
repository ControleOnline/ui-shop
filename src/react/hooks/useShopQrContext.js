import {useCallback, useEffect, useState} from 'react';
import {api} from '@controleonline/ui-common/src/api';
import {
  buildQrIdempotencyKey,
  clearStoredQrContext,
  consumeQrToken,
  normalizeQrToken,
  readStoredQrContext,
  resolveQrToken,
  writeStoredQrContext,
} from '@controleonline/ui-shop/src/react/utils/shopQrContext';

/**
 * Manages Shop QR session lifecycle: resolve → consume → persist public context.
 * Never trusts client-supplied mainOrder / company / local.
 */
export default function useShopQrContext() {
  const [context, setContext] = useState(() => readStoredQrContext());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (context) {
      writeStoredQrContext(context);
    }
  }, [context]);

  const clear = useCallback(() => {
    clearStoredQrContext();
    setContext(null);
    setError(null);
  }, []);

  const activateToken = useCallback(async rawToken => {
    const token = normalizeQrToken(rawToken);
    if (!token) {
      setError('qr_token_missing');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Resolve — public minimal context (no internal IDs)
      const publicContext = await resolveQrToken(api, token);

      if (
        publicContext.status === 'expired' ||
        publicContext.status === 'revoked' ||
        publicContext.status === 'invalid'
      ) {
        setError(publicContext.status || 'qr_invalid');
        setLoading(false);
        return null;
      }

      // 2) Consume — backend creates/reuses cart or child round idempotently
      const idempotencyKey = buildQrIdempotencyKey(token, 'shop');
      const consumeResult = await consumeQrToken(api, token, {idempotencyKey});

      const next = {
        tokenFingerprint: token.slice(0, 8),
        resolvedAt: new Date().toISOString(),
        purpose: publicContext.purpose || consumeResult.purpose,
        linkType: publicContext.linkType || consumeResult.linkType,
        externalCode:
          publicContext.externalCode || consumeResult.externalCode || null,
        cartId: consumeResult.cartId,
        orderId: consumeResult.orderId,
        mainOrderPresent: Boolean(consumeResult.mainOrderPresent),
        recoverable: publicContext.recoverable !== false,
      };

      setContext(next);
      writeStoredQrContext(next);
      setLoading(false);
      return next;
    } catch (err) {
      const message =
        err?.message ||
        err?.body?.detail ||
        err?.body?.['hydra:description'] ||
        'qr_resolve_failed';
      setError(String(message));
      setLoading(false);
      return null;
    }
  }, []);

  return {
    context,
    loading,
    error,
    activateToken,
    clear,
    hasActiveContext: Boolean(context?.cartId || context?.linkType),
  };
}
