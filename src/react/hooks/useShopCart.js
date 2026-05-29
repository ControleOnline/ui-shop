import {useCallback, useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {env} from '@env';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import {
  clearAnonymousCart,
  readAnonymousCart,
  subscribeAnonymousCart,
} from '@controleonline/ui-shop/src/react/utils/anonymousCart';

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
  const orderProductsStore = useStore('order_products');
  const orderProductActions = orderProductsStore.actions;
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
  const providerId = normalizeId(salesCompany?.id || defaultCompany?.id);
  const [anonymousCart, setAnonymousCart] = useState(() =>
    readAnonymousCart(providerId),
  );

  useEffect(() => {
    setAnonymousCart(readAnonymousCart(providerId));
    return subscribeAnonymousCart(({providerId: changedProviderId}) => {
      if (!changedProviderId || normalizeId(changedProviderId) === providerId) {
        setAnonymousCart(readAnonymousCart(providerId));
      }
    });
  }, [providerId]);

  const migrateAnonymousCart = useCallback(
    async backendCart => {
      if (!backendCart?.id || !providerId) {
        return backendCart;
      }

      const localCart = readAnonymousCart(providerId);
      const localItems = Array.isArray(localCart?.orderProducts)
        ? localCart.orderProducts
        : [];

      if (localItems.length === 0) {
        return backendCart;
      }

      for (const item of localItems) {
        const productId = normalizeId(item?.product?.id || item?.product?.['@id']);
        if (!productId || Number(item?.quantity || 0) <= 0) {
          continue;
        }

        const existing = (backendCart.orderProducts || []).find(
          orderProduct =>
            normalizeId(orderProduct?.product?.id || orderProduct?.product?.['@id']) ===
            productId,
        );

        await orderProductActions.save({
          id: existing?.id || null,
          product: `/products/${productId}`,
          quantity:
            Number(existing?.quantity || 0) + Number(item.quantity || 0),
          order: backendCart?.['@id'] || `/orders/${backendCart.id}`,
        });
      }

      clearAnonymousCart(providerId);

      return cartActions.discoveryCart({
        provider: providerId,
        client: normalizeId(currentCompany?.id) || readSessionClientId(),
      });
    },
    [cartActions, currentCompany?.id, orderProductActions, providerId],
  );

  const refreshCart = useCallback(() => {
    const appType = String(env.APP_TYPE || '').toUpperCase();
    const isShopApp = appType === 'SHOP';

    const currentCompanyId = normalizeId(currentCompany?.id);
    const sessionClientId = readSessionClientId();
    const clientId = isShopApp
      ? currentCompanyId || sessionClientId
      : currentCompanyId;

    if (requiresCompanySelection || !providerId || !clientId) {
      const localCart = isShopApp && providerId ? readAnonymousCart(providerId) : null;
      if (cartGetters.item?.id) {
        cartActions.setItem({});
      }
      return Promise.resolve(localCart);
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
    })
      .then(migrateAnonymousCart)
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
    cartGetters.item,
    currentCompany?.id,
    migrateAnonymousCart,
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
    cart: cartGetters.item?.id ? cartGetters.item : anonymousCart || cartGetters.item,
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
