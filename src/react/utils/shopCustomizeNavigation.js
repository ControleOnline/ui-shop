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

  if (activeCart?.id) {
    navigation.navigate('CustomizeScreen', customizeParams);
    return true;
  }

  navigation.navigate('SignInPage', {
    redirectRoute: 'ShopProductPage',
    redirectParams: {id: normalizedProductId},
  });

  return false;
};
