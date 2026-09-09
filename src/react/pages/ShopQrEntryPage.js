import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import useShopQrContext from '@controleonline/ui-shop/src/react/hooks/useShopQrContext';
import {normalizeQrToken} from '@controleonline/ui-shop/src/react/utils/shopQrContext';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

/**
 * Entry point for Shop QR journeys (session or permanent).
 * Query/param `token` only — no internal IDs accepted from the client.
 */
export default function ShopQrEntryPage() {
  const configStore = useStore('config');
  const theme = pickTheme(configStore?.getters);
  const navigation = useNavigation();
  const route = useRoute();
  const {activateToken, loading, error, context} = useShopQrContext();
  const [started, setStarted] = useState(false);

  const token = useMemo(() => {
    const params = route?.params || {};
    return normalizeQrToken(
      params.token || params.t || params.qr || params.code,
    );
  }, [route?.params]);

  useEffect(() => {
    if (started || !token) return;
    setStarted(true);
    activateToken(token).then(result => {
      if (result?.cartId || result?.linkType) {
        // Land on storefront; cart discovery will pick up session/cart id.
        navigation.replace?.('ShopIndex') || navigation.navigate?.('ShopIndex');
      }
    });
  }, [activateToken, navigation, started, token]);

  const styles = {
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.background || '#fff',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text || '#111',
      marginBottom: 8,
      textAlign: 'center',
    },
    meta: {
      fontSize: 14,
      color: theme.muted || '#666',
      textAlign: 'center',
      marginTop: 8,
    },
    error: {
      fontSize: 14,
      color: theme.danger || '#b00020',
      textAlign: 'center',
      marginTop: 12,
    },
  };

  if (!token) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>QR inválido</Text>
        <Text style={styles.meta}>
          Nenhum token seguro foi informado. Escaneie o QR novamente.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Não foi possível abrir a sessão</Text>
        <Text style={styles.error}>
          {error === 'expired'
            ? 'Este QR expirou. Solicite um novo código.'
            : error === 'revoked'
              ? 'Este QR foi revogado.'
              : 'Não foi possível validar o QR. Tente novamente.'}
        </Text>
        <Text style={styles.meta}>
          A jornada é recuperável sem expor referências internas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={theme.primary || '#1976d2'} />
      <Text style={[styles.meta, {marginTop: 16}]}>
        {loading || !context
          ? 'Validando QR seguro…'
          : 'Sessão pronta. Abrindo a loja…'}
      </Text>
    </View>
  );
}
