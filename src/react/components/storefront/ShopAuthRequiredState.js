import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';

export default function ShopAuthRequiredState({
  theme,
  title = 'Entrar para continuar',
  description = 'Acesse sua conta ou crie um cadastro para continuar com esta area do shop.',
  redirectRoute,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const targetRoute = redirectRoute || route?.name || 'HomePage';
  const redirectParams =
    route?.params && typeof route.params === 'object'
      ? JSON.stringify(route.params)
      : undefined;

  return (
    <ShopFeatureState
      theme={theme}
      iconName="login"
      title={title}
      description={description}
      primaryActionLabel="Entrar ou criar conta"
      onPrimaryAction={() =>
        navigation.navigate('SignInPage', {
          redirectRoute: targetRoute,
          ...(redirectParams ? {redirectParams} : {}),
        })
      }
    />
  );
}
