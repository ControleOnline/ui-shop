import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {app_type} from '@appType';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import {
  normalizeNumericId,
  readShopSessionClientId,
} from '@controleonline/ui-shop/src/react/utils/shopSession';
import {readStoredQrContext} from '@controleonline/ui-shop/src/react/utils/shopQrContext';

let cartRequestInFlight = null;
let cartRequestKey = '';
let cartRequestAt = 0;

export default function useShopCart({autoRefresh = false} = {}) {
  const cartStore = useStore('cart');
  const cartActions = cartStore.actions;
  const cartGetters = cartStore.getters;
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;
  const {
    clearSalesCompanySelection,
    isLoading: isLoadingSalesCompanies,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    selectSalesCompany,
  } = useShopSalesCompany();
  const providerId = normalizeNumericId(salesCompany?.id || defaultCompany?.id);
  const cartId = cartGetters.item?.id || '';
  const cartExternalCode = String(
    cartGetters.item?.externalCode || cartGetters.item?.external_code || '',
  ).trim();
  const qrContext = readStoredQrContext();
  const qrExternalCode = String(qrContext?.externalCode || '').trim();
  const effectiveExternalCode = cartExternalCode || qrExternalCode;

  const refreshCart = useCallback(() => {
    const appType = String(app_type || '').toUpperCase();
    const isShopApp = appType === 'SHOP';

    const currentCompanyId = normalizeNumericId(currentCompany?.id);
    const sessionClientId = readShopSessionClientId();
    const clientId = isShopApp
      ? currentCompanyId || sessionClientId
      : currentCompanyId;

    if (requiresCompanySelection || !providerId) {
      if (cartId) {
        cartActions.setItem({});
      }
      return Promise.resolve(null);
    }

    const key = clientId ? `${providerId}:${clientId}` : `anonymous:${providerId}`;
    const now = Date.now();

    if (cartRequestInFlight?.key === key) {
      return cartRequestInFlight.promise;
    }

    if (cartRequestKey === key && now - cartRequestAt < 1200) {
      return Promise.resolve(cartGetters.item || null);
    }

    const promise = (clientId
      ? cartActions.discoveryCart({
          provider: providerId,
          client: clientId,
        })
      : cartActions.discoveryAnonymousCart({
          provider: providerId,
          externalCode: effectiveExternalCode,
        }))
      .finally(() => {
        if (cartRequestInFlight?.key === key) {
          cartRequestInFlight = null;
          cartRequestKey = key;
          cartRequestAt = Date.now();
        }
      });

    cartRequestInFlight = {key, promise};
    return promise;
  }, [
    cartActions,
    cartExternalCode,
    cartId,
    currentCompany?.id,
    providerId,
    requiresCompanySelection,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!autoRefresh) return;
      refreshCart();
    }, [autoRefresh, refreshCart]),
  );

  return {
    cart: cartGetters.item || {},
    cartGetters,
    clearSalesCompanySelection,
    currentCompany,
    defaultCompany,
    isLoadingSalesCompanies,
    refreshCart,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    selectSalesCompany,
  };
}
