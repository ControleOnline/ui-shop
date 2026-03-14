import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';

export default function useShopCart() {
  const cartStore = useStore('cart');
  const cartActions = cartStore.actions;
  const cartGetters = cartStore.getters;
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;

  const refreshCart = useCallback(() => {
    if (!currentCompany?.id || !defaultCompany?.id) return Promise.resolve(null);

    return cartActions.discoveryCart({
      provider: defaultCompany.id,
      client: currentCompany.id,
    });
  }, [cartActions, currentCompany?.id, defaultCompany?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart]),
  );

  return {
    cart: cartGetters.item,
    cartGetters,
    refreshCart,
    currentCompany,
    defaultCompany,
  };
}
