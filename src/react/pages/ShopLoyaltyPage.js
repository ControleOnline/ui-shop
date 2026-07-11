import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
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
import {
  buildLoyaltyDisplayCards,
  isPaidLoyaltySaleOrder,
} from '@controleonline/ui-shop/src/react/utils/shopLoyalty';
import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';
import {readShopSessionClientId} from '@controleonline/ui-shop/src/react/utils/shopSession';
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

const silentStoreMeta = {__storeMeta: {skipSystemError: true}};
const SHOP_COLLECTION_ITEMS_PER_PAGE = 50;
const SHOP_LOYALTY_SALES_ITEMS_PER_PAGE = 200;

export default function ShopLoyaltyPage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const productsStore = useStore('products');
  const ordersStore = useStore('orders');
  const themeStore = useStore('theme');
  const themeColors = themeStore.getters?.colors || {};
  const {isLogged, sessionChecked} = authStore.getters;
  const {
    defaultCompany,
    loyaltyCouponsEnabled,
    loyaltyGiftProductId,
    loyaltyProductIds,
    loyaltyRequiredSales,
    loyaltyStampIconUrl,
    primaryEntryRouteName,
  } = useShopSettings();
  const {
    currentCompany,
    defaultCompany: cartDefaultCompany,
    refreshCart,
    salesCompany,
  } = useShopCart({autoRefresh: true});
  const palette = {
    pageBackground: themeColors.pageBackground,
    cardBackground: themeColors.cardBackground,
    headerBorder: themeColors.headerBorder,
    badgeText: themeColors.badgeText,
    buttonBackground: themeColors.buttonBackground,
    buttonText: themeColors.buttonText,
    chipSelectedBackground: themeColors.chipSelectedBackground,
    chipSelectedBorder: themeColors.chipSelectedBorder,
    chipSelectedText: themeColors.chipSelectedText,
    dividerBorder: themeColors.dividerBorder,
    textMuted: themeColors.textMuted,
    textPrimary: themeColors.textPrimary,
  };
  const featureTheme = {
    surface: palette.cardBackground,
    cardBorder: palette.headerBorder,
    primary: palette.buttonBackground,
    onPrimary: palette.buttonText,
    text: palette.textPrimary,
    muted: palette.textMuted,
  };
  const loyaltyStampIconSource = String(loyaltyStampIconUrl || '').trim();

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
    const clientId = normalizeId(currentCompany?.id) || readShopSessionClientId();

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
      const salesQuery = {
        provider: providerId,
        orderType: 'sale',
        page: 1,
        itemsPerPage: SHOP_LOYALTY_SALES_ITEMS_PER_PAGE,
      };

      if (!showHistory) {
        cardQuery.status = {realStatus: 'open'};
      }

      const [cards, clientSales, payerSales] = await Promise.all([
        ordersStore.actions.getItems(cardQuery),
        ordersStore.actions.getItems({
          ...salesQuery,
          client: clientId,
        }),
        ordersStore.actions.getItems({
          ...salesQuery,
          payer: clientId,
        }),
      ]);
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
              .filter(isPaidLoyaltySaleOrder)
              .sort(
                (left, right) =>
                  new Date(left?.orderDate || 0).getTime() -
                  new Date(right?.orderDate || 0).getTime(),
              ),
          };
        }),
      );

      setLoyaltyCards(
        buildLoyaltyDisplayCards({
          cards: hydratedCards,
          clientId,
          loyaltyProductIds,
          requiredSales: loyaltyRequiredSales,
          sales: [
            ...(Array.isArray(clientSales) ? clientSales : []),
            ...(Array.isArray(payerSales) ? payerSales : []),
          ],
          showHistory,
        }),
      );
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
    loyaltyProductIds,
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
            <Text style={[styles.summaryLabel, {color: palette.textMuted}]}>
              Pedidos carimbados
            </Text>
            <Text style={[styles.summaryValue, {color: palette.textPrimary}]}>
              {completedStampCount} / {requiredSales || 0}
            </Text>
            {cardData?.card?.id ? (
              <Text style={[styles.cardMeta, {color: palette.textMuted}]}>
                Cartão #{cardData.card.id}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.rewardBadge,
              {backgroundColor: palette.buttonBackground},
            ]}>
            <Text
              style={[
                styles.rewardBadgeText,
                {color: palette.buttonText},
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
                      ? palette.pageBackground
                      : palette.cardBackground,
                    borderColor: slot.completed
                      ? palette.chipSelectedBorder
                      : palette.headerBorder,
                  },
                ]}>
                {slot.completed ? (
                  loyaltyStampIconSource ? (
                    <Image
                      source={{uri: loyaltyStampIconSource}}
                      style={[
                        styles.stampImage,
                        {
                          transform: [
                            {
                              rotate:
                                slot.number % 2 === 0 ? '4deg' : '-5deg',
                            },
                          ],
                        },
                      ]}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        styles.stampMark,
                        {
                          borderColor: palette.chipSelectedBorder,
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
                          {color: palette.chipSelectedText},
                        ]}>
                        OK
                      </Text>
                      <Text
                        style={[
                          styles.stampMarkLabel,
                          {color: palette.chipSelectedText},
                        ]}>
                        {slot.order?.id
                          ? `PEDIDO #${slot.order.id}`
                          : `PEDIDO ${formatStampNumber(slot.number)}`}
                      </Text>
                    </View>
                  )
                ) : (
                  <>
                    <Text
                      style={[
                        styles.pendingStampNumber,
                        {color: palette.dividerBorder},
                      ]}>
                      {formatStampNumber(slot.number)}
                    </Text>
                    <Text
                      style={[
                        styles.pendingStampLabel,
                        {color: palette.textMuted},
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
              {borderColor: palette.headerBorder},
            ]}>
            <Text style={[styles.summaryHelp, {color: palette.textMuted}]}>
              Nenhuma meta de pedidos foi configurada para esta fidelidade.
            </Text>
          </View>
        )}
        {stampSlots.length > 0 && (
          <Text style={[styles.summaryHelp, {color: palette.textMuted}]}>
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
          style={[styles.page, {backgroundColor: palette.pageBackground}]}
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}>
          {!loyaltyCouponsEnabled ? (
            <ShopFeatureState
              theme={featureTheme}
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
                    backgroundColor: palette.buttonBackground,
                    borderColor: palette.chipSelectedBorder,
                  },
                ]}>
                <Text style={[styles.heroEyebrow, {color: palette.chipSelectedBackground}]}>
                  FIDELIDADE
                </Text>
                <Text style={[styles.heroTitle, {color: palette.badgeText}]}>
                  Acompanhe a sua fidelidade
                </Text>
                <Text style={[styles.heroText, {color: palette.badgeText}]}>
                  Cada pedido pago com produtos participantes ganha um carimbo.
                  Ao completar o cartão, o brinde entra no próximo carrinho.
                </Text>
              </View>

              <View style={styles.loyaltyToolbar}>
                <View style={styles.toolbarTitleGroup}>
                  <Text style={[styles.toolbarTitle, {color: palette.textPrimary}]}>
                    {showHistory ? 'Últimos cartões' : 'Cartão atual'}
                  </Text>
                  <Text style={[styles.toolbarMeta, {color: palette.textMuted}]}>
                    {loyaltyCards.length} cartão(ões) carregado(s)
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={() => setShowHistory(value => !value)}
                  style={[
                    styles.historyButton,
                    {borderColor: palette.buttonBackground},
                  ]}>
                  <Text
                    style={[
                      styles.historyButtonText,
                      {color: palette.buttonBackground},
                    ]}>
                    {showHistory ? 'Ver atual' : 'Ver últimos'}
                  </Text>
                </TouchableOpacity>
              </View>

              {sessionChecked && !isLogged ? (
                <ShopAuthRequiredState
                  theme={featureTheme}
                  title="Entre para ver seus carimbos"
                  description="O programa de fidelidade e publico, mas seus cartoes e carimbos dependem do cadastro."
                />
              ) : isLoadingCards ? (
                <View
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: palette.cardBackground,
                      borderColor: palette.headerBorder,
                    },
                  ]}>
                  <Text style={[styles.summaryHelp, {color: palette.textMuted}]}>
                    Carregando cartões de fidelidade.
                  </Text>
                </View>
              ) : loyaltyCards.length > 0 ? (
                loyaltyCards.map(cardData => (
                  <View
                    key={`loyalty-card-${cardData?.card?.id || cardData?.syntheticKey || 'current'}`}
                    style={[
                      styles.summaryCard,
                      {
                        backgroundColor: palette.cardBackground,
                        borderColor: palette.headerBorder,
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
                      backgroundColor: palette.cardBackground,
                      borderColor: palette.headerBorder,
                    },
                  ]}>
                  {renderStampGrid({
                    card: null,
                    requiredSales: loyaltyRequiredSales || 0,
                    stamps: [],
                  })}
                  <Text style={[styles.summaryHelp, {color: palette.textMuted}]}>
                    Nenhum cartão aberto foi encontrado para este cliente.
                  </Text>
                </View>
              )}

              <View style={styles.infoGrid}>
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: palette.cardBackground,
                      borderColor: palette.headerBorder,
                    },
                  ]}>
                  <Text style={[styles.infoTitle, {color: palette.textPrimary}]}>
                    Produtos participantes
                  </Text>
                  <Text style={[styles.infoMeta, {color: palette.textMuted}]}>
                    {loyaltyProductIds.length} produto(s) configurado(s)
                  </Text>
                  {participantProducts.length > 0 ? (
                    participantProducts.map(product => (
                      <Text
                        key={product?.id || resolveProductLabel(product)}
                        style={[styles.infoListItem, {color: palette.textPrimary}]}>
                        • {resolveProductLabel(product)}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.infoEmpty, {color: palette.textMuted}]}>
                      Nenhum produto participante foi carregado.
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: palette.cardBackground,
                      borderColor: palette.headerBorder,
                    },
                  ]}>
                  <Text style={[styles.infoTitle, {color: palette.textPrimary}]}>
                    Brinde configurado
                  </Text>
                  <Text style={[styles.infoMeta, {color: palette.textMuted}]}>
                    Produto liberado ao bater a meta
                  </Text>
                  <Text style={[styles.giftTitle, {color: palette.buttonBackground}]}>
                    {giftProduct
                      ? resolveProductLabel(giftProduct)
                      : 'Nenhum brinde configurado'}
                  </Text>
                  <Text style={[styles.infoEmpty, {color: palette.textMuted}]}>
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
