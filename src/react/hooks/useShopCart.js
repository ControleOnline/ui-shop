import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {env} from '@env';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';

let cartRequestInFlight = null;
let cartRequestKey = '';
let cartRequestAt = 0;

const normalizeId = value => {
  const clean = String(value || '').replace(/\D/g, '');
  return clean ? Number(clean) : null;
};

const readSessionClientId = () => {
  try {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    return normalizeId(session?.mycompany || session?.people);
  } catch {
    return null;
  }
};

export default function useShopCart({autoRefresh = false} = {}) {
  const cartStore = useStore('cart');
  const cartActions = cartStore.actions;
  const cartGetters = cartStore.getters;
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;
  const {requiresCompanySelection, salesCompany} = useShopSalesCompany();

  const refreshCart = useCallback(() => {
    const appType = String(env.APP_TYPE || '').toUpperCase();
    const isShopApp = appType === 'SHOP';

    const providerId = normalizeId(salesCompany?.id || defaultCompany?.id);
    const currentCompanyId = normalizeId(currentCompany?.id);
    const sessionClientId = readSessionClientId();
    const clientId = isShopApp
      ? currentCompanyId || sessionClientId
      : currentCompanyId;

    if (requiresCompanySelection || !providerId || !clientId) {
      cartActions.setItem({});
      return Promise.resolve(null);
    }

    const key = `${providerId}:${clientId}`;
    const now = Date.now();

    if (cartRequestInFlight?.key === key) {
      return cartRequestInFlight.promise;
    }

    if (cartRequestKey === key && now - cartRequestAt < 1200) {
      return Promise.resolve(cartGetters.item || null);
    }

    const promise = cartActions.discoveryCart({
      provider: providerId,
      client: clientId,
    }).finally(() => {
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
    cartGetters.item,
    currentCompany?.id,
    defaultCompany?.id,
    requiresCompanySelection,
    salesCompany?.id,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (!autoRefresh) return;
      refreshCart();
    }, [autoRefresh, refreshCart]),
  );

  return {
    cart: cartGetters.item,
    cartGetters,
    currentCompany,
    defaultCompany,
    refreshCart,
    salesCompany,
  };
}
