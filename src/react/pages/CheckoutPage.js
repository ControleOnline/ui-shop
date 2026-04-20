import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopPaymentBar from '@controleonline/ui-shop/src/react/components/storefront/ShopPaymentBar';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import styles from './CheckoutPage.styles';

import {
  formatMoney,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_326_14,
  inlineStyle_328_12,
  inlineStyle_331_14,
  inlineStyle_339_16,
  inlineStyle_343_16,
  inlineStyle_351_20,
  inlineStyle_355_16,
  inlineStyle_366_14,
  inlineStyle_375_16,
  inlineStyle_380_22,
  inlineStyle_385_18,
  inlineStyle_410_26,
  inlineStyle_422_22,
  inlineStyle_429_14,
  inlineStyle_438_16,
  inlineStyle_445_18,
  inlineStyle_450_24,
  inlineStyle_457_22,
  inlineStyle_468_22,
  inlineStyle_480_28,
  inlineStyle_484_24,
  inlineStyle_489_24,
  inlineStyle_504_16,
  inlineStyle_513_18,
  inlineStyle_522_20,
  inlineStyle_526_18,
  inlineStyle_534_24,
  inlineStyle_540_18,
  inlineStyle_549_24,
  inlineStyle_558_16,
  inlineStyle_564_22,
  inlineStyle_572_16,
  inlineStyle_578_22,
} from './CheckoutPage.styles';

import { inlineStyle_371_12 } from './CheckoutPage.styles';

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member']))
    return response['hydra:member'];
  return [];
};

const normalizeText = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const detectGatewayByPaymentType = payment => {
  const text = normalizeText(
    `${payment?.paymentType?.paymentType || ''} ${payment?.paymentCode || ''}`,
  );

  if (text.includes('pix')) return 'pix';
  if (
    text.includes('cart') ||
    text.includes('credito') ||
    text.includes('credit') ||
    text.includes('debito') ||
    text.includes('debit')
  ) {
    return 'card';
  }

  return 'other';
};

const normalizeEntityId = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    return normalizeEntityId(value?.['@id'] || value?.id);
  }

  return String(value).replace(/\D+/g, '').trim();
};

const getPaymentTypeId = payment =>
  normalizeEntityId(
    payment?.paymentType?.['@id'] ||
      payment?.paymentType?.id ||
      payment?.paymentType ||
      payment?.id,
  );

const getPaymentTypeLabel = payment =>
  String(
    payment?.paymentType?.paymentType ||
      payment?.paymentType?.name ||
      payment?.paymentCode ||
      'Pagamento',
  ).trim() || 'Pagamento';

const getPaymentTypeWalletLabel = payment =>
  String(
    payment?.wallet?.wallet ||
      payment?.wallet?.name ||
      payment?.wallet?.alias ||
      '',
  ).trim();

const pickPendingStatus = statuses => {
  const all = Array.isArray(statuses) ? statuses : [];
  return (
    all.find(item => {
      const real = normalizeText(item?.realStatus);
      const label = normalizeText(item?.status);
      return (
        real === 'pending' &&
        (label.includes('waiting') || label.includes('aguard'))
      );
    }) ||
    all.find(item => normalizeText(item?.realStatus) === 'pending') ||
    all.find(item => normalizeText(item?.context) === 'invoice') ||
    null
  );
};

const sortInvoicesByDateDesc = invoices =>
  [...(Array.isArray(invoices) ? invoices : [])].sort((a, b) => {
    const aDate = new Date(a?.dueDate || a?.invoice_date || 0).getTime();
    const bDate = new Date(b?.dueDate || b?.invoice_date || 0).getTime();
    return bDate - aDate;
  });

const getInvoiceStatusKeys = invoice => ({
  realStatus: normalizeText(
    invoice?.status?.realStatus || invoice?.status?.real_status,
  ),
  status: normalizeText(invoice?.status?.status),
});

const isCanceledInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return ['canceled', 'cancelled'].includes(realStatus) || ['canceled', 'cancelled'].includes(status);
};

const isPaidInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return realStatus === 'closed' || ['closed', 'paid'].includes(status);
};

const findReusableInvoiceForPaymentType = (invoices, selectedPaymentType) => {
  const paymentTypeId = getPaymentTypeId(selectedPaymentType);

  if (!paymentTypeId) {
    return null;
  }

  return (
    sortInvoicesByDateDesc(invoices).find(invoice => {
      return (
        !isCanceledInvoice(invoice) &&
        !isPaidInvoice(invoice) &&
        getPaymentTypeId(invoice) === paymentTypeId
      );
    }) || null
  );
};

export default function CheckoutPage() {
  const navigation = useNavigation();
  const {
    cart,
    currentCompany,
    defaultCompany,
    refreshCart,
    salesCompany,
  } = useShopCart({autoRefresh: true});
  const {chargeOnDeliveryEnabled} = useShopSettings();
  const theme = pickTheme(defaultCompany);

  const walletPaymentTypeStore = useStore('walletPaymentType');
  const walletPaymentTypeActions = walletPaymentTypeStore.actions;
  const cardStore = useStore('card');
  const cardActions = cardStore.actions;
  const invoiceStore = useStore('invoice');
  const invoiceActions = invoiceStore.actions;
  const statusStore = useStore('status');
  const statusActions = statusStore.actions;
  const asaasStore = useStore('asaas');
  const asaasActions = asaasStore.actions;

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [cards, setCards] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualPaymentModalVisible, setManualPaymentModalVisible] =
    useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hasCart = Boolean(cart?.id);
  const cartItems = Array.isArray(cart?.orderProducts)
    ? cart.orderProducts
    : [];
  const itemsCount = cartItems.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
  const cartTotal = Number(cart?.price || 0);
  const paidAmount = useMemo(
    () =>
      invoices.reduce((sum, currentInvoice) => {
        if (!isPaidInvoice(currentInvoice)) {
          return sum;
        }

        return sum + Number(currentInvoice?.price || 0);
      }, 0),
    [invoices],
  );
  const pendingAmount = useMemo(
    () => Math.max(cartTotal - paidAmount, 0),
    [cartTotal, paidAmount],
  );

  const cardPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(item => detectGatewayByPaymentType(item) === 'card'),
    [paymentTypes],
  );
  const pixPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(item => detectGatewayByPaymentType(item) === 'pix'),
    [paymentTypes],
  );
  const manualPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(item => detectGatewayByPaymentType(item) === 'other'),
    [paymentTypes],
  );
  const deliveryPaymentLabels = useMemo(
    () => manualPaymentTypes.map(getPaymentTypeLabel).filter(Boolean),
    [manualPaymentTypes],
  );

  const pickPaymentTypeForGateway = useCallback(
    gateway => {
      if (gateway === 'card' && cardPaymentTypes.length > 0) {
        return cardPaymentTypes[0];
      }
      if (gateway === 'pix' && pixPaymentTypes.length > 0) {
        return pixPaymentTypes[0];
      }
      if (gateway === 'other' && manualPaymentTypes.length > 0) {
        return manualPaymentTypes[0];
      }
      return paymentTypes[0] || null;
    },
    [cardPaymentTypes, manualPaymentTypes, paymentTypes, pixPaymentTypes],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await refreshCart();

      const [
        paymentTypeResponse,
        cardsResponse,
        statusResponse,
        invoicesResponse,
      ] = await Promise.all([
        (salesCompany?.id || defaultCompany?.id)
          ? walletPaymentTypeActions.getItems({
              company: salesCompany?.id || defaultCompany.id,
              itemsPerPage: 200,
            })
          : Promise.resolve([]),
        cardActions.getItems({itemsPerPage: 200}),
        statusActions.getItems({
          context: 'invoice',
          itemsPerPage: 200,
        }),
        cart?.id
          ? invoiceActions.getItems({
              orderId: cart.id,
              'order.order': `/orders/${cart.id}`,
              itemsPerPage: 50,
            })
          : Promise.resolve([]),
      ]);

      const fetchedPaymentTypes = extractItems(paymentTypeResponse);
      const fetchedCards = extractItems(cardsResponse);
      const fetchedStatuses = extractItems(statusResponse);
      const fetchedInvoices = sortInvoicesByDateDesc(
        extractItems(invoicesResponse),
      );

      setPaymentTypes(fetchedPaymentTypes);
      setCards(fetchedCards);
      setInvoices(fetchedInvoices);
      setSelectedCard(
        previous =>
          fetchedCards.find(item => item?.id === previous?.id) ||
          fetchedCards[0] ||
          null,
      );
      setPendingStatus(pickPendingStatus(fetchedStatuses));
    } catch (e) {
      setError(
        e?.message || 'Não foi possível carregar os dados de pagamento.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    cardActions,
    cart?.id,
    defaultCompany?.id,
    invoiceActions,
    refreshCart,
    salesCompany?.id,
    statusActions,
    walletPaymentTypeActions,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const ensureInvoiceForPaymentType = useCallback(
    async selectedPaymentType => {
      if (!hasCart) {
        throw new Error('Carrinho não encontrado para checkout.');
      }

      if (pendingAmount <= 0.009) {
        throw new Error('Este pedido ja foi pago.');
      }

      const reusableInvoice = findReusableInvoiceForPaymentType(
        invoices,
        selectedPaymentType,
      );

      if (reusableInvoice?.id) {
        return reusableInvoice;
      }

      if (
        !selectedPaymentType?.paymentType?.['@id'] ||
        !selectedPaymentType?.wallet?.['@id']
      ) {
        throw new Error(
          'Forma de pagamento indisponível para gerar a cobrança.',
        );
      }

      const payload = {
        dueDate: Formatter.getCurrentDate(),
        order: cart?.['@id'] || `/orders/${cart?.id}`,
        price: Number(cart?.price || 0),
        payer: currentCompany?.id ? `/people/${currentCompany.id}` : undefined,
        receiver: salesCompany?.id
          ? `/people/${salesCompany.id}`
          : defaultCompany?.id
            ? `/people/${defaultCompany.id}`
          : undefined,
        destinationWallet: selectedPaymentType.wallet?.['@id'],
        paymentType: selectedPaymentType.paymentType?.['@id'],
      };

      if (pendingStatus?.['@id']) {
        payload.status = pendingStatus['@id'];
      }

      const createdInvoice = await invoiceActions.save(payload);
      setInvoices(currentInvoices =>
        sortInvoicesByDateDesc([
          createdInvoice,
          ...currentInvoices.filter(item => item?.id !== createdInvoice?.id),
        ]),
      );
      return createdInvoice;
    },
    [
      cart?.['@id'],
      cart?.id,
      cart?.price,
      currentCompany?.id,
      defaultCompany?.id,
      hasCart,
      invoiceActions,
      invoices,
      pendingAmount,
      pendingStatus,
      salesCompany?.id,
    ],
  );

  const ensureInvoice = useCallback(
    async gateway => {
      const selectedPaymentType = pickPaymentTypeForGateway(gateway);
      return ensureInvoiceForPaymentType(selectedPaymentType);
    },
    [ensureInvoiceForPaymentType, pickPaymentTypeForGateway],
  );

  const handlePayWithCard = useCallback(async () => {
    setError('');
    setMessage('');
    setPixData(null);

    if (!selectedCard?.id) {
      setError('Selecione um cartão salvo antes de confirmar o pagamento.');
      return;
    }

    setIsProcessing(true);
    try {
      const targetInvoice = await ensureInvoice('card');
      await asaasActions.payWithCard({
        invoice: targetInvoice,
        card: selectedCard,
      });
      setMessage(
        'Pagamento com cartão enviado. Aguarde alguns instantes para confirmação.',
      );
      await loadData();
    } catch (e) {
      setError(
        e?.message || 'Não foi possível processar o pagamento com cartão.',
      );
    } finally {
      setIsProcessing(false);
    }
  }, [asaasActions, ensureInvoice, loadData, selectedCard]);

  const handleGeneratePix = useCallback(async () => {
    setError('');
    setMessage('');

    setIsProcessing(true);
    try {
      const targetInvoice = await ensureInvoice('pix');
      const pixResponse = await asaasActions.getPix({invoice: targetInvoice});
      if (!pixResponse?.payload) {
        throw new Error('Não foi possível gerar o Pix para esta cobrança.');
      }
      setPixData(pixResponse);
      setMessage('Pix gerado com sucesso.');
      await loadData();
    } catch (e) {
      setError(e?.message || 'Não foi possível gerar o Pix.');
    } finally {
      setIsProcessing(false);
    }
  }, [asaasActions, ensureInvoice, loadData]);

  const handleCopyPix = useCallback(async () => {
    if (!pixData?.payload) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(pixData.payload);
      setMessage('Código Pix copiado.');
      return;
    }
    setMessage('Copie manualmente o código Pix exibido.');
  }, [pixData?.payload]);

  const handleConfirmChargeOnDelivery = useCallback(
    async selectedPaymentType => {
      setError('');
      setMessage('');
      setPixData(null);

      setIsProcessing(true);
      try {
        await ensureInvoiceForPaymentType(selectedPaymentType);
        const orderId = String(cart?.id || '');
        if (orderId) {
          navigation.navigate('ShopOrderDetailsPage', {id: orderId});
          return;
        }

        setMessage(
          `Pedido registrado para cobrar na entrega via ${getPaymentTypeLabel(selectedPaymentType)}.`,
        );
      } catch (e) {
        setError(
          e?.message ||
            'Nao foi possivel registrar a cobranca para pagamento na entrega.',
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [cart?.id, ensureInvoiceForPaymentType, navigation],
  );

  const handleChargeOnDelivery = useCallback(async () => {
    setError('');
    setMessage('');
    setPixData(null);

    if (!chargeOnDeliveryEnabled) {
      return;
    }

    if (manualPaymentTypes.length === 0) {
      setError(
        'A loja ainda nao configurou um meio manual para cobrar na entrega.',
      );
      return;
    }

    if (manualPaymentTypes.length === 1) {
      await handleConfirmChargeOnDelivery(manualPaymentTypes[0]);
      return;
    }

    setManualPaymentModalVisible(true);
  }, [
    chargeOnDeliveryEnabled,
    handleConfirmChargeOnDelivery,
    manualPaymentTypes,
  ]);

  const handleSelectDeliveryPayment = useCallback(
    async selectedPaymentType => {
      setManualPaymentModalVisible(false);
      await handleConfirmChargeOnDelivery(selectedPaymentType);
    },
    [handleConfirmChargeOnDelivery],
  );

  const checkoutBlocked = isLoading || isProcessing || !hasCart || !itemsCount;
  const deliveryCheckoutBlocked =
    checkoutBlocked || pendingAmount <= 0.009 || manualPaymentTypes.length === 0;
  const checkoutActions = useMemo(
    () => [
      pixPaymentTypes.length > 0
        ? {
            key: 'pix',
            label: 'Gerar Pix',
            icon: 'qr-code-scanner',
            variant: 'success',
            loading: isProcessing,
            disabled: checkoutBlocked || pendingAmount <= 0.009,
            onPress: handleGeneratePix,
          }
        : null,
      cardPaymentTypes.length > 0
        ? {
            key: 'card',
            label: 'Pagar com cartao',
            icon: 'credit-card',
            variant: 'primary',
            loading: isProcessing,
            disabled:
              checkoutBlocked ||
              pendingAmount <= 0.009 ||
              !selectedCard?.id,
            onPress: handlePayWithCard,
          }
        : null,
    ],
    [
      cardPaymentTypes.length,
      checkoutBlocked,
      handleGeneratePix,
      handlePayWithCard,
      isProcessing,
      pendingAmount,
      pixPaymentTypes.length,
      selectedCard?.id,
    ],
  );

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={inlineStyle_326_14}>
          <ScrollView
            style={inlineStyle_328_12}
            contentContainerStyle={[
              inlineStyle_371_12,
              {paddingBottom: 232},
            ]}>
            <View
              style={inlineStyle_331_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_339_16({
                  theme: theme,
                })}>
                CHECKOUT
              </Text>
              <Text
                style={inlineStyle_343_16({
                  theme: theme,
                })}>
                Pedido #{cart?.id || '--'}
              </Text>
              <Text style={inlineStyle_351_20({
                theme: theme,
              })}>
                {itemsCount} item(ns)
              </Text>
              <Text
                style={inlineStyle_355_16({
                  theme: theme,
                })}>
                {formatMoney(cartTotal)}
              </Text>
            </View>

            <View
              style={inlineStyle_366_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_375_16({
                  theme: theme,
                })}>
                Método financeiro
              </Text>

              {isLoading ? (
                <View style={inlineStyle_380_22}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : paymentTypes.length > 0 ? (
                <View
                  style={inlineStyle_385_18}>
                  {paymentTypes.map(item => {
                    const gateway = detectGatewayByPaymentType(item);
                    const label = item?.paymentType?.paymentType || 'Pagamento';
                    return (
                      <View
                        key={item?.id || label}
                        style={[
                          styles.methodChip,
                          {
                            borderColor: theme.cardBorder,
                            backgroundColor:
                              gateway === 'pix'
                                ? `${theme.success}16`
                                : gateway === 'card'
                                  ? `${theme.primary}14`
                                  : `${theme.cardBorder}40`,
                          },
                        ]}>
                        <Text
                          style={inlineStyle_410_26({
                            theme: theme,
                          })}>
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={inlineStyle_422_22({
                  theme: theme,
                })}>
                  Nenhuma forma de pagamento disponível para esta empresa.
                </Text>
              )}
            </View>

            {chargeOnDeliveryEnabled && (
              <View
                style={inlineStyle_429_14({
                  theme: theme,
                })}>
                <View style={styles.methodCardHeader}>
                  <Text
                    style={[
                      styles.methodCardTitle,
                      {color: theme.text},
                    ]}>
                    Cobrar na entrega
                  </Text>
                  <View
                    style={[
                      styles.methodChip,
                      {
                        borderColor:
                          manualPaymentTypes.length > 0
                            ? theme.primary
                            : theme.cardBorder,
                        backgroundColor:
                          manualPaymentTypes.length > 0
                            ? `${theme.primary}14`
                            : `${theme.cardBorder}30`,
                      },
                    ]}>
                    <Text
                      style={[
                        inlineStyle_410_26({
                          theme: theme,
                        }),
                        {
                          color:
                            manualPaymentTypes.length > 0
                              ? theme.primary
                              : theme.muted,
                        },
                      ]}>
                      {manualPaymentTypes.length > 0
                        ? `${manualPaymentTypes.length} meio(s)`
                        : 'Indisponivel'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.methodCardMeta,
                    {color: theme.muted},
                  ]}>
                  O pedido fica registrado para cobranca manual na entrega, usando as carteiras da loja.
                </Text>
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.text},
                  ]}>
                  {manualPaymentTypes.length > 0
                    ? `Meios manuais disponiveis: ${deliveryPaymentLabels.join(', ')}.`
                    : 'Cadastre ao menos um meio manual da empresa para liberar essa opcao no checkout.'}
                </Text>

                <TouchableOpacity
                  onPress={handleChargeOnDelivery}
                  disabled={deliveryCheckoutBlocked}
                  style={[
                    styles.modalCloseButton,
                    {
                      marginTop: 12,
                      backgroundColor: deliveryCheckoutBlocked
                        ? theme.surface
                        : theme.primary,
                      borderColor: deliveryCheckoutBlocked
                        ? theme.cardBorder
                        : theme.primary,
                    },
                  ]}>
                  {isProcessing ? (
                    <ActivityIndicator
                      color={
                        deliveryCheckoutBlocked
                          ? theme.primary
                          : theme.onPrimary || '#FFFFFF'
                      }
                    />
                  ) : (
                    <Text
                      style={[
                        styles.modalCloseText,
                        {
                          color: deliveryCheckoutBlocked
                            ? theme.text
                            : theme.onPrimary || '#FFFFFF',
                        },
                      ]}>
                      Cobrar na entrega
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View
              style={inlineStyle_429_14({
                theme: theme,
              })}>
              <View
                style={inlineStyle_438_16}>
                <Text
                  style={inlineStyle_445_18({
                    theme: theme,
                  })}>
                  Cartões salvos
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ShopCardsPage')}>
                  <Text style={inlineStyle_450_24({
                    theme: theme,
                  })}>
                    Gerenciar
                  </Text>
                </TouchableOpacity>
              </View>

              {cards.length === 0 ? (
                <Text style={inlineStyle_457_22({
                  theme: theme,
                })}>
                  Nenhum cartão salvo. Cadastre um cartão para pagar com
                  crédito.
                </Text>
              ) : (
                cards.map(card => {
                  const isSelected = card?.id === selectedCard?.id;
                  return (
                    <TouchableOpacity
                      key={card.id}
                      onPress={() => setSelectedCard(card)}
                      style={inlineStyle_468_22({
                        isSelected: isSelected,
                        theme: theme,
                      })}>
                      <Text style={inlineStyle_480_28({
                        theme: theme,
                      })}>
                        {(card?.type || 'Crédito').toUpperCase()}
                      </Text>
                      <Text
                        style={inlineStyle_484_24({
                          theme: theme,
                        })}>
                        {card?.number_group_1 || '****'} •••• ••••{' '}
                        {card?.number_group_4 || '****'}
                      </Text>
                      <Text
                        style={inlineStyle_489_24({
                          theme: theme,
                        })}>
                        {card?.name || 'Titular'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {!!pixData?.payload && (
              <View
                style={inlineStyle_504_16({
                  theme: theme,
                })}>
                <Text
                  style={inlineStyle_513_18({
                    theme: theme,
                  })}>
                  Pix gerado
                </Text>
                {pixData?.encodedImage ? (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${pixData.encodedImage}`,
                    }}
                    resizeMode="contain"
                    style={inlineStyle_522_20}
                  />
                ) : null}
                <View
                  style={inlineStyle_526_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_534_24({
                    theme: theme,
                  })}>
                    {pixData.payload}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyPix}
                  style={inlineStyle_540_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_549_24({
                    theme: theme,
                  })}>
                    Copiar código Pix
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!!error && (
              <View
                style={inlineStyle_558_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_564_22({
                  theme: theme,
                })}>
                  {error}
                </Text>
              </View>
            )}

            {!!message && (
              <View
                style={inlineStyle_572_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_578_22({
                  theme: theme,
                })}>
                  {message}
                </Text>
              </View>
            )}
          </ScrollView>

          <Modal
            animationType="fade"
            transparent={true}
            visible={manualPaymentModalVisible}
            onRequestClose={() => setManualPaymentModalVisible(false)}>
            <View style={styles.modalBackdrop}>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.cardBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: theme.text},
                  ]}>
                  Cobrar na entrega
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.muted},
                  ]}>
                  Escolha qual meio manual da loja deve registrar a cobranca deste pedido na entrega.
                </Text>

                {manualPaymentTypes.map(paymentType => {
                  const paymentLabel = getPaymentTypeLabel(paymentType);
                  const walletLabel = getPaymentTypeWalletLabel(paymentType);

                  return (
                    <TouchableOpacity
                      key={getPaymentTypeId(paymentType) || paymentLabel}
                      style={[
                        styles.modalItem,
                        {
                          borderColor: theme.cardBorder,
                          backgroundColor: theme.background,
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() =>
                        handleSelectDeliveryPayment(paymentType)
                      }>
                      <Text
                        style={[
                          styles.modalItemTitle,
                          {color: theme.text},
                        ]}>
                        {paymentLabel}
                      </Text>
                      <Text
                        style={[
                          styles.modalItemMeta,
                          {color: theme.muted},
                        ]}>
                        {walletLabel
                          ? `${walletLabel} • toque para continuar`
                          : 'Toque para continuar'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  onPress={() => setManualPaymentModalVisible(false)}>
                  <Text
                    style={[
                      styles.modalCloseText,
                      {color: theme.text},
                    ]}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <ShopPaymentBar
            actions={checkoutActions}
            paidAmount={paidAmount}
            pendingAmount={pendingAmount}
            theme={theme}
            totalAmount={cartTotal}
          />
        </View>
      )}
    </ShopShell>
  );
}
