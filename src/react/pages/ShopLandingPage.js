import React, {useEffect, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';

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
  const authStore = useStore('auth');
  const {isLogged, sessionChecked} = authStore.getters;
  const {
    defaultCompany,
    homeEntries,
  } = useShopSettings();
  const theme = pickTheme(defaultCompany);
  const resolvedPrimaryEntry = homeEntries[0]?.key || '';
  const shouldRenderSales = resolvedPrimaryEntry === SHOP_HOME_OPTION_SALES;
  const isLoadingDefaultCompany = !defaultCompany?.id;
  const shouldRequireLogin =
    resolvedPrimaryEntry === SHOP_HOME_OPTION_LOYALTY;

  useLayoutEffect(() => {
    navigation.setParams({showBottomCart: shouldRenderSales});
  }, [navigation, shouldRenderSales]);

  useEffect(() => {
    if (!shouldRequireLogin || !sessionChecked || isLogged) {
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SignInPage',
          params: {
            redirectRoute: 'HomePage',
          },
        },
      ],
    });
  }, [isLogged, navigation, sessionChecked, shouldRequireLogin]);

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_SALES) {
    return <StorefrontHome />;
  }

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_FRANCHISE_LOCATOR) {
    return <ShopFranchiseLocatorPage />;
  }

  if (shouldRequireLogin && (!sessionChecked || !isLogged)) {
    return (
      <ShopShell hideHeader showSearch={false}>
        {() => (
          <ShopFeatureState
            theme={theme}
            iconName="login"
            title="Entrar para acessar"
            description="A fidelidade depende da sua conta para exibir cartoes, carimbos e brindes."
            secondaryText="Voce sera direcionado para autenticacao."
          />
        )}
      </ShopShell>
    );
  }

  if (resolvedPrimaryEntry === SHOP_HOME_OPTION_LOYALTY) {
    return <ShopLoyaltyPage />;
  }

  if (isLoadingDefaultCompany) {
    return (
      <ShopShell hideHeader showSearch={false}>
        {() => (
          <ShopFeatureState
            theme={theme}
            iconName="hourglass-empty"
            title="Carregando shop"
            description="Aguarde enquanto as configuracoes da empresa sao carregadas."
            secondaryText="Tente novamente em instantes se esta mensagem permanecer."
          />
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell hideHeader showSearch={false}>
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
