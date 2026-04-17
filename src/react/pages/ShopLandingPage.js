import React from 'react';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import StorefrontHome from '@controleonline/ui-shop/src/react/pages/StorefrontHome';
import ShopFranchiseLocatorPage from '@controleonline/ui-shop/src/react/pages/ShopFranchiseLocatorPage';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
  SHOP_HOME_OPTION_SALES,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

export default function ShopLandingPage() {
  const {
    defaultCompany,
    franchiseLocatorEnabled,
    primaryEntry,
    salesPageEnabled,
  } = useShopSettings();
  const theme = pickTheme(defaultCompany);

  if (salesPageEnabled && primaryEntry === SHOP_HOME_OPTION_SALES) {
    return <StorefrontHome />;
  }

  if (
    franchiseLocatorEnabled &&
    primaryEntry === SHOP_HOME_OPTION_FRANCHISE_LOCATOR
  ) {
    return <ShopFranchiseLocatorPage />;
  }

  if (salesPageEnabled) {
    return <StorefrontHome />;
  }

  if (franchiseLocatorEnabled) {
    return <ShopFranchiseLocatorPage />;
  }

  return (
    <ShopShell showSearch={false}>
      {() => (
        <ShopFeatureState
          theme={theme}
          iconName="visibility-off"
          title="Nenhuma entrada do shop esta disponivel"
          description="A pagina de vendas e o localizador de franquias estao desativados para esta empresa."
          secondaryText="Ative uma dessas entradas no manager para liberar a home do cliente."
        />
      )}
    </ShopShell>
  );
}
