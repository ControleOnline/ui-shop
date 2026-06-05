import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopPaymentBar from '@controleonline/ui-shop/src/react/components/storefront/ShopPaymentBar';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  buildWalletIdsForGateway,
  filterDeviceConfigsByCompany,
  getPaymentGatewayFromConfigs,
  isOrderChargeOnDeliveryEnabled,
  resolveRemotePaymentDeviceOptions,
} from '@controleonline/ui-common/src/react/utils/paymentDevices';
import {
  detectPaymentOptionKind,
  getInvoiceDestinationWalletId,
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
import {
  buildAddressOptionSummary,
  createEmptyAddressForm,
  normalizePostalCodeInput,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  normalizeEntityId,
  toEntityIri,
} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';
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

const normalizeActionResult = response => {
  if (Array.isArray(response?.member)) {
    return response.member[0] || null;
  }

  if (Array.isArray(response?.['hydra:member'])) {
    return response['hydra:member'][0] || null;
  }

  if (response?.result && typeof response.result === 'object') {
    return response.result;
  }

  if (response?.data && typeof response.data === 'object') {
    return response.data;
  }

  return response || null;
};

const extractQuotePayload = response => {
  const result = normalizeActionResult(response);
  const data = result?.data && typeof result.data === 'object'
    ? result.data
    : result;

  return data || {};
};

const extractQuotesFromResponse = response => {
  const data = extractQuotePayload(response);
  return Array.isArray(data?.quotes) ? data.quotes : [];
};

const getQuotePrice = quote => {
  const price = Number(quote?.price);
  return Number.isFinite(price) ? price : 0;
};

const hasQuotePrice = quote =>
  quote?.price !== null &&
  quote?.price !== undefined &&
  quote?.price !== '' &&
  Number.isFinite(Number(quote.price));

const isSelectableDeliveryQuote = quote =>
  quote?.available !== false && hasQuotePrice(quote);

const formatApiError = error => {
  if (!error) {
    return 'Nao foi possivel concluir a solicitacao.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return (
    error?.message ||
    error?.errmsg ||
    error?.data?.message ||
    'Nao foi possivel concluir a solicitacao.'
  );
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
      Number(metadata.changeFor || 0)
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

      if (walletId && getInvoiceDestinationWalletId(invoice) !== walletId) {
        return false;
      }

      return matchesDeliveryMetadata(invoice, deliveryMetadata);
    }) || null
  );
};

const buildDeliveryPaymentLabel = payment => {
  const kind = detectPaymentOptionKind(payment);
  const label = getPaymentOptionLabel(payment);

  if (kind === 'pix') {
    return 'Pix na entrega';
  }

  if (kind === 'card') {
    return `${label} na entrega`;
  }

  return `${label} na entrega`;
};

const getActionResult = response =>
  response?.result && typeof response.result === 'object'
    ? response.result
    : response;

const CheckoutSkeletonRows = ({theme}) => (
  <View style={styles.skeletonStack}>
    <ShopSkeleton height={18} width="48%" theme={{theme: {colors: theme}}} />
    <ShopSkeleton height={14} width="86%" theme={{theme: {colors: theme}}} />
    <ShopSkeleton height={46} radius={12} theme={{theme: {colors: theme}}} />
  </View>
);

export default function CheckoutPage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const {isLogged, sessionChecked} = authStore.getters;
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
    deliveryFeeEnabled,
    deliveryFeeValue,
  } = useShopSettings();

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
  const addressStore = useStore('address');
  const addressActions = addressStore.actions;
  const ordersStore = useStore('orders');
  const ordersActions = ordersStore.actions;

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [deliveryPaymentTypes, setDeliveryPaymentTypes] = useState([]);
  const [companyDeviceConfigs, setCompanyDeviceConfigs] = useState([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
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
  const [deliveryChangeForValue, setDeliveryChangeForValue] = useState('');
  const [selectedDeliveryPaymentType, setSelectedDeliveryPaymentType] =
    useState(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [addressForm, setAddressForm] = useState({
    ...createEmptyAddressForm(),
    country: 'BR',
  });
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [addressOptionsLoading, setAddressOptionsLoading] = useState(true);
  const [addressSaveLoading, setAddressSaveLoading] = useState(false);
  const [addressSelectingId, setAddressSelectingId] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [deliveryQuotes, setDeliveryQuotes] = useState([]);
  const [selectedDeliveryQuote, setSelectedDeliveryQuote] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sellerCompany = salesCompany || defaultCompany || null;
  const sellerCompanyId = sellerCompany?.id || null;
  const theme = pickTheme(sellerCompany || defaultCompany);
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
  const asaasConfigured = Boolean(effectiveCompanyConfigs?.['asaas-key']);
  const asaasPixConfigured = Boolean(
    effectiveCompanyConfigs?.['asaas-key'] &&
      effectiveCompanyConfigs?.['asaas-receiver-pix-key'],
  );

  const hasCart = Boolean(cart?.id);
  const cartAddressDestination = cart?.addressDestination || null;
  const cartAddressDestinationIri = toEntityIri(
    cartAddressDestination,
    'addresses',
  );
  const hasDeliveryAddress = Boolean(cartAddressDestinationIri);
  const cartItems = Array.isArray(cart?.orderProducts) ? cart.orderProducts : [];
  const itemsCount = cartItems.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
  const cartTotal = Number(cart?.price || 0);
  const configuredDeliveryFee = deliveryFeeEnabled
    ? Number(deliveryFeeValue || 0)
    : 0;
  const quotedDeliveryFee = getQuotePrice(selectedDeliveryQuote);
  const hasSelectedDeliveryQuote = isSelectableDeliveryQuote(selectedDeliveryQuote);
  const deliveryFee = hasSelectedDeliveryQuote
    ? quotedDeliveryFee
    : configuredDeliveryFee;
  const deliveryFeeProviderLabel =
    selectedDeliveryQuote?.providerLabel ||
    selectedDeliveryQuote?.providerKey ||
    selectedDeliveryQuote?.app ||
    'cotacao';
  let deliveryFeeSourceLabel = 'Nenhuma taxa de entrega aplicada no momento.';
  if (hasSelectedDeliveryQuote) {
    deliveryFeeSourceLabel = `Cotacao selecionada: ${deliveryFeeProviderLabel}.`;
  } else if (configuredDeliveryFee > 0) {
    deliveryFeeSourceLabel = 'Taxa fixa configurada pela loja.';
  } else if (deliveryQuotes.length > 0) {
    deliveryFeeSourceLabel =
      'Selecione uma cotacao disponivel para aplicar a taxa.';
  }
  const financialTotal = cartTotal + deliveryFee;
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
    () => Math.max(financialTotal - paidAmount, 0),
    [financialTotal, paidAmount],
  );
  const changeForAmount = useMemo(
    () => parseMoneyInputValue(deliveryChangeForValue),
    [deliveryChangeForValue],
  );
  const cashPaymentDetails = useMemo(
    () =>
      resolveCashPaymentDetails({
        receivedAmount: changeForAmount,
        totalAmount: pendingAmount,
      }),
    [changeForAmount, pendingAmount],
  );
  const shouldShowAddressForm =
    !addressOptionsLoading &&
    (deliveryAddresses.length === 0 || addressFormVisible);

  const cardPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(
        item =>
          detectPaymentOptionKind(item) === 'card' &&
          asaasConfigured &&
          isIntegratedPaymentOption(item),
      ),
    [asaasConfigured, paymentTypes],
  );
  const pixPaymentTypes = useMemo(
    () =>
      paymentTypes.filter(
        item =>
          detectPaymentOptionKind(item) === 'pix' &&
          asaasPixConfigured &&
          isIntegratedPaymentOption(item),
      ),
    [asaasPixConfigured, paymentTypes],
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
  const deliveryCashPayment = useMemo(
    () => deliveryPaymentTypes.find(isCashPaymentOption) || null,
    [deliveryPaymentTypes],
  );
  const deliveryDeviceOptionsByWalletId = useMemo(() => {
    const map = {};

    remotePaymentDevices.forEach(device => {
      const walletId = normalizeEntityId(
        effectiveCompanyConfigs?.[`pos-${device.gateway}-wallet`],
      );

      if (!walletId) {
        return;
      }

      map[walletId] = [...(map[walletId] || []), device];
    });

    return map;
  }, [effectiveCompanyConfigs, remotePaymentDevices]);
  const deliveryModeOptions = useMemo(() => {
    const options = [];

    deliveryPaymentTypes
      .filter(
        item =>
          isIntegratedPaymentOption(item) && !isCashPaymentOption(item),
      )
      .forEach(paymentType => {
        const paymentTypeId = getPaymentOptionId(paymentType);
        const walletId = getPaymentOptionWalletId(paymentType);
        const deviceOptions = deliveryDeviceOptionsByWalletId[walletId] || [];

        deviceOptions.forEach(device => {
          const label = buildDeliveryPaymentLabel(paymentType);

          options.push({
            key: `device-${device.deviceId}-${paymentTypeId}`,
            label,
            description: `${label} via ${device.alias || device.gatewayLabel}.`,
            paymentMode: detectPaymentOptionKind(paymentType),
            paymentType,
            targetDevice: device,
          });
        });
      });

    if (deliveryCashPayment) {
      options.push({
        key: 'cash',
        label: 'Dinheiro',
        description:
          'O cliente informa para quanto precisa de troco e o motoboy leva o valor.',
        paymentMode: 'cash',
        paymentType: deliveryCashPayment,
        targetDevice: null,
      });
    }

    return options;
  }, [deliveryCashPayment, deliveryDeviceOptionsByWalletId, deliveryPaymentTypes]);
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

  const handleAddressFormChange = useCallback((field, value) => {
    setAddressForm(current => ({
      ...current,
      [field]: field === 'cep' ? normalizePostalCodeInput(value) : value,
    }));
  }, []);

  const handleBackFromCheckout = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('ShopCartPage');
  }, [navigation]);

  const updateCartDeliveryAddress = useCallback(
    async addressIri => {
      if (!cart?.id) {
        throw new Error('Carrinho nao encontrado para atualizar a entrega.');
      }

      const clientIri = toEntityIri(currentCompany, 'people');
      const providerIri = toEntityIri(sellerCompany, 'people');

      if (!clientIri) {
        throw new Error('Cliente nao encontrado para atualizar a entrega.');
      }

      const savedOrder = await ordersActions.save({
        id: cart.id,
        '@id': cart?.['@id'],
        addressDestination: addressIri,
        client: clientIri,
        payer: clientIri,
        provider: providerIri || undefined,
      });

      if (savedOrder) {
        if (typeof ordersActions.syncOrder === 'function') {
          ordersActions.syncOrder(savedOrder);
        } else if (typeof ordersActions.setItem === 'function') {
          ordersActions.setItem(savedOrder);
        }
      }

      setDeliveryQuotes([]);
      setSelectedDeliveryQuote(null);
      await refreshCart();

      return savedOrder;
    },
    [
      cart?.id,
      cart?.['@id'],
      currentCompany,
      ordersActions,
      refreshCart,
      sellerCompany,
    ],
  );

  const handleSelectDeliveryAddress = useCallback(
    async address => {
      const addressIri = toEntityIri(address, 'addresses');
      const addressId = normalizeEntityId(address);

      if (!addressIri) {
        setError('Nao foi possivel identificar o endereco selecionado.');
        return;
      }

      if (addressIri === cartAddressDestinationIri) {
        return;
      }

      setError('');
      setMessage('');

      try {
        setAddressSelectingId(addressId);
        await updateCartDeliveryAddress(addressIri);
        setAddressFormVisible(false);
        setMessage('Endereco de entrega selecionado.');
      } catch (e) {
        setError(formatApiError(e));
      } finally {
        setAddressSelectingId('');
      }
    },
    [cartAddressDestinationIri, updateCartDeliveryAddress],
  );

  const saveDeliveryAddress = useCallback(async () => {
    setError('');
    setMessage('');

    if (!cart?.id) {
      setError('Carrinho nao encontrado para atualizar a entrega.');
      return;
    }

    const clientIri = toEntityIri(currentCompany, 'people');

    if (!clientIri) {
      setError('Cliente nao encontrado para cadastrar o endereco.');
      return;
    }

    const street = String(addressForm.street || '').trim();
    const district = String(addressForm.district || '').trim();
    const city = String(addressForm.city || '').trim();
    const state = String(addressForm.state || '').trim();
    const country = String(addressForm.country || 'BR').trim();
    const number = String(addressForm.number ?? '').replace(/\D+/g, '').trim();
    const cep = normalizePostalCodeInput(addressForm.cep);
    const complement = String(addressForm.complement || '').trim();
    const nickname = String(addressForm.nickname || 'Entrega').trim();

    if (!street || !district || !city || !state || !country || !number || !cep) {
      setError('Rua, numero, bairro, cidade, estado, pais e CEP sao obrigatorios.');
      return;
    }

    try {
      setAddressSaveLoading(true);

      const savedAddress = normalizeActionResult(
        await addressActions.save({
          street,
          district,
          city,
          state,
          country,
          number: Number(number),
          cep,
          nickname,
          complement,
          people: clientIri,
        }),
      );
      const savedAddressIri = toEntityIri(savedAddress, 'addresses');

      if (!savedAddressIri) {
        throw new Error('Endereco criado sem identificador valido.');
      }

      await updateCartDeliveryAddress(savedAddressIri);
      setDeliveryAddresses(current => [
        savedAddress,
        ...current.filter(
          address =>
            toEntityIri(address, 'addresses') !== savedAddressIri,
        ),
      ]);
      setAddressForm({
        ...createEmptyAddressForm(),
        country: 'BR',
      });
      setAddressFormVisible(false);
      setMessage('Endereco de entrega salvo no pedido.');
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setAddressSaveLoading(false);
    }
  }, [
    addressActions,
    addressForm.cep,
    addressForm.city,
    addressForm.complement,
    addressForm.country,
    addressForm.district,
    addressForm.nickname,
    addressForm.number,
    addressForm.state,
    addressForm.street,
    cart?.id,
    currentCompany,
    updateCartDeliveryAddress,
  ]);

  const loadDeliveryQuotes = useCallback(async orderId => {
    const targetOrderId = normalizeEntityId(orderId || cart?.id);

    if (!targetOrderId) {
      return [];
    }

    const response = await api.fetch(`orders/${targetOrderId}/logistic`, {
      method: 'GET',
    });
    const quotes = extractQuotesFromResponse(response);
    setDeliveryQuotes(quotes);
    setSelectedDeliveryQuote(current => {
      if (!current?.id) {
        return quotes.find(isSelectableDeliveryQuote) || null;
      }

      return quotes.find(item => item?.id === current.id) || current;
    });
    return quotes;
  }, [cart?.id]);

  const requestDeliveryQuote = useCallback(async () => {
    setError('');
    setMessage('');

    if (!cart?.id) {
      setError('Carrinho nao encontrado para cotar entrega.');
      return;
    }

    if (!cartAddressDestinationIri) {
      setError('Salve o endereco de entrega antes de cotar.');
      return;
    }

    try {
      setQuoteLoading(true);
      const response = await api.fetch(`orders/${cart.id}/logistic/quote`, {
        method: 'POST',
      });
      const result = normalizeActionResult(response);
      if (String(result?.errno ?? '0') !== '0') {
        throw result || response;
      }

      const quotes = extractQuotesFromResponse(response);
      if (quotes.length > 0) {
        setDeliveryQuotes(quotes);
        setSelectedDeliveryQuote(quotes.find(isSelectableDeliveryQuote) || null);
      } else {
        await loadDeliveryQuotes();
      }
      setMessage('Cotacao de entrega solicitada.');
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setQuoteLoading(false);
    }
  }, [cart?.id, cartAddressDestinationIri, loadDeliveryQuotes]);

  const loadData = useCallback(async () => {
    if (!sessionChecked || !isLogged) {
      return;
    }

    setIsLoading(true);
    setAddressOptionsLoading(true);
    setError('');
    setMessage('');

    try {
      const refreshedCart = await refreshCart();
      const resolvedCart = refreshedCart?.id ? refreshedCart : cart;
      const clientIri = toEntityIri(currentCompany, 'people');

      const [
        paymentTypeResponse,
        cardsResponse,
        statusResponse,
        invoicesResponse,
        addressesResponse,
      ] = await Promise.all([
        sellerCompanyId
          ? walletPaymentTypeActions.getItems({
              people: `/people/${sellerCompanyId}`,
              itemsPerPage: 200,
            })
          : Promise.resolve([]),
        asaasConfigured
          ? cardActions.getItems({itemsPerPage: 200})
          : Promise.resolve([]),
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
        clientIri
          ? addressActions.getItems({
              people: clientIri,
              itemsPerPage: 50,
            }).catch(() => [])
          : Promise.resolve([]),
      ]);

      const fetchedPaymentTypes = extractItems(paymentTypeResponse);
      const fetchedCards = extractItems(cardsResponse);
      const fetchedStatuses = extractItems(statusResponse);
      const fetchedInvoices = sortInvoicesByDateDesc(
        extractItems(invoicesResponse),
      );
      const fetchedAddresses = extractItems(addressesResponse);

      setPaymentTypes(fetchedPaymentTypes);
      setCards(fetchedCards);
      setInvoices(fetchedInvoices);
      setDeliveryAddresses(fetchedAddresses);
      setSelectedCard(
        previous =>
          fetchedCards.find(item => item?.id === previous?.id) ||
          fetchedCards[0] ||
          null,
      );
      setPendingStatus(pickPendingStatus(fetchedStatuses));

      if (resolvedCart?.id) {
        await loadDeliveryQuotes(resolvedCart.id).catch(() => {});
      }
    } catch (e) {
      setError(
        e?.message || 'Não foi possível carregar os dados de pagamento.',
      );
    } finally {
      setIsLoading(false);
      setAddressOptionsLoading(false);
    }
  }, [
    addressActions,
    asaasConfigured,
    cardActions,
    cart,
    currentCompany,
    isLogged,
    invoiceActions,
    loadDeliveryQuotes,
    refreshCart,
    sellerCompanyId,
    sessionChecked,
    statusActions,
    walletPaymentTypeActions,
  ]);
  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked || !isLogged) {
        return;
      }

      loadData();
    }, [isLogged, loadData, sessionChecked]),
  );

  useEffect(() => {
    if (addressOptionsLoading) {
      return;
    }

    setAddressFormVisible(deliveryAddresses.length === 0);
  }, [addressOptionsLoading, deliveryAddresses.length]);

  useFocusEffect(
    useCallback(() => {
      if (!sellerCompanyId || !chargeOnDeliveryEnabled) {
        setCompanyDeviceConfigs([]);
        setLoadingRemoteDevices(false);
        return undefined;
      }

      if (!sessionChecked || !isLogged) {
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
    }, [
      chargeOnDeliveryEnabled,
      deviceConfigActions,
      isLogged,
      sellerCompanyId,
      sessionChecked,
    ]),
  );

  useEffect(() => {
    if (
      !sellerCompanyId ||
      !chargeOnDeliveryEnabled ||
      !sessionChecked ||
      !isLogged
    ) {
      setDeliveryPaymentTypes([]);
      return undefined;
    }

    const deliveryGateways = [
      ...new Set(
        [
          ...remotePaymentDevices.map(device => device.gateway),
          getPaymentGatewayFromConfigs(effectiveCompanyConfigs),
        ].filter(Boolean),
      ),
    ];
    const walletIds = [
      ...new Set([
        ...deliveryGateways.flatMap(gateway =>
          buildWalletIdsForGateway({
            gateway,
            companyConfigs: effectiveCompanyConfigs,
            includeCashWallet: false,
          }),
        ),
        ...buildWalletIdsForGateway({
          gateway: null,
          companyConfigs: effectiveCompanyConfigs,
          includeCashWallet: true,
        }),
      ]),
    ];

    if (!walletIds.length) {
      setDeliveryPaymentTypes([]);
      return undefined;
    }

    let isMounted = true;

    walletPaymentTypeActions
      .getItems({
        people: `/people/${sellerCompanyId}`,
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
    effectiveCompanyConfigs,
    isLogged,
    remotePaymentDevices,
    sellerCompanyId,
    sessionChecked,
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

      if (!cartAddressDestinationIri) {
        throw new Error(
          'Selecione ou cadastre um endereco de entrega antes de concluir o checkout.',
        );
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

      if (
        reusableInvoice?.id &&
        Math.abs(Number(reusableInvoice?.price || 0) - Number(price || 0)) < 0.01
      ) {
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

      const invoiceInfo =
        additionalInfo && typeof additionalInfo === 'object'
          ? {...additionalInfo}
          : {};

      if (deliveryFee > 0) {
        invoiceInfo.deliveryFee = deliveryFee;
        invoiceInfo.orderSubtotal = cartTotal;
        invoiceInfo.orderTotal = financialTotal;
      }

      if (selectedDeliveryQuote?.id) {
        invoiceInfo.deliveryQuoteOrderId = selectedDeliveryQuote.id;
        invoiceInfo.deliveryProvider =
          selectedDeliveryQuote.providerKey || selectedDeliveryQuote.app || null;
        invoiceInfo.deliveryProviderLabel =
          selectedDeliveryQuote.providerLabel || null;
      }

      if (Object.keys(invoiceInfo).length > 0) {
        payload.otherInformations = invoiceInfo;
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
      cartAddressDestinationIri,
      currentCompany?.id,
      deliveryFee,
      financialTotal,
      hasCart,
      invoiceActions,
      invoices,
      pendingAmount,
      pendingStatus,
      sellerCompanyId,
      selectedDeliveryQuote,
      cartTotal,
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
    ({deliveryOption, changeFor = 0, changeAmount = 0}) => {
      const selectedPaymentType = deliveryOption?.paymentType;
      const targetDevice = deliveryOption?.targetDevice || null;
      const paymentMode =
        deliveryOption?.paymentMode ||
        (isCashPaymentOption(selectedPaymentType)
          ? 'cash'
          : detectPaymentOptionKind(selectedPaymentType));

      return {
        channel: 'delivery',
        paymentLabel:
          deliveryOption?.label || buildDeliveryPaymentLabel(selectedPaymentType),
        paymentMode,
        needsChange: Number(changeAmount || 0) > 0.009,
        changeFor:
          Number(changeFor || 0) > 0 ? Number(changeFor) : null,
        changeAmount: Number(changeAmount || 0) > 0 ? Number(changeAmount) : 0,
        targetDeviceId: targetDevice?.deviceId || null,
        targetDeviceLabel: targetDevice?.alias || null,
        targetGateway: targetDevice?.gateway || null,
        deliveryQuoteOrderId: selectedDeliveryQuote?.id || null,
        deliveryProvider:
          selectedDeliveryQuote?.providerKey || selectedDeliveryQuote?.app || null,
      };
    },
    [selectedDeliveryQuote],
  );

  const finalizeDeliveryRegistration = useCallback(
    async (deliveryOption, {changeFor = 0, changeAmount = 0} = {}) => {
      setError('');
      setMessage('');
      setPixData(null);
      setIsProcessing(true);

      try {
        const selectedPaymentType = deliveryOption?.paymentType || null;
        await ensureInvoiceForPaymentType(selectedPaymentType, {
          additionalInfo: buildDeliveryPaymentMetadata({
            deliveryOption,
            changeFor,
            changeAmount,
          }),
        });

        const orderId = String(cart?.id || '');
        if (orderId) {
          const confirmResponse = await api.fetch(`orders/${orderId}/confirm`, {
            method: 'POST',
          });
          const confirmResult = getActionResult(confirmResponse);
          if (String(confirmResult?.errno ?? '0') !== '0') {
            throw confirmResult;
          }
          navigation.navigate('ShopOrderDetailsPage', {id: orderId});
          return;
        }

        setMessage(
          `Pedido registrado para cobrar na entrega via ${deliveryOption?.label || 'pagamento na entrega'}.`,
        );
      } catch (e) {
        setError(
          formatApiError(e) ||
            'Nao foi possivel registrar a cobranca para pagamento na entrega.',
        );
      } finally {
        setIsProcessing(false);
        setSelectedDeliveryPaymentType(null);
        setSelectedDeliveryOption(null);
      }
    },
    [
      buildDeliveryPaymentMetadata,
      cart?.id,
      ensureInvoiceForPaymentType,
      navigation,
    ],
  );

  const startDeliveryPayment = useCallback(
    async deliveryOption => {
      const selectedPaymentType = deliveryOption?.paymentType || null;

      if (!selectedPaymentType) {
        setError(
          'Nao foi possivel identificar o meio de pagamento da entrega.',
        );
        return;
      }

      setDeliveryModeModalVisible(false);
      setSelectedDeliveryPaymentType(selectedPaymentType);
      setSelectedDeliveryOption(deliveryOption);

      if (isCashPaymentOption(selectedPaymentType)) {
        setDeliveryChangeForValue(formatMoneyInputValue(pendingAmount));
        setDeliveryChangeModalVisible(true);
        return;
      }

      await finalizeDeliveryRegistration(deliveryOption);
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

    if (!hasDeliveryAddress) {
      setError(
        'Selecione ou cadastre um endereco de entrega antes de concluir o checkout.',
      );
      return;
    }

    if (deliveryModeOptions.length === 0) {
      setError(
        'A loja ainda nao configurou maquininha ou dinheiro para cobrar na entrega.',
      );
      return;
    }

    if (deliveryModeOptions.length === 1) {
      await startDeliveryPayment(deliveryModeOptions[0]);
      return;
    }

    setDeliveryModeModalVisible(true);
  }, [
    chargeOnDeliveryEnabled,
    deliveryModeOptions,
    hasDeliveryAddress,
    startDeliveryPayment,
  ]);

  const handleSelectDeliveryMode = useCallback(
    async option => {
      await startDeliveryPayment(option || null);
    },
    [startDeliveryPayment],
  );

  const handleDeliveryChangeInputChange = useCallback(text => {
    setDeliveryChangeForValue(normalizeMoneyInputText(text));
  }, []);

  const handleConfirmDeliveryChange = useCallback(async () => {
    if (!selectedDeliveryPaymentType) {
      setError(
        'Nao foi possivel identificar o pagamento em dinheiro para registrar a entrega.',
      );
      return;
    }

    if (cashPaymentDetails.receivedAmount <= 0.009) {
      setError('Informe para quanto precisa de troco.');
      return;
    }

    if (cashPaymentDetails.missingAmount > 0.009) {
      setError(
        'O valor informado para troco nao pode ser menor que o total do pedido.',
      );
      return;
    }

    setDeliveryChangeModalVisible(false);
    await finalizeDeliveryRegistration(selectedDeliveryOption, {
      changeFor: cashPaymentDetails.receivedAmount,
      changeAmount: cashPaymentDetails.changeAmount,
    });
  }, [
    cashPaymentDetails,
    finalizeDeliveryRegistration,
    selectedDeliveryOption,
    selectedDeliveryPaymentType,
  ]);

  const checkoutBlocked = isLoading || isProcessing || !hasCart || !itemsCount;
  const paymentCheckoutBlocked = checkoutBlocked || !hasDeliveryAddress;
  const deliveryCheckoutBlocked =
    paymentCheckoutBlocked ||
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
            disabled: paymentCheckoutBlocked || pendingAmount <= 0.009,
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
              paymentCheckoutBlocked ||
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
      deliveryCheckoutBlocked,
      handleChargeOnDelivery,
      handleGeneratePix,
      handlePayWithCard,
      isProcessing,
      paymentCheckoutBlocked,
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
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={handleBackFromCheckout}
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.cardBorder,
                },
              ]}>
              <Icon name="arrow-back" size={19} color={theme.primary} />
              <Text style={[styles.backButtonText, {color: theme.primary}]}>
                Voltar ao carrinho
              </Text>
            </TouchableOpacity>

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
                {formatMoney(financialTotal)}
              </Text>
            </View>

            {deliveryFee > 0 && (
              <View
                style={inlineStyle_366_14({
                  theme: theme,
                })}>
                <Text
                  style={inlineStyle_375_16({
                    theme: theme,
                  })}>
                  Resumo da entrega
                </Text>
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.text},
                  ]}>
                  Produtos: {formatMoney(cartTotal)}
                </Text>
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.text},
                  ]}>
                  Entrega: {formatMoney(deliveryFee)}
                </Text>
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.text},
                  ]}>
                  Total a cobrar: {formatMoney(financialTotal)}
                </Text>
              </View>
            )}

            <View
              style={inlineStyle_366_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_375_16({
                  theme: theme,
                })}>
                Entrega
              </Text>
              {!hasDeliveryAddress ? (
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.primary},
                  ]}>
                  Selecione ou cadastre um endereco para liberar o pagamento.
                </Text>
              ) : null}

              {addressOptionsLoading ? (
                <CheckoutSkeletonRows theme={theme} />
              ) : deliveryAddresses.length > 0 ? (
                <View style={{marginTop: 8}}>
                  {deliveryAddresses.map(address => {
                    const addressIri = toEntityIri(address, 'addresses');
                    const addressId = normalizeEntityId(address);
                    const summary = buildAddressOptionSummary(address);
                    const isSelected = addressIri === cartAddressDestinationIri;
                    const isSelecting = addressSelectingId === addressId;

                    return (
                      <TouchableOpacity
                        key={addressIri || addressId || summary.primary}
                        style={[
                          styles.quoteCard,
                          {
                            borderColor: isSelected
                              ? theme.primary
                              : theme.cardBorder,
                            backgroundColor: isSelected
                              ? `${theme.primary}12`
                              : theme.background,
                            opacity: isSelecting ? 0.7 : 1,
                          },
                        ]}
                        disabled={addressSaveLoading || !!addressSelectingId}
                        onPress={() => handleSelectDeliveryAddress(address)}>
                        <Text style={[styles.quoteTitle, {color: theme.text}]}>
                          {summary.primary || `Endereco #${addressId || '--'}`}
                        </Text>
                        {!!summary.secondary && (
                          <Text style={[styles.quoteMeta, {color: theme.muted}]}>
                            {summary.secondary}
                          </Text>
                        )}
                        {isSelected || isSelecting ? (
                          <Text
                            style={[
                              styles.quoteMeta,
                              {color: isSelected ? theme.primary : theme.muted},
                            ]}>
                            {isSelecting ? 'Selecionando...' : 'Selecionado'}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text
                  style={[
                    styles.methodCardHint,
                    {color: theme.muted},
                  ]}>
                  Nenhum endereco cadastrado para este cliente.
                </Text>
              )}

              {deliveryAddresses.length > 0 && !shouldShowAddressForm ? (
                <View style={styles.formRowAction}>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        flex: 1,
                        backgroundColor: theme.primary,
                      },
                    ]}
                    onPress={() => setAddressFormVisible(true)}>
                    <Text style={[styles.confirmButtonText, {color: '#FFFFFF'}]}>
                      Adicionar endereco
                    </Text>
                  </TouchableOpacity>
                  {hasDeliveryAddress ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        {
                          flex: 1,
                          backgroundColor: theme.primary,
                          opacity: quoteLoading ? 0.7 : 1,
                        },
                      ]}
                      disabled={quoteLoading}
                      onPress={requestDeliveryQuote}>
                      <Text style={[styles.confirmButtonText, {color: '#FFFFFF'}]}>
                        {quoteLoading ? 'Cotando...' : 'Cotar entrega'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {shouldShowAddressForm ? (
                <View style={styles.formGrid}>
                <TextInput
                  style={[
                    styles.formInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                  placeholder="Apelido do endereco"
                  placeholderTextColor={theme.muted}
                  value={addressForm.nickname}
                  onChangeText={value => handleAddressFormChange('nickname', value)}
                />
                <View style={styles.formRow}>
                  <TextInput
                    style={[
                      styles.formInput,
                      {flex: 1, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="CEP"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                    value={addressForm.cep}
                    onChangeText={value => handleAddressFormChange('cep', value)}
                  />
                  <TextInput
                    style={[
                      styles.formInput,
                      {width: 112, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="Numero"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                    value={String(addressForm.number || '')}
                    onChangeText={value => handleAddressFormChange('number', value)}
                  />
                </View>
                <TextInput
                  style={[
                    styles.formInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                  placeholder="Rua"
                  placeholderTextColor={theme.muted}
                  value={addressForm.street}
                  onChangeText={value => handleAddressFormChange('street', value)}
                />
                <TextInput
                  style={[
                    styles.formInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                  placeholder="Complemento"
                  placeholderTextColor={theme.muted}
                  value={addressForm.complement}
                  onChangeText={value => handleAddressFormChange('complement', value)}
                />
                <View style={styles.formRow}>
                  <TextInput
                    style={[
                      styles.formInput,
                      {flex: 1, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="Bairro"
                    placeholderTextColor={theme.muted}
                    value={addressForm.district}
                    onChangeText={value => handleAddressFormChange('district', value)}
                  />
                  <TextInput
                    style={[
                      styles.formInput,
                      {flex: 1, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="Cidade"
                    placeholderTextColor={theme.muted}
                    value={addressForm.city}
                    onChangeText={value => handleAddressFormChange('city', value)}
                  />
                </View>
                <View style={styles.formRow}>
                  <TextInput
                    style={[
                      styles.formInput,
                      {flex: 1, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="UF"
                    placeholderTextColor={theme.muted}
                    autoCapitalize="characters"
                    value={addressForm.state}
                    onChangeText={value => handleAddressFormChange('state', value)}
                  />
                  <TextInput
                    style={[
                      styles.formInput,
                      {flex: 1, borderColor: theme.cardBorder, color: theme.text},
                    ]}
                    placeholder="Pais"
                    placeholderTextColor={theme.muted}
                    autoCapitalize="characters"
                    value={addressForm.country}
                    onChangeText={value => handleAddressFormChange('country', value)}
                  />
                </View>

                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        flex: 1,
                        borderColor: theme.cardBorder,
                        opacity: addressSaveLoading ? 0.7 : 1,
                      },
                    ]}
                    disabled={addressSaveLoading}
                    onPress={saveDeliveryAddress}>
                    <Text style={[styles.confirmButtonText, {color: theme.text}]}>
                      {addressSaveLoading ? 'Salvando...' : 'Salvar endereco'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        flex: 1,
                        backgroundColor: theme.primary,
                        opacity: quoteLoading ? 0.7 : 1,
                      },
                    ]}
                    disabled={quoteLoading}
                    onPress={requestDeliveryQuote}>
                    <Text
                      style={[
                        styles.confirmButtonText,
                        {color: '#FFFFFF'},
                      ]}>
                      {quoteLoading ? 'Cotando...' : 'Cotar entrega'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {deliveryAddresses.length > 0 ? (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {borderColor: theme.cardBorder},
                    ]}
                    onPress={() => {
                      setAddressFormVisible(false);
                      setAddressForm({
                        ...createEmptyAddressForm(),
                        country: 'BR',
                      });
                    }}>
                    <Text style={[styles.confirmButtonText, {color: theme.text}]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                ) : null}
                </View>
              ) : null}

              {deliveryQuotes.length > 0 ? (
                <View style={{marginTop: 8}}>
                  {deliveryQuotes.map(quote => {
                    const quotePrice = getQuotePrice(quote);
                    const canSelectQuote = isSelectableDeliveryQuote(quote);
                    const isSelected = selectedDeliveryQuote?.id === quote?.id;
                    const providerLabel =
                      quote?.providerLabel || quote?.providerKey || quote?.app || 'Entrega';

                    return (
                      <TouchableOpacity
                        key={quote?.id || providerLabel}
                        style={[
                          styles.quoteCard,
                          {
                            borderColor: isSelected ? theme.primary : theme.cardBorder,
                            backgroundColor: isSelected
                              ? `${theme.primary}12`
                              : theme.background,
                          },
                        ]}
                        disabled={!canSelectQuote}
                        onPress={() => setSelectedDeliveryQuote(quote)}>
                        <Text style={[styles.quoteTitle, {color: theme.text}]}>
                          {providerLabel}
                        </Text>
                        <Text style={[styles.quoteMeta, {color: theme.muted}]}>
                          {canSelectQuote
                            ? `Valor: ${formatMoney(quotePrice)}`
                            : quote?.quoteStateLabel || 'Aguardando cotacao'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {hasDeliveryAddress ? (
                <View
                  style={[
                    styles.quoteCard,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: theme.background,
                    },
                  ]}>
                  <Text style={[styles.quoteTitle, {color: theme.text}]}>
                    Valor da entrega
                  </Text>
                  <Text style={[styles.quoteMeta, {color: theme.primary}]}>
                    {formatMoney(deliveryFee)}
                  </Text>
                  <Text style={[styles.quoteMeta, {color: theme.muted}]}>
                    {deliveryFeeSourceLabel}
                  </Text>
                </View>
              ) : null}
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
                  <CheckoutSkeletonRows theme={theme} />
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
                        borderColor: deliveryModeLabels.length > 0
                          ? theme.primary
                          : theme.cardBorder,
                        backgroundColor: deliveryModeLabels.length > 0
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
                          color: deliveryModeLabels.length > 0
                            ? theme.primary
                            : theme.muted,
                        },
                      ]}>
                      {deliveryModeLabels.length > 0
                        ? `${deliveryModeLabels.length} opcao(oes)`
                        : 'Indisponivel'}
                    </Text>
                  </View>
                </View>

                {loadingRemoteDevices ? (
                  <CheckoutSkeletonRows theme={theme} />
                ) : deliveryModeLabels.length > 0 ? (
                  <>
                    <Text
                      style={[
                        styles.methodCardHint,
                        {color: theme.text},
                      ]}>
                      Escolha uma forma liberada para pagar quando o pedido
                      chegar.
                    </Text>
                    <Text
                      style={[
                        styles.methodCardHint,
                        {color: theme.text},
                      ]}>
                      Opcoes liberadas: {deliveryModeLabels.join(', ')}.
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.methodCardHint,
                      {color: theme.text},
                    ]}>
                    Configure devices de cobranca e/ou dinheiro na empresa para
                    usar o pagamento na entrega.
                  </Text>
                )}
              </View>
            )}

            {cardPaymentTypes.length > 0 && (
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
            )}

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
                  Escolha como o cliente vai pagar ao motoboy na entrega.
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
                  Informe para quanto precisa de troco quando o motoboy levar o
                  dinheiro.
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
                  placeholder="Troco para quanto?"
                  placeholderTextColor={theme.muted}
                  value={deliveryChangeForValue}
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
                        {color: '#FFFFFF'},
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
            totalAmount={financialTotal}
          />
        </View>
      )}
    </ShopShell>
  );
}
