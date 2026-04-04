import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {
  formatMoney,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

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

export default function CheckoutPage() {
  const navigation = useNavigation();
  const {cart, defaultCompany, currentCompany, refreshCart} = useShopCart({
    autoRefresh: true,
  });
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
  const [selectedCard, setSelectedCard] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const pickPaymentTypeForGateway = useCallback(
    gateway => {
      if (gateway === 'card' && cardPaymentTypes.length > 0) {
        return cardPaymentTypes[0];
      }
      if (gateway === 'pix' && pixPaymentTypes.length > 0) {
        return pixPaymentTypes[0];
      }
      return paymentTypes[0] || null;
    },
    [cardPaymentTypes, paymentTypes, pixPaymentTypes],
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
        defaultCompany?.id
          ? walletPaymentTypeActions.getItems({
              company: defaultCompany.id,
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
      setSelectedCard(
        previous =>
          fetchedCards.find(item => item?.id === previous?.id) ||
          fetchedCards[0] ||
          null,
      );
      setPendingStatus(pickPendingStatus(fetchedStatuses));
      setInvoice(fetchedInvoices[0] || null);
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
    statusActions,
    walletPaymentTypeActions,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const ensureInvoice = useCallback(
    async gateway => {
      if (!hasCart) {
        throw new Error('Carrinho não encontrado para checkout.');
      }

      if (invoice?.id) {
        return invoice;
      }

      const selectedPaymentType = pickPaymentTypeForGateway(gateway);

      if (!selectedPaymentType?.paymentType?.['@id']) {
        throw new Error(
          'Forma de pagamento indisponível para gerar a cobrança.',
        );
      }

      const payload = {
        dueDate: Formatter.getCurrentDate(),
        order: cart?.['@id'] || `/orders/${cart?.id}`,
        price: Number(cart?.price || 0),
        payer: currentCompany?.id ? `/people/${currentCompany.id}` : undefined,
        receiver: defaultCompany?.id
          ? `/people/${defaultCompany.id}`
          : undefined,
        destinationWallet: selectedPaymentType.wallet?.['@id'],
        paymentType: selectedPaymentType.paymentType?.['@id'],
      };

      if (pendingStatus?.['@id']) {
        payload.status = pendingStatus['@id'];
      }

      const createdInvoice = await invoiceActions.save(payload);
      setInvoice(createdInvoice);
      return createdInvoice;
    },
    [
      cart?.['@id'],
      cart?.id,
      cart?.price,
      currentCompany?.id,
      defaultCompany?.id,
      hasCart,
      invoice,
      invoiceActions,
      pendingStatus,
      pickPaymentTypeForGateway,
    ],
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

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={{flex: 1}}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{padding: 14, paddingBottom: 120}}>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
                backgroundColor: `${theme.primary}10`,
                padding: 14,
              }}>
              <Text
                style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>
                CHECKOUT
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '800',
                }}>
                Pedido #{cart?.id || '--'}
              </Text>
              <Text style={{marginTop: 6, color: theme.muted, fontSize: 13}}>
                {itemsCount} item(ns)
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: theme.primary,
                  fontSize: 28,
                  fontWeight: '900',
                }}>
                {formatMoney(cartTotal)}
              </Text>
            </View>

            <View
              style={{
                marginTop: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                backgroundColor: theme.surface,
                padding: 14,
              }}>
              <Text
                style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>
                Método financeiro
              </Text>

              {isLoading ? (
                <View style={{paddingVertical: 18, alignItems: 'center'}}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : paymentTypes.length > 0 ? (
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}>
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
                          style={{
                            color: theme.text,
                            fontSize: 12,
                            fontWeight: '700',
                          }}>
                          {label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={{marginTop: 10, color: theme.muted}}>
                  Nenhuma forma de pagamento disponível para esta empresa.
                </Text>
              )}
            </View>

            <View
              style={{
                marginTop: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                backgroundColor: theme.surface,
                padding: 14,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                <Text
                  style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>
                  Cartões salvos
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ShopCardsPage')}>
                  <Text style={{color: theme.primary, fontWeight: '800'}}>
                    Gerenciar
                  </Text>
                </TouchableOpacity>
              </View>

              {cards.length === 0 ? (
                <Text style={{color: theme.muted}}>
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
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.cardBorder,
                        backgroundColor: isSelected
                          ? `${theme.primary}12`
                          : '#fff',
                        padding: 12,
                        marginTop: 8,
                      }}>
                      <Text style={{color: theme.text, fontWeight: '800'}}>
                        {(card?.type || 'Crédito').toUpperCase()}
                      </Text>
                      <Text
                        style={{marginTop: 2, color: theme.text, fontSize: 15}}>
                        {card?.number_group_1 || '****'} •••• ••••{' '}
                        {card?.number_group_4 || '****'}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: theme.muted,
                          fontSize: 12,
                        }}>
                        {card?.name || 'Titular'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {!!pixData?.payload && (
              <View
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.surface,
                  padding: 14,
                }}>
                <Text
                  style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>
                  Pix gerado
                </Text>
                {pixData?.encodedImage ? (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${pixData.encodedImage}`,
                    }}
                    resizeMode="contain"
                    style={{width: '100%', height: 260, marginTop: 10}}
                  />
                ) : null}
                <View
                  style={{
                    marginTop: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    backgroundColor: '#fff',
                    padding: 10,
                  }}>
                  <Text style={{color: theme.text, fontSize: 12}}>
                    {pixData.payload}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyPix}
                  style={{
                    marginTop: 10,
                    minHeight: 40,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: theme.text, fontWeight: '700'}}>
                    Copiar código Pix
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!!error && (
              <View
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  backgroundColor: `${theme.danger}15`,
                  padding: 10,
                }}>
                <Text style={{color: theme.danger, fontWeight: '700'}}>
                  {error}
                </Text>
              </View>
            )}

            {!!message && (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 12,
                  backgroundColor: `${theme.success}18`,
                  padding: 10,
                }}>
                <Text style={{color: theme.success, fontWeight: '700'}}>
                  {message}
                </Text>
              </View>
            )}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              padding: 10,
              flexDirection: 'row',
              gap: 10,
            }}>
            <TouchableOpacity
              onPress={handleGeneratePix}
              disabled={isLoading || isProcessing || !hasCart || !itemsCount}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.success,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || isProcessing ? 0.6 : 1,
              }}>
              <Text style={{color: theme.success, fontWeight: '800'}}>
                Gerar Pix
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePayWithCard}
              disabled={isLoading || isProcessing || !hasCart || !itemsCount}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || isProcessing ? 0.6 : 1,
              }}>
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{color: '#fff', fontWeight: '800'}}>
                  Pagar com cartão
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  methodChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
