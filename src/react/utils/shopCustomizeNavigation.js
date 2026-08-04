import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';

export const openShopCustomize = async ({
  cart = null,
  navigation,
  productId,
  presentation = null,
  redirectToCart = false,
  refreshCart = null,
}) => {
  const normalizedProductId = normalizeId(productId);

  if (!navigation || !normalizedProductId) {
    return false;
  }

  let activeCart = cart;
  if (!activeCart?.id) {
    try {
      activeCart = (await refreshCart?.()) || activeCart;
    } catch {}
  }

  const customizeParams = {
    productId: normalizedProductId,
    redirectToCart,
  };

  if (presentation) {
    customizeParams.presentation = presentation;
  }

  if (!activeCart?.id) {
    /*
     * @agents Product customization owns its cart rehydration on submit. The
     * product page should still open the customizer when the cart store is not
     * ready yet, instead of leaving the customer on a dead button.
     */
    navigation.navigate('CustomizeScreen', customizeParams);
    return true;
  }

  navigation.navigate('CustomizeScreen', customizeParams);
  return true;
};
