import React, {useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {useStore} from '@store';
import {SHOP_HOME_OPTION_LOYALTY} from '@controleonline/ui-common/src/react/utils/shopConfig';

const resolveProductLabel = product =>
  String(product?.product || product?.name || '').trim() ||
  `Produto #${product?.id || ''}`;

export default function ShopLoyaltyPage() {
  const navigation = useNavigation();
  const productsStore = useStore('products');
  const {
    defaultCompany,
    loyaltyCouponsEnabled,
    loyaltyGiftProductId,
    loyaltyProductIds,
    loyaltyRequiredSales,
    primaryEntryRouteName,
  } = useShopSettings();
  const theme = pickTheme(defaultCompany);

  const [participantProducts, setParticipantProducts] = useState([]);
  const [giftProduct, setGiftProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!loyaltyCouponsEnabled || loyaltyProductIds.length === 0) {
      setParticipantProducts([]);
      return undefined;
    }

    Promise.all(
      loyaltyProductIds.slice(0, 6).map(async productId => {
        try {
          return await productsStore.actions.get(productId);
        } catch {
          return {id: productId};
        }
      }),
    ).then(items => {
      if (!cancelled) {
        setParticipantProducts(items.filter(Boolean));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loyaltyCouponsEnabled, loyaltyProductIds, productsStore.actions]);

  useEffect(() => {
    let cancelled = false;

    if (!loyaltyCouponsEnabled || !loyaltyGiftProductId) {
      setGiftProduct(null);
      return undefined;
    }

    productsStore.actions
      .get(loyaltyGiftProductId)
      .then(product => {
        if (!cancelled) {
          setGiftProduct(product || {id: loyaltyGiftProductId});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGiftProduct({id: loyaltyGiftProductId});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loyaltyCouponsEnabled, loyaltyGiftProductId, productsStore.actions]);

  const fakeCompletedSales = useMemo(() => {
    if (!loyaltyRequiredSales) {
      return 0;
    }

    return Math.max(1, Math.min(loyaltyRequiredSales - 1, 3));
  }, [loyaltyRequiredSales]);

  const remainingSales = Math.max(loyaltyRequiredSales - fakeCompletedSales, 0);
  const progressPercent =
    loyaltyRequiredSales > 0
      ? Math.min(100, (fakeCompletedSales / loyaltyRequiredSales) * 100)
      : 0;

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_LOYALTY}
      showBottomCart={false}
      showHomeEntryControls={false}
      showSalesShortcuts={false}
      showSearch={false}
      subtitle="Programa de fidelidade">
      {() => (
        <ScrollView
          style={styles.page}
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}>
          {!loyaltyCouponsEnabled ? (
            <ShopFeatureState
              theme={theme}
              iconName="loyalty"
              title="Fidelidade desativada"
              description="A tela de acompanhamento esta escondida porque os cupons de fidelidade nao estao ativos para esta empresa."
              primaryActionLabel={
                primaryEntryRouteName && primaryEntryRouteName !== 'ShopLoyaltyPage'
                  ? 'Voltar para o shop'
                  : null
              }
              onPrimaryAction={
                primaryEntryRouteName && primaryEntryRouteName !== 'ShopLoyaltyPage'
                  ? () => navigation.navigate(primaryEntryRouteName)
                  : null
              }
            />
          ) : (
            <>
              <View
                style={[
                  styles.hero,
                  {
                    backgroundColor: theme.darkCard,
                    borderColor: theme.darkBorder,
                  },
                ]}>
                <Text style={[styles.heroEyebrow, {color: theme.accent}]}>
                  DADOS DE TESTE
                </Text>
                <Text style={[styles.heroTitle, {color: theme.onPrimary}]}>
                  Acompanhe a sua fidelidade
                </Text>
                <Text
                  style={[
                    styles.heroText,
                    {color: 'rgba(255,255,255,0.78)'},
                  ]}>
                  Esta tela usa contadores fake apenas para validar se a
                  experiencia aparece ou nao conforme a configuracao da empresa.
                </Text>
              </View>

              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.cardBorder,
                  },
                ]}>
                <Text style={[styles.summaryLabel, {color: theme.muted}]}>
                  Compras registradas
                </Text>
                <Text style={[styles.summaryValue, {color: theme.text}]}>
                  {fakeCompletedSales} / {loyaltyRequiredSales || 0}
                </Text>
                <View
                  style={[
                    styles.progressTrack,
                    {backgroundColor: theme.cardBorder},
                  ]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${progressPercent}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.summaryHelp, {color: theme.muted}]}>
                  {remainingSales > 0
                    ? `Faltam ${remainingSales} compra(s) para liberar o brinde.`
                    : 'Brinde liberado nos dados de teste.'}
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  <Text style={[styles.infoTitle, {color: theme.text}]}>
                    Produtos participantes
                  </Text>
                  <Text style={[styles.infoMeta, {color: theme.muted}]}>
                    {loyaltyProductIds.length} produto(s) configurado(s)
                  </Text>
                  {participantProducts.length > 0 ? (
                    participantProducts.map(product => (
                      <Text
                        key={product?.id || resolveProductLabel(product)}
                        style={[styles.infoListItem, {color: theme.text}]}>
                        • {resolveProductLabel(product)}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.infoEmpty, {color: theme.muted}]}>
                      Nenhum produto participante foi carregado.
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  <Text style={[styles.infoTitle, {color: theme.text}]}>
                    Brinde configurado
                  </Text>
                  <Text style={[styles.infoMeta, {color: theme.muted}]}>
                    Produto liberado ao bater a meta fake
                  </Text>
                  <Text style={[styles.giftTitle, {color: theme.primary}]}>
                    {giftProduct
                      ? resolveProductLabel(giftProduct)
                      : 'Nenhum brinde configurado'}
                  </Text>
                  <Text style={[styles.infoEmpty, {color: theme.muted}]}>
                    Meta configurada: {loyaltyRequiredSales || 0} venda(s).
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 40,
  },
  hero: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    marginTop: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  summaryCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  summaryHelp: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  infoGrid: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  infoCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoMeta: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  infoListItem: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  infoEmpty: {
    fontSize: 13,
    lineHeight: 19,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
});
