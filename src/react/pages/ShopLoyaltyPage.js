import React, {useCallback, useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import ShopAuthRequiredState from '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {normalizeId, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {useStore} from '@store';
import {SHOP_HOME_OPTION_LOYALTY} from '@controleonline/ui-common/src/react/utils/shopConfig';
import styles from '@controleonline/ui-shop/src/react/pages/ShopLoyaltyPage.styles';

const resolveProductLabel = product =>
  String(product?.product || product?.name || '').trim() ||
  `Produto #${product?.id || ''}`;

const formatStampNumber = value => String(value).padStart(2, '0');

const extractOrderInfo = order => {
  const raw = order?.otherInformations;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const resolveCardRequiredSales = (card, fallback) => {
  const info = extractOrderInfo(card);
  const configuredValue = Number(info.loyalty_required_sales || 0);
  const fallbackValue = Number(fallback || 0);

  return Math.max(0, configuredValue || fallbackValue);
};

const isPaidSale = order => {
  const status = String(order?.status?.status || '').trim().toLowerCase();
  const realStatus = String(order?.status?.realStatus || '').trim().toLowerCase();

  return status === 'paid' || realStatus === 'paid' || realStatus === 'closed';
};

const silentStoreMeta = {__storeMeta: {skipSystemError: true}};
const SHOP_COLLECTION_ITEMS_PER_PAGE = 50;

export default function ShopLoyaltyPage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const productsStore = useStore('products');
  const ordersStore = useStore('orders');
  const {isLogged, sessionChecked} = authStore.getters;
  const {
    defaultCompany,
    loyaltyCouponsEnabled,
    loyaltyGiftProductId,
    loyaltyProductIds,
    loyaltyRequiredSales,
    primaryEntryRouteName,
  } = useShopSettings();
  const {
    currentCompany,
    defaultCompany: cartDefaultCompany,
    refreshCart,
    salesCompany,
  } = useShopCart({autoRefresh: true});
  const theme = pickTheme(defaultCompany);

  const [participantProducts, setParticipantProducts] = useState([]);
  const [giftProduct, setGiftProduct] = useState(null);
  const [loyaltyCards, setLoyaltyCards] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (
      !sessionChecked ||
      !isLogged ||
      !loyaltyCouponsEnabled ||
      loyaltyProductIds.length === 0
    ) {
      setParticipantProducts([]);
      return undefined;
    }

    Promise.all(
      loyaltyProductIds.slice(0, 6).map(async productId => {
        try {
          return await productsStore.actions.get({
            id: productId,
            ...silentStoreMeta,
          });
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
  }, [
    isLogged,
    loyaltyCouponsEnabled,
    loyaltyProductIds,
    productsStore.actions,
    sessionChecked,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (
      !sessionChecked ||
      !isLogged ||
      !loyaltyCouponsEnabled ||
      !loyaltyGiftProductId
    ) {
      setGiftProduct(null);
      return undefined;
    }

    productsStore.actions
      .get({id: loyaltyGiftProductId, ...silentStoreMeta})
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
  }, [
    isLogged,
    loyaltyCouponsEnabled,
    loyaltyGiftProductId,
    productsStore.actions,
    sessionChecked,
  ]);

  const loadLoyaltyCards = useCallback(async () => {
    const providerId = normalizeId(salesCompany?.id || cartDefaultCompany?.id || defaultCompany?.id);
    const clientId = normalizeId(currentCompany?.id);

    if (
      !sessionChecked ||
      !isLogged ||
      !loyaltyCouponsEnabled ||
      !providerId ||
      !clientId
    ) {
      setLoyaltyCards([]);
      return;
    }

    setIsLoadingCards(true);
    try {
      await refreshCart?.();

      const cardQuery = {
        client: clientId,
        provider: providerId,
        orderType: 'fidelity',
        page: 1,
        itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
      };

      if (!showHistory) {
        cardQuery.status = {realStatus: 'open'};
      }

      const cards = await ordersStore.actions.getItems(cardQuery);
      const hydratedCards = await Promise.all(
        (Array.isArray(cards) ? cards : []).map(async card => {
          const requiredSales = resolveCardRequiredSales(
            card,
            loyaltyRequiredSales,
          );
          const stamps = await ordersStore.actions.getItems({
            mainOrderId: card?.id,
            orderType: 'sale',
            page: 1,
            itemsPerPage: Math.max(
              1,
              Math.min(SHOP_COLLECTION_ITEMS_PER_PAGE, requiredSales || SHOP_COLLECTION_ITEMS_PER_PAGE),
            ),
          });

          return {
            card,
            requiredSales,
            stamps: (Array.isArray(stamps) ? stamps : [])
              .filter(isPaidSale)
              .sort(
                (left, right) =>
                  new Date(left?.orderDate || 0).getTime() -
                  new Date(right?.orderDate || 0).getTime(),
              ),
          };
        }),
      );

      setLoyaltyCards(hydratedCards);
    } catch {
      setLoyaltyCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  }, [
    cartDefaultCompany?.id,
    currentCompany?.id,
    defaultCompany?.id,
    isLogged,
    loyaltyCouponsEnabled,
    loyaltyRequiredSales,
    ordersStore.actions,
    refreshCart,
    salesCompany?.id,
    sessionChecked,
    showHistory,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadLoyaltyCards();
    }, [loadLoyaltyCards]),
  );

  const renderStampGrid = cardData => {
    const requiredSales = cardData?.requiredSales || loyaltyRequiredSales || 0;
    const stamps = Array.isArray(cardData?.stamps) ? cardData.stamps : [];
    const completedStampCount = Math.min(stamps.length, requiredSales);
    const remainingSales = Math.max(requiredSales - completedStampCount, 0);
    const stampSlots = Array.from({length: requiredSales}, (_, index) => ({
      completed: index < completedStampCount,
      number: index + 1,
      order: stamps[index] || null,
    }));

    return (
      <>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleGroup}>
            <Text style={[styles.summaryLabel, {color: theme.muted}]}>
              Pedidos carimbados
            </Text>
            <Text style={[styles.summaryValue, {color: theme.text}]}>
              {completedStampCount} / {requiredSales || 0}
            </Text>
            {cardData?.card?.id ? (
              <Text style={[styles.cardMeta, {color: theme.muted}]}>
                Cartão #{cardData.card.id}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.rewardBadge,
              {backgroundColor: theme.primary},
            ]}>
            <Text
              style={[
                styles.rewardBadgeText,
                {color: theme.onPrimary},
              ]}>
              prêmio
            </Text>
          </View>
        </View>
        {stampSlots.length > 0 ? (
          <View style={styles.stampGrid}>
            {stampSlots.map(slot => (
              <View
                key={`loyalty-stamp-${cardData?.card?.id || 'empty'}-${slot.number}`}
                style={[
                  styles.stampSlot,
                  {
                    backgroundColor: slot.completed
                      ? theme.background
                      : theme.surface,
                    borderColor: slot.completed
                      ? theme.primary
                      : theme.cardBorder,
                  },
                ]}>
                {slot.completed ? (
                  <View
                    style={[
                      styles.stampMark,
                      {
                        borderColor: theme.primary,
                        transform: [
                          {
                            rotate:
                              slot.number % 2 === 0 ? '4deg' : '-5deg',
                          },
                        ],
                      },
                    ]}>
                    <Text
                      style={[
                        styles.stampMarkMain,
                        {color: theme.primary},
                      ]}>
                      OK
                    </Text>
                    <Text
                      style={[
                        styles.stampMarkLabel,
                        {color: theme.primary},
                      ]}>
                      {slot.order?.id
                        ? `PEDIDO #${slot.order.id}`
                        : `PEDIDO ${formatStampNumber(slot.number)}`}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.pendingStampNumber,
                        {color: theme.cardBorder},
                      ]}>
                      {formatStampNumber(slot.number)}
                    </Text>
                    <Text
                      style={[
                        styles.pendingStampLabel,
                        {color: theme.muted},
                      ]}>
                      aguardando pedido
                    </Text>
                  </>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyStampBoard,
              {borderColor: theme.cardBorder},
            ]}>
            <Text style={[styles.summaryHelp, {color: theme.muted}]}>
              Nenhuma meta de pedidos foi configurada para esta fidelidade.
            </Text>
          </View>
        )}
        {stampSlots.length > 0 && (
          <Text style={[styles.summaryHelp, {color: theme.muted}]}>
            {remainingSales > 0
              ? `Faltam ${remainingSales} pedido(s) para liberar o brinde.`
              : 'Brinde liberado para o próximo pedido.'}
          </Text>
        )}
      </>
    );
  };

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_LOYALTY}
      showBottomCart={false}
      showHomeEntryControls
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
              description="A tela de acompanhamento está escondida porque os cupons de fidelidade não estão ativos para esta empresa."
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
                  FIDELIDADE
                </Text>
                <Text style={[styles.heroTitle, {color: '#FFFFFF'}]}>
                  Acompanhe a sua fidelidade
                </Text>
                <Text
                  style={[
                    styles.heroText,
                    {color: 'rgba(255,255,255,0.78)'},
                  ]}>
                  Cada pedido pago com produtos participantes ganha um carimbo.
                  Ao completar o cartão, o brinde entra no próximo carrinho.
                </Text>
              </View>

              <View style={styles.loyaltyToolbar}>
                <View style={styles.toolbarTitleGroup}>
                  <Text style={[styles.toolbarTitle, {color: theme.text}]}>
                    {showHistory ? 'Últimos cartões' : 'Cartão atual'}
                  </Text>
                  <Text style={[styles.toolbarMeta, {color: theme.muted}]}>
                    {loyaltyCards.length} cartão(ões) carregado(s)
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={() => setShowHistory(value => !value)}
                  style={[
                    styles.historyButton,
                    {borderColor: theme.primary},
                  ]}>
                  <Text style={[styles.historyButtonText, {color: theme.primary}]}>
                    {showHistory ? 'Ver atual' : 'Ver últimos'}
                  </Text>
                </TouchableOpacity>
              </View>

              {sessionChecked && !isLogged ? (
                <ShopAuthRequiredState
                  theme={theme}
                  title="Entre para ver seus carimbos"
                  description="O programa de fidelidade e publico, mas seus cartoes e carimbos dependem do cadastro."
                />
              ) : isLoadingCards ? (
                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  <Text style={[styles.summaryHelp, {color: theme.muted}]}>
                    Carregando cartões de fidelidade.
                  </Text>
                </View>
              ) : loyaltyCards.length > 0 ? (
                loyaltyCards.map(cardData => (
                  <View
                    key={`loyalty-card-${cardData?.card?.id || 'current'}`}
                    style={[
                      styles.summaryCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.cardBorder,
                      },
                    ]}>
                    {renderStampGrid(cardData)}
                  </View>
                ))
              ) : (
                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  {renderStampGrid({
                    card: null,
                    requiredSales: loyaltyRequiredSales || 0,
                    stamps: [],
                  })}
                  <Text style={[styles.summaryHelp, {color: theme.muted}]}>
                    Nenhum cartão aberto foi encontrado para este cliente.
                  </Text>
                </View>
              )}

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
                    Produto liberado ao bater a meta
                  </Text>
                  <Text style={[styles.giftTitle, {color: theme.primary}]}>
                    {giftProduct
                      ? resolveProductLabel(giftProduct)
                      : 'Nenhum brinde configurado'}
                  </Text>
                  <Text style={[styles.infoEmpty, {color: theme.muted}]}>
                    Meta configurada: {loyaltyRequiredSales || 0} pedido(s).
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
