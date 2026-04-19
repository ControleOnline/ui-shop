import React, {useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import StorefrontHome from '@controleonline/ui-shop/src/react/pages/StorefrontHome';
import ShopFranchiseLocatorPage from '@controleonline/ui-shop/src/react/pages/ShopFranchiseLocatorPage';
import ShopLoyaltyPage from '@controleonline/ui-shop/src/react/pages/ShopLoyaltyPage';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
  SHOP_HOME_OPTION_LOYALTY,
  SHOP_HOME_OPTION_SALES,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

export default function ShopLandingPage() {
  const navigation = useNavigation();
  const {
    defaultCompany,
    franchiseLocatorEnabled,
    loyaltyCouponsEnabled,
    primaryEntry,
    salesPageEnabled,
  } = useShopSettings();
  const theme = pickTheme(defaultCompany);
  const resolvedPrimaryEntry = (() => {
    if (salesPageEnabled && primaryEntry === SHOP_HOME_OPTION_SALES) {
      return SHOP_HOME_OPTION_SALES;
    }

    if (
      franchiseLocatorEnabled &&
      primaryEntry === SHOP_HOME_OPTION_FRANCHISE_LOCATOR
    ) {
      return SHOP_HOME_OPTION_FRANCHISE_LOCATOR;
    }

    if (loyaltyCouponsEnabled && primaryEntry === SHOP_HOME_OPTION_LOYALTY) {
      return SHOP_HOME_OPTION_LOYALTY;
    }

    if (salesPageEnabled) {
      return SHOP_HOME_OPTION_SALES;
    }

    if (franchiseLocatorEnabled) {
      return SHOP_HOME_OPTION_FRANCHISE_LOCATOR;
    }

    if (loyaltyCouponsEnabled) {
      return SHOP_HOME_OPTION_LOYALTY;
    }

    return '';
  })();
  const shouldRenderSales = resolvedPrimaryEntry === SHOP_HOME_OPTION_SALES;

  useLayoutEffect(() => {
    navigation.setParams({showBottomCart: shouldRenderSales});
  }, [navigation, shouldRenderSales]);

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_SALES) {
    return <StorefrontHome />;
  }

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_FRANCHISE_LOCATOR) {
    return <ShopFranchiseLocatorPage />;
  }

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_LOYALTY) {
    return <ShopLoyaltyPage />;
  }

  return (
    <ShopShell showSearch={false}>
      {() => (
        <ShopFeatureState
          theme={theme}
          iconName="visibility-off"
          title="Nenhuma entrada do shop esta disponivel"
          description="A pagina de compras, o mapa de franquias e a fidelidade estao desativados para esta empresa."
          secondaryText="Tente novamente em instantes."
        />
      )}
    </ShopShell>
  );
}
