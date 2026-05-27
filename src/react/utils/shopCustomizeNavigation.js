import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';

export const openShopCustomize = async ({
  cart = null,
  navigation,
  productId,
  redirectToCart = false,
  refreshCart = null,
}) => {
  const normalizedProductId = normalizeId(productId);

  if (!navigation || !normalizedProductId) {
    return false;
  }

  let activeCart = cart;
  try {
    activeCart = (await refreshCart?.()) || activeCart;
  } catch {}

  const customizeParams = {
    productId: normalizedProductId,
    redirectToCart,
  };

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
