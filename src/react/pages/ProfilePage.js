import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopAuthRequiredState from '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import Profile from '@controleonline/ui-people/src/react/pages/Profile';

/*
 * @agents The Shop profile route opens the canonical profile editor directly.
 * The short summary panel was removed so the user does not need a second hop.
 */
export default function ShopProfilePage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const {defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  const {isLogged, sessionChecked} = authStore.getters;

  if (sessionChecked && !isLogged) {
    return (
      <ShopShell
        showBottomCart={false}
        showSearch={false}
        subtitle="Perfil">
        {() => (
          <ShopAuthRequiredState
            theme={theme}
            title="Entre para acessar seu perfil"
            description="Seu perfil, enderecos e dados de contato ficam protegidos pelo cadastro."
          />
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell
      showBottomCart={false}
      showSearch={false}
      subtitle="Perfil">
      {() => <Profile navigation={navigation} />}
    </ShopShell>
  );
}
