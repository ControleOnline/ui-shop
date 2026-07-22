import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import DefaultErrors from '@controleonline/ui-default/src/react/components/errors/DefaultErrors';
import StateStore from '@controleonline/ui-common/src/react/components/StateStore';
import ShopAuthRequiredState from '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {buildFileUrl, normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';
import {readShopAuthenticatedPeopleId} from '@controleonline/ui-shop/src/react/utils/shopSession';
import {useStore} from '@store';
import {SHOP_HOME_OPTION_LOYALTY} from '@controleonline/ui-common/src/react/utils/shopConfig';
import styles from '@controleonline/ui-shop/src/react/pages/ShopLoyaltyPage.styles';

const resolveProductLabel = product =>
  String(product?.product || product?.name || '').trim() ||
  `Produto #${product?.id || ''}`;

const resolveProviderLabel = provider =>
  String(provider?.alias || provider?.name || '').trim();

const groupCardsByProvider = cards => {
  const groups = new Map();

  cards.forEach((cardData, index) => {
    const provider = cardData?.provider || null;
    const providerLabel = resolveProviderLabel(provider);
    const providerId = normalizeId(provider?.id || provider?.['@id']);
    const key = providerId
      ? `provider-${providerId}`
      : providerLabel
        ? `provider-${providerLabel}`
        : `provider-unknown-${index}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: providerLabel,
        cards: [],
      });
    }

    groups.get(key).cards.push(cardData);
  });

  return Array.from(groups.values());
};

const formatStampNumber = value => String(value).padStart(2, '0');
const tt = (type, key) => global.t?.t('configs', type, key);

// TO DO // 21/06/2026 // ALEMAC
// passar isso para config ou theme
// deixei zerado para LAVE-GO
const STAMP_OFFSET_LIMIT = 0; // era 25
const STAMP_ROTATION_LIMIT = 0; // era 15

const createSeededValue = seed => {
  const text = String(seed || 'stamp');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  const normalized = Math.sin(hash || 1) * 10000;
  return normalized - Math.floor(normalized);
};

const resolveSeededOffset = (baseSeed, slotNumber, axis, limit) => {
  const slotIndex = Math.max(Number(slotNumber || 1) - 1, 0);
  const magnitude = Math.round(
    createSeededValue(`${baseSeed}:${axis}:magnitude`) * limit,
  );
  const preferredSign =
    axis === 'x'
      ? slotIndex % 2 === 0
        ? -1
        : 1
      : Math.floor(slotIndex / 2) % 2 === 0
        ? -1
        : 1;
  const shouldFlipSign =
    createSeededValue(`${baseSeed}:${axis}:direction`) >= 0.75;
  const sign = shouldFlipSign ? preferredSign * -1 : preferredSign;

  return magnitude * sign;
};

const resolveStampTransform = (cardId, slotNumber) => {
  const baseSeed = `${cardId || 'empty'}:${slotNumber || 0}`;
  const offsetX = resolveSeededOffset(
    baseSeed,
    slotNumber,
    'x',
    STAMP_OFFSET_LIMIT,
  );
  const offsetY = resolveSeededOffset(
    baseSeed,
    slotNumber,
    'y',
    STAMP_OFFSET_LIMIT,
  );
  const rotation = Math.round(
    (createSeededValue(`${baseSeed}:rotation`) * 2 - 1) *
      STAMP_ROTATION_LIMIT,
  );

  return [
    {translateX: offsetX},
    {translateY: offsetY},
    {rotate: `${rotation}deg`},
  ];
};

/*
 * @agents History responses carry a dedicated empty-state flag so the UI can keep
 * the "no open card" and "no history found" messages separated.
 */
const resolveLoyaltyEmptyMessage = summary =>
  summary?.historyEmpty
    ? tt('loyalty_text', 'historyEmpty') ||
      'Nenhum histórico encontrado para este cliente.'
    : tt('loyalty_text', 'openCardEmpty') ||
      'Nenhum cartão aberto foi encontrado para este cliente.';

const resolvePublicStampUrl = (...companies) => {
  /*
   * @agents Loyalty stamp artwork belongs to people_media type "stamp".
   * Shop must not read a URL from configs because company media is the shared source.
   */
  const companyWithStamp = companies.find(company => company?.stamp);
  return companyWithStamp?.stamp
    ? buildFileUrl(companyWithStamp.stamp, companyWithStamp)
    : '';
};

const silentStoreMeta = {__storeMeta: {skipSystemError: true}};

export default function ShopLoyaltyPage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const productsStore = useStore('products');
  const ordersStore = useStore('orders');
  const themeStore = useStore('theme');
  const themeColors = themeStore.getters?.colors || {};
  const {isLogged, sessionChecked, user} = authStore.getters;
  const {
    defaultCompany,
    loyaltyCouponsEnabled,
    loyaltyGiftProductId,
    loyaltyProductIds,
    loyaltyRequiredSales,
    primaryEntryRouteName,
  } = useShopSettings();
  const {
    defaultCompany: cartDefaultCompany,
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
  const loyaltyStampIconSource =
    resolvePublicStampUrl(salesCompany, cartDefaultCompany, defaultCompany);

  const [participantProducts, setParticipantProducts] = useState([]);
  const [giftProduct, setGiftProduct] = useState(null);
  const [loyaltyCards, setLoyaltyCards] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showHeroHelpModal, setShowHeroHelpModal] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [, setCardsError] = useState(null);
  const [snapshotSummary, setSnapshotSummary] = useState({});
  const loyaltySnapshotRequestRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  /*
   * @agents The page only renders the backend snapshot.
   * It never rebuilds stamps from raw orders locally.
   */
  const loadLoyaltyCards = useCallback(async () => {
    const requestId = loyaltySnapshotRequestRef.current + 1;
    loyaltySnapshotRequestRef.current = requestId;
    const providerId = normalizeId(
      salesCompany?.id || cartDefaultCompany?.id || defaultCompany?.id,
    );
    const clientId =
      normalizeId(user?.people?.id || user?.people?.['@id'] || user?.people) ||
      readShopAuthenticatedPeopleId();

    if (
      !sessionChecked ||
      !isLogged ||
      !loyaltyCouponsEnabled ||
      !providerId ||
      !clientId
    ) {
      if (isMountedRef.current) {
        setLoyaltyCards([]);
        setSnapshotSummary({});
        setCardsError(null);
        setIsLoadingCards(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setIsLoadingCards(true);
      setCardsError(null);
    }

    try {
      const response = await ordersStore.actions.getFidelitySnapshot({
        clientId,
        history: showHistory,
      });

      if (
        !isMountedRef.current ||
        loyaltySnapshotRequestRef.current !== requestId
      ) {
        return;
      }

      /*
       * @agents Accept both the wrapped API response and a direct array so the screen
       * stays resilient to the store contract while still rendering only the canonical snapshot.
       */
      /*
       * @agents The backend summary flags the empty-history branch so the screen can
       * keep the empty-state copy aligned with the requested mode.
       */
      const nextSummary =
        response?.summary && typeof response.summary === 'object'
          ? response.summary
          : {};
      const nextCards = Array.isArray(response?.member)
        ? response.member.filter(Boolean)
        : Array.isArray(response)
          ? response.filter(Boolean)
          : [];

      setSnapshotSummary(nextSummary);
      setLoyaltyCards(nextCards);
    } catch (error) {
      if (
        !isMountedRef.current ||
        loyaltySnapshotRequestRef.current !== requestId
      ) {
        return;
      }

      setLoyaltyCards([]);
      setSnapshotSummary({});
      setCardsError(error);
    } finally {
      if (
        isMountedRef.current &&
        loyaltySnapshotRequestRef.current === requestId
      ) {
        setIsLoadingCards(false);
      }
    }
  }, [
    cartDefaultCompany?.id,
    defaultCompany?.id,
    isLogged,
    loyaltyCouponsEnabled,
    ordersStore.actions,
    salesCompany?.id,
    sessionChecked,
    showHistory,
    user?.people,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadLoyaltyCards();
    }, [loadLoyaltyCards]),
  );

  const loyaltyCardGroups = useMemo(
    () => groupCardsByProvider(loyaltyCards),
    [loyaltyCards],
  );

  const renderStampGrid = cardData => {
    /*
     * @agents Stamp slots are derived from the snapshot count only.
     * The UI never recalculates progress from raw orders.
     */
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
            {cardData?.card?.id ? (
              <Text style={[styles.summaryLabel, {color: palette.textMuted}]}>
                Meus carimbos #{cardData.card.id}
              </Text>
            ) : null}
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
                    <View
                      style={[
                        styles.stampImageWrap,
                        {
                          transform: resolveStampTransform(
                            cardData?.card?.id,
                            slot.number,
                          ),
                        },
                      ]}>
                      <Image
                        source={{uri: loyaltyStampIconSource}}
                        style={styles.stampImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.stampMark,
                        {
                          borderColor: palette.chipSelectedBorder,
                          transform: resolveStampTransform(
                            cardData?.card?.id,
                            slot.number,
                          ),
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

  const emptyLoyaltyMessage = resolveLoyaltyEmptyMessage(snapshotSummary);

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_LOYALTY}
      showBottomCart={false}
      showHomeEntryControls
      showSalesShortcuts={false}
      showSearch={false}>
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
              description="A tela de acompanhamento fica oculta porque os cupons de fidelidade nao estao ativos para esta empresa."
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
                <View style={styles.heroTitleRow}>
                  <Text style={[styles.heroTitle, {color: palette.chipSelectedBackground}]}>
                    Acompanhe sua fidelidade
                  </Text>
                  <TouchableOpacity
                    accessibilityLabel="Mostrar ajuda sobre fidelidade"
                    onPress={() => setShowHeroHelpModal(true)}
                    style={[
                      styles.heroHelpButton,
                      {
                        borderColor: palette.chipSelectedBorder,
                        backgroundColor: palette.cardBackground,
                      },
                    ]}>
                    <Text style={[styles.heroHelpButtonText, {color: palette.buttonBackground}]}>
                      ?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Modal
                animationType="fade"
                transparent
                visible={showHeroHelpModal}
                onRequestClose={() => setShowHeroHelpModal(false)}>
                <View style={styles.heroInfoBackdrop}>
                  <View
                    style={[
                      styles.heroInfoCard,
                      {
                        backgroundColor: palette.buttonBackground,
                        borderColor: palette.chipSelectedBorder,
                      },
                    ]}>
                    <View style={styles.heroInfoHeader}>
                      <Text style={[styles.heroTitle, {color: palette.chipSelectedBackground}]}>
                        Acompanhe sua fidelidade
                      </Text>
                      <TouchableOpacity
                        accessibilityLabel="Fechar ajuda sobre fidelidade"
                        onPress={() => setShowHeroHelpModal(false)}
                        style={[
                          styles.heroInfoCloseButton,
                          {
                            borderColor: palette.chipSelectedBorder,
                            backgroundColor: palette.cardBackground,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.heroInfoCloseButtonText,
                            {color: palette.buttonBackground},
                          ]}>
                          x
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.heroText, {color: palette.badgeText}]}>
                      Cada pedido fechado com produtos ou serviços participantes ganha um carimbo.
                      Quando o cartão completa a meta, a próxima venda fechada com
                      o brinde encerra esse cartão.
                    </Text>
                  </View>
                </View>
              </Modal>

              <View style={styles.loyaltyToolbar}>
                <View style={styles.toolbarTitleGroup}>
                  <Text style={[styles.toolbarTitle, {color: palette.textPrimary}]}>
                    {showHistory ? 'Últimos cartões' : 'Cartão atual'}
                  </Text>
                  <Text style={[styles.toolbarMeta, {color: palette.textMuted}]}>
                    {loyaltyCardGroups.length} franquia(s),{' '}
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
                  description="O programa de fidelidade esta ativo, mas seus cartoes e carimbos dependem do cadastro."
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
                loyaltyCardGroups.map(group => (
                  <View key={group.key} style={styles.franchiseGroup}>
                    {group.label ? (
                      <Text
                        style={[
                          styles.franchiseTitle,
                          {color: palette.textPrimary},
                        ]}>
                        {group.label}
                      </Text>
                    ) : null}
                    {group.cards.map((cardData, index) => (
                      <View
                        key={`loyalty-card-${cardData?.card?.id || `current-${index}`}`}
                        style={[
                          styles.summaryCard,
                          styles.groupedSummaryCard,
                          {
                            backgroundColor: palette.cardBackground,
                            borderColor: palette.headerBorder,
                          },
                        ]}>
                        {renderStampGrid(cardData)}
                      </View>
                    ))}
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
                    {emptyLoyaltyMessage}
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
