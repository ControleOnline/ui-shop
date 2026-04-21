import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
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
import {
  buildWalletIdsForGateway,
  filterDeviceConfigsByCompany,
  getPaymentGatewayLabel,
  isOrderChargeOnDeliveryEnabled,
  resolveRemotePaymentDeviceOptions,
} from '@controleonline/ui-common/src/react/utils/paymentDevices';
import {
  detectPaymentOptionKind,
  getPaymentOptionId,
  getPaymentOptionLabel,
  getPaymentOptionWalletId,
  isCashPaymentOption,
  isIntegratedPaymentOption,
} from '@controleonline/ui-common/src/react/utils/paymentOptions';
import {
  formatMoneyInputValue,
  normalizeMoneyInputText,
  parseMoneyInputValue,
  resolveCashPaymentDetails,
} from '@controleonline/ui-common/src/react/utils/cashPayment';
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

import {inlineStyle_371_12} from './CheckoutPage.styles';

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member'])) {
    return response['hydra:member'];
  }
  return [];
};

const normalizeText = value =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeEntityId = value => {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    return normalizeEntityId(value?.['@id'] || value?.id);
  }

  return String(value).replace(/\D+/g, '').trim();
};

const parseInvoiceOtherInformations = value => {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof value === 'object' ? value : {};
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

const getInvoiceStatusKeys = invoice => ({
  realStatus: normalizeText(
    invoice?.status?.realStatus || invoice?.status?.real_status,
  ),
  status: normalizeText(invoice?.status?.status),
});

const isCanceledInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return (
    ['canceled', 'cancelled'].includes(realStatus) ||
    ['canceled', 'cancelled'].includes(status)
  );
};

const isPaidInvoice = invoice => {
  const {realStatus, status} = getInvoiceStatusKeys(invoice);
  return realStatus === 'closed' || ['closed', 'paid'].includes(status);
};

const matchesDeliveryMetadata = (invoice, metadata) => {
  if (!metadata) {
    return true;
  }

  const otherInformations = parseInvoiceOtherInformations(
    invoice?.otherInformations,
  );
  const hasTargetDevice = normalizeEntityId(metadata?.targetDeviceId) !== '';

  return (
    normalizeText(otherInformations?.channel) ===
      normalizeText(metadata.channel) &&
    normalizeText(otherInformations?.paymentMode) ===
      normalizeText(metadata.paymentMode) &&
    (!hasTargetDevice ||
      normalizeEntityId(otherInformations?.targetDeviceId) ===
        normalizeEntityId(metadata.targetDeviceId)) &&
    Number(otherInformations?.changeFor || 0) ===
      Number(metadata.changeFor || 0) &&
    Number(otherInformations?.receivedAmount || 0) ===
      Number(metadata.receivedAmount || 0)
  );
};

const findReusableInvoiceForPaymentType = (
  invoices,
  selectedPaymentType,
  {deliveryMetadata = null} = {},
) => {
  const paymentTypeId = getPaymentOptionId(selectedPaymentType);
  const walletId = getPaymentOptionWalletId(selectedPaymentType);

  if (!paymentTypeId) {
    return null;
  }

  return (
    sortInvoicesByDateDesc(invoices).find(invoice => {
      if (isCanceledInvoice(invoice) || isPaidInvoice(invoice)) {
        return false;
      }

      if (getPaymentOptionId(invoice) !== paymentTypeId) {
        return false;
      }

      if (walletId && getPaymentOptionWalletId(invoice) !== walletId) {
        return false;
      }

      return matchesDeliveryMetadata(invoice, deliveryMetadata);
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
  const {
    chargeOnDeliveryEnabled: shopChargeOnDeliveryEnabled,
    companyConfigs: settingsCompanyConfigs,
  } = useShopSettings();
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
  const deviceConfigStore = useStore('device_config');
  const deviceConfigActions = deviceConfigStore.actions;

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [deliveryPaymentTypes, setDeliveryPaymentTypes] = useState([]);
  const [companyDeviceConfigs, setCompanyDeviceConfigs] = useState([]);
  const [cards, setCards] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingRemoteDevices, setLoadingRemoteDevices] = useState(false);
  const [deliveryModeModalVisible, setDeliveryModeModalVisible] =
    useState(false);
  const [deliveryChangeModalVisible, setDeliveryChangeModalVisible] =
    useState(false);
  const [cashReceivedValue, setCashReceivedValue] = useState('');
  const [selectedDeliveryPaymentType, setSelectedDeliveryPaymentType] =
    useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sellerCompany = salesCompany || defaultCompany || null;
  const sellerCompanyId = sellerCompany?.id || null;
  const effectiveCompanyConfigs = useMemo(() => {
    if (salesCompany?.configs && typeof salesCompany.configs === 'object') {
      return salesCompany.configs;
    }

    if (
      settingsCompanyConfigs &&
      typeof settingsCompanyConfigs === 'object' &&
      !Array.isArray(settingsCompanyConfigs)
    ) {
      return settingsCompanyConfigs;
    }

    return {};
  }, [salesCompany?.configs, settingsCompanyConfigs]);
  const chargeOnDeliveryEnabled = useMemo(
    () =>
      shopChargeOnDeliveryEnabled ||
      isOrderChargeOnDeliveryEnabled(effectiveCompanyConfigs),
    [effectiveCompanyConfigs, shopChargeOnDeliveryEnabled],
  );

  const hasCart = Boolean(cart?.id);
  const cartItems = Array.isArray(cart?.orderProducts) ? cart.orderProducts : [];
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
  const cashPaymentDetails = useMemo(
    () =>
      resolveCashPaymentDetails({
        receivedAmount: parseMoneyInputValue(cashReceivedValue),
        totalAmount: pendingAmount,
      }),
    [cashReceivedValue, pendingAmount],
  );

  const cardPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(
        item =>
          detectPaymentOptionKind(item) === 'card' &&
          isIntegratedPaymentOption(item),
      ),
    [paymentTypes],
  );
  const pixPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(
        item =>
          detectPaymentOptionKind(item) === 'pix' &&
          isIntegratedPaymentOption(item),
      ),
    [paymentTypes],
  );
  const paymentMethodChips = useMemo(() => {
    const chips = [];

    if (pixPaymentTypes.length > 0) {
      chips.push({
        key: 'pix',
        label:
          pixPaymentTypes.length === 1
            ? getPaymentOptionLabel(pixPaymentTypes[0])
            : 'Pix online',
      });
    }

    if (cardPaymentTypes.length > 0) {
      chips.push({
        key: 'card',
        label:
          cardPaymentTypes.length === 1
            ? getPaymentOptionLabel(cardPaymentTypes[0])
            : 'Cartao online',
      });
    }

    if (chargeOnDeliveryEnabled) {
      chips.push({
        key: 'delivery',
        label: 'Cobrar na entrega',
      });
    }

    return chips;
  }, [cardPaymentTypes, chargeOnDeliveryEnabled, pixPaymentTypes]);

  const remotePaymentDevices = useMemo(
    () =>
      resolveRemotePaymentDeviceOptions({
        deviceConfig: null,
        deviceConfigs: companyDeviceConfigs,
        companyConfigs: effectiveCompanyConfigs,
      }),
    [companyDeviceConfigs, effectiveCompanyConfigs],
  );
  const defaultDeliveryDevice = useMemo(
    () => remotePaymentDevices[0] || null,
    [remotePaymentDevices],
  );
  const deliveryCashPayment = useMemo(
    () => deliveryPaymentTypes.find(isCashPaymentOption) || null,
    [deliveryPaymentTypes],
  );
  const deliveryMachinePayment = useMemo(
    () =>
      deliveryPaymentTypes.find(
        item =>
          isIntegratedPaymentOption(item) && !isCashPaymentOption(item),
      ) || null,
    [deliveryPaymentTypes],
  );
  const deliveryModeOptions = useMemo(() => {
    const options = [];

    if (deliveryMachinePayment) {
      options.push({
        key: 'machine',
        label: 'Maquininha na entrega',
        description:
          'O cliente vai pagar quando o motoboy chegar com a maquininha.',
        paymentType: deliveryMachinePayment,
      });
    }

    if (deliveryCashPayment) {
      options.push({
        key: 'cash',
        label: 'Dinheiro',
        description:
          'O cliente informa para quanto precisa de troco e o motoboy leva o valor.',
        paymentType: deliveryCashPayment,
      });
    }

    return options;
  }, [deliveryCashPayment, deliveryMachinePayment]);
  const deliveryModeLabels = useMemo(
    () => deliveryModeOptions.map(item => item.label).filter(Boolean),
    [deliveryModeOptions],
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
      const refreshedCart = await refreshCart();
      const resolvedCart = refreshedCart?.id ? refreshedCart : cart;

      const [
        paymentTypeResponse,
        cardsResponse,
        statusResponse,
        invoicesResponse,
      ] = await Promise.all([
        sellerCompanyId
          ? walletPaymentTypeActions.getItems({
              company: sellerCompanyId,
              itemsPerPage: 200,
            })
          : Promise.resolve([]),
        cardActions.getItems({itemsPerPage: 200}),
        statusActions.getItems({
          context: 'invoice',
          itemsPerPage: 200,
        }),
        resolvedCart?.id
          ? invoiceActions.getItems({
              orderId: resolvedCart.id,
              'order.order': `/orders/${resolvedCart.id}`,
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
    cart,
    invoiceActions,
    refreshCart,
    sellerCompanyId,
    statusActions,
    walletPaymentTypeActions,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!sellerCompanyId || !chargeOnDeliveryEnabled) {
        setCompanyDeviceConfigs([]);
        setLoadingRemoteDevices(false);
        return undefined;
      }

      let isMounted = true;
      setLoadingRemoteDevices(true);

      deviceConfigActions
        .getItems({
          people: `/people/${sellerCompanyId}`,
          itemsPerPage: 200,
        })
        .then(data => {
          if (!isMounted) {
            return;
          }

          setCompanyDeviceConfigs(
            filterDeviceConfigsByCompany(data, sellerCompanyId),
          );
        })
        .catch(() => {
          if (isMounted) {
            setCompanyDeviceConfigs([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoadingRemoteDevices(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [chargeOnDeliveryEnabled, deviceConfigActions, sellerCompanyId]),
  );

  useEffect(() => {
    if (!sellerCompanyId || !chargeOnDeliveryEnabled) {
      setDeliveryPaymentTypes([]);
      return undefined;
    }

    const walletIds = buildWalletIdsForGateway({
      gateway: defaultDeliveryDevice?.gateway,
      companyConfigs: effectiveCompanyConfigs,
      includeCashWallet: true,
    });

    if (!walletIds.length) {
      setDeliveryPaymentTypes([]);
      return undefined;
    }

    let isMounted = true;

    walletPaymentTypeActions
      .getItems({
        company: sellerCompanyId,
        wallet: walletIds,
        itemsPerPage: 200,
      })
      .then(response => {
        if (isMounted) {
          setDeliveryPaymentTypes(extractItems(response));
        }
      })
      .catch(() => {
        if (isMounted) {
          setDeliveryPaymentTypes([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    chargeOnDeliveryEnabled,
    defaultDeliveryDevice?.gateway,
    effectiveCompanyConfigs,
    sellerCompanyId,
    walletPaymentTypeActions,
  ]);

  const ensureInvoiceForPaymentType = useCallback(
    async (
      selectedPaymentType,
      {additionalInfo = null, price = pendingAmount, reuseExisting = true} = {},
    ) => {
      if (!hasCart) {
        throw new Error('Carrinho não encontrado para checkout.');
      }

      if (pendingAmount <= 0.009) {
        throw new Error('Este pedido ja foi pago.');
      }

      const reusableInvoice = reuseExisting
        ? findReusableInvoiceForPaymentType(invoices, selectedPaymentType, {
            deliveryMetadata:
              additionalInfo?.channel === 'delivery' ? additionalInfo : null,
          })
        : null;

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
        price: Number(price || 0),
        payer: currentCompany?.id ? `/people/${currentCompany.id}` : undefined,
        receiver: sellerCompanyId ? `/people/${sellerCompanyId}` : undefined,
        destinationWallet: selectedPaymentType.wallet?.['@id'],
        paymentType: selectedPaymentType.paymentType?.['@id'],
      };

      if (pendingStatus?.['@id']) {
        payload.status = pendingStatus['@id'];
      }

      if (additionalInfo && typeof additionalInfo === 'object') {
        payload.otherInformations = additionalInfo;
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
      currentCompany?.id,
      hasCart,
      invoiceActions,
      invoices,
      pendingAmount,
      pendingStatus,
      sellerCompanyId,
    ],
  );

  const ensureInvoice = useCallback(
    async gateway => {
      const selectedPaymentType = pickPaymentTypeForGateway(gateway);
      return ensureInvoiceForPaymentType(selectedPaymentType);
    },
    [ensureInvoiceForPaymentType, pickPaymentTypeForGateway],
  );

  const buildDeliveryPaymentMetadata = useCallback(
    ({selectedPaymentType, receivedAmount = 0, changeAmount = 0}) => ({
      channel: 'delivery',
      paymentLabel: isCashPaymentOption(selectedPaymentType)
        ? 'Dinheiro'
        : 'Maquininha na entrega',
      paymentMode: isCashPaymentOption(selectedPaymentType) ? 'cash' : 'machine',
      needsChange: Number(changeAmount || 0) > 0.009,
      changeFor:
        Number(changeAmount || 0) > 0.009 ? Number(receivedAmount || 0) : null,
      receivedAmount: Number(receivedAmount || 0) > 0 ? Number(receivedAmount) : null,
      changeAmount: Number(changeAmount || 0) > 0 ? Number(changeAmount) : 0,
      targetDeviceId: null,
      targetDeviceLabel: null,
      targetGateway: defaultDeliveryDevice?.gateway || null,
    }),
    [defaultDeliveryDevice?.gateway],
  );

  const finalizeDeliveryRegistration = useCallback(
    async (selectedPaymentType, {receivedAmount = 0, changeAmount = 0} = {}) => {
      setError('');
      setMessage('');
      setPixData(null);
      setIsProcessing(true);

      try {
        await ensureInvoiceForPaymentType(selectedPaymentType, {
          additionalInfo: buildDeliveryPaymentMetadata({
            selectedPaymentType,
            receivedAmount,
            changeAmount,
          }),
        });

        const orderId = String(cart?.id || '');
        if (orderId) {
          navigation.navigate('ShopOrderDetailsPage', {id: orderId});
          return;
        }

        setMessage(
          `Pedido registrado para cobrar na entrega via ${
            isCashPaymentOption(selectedPaymentType)
              ? 'dinheiro'
              : 'maquininha'
          }.`,
        );
      } catch (e) {
        setError(
          e?.message ||
            'Nao foi possivel registrar a cobranca para pagamento na entrega.',
        );
      } finally {
        setIsProcessing(false);
        setSelectedDeliveryPaymentType(null);
      }
    },
    [
      buildDeliveryPaymentMetadata,
      cart?.id,
      defaultDeliveryDevice?.gateway,
      ensureInvoiceForPaymentType,
      navigation,
    ],
  );

  const startDeliveryPayment = useCallback(
    async selectedPaymentType => {
      if (!selectedPaymentType) {
        setError(
          'Nao foi possivel identificar o meio de pagamento da entrega.',
        );
        return;
      }

      setDeliveryModeModalVisible(false);
      setSelectedDeliveryPaymentType(selectedPaymentType);

      if (isCashPaymentOption(selectedPaymentType)) {
        setCashReceivedValue(formatMoneyInputValue(pendingAmount));
        setDeliveryChangeModalVisible(true);
        return;
      }

      await finalizeDeliveryRegistration(selectedPaymentType);
    },
    [finalizeDeliveryRegistration, pendingAmount],
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

  const handleChargeOnDelivery = useCallback(async () => {
    setError('');
    setMessage('');
    setPixData(null);

    if (!chargeOnDeliveryEnabled) {
      return;
    }

    if (deliveryModeOptions.length === 0) {
      setError(
        'A loja ainda nao configurou maquininha ou dinheiro para cobrar na entrega.',
      );
      return;
    }

    if (deliveryModeOptions.length === 1) {
      await startDeliveryPayment(deliveryModeOptions[0].paymentType);
      return;
    }

    setDeliveryModeModalVisible(true);
  }, [
    chargeOnDeliveryEnabled,
    deliveryModeOptions,
    startDeliveryPayment,
  ]);

  const handleSelectDeliveryMode = useCallback(
    async option => {
      await startDeliveryPayment(option?.paymentType || null);
    },
    [startDeliveryPayment],
  );

  const handleDeliveryChangeInputChange = useCallback(text => {
    setCashReceivedValue(normalizeMoneyInputText(text));
  }, []);

  const handleConfirmDeliveryChange = useCallback(async () => {
    if (!selectedDeliveryPaymentType) {
      setError(
        'Nao foi possivel identificar o pagamento em dinheiro para registrar a entrega.',
      );
      return;
    }

    if (cashPaymentDetails.receivedAmount <= 0.009) {
      setError('Informe o valor recebido para continuar.');
      return;
    }

    if (cashPaymentDetails.missingAmount > 0.009) {
      setError(
        'O valor recebido nao pode ser menor que o total do pedido na entrega.',
      );
      return;
    }

    setDeliveryChangeModalVisible(false);
    await finalizeDeliveryRegistration(selectedDeliveryPaymentType, {
      receivedAmount: cashPaymentDetails.receivedAmount,
      changeAmount: cashPaymentDetails.changeAmount,
    });
  }, [
    cashPaymentDetails,
    finalizeDeliveryRegistration,
    selectedDeliveryPaymentType,
  ]);

  const checkoutBlocked = isLoading || isProcessing || !hasCart || !itemsCount;
  const deliveryCheckoutBlocked =
    checkoutBlocked ||
    pendingAmount <= 0.009 ||
    deliveryModeOptions.length === 0;
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
      chargeOnDeliveryEnabled
        ? {
            key: 'delivery',
            label: 'Cobrar na entrega',
            icon: 'local-shipping',
            variant: 'success',
            loading: isProcessing,
            disabled: deliveryCheckoutBlocked,
            onPress: handleChargeOnDelivery,
          }
        : null,
    ],
    [
      cardPaymentTypes.length,
      chargeOnDeliveryEnabled,
      checkoutBlocked,
      deliveryCheckoutBlocked,
      handleChargeOnDelivery,
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
              <Text
                style={inlineStyle_351_20({
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
                Barra de pagamento
              </Text>

              {isLoading ? (
                <View style={inlineStyle_380_22}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : paymentMethodChips.length > 0 ? (
                <View style={inlineStyle_385_18}>
                  {paymentMethodChips.map(item => {
                    const isPix = item.key === 'pix';
                    const isCard = item.key === 'card';
                    const backgroundColor = isPix
                      ? `${theme.success}16`
                      : isCard
                        ? `${theme.primary}14`
                        : `${theme.cardBorder}40`;

                    return (
                      <View
                        key={item.key}
                        style={[
                          styles.methodChip,
                          {
                            borderColor: theme.cardBorder,
                            backgroundColor,
                          },
                        ]}>
                        <Text
                          style={inlineStyle_410_26({
                            theme: theme,
                          })}>
                          {item.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={inlineStyle_422_22({
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
                        borderColor: selectedDeliveryDevice?.deviceId
                          ? theme.primary
                          : theme.cardBorder,
                        backgroundColor: selectedDeliveryDevice?.deviceId
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
                          color: selectedDeliveryDevice?.deviceId
                            ? theme.primary
                            : theme.muted,
                        },
                      ]}>
                      {selectedDeliveryDevice?.deviceId
                        ? 'Equipamento definido'
                        : 'Sem equipamento'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.methodCardMeta,
                    {color: theme.muted},
                  ]}>
                  Escolha qual equipamento da entrega vai cobrar o pedido para
                  a barra liberar apenas maquininha e dinheiro válidos.
                </Text>

                {loadingRemoteDevices ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={theme.primary} />
                    <Text style={[styles.methodCardHint, {color: theme.text}]}>
                      Carregando equipamentos da entrega...
                    </Text>
                  </View>
                ) : selectedDeliveryDevice ? (
                  <>
                    <Text
                      style={[
                        styles.methodCardHint,
                        {color: theme.text},
                      ]}>
                      Entrega usando {selectedDeliveryDevice.alias} (
                      {getPaymentGatewayLabel(selectedDeliveryDevice.gateway)}).
                    </Text>
                    <Text
                      style={[
                        styles.methodCardHint,
                        {color: theme.text},
                      ]}>
                      {deliveryModeLabels.length > 0
                        ? `Opcoes liberadas: ${deliveryModeLabels.join(', ')}.`
                        : 'Esse equipamento ainda nao libera maquininha nem dinheiro para a entrega.'}
                    </Text>
                    {remotePaymentDevices.length > 1 && (
                      <TouchableOpacity
                        onPress={() => setDeliveryDeviceModalVisible(true)}
                        style={[
                          styles.modalCloseButton,
                          {
                            marginTop: 12,
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.modalCloseText,
                            {color: theme.onPrimary || '#FFFFFF'},
                          ]}>
                          Selecionar equipamento
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text
                    style={[
                      styles.methodCardHint,
                      {color: theme.text},
                    ]}>
                    Configure devices remotos de pagamento na empresa para usar
                    o pagamento na entrega.
                  </Text>
                )}
              </View>
            )}

            <View
              style={inlineStyle_429_14({
                theme: theme,
              })}>
              <View style={inlineStyle_438_16}>
                <Text
                  style={inlineStyle_445_18({
                    theme: theme,
                  })}>
                  Cartões salvos
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ShopCardsPage')}>
                  <Text
                    style={inlineStyle_450_24({
                      theme: theme,
                    })}>
                    Gerenciar
                  </Text>
                </TouchableOpacity>
              </View>

              {cards.length === 0 ? (
                <Text
                  style={inlineStyle_457_22({
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
                      <Text
                        style={inlineStyle_480_28({
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
                  <Text
                    style={inlineStyle_534_24({
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
                  <Text
                    style={inlineStyle_549_24({
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
                <Text
                  style={inlineStyle_564_22({
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
                <Text
                  style={inlineStyle_578_22({
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
            visible={deliveryDeviceModalVisible}
            onRequestClose={() => setDeliveryDeviceModalVisible(false)}>
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
                  Equipamento da entrega
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.muted},
                  ]}>
                  Escolha qual equipamento deve definir as opcoes de pagamento
                  exibidas na barra da entrega.
                </Text>

                {remotePaymentDevices.map(deviceOption => {
                  const active =
                    deviceOption.deviceId === selectedDeliveryDevice?.deviceId;

                  return (
                    <TouchableOpacity
                      key={deviceOption.deviceId}
                      style={[
                        styles.modalItem,
                        active && styles.modalItemActive,
                        {
                          borderColor: active
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: theme.background,
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedDeliveryDeviceId(deviceOption.deviceId);
                        setDeliveryDeviceModalVisible(false);
                      }}>
                      <Text
                        style={[
                          styles.modalItemTitle,
                          {color: theme.text},
                        ]}>
                        {deviceOption.alias}
                      </Text>
                      <Text
                        style={[
                          styles.modalItemMeta,
                          {color: theme.muted},
                        ]}>
                        {getPaymentGatewayLabel(deviceOption.gateway)} •{' '}
                        {deviceOption.deviceId}
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
                  onPress={() => setDeliveryDeviceModalVisible(false)}>
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

          <Modal
            animationType="fade"
            transparent={true}
            visible={deliveryModeModalVisible}
            onRequestClose={() => setDeliveryModeModalVisible(false)}>
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
                  Pagamento na entrega
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.muted},
                  ]}>
                  Escolha se o pagamento na entrega sera feito na maquininha do
                  equipamento selecionado ou em dinheiro.
                </Text>

                {deliveryModeOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.modalItem,
                      {
                        borderColor: theme.cardBorder,
                        backgroundColor: theme.background,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleSelectDeliveryMode(option)}>
                    <Text
                      style={[
                        styles.modalItemTitle,
                        {color: theme.text},
                      ]}>
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.modalItemMeta,
                        {color: theme.muted},
                      ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  onPress={() => setDeliveryModeModalVisible(false)}>
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

          <Modal
            animationType="fade"
            transparent={true}
            visible={deliveryChangeModalVisible}
            onRequestClose={() => setDeliveryChangeModalVisible(false)}>
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
                  Dinheiro na entrega
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.muted},
                  ]}>
                  Informe o valor recebido para calcular o troco
                  automaticamente.
                </Text>

                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      borderColor: theme.cardBorder,
                      color: theme.text,
                    },
                  ]}
                  keyboardType="numeric"
                  placeholder="Valor recebido"
                  placeholderTextColor={theme.muted}
                  value={cashReceivedValue}
                  onChangeText={handleDeliveryChangeInputChange}
                />

                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.text},
                  ]}>
                  Valor do pedido: {formatMoney(pendingAmount)}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.text},
                  ]}>
                  Troco: {formatMoney(cashPaymentDetails.changeAmount)}
                </Text>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalCloseButton,
                      {
                        flex: 1,
                        backgroundColor: theme.surface,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                    onPress={() => setDeliveryChangeModalVisible(false)}>
                    <Text
                      style={[
                        styles.modalCloseText,
                        {color: theme.text},
                      ]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      {backgroundColor: theme.primary},
                    ]}
                    onPress={handleConfirmDeliveryChange}>
                    <Text
                      style={[
                        styles.confirmButtonText,
                        {color: theme.onPrimary || '#FFFFFF'},
                      ]}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
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
