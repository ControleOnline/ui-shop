import {useCallback, useEffect, useRef, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import {
  createEmptyAddressForm,
  normalizePostalCodeInput,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  normalizeEntityId,
  toEntityIri,
} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  SHOP_COLLECTION_ITEMS_PER_PAGE,
  extractItems,
  extractQuotesFromResponse,
  formatApiError,
  isSelectableDeliveryQuote,
  normalizeActionResult,
  pickPendingStatus,
  sortInvoicesByDateDesc,
} from './checkoutHelpers';

export default function useCheckoutState() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const {isLogged, sessionChecked} = authStore.getters;
  const {
    cart,
    currentCompany,
    defaultCompany,
    refreshCart,
    salesCompany,
  } = useShopCart({autoRefresh: false});
  const {
    chargeOnDeliveryEnabled: shopChargeOnDeliveryEnabled,
    companyConfigs: settingsCompanyConfigs,
    deliveryFeeEnabled,
    deliveryFeeValue,
  } = useShopSettings();
  const walletPaymentTypeStore = useStore('walletPaymentType');
  const walletPaymentTypeActions = walletPaymentTypeStore.actions;
  const walletPaymentTypes = walletPaymentTypeStore.getters.items || [];
  const cardStore = useStore('card');
  const cardActions = cardStore.actions;
  const invoiceStore = useStore('invoice');
  const invoiceActions = invoiceStore.actions;
  const statusStore = useStore('status');
  const statusActions = statusStore.actions;
  const asaasStore = useStore('asaas');
  const asaasActions = asaasStore.actions;
  const deviceConfigActions = useStore('device_config').actions;
  const addressStore = useStore('address');
  const addressActions = addressStore.actions;
  const ordersStore = useStore('orders');
  const ordersActions = ordersStore.actions;

  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressForm, setAddressForm] = useState({
    ...createEmptyAddressForm(),
    country: 'BR',
  });
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [localDeliveryAddressIri, setLocalDeliveryAddressIri] = useState('');
  const [addressOptionsLoading, setAddressOptionsLoading] = useState(true);
  const [addressSaveLoading, setAddressSaveLoading] = useState(false);
  const [addressSelectingId, setAddressSelectingId] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [deliveryQuotes, setDeliveryQuotes] = useState([]);
  const [selectedDeliveryQuote, setSelectedDeliveryQuote] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const loadDataInFlightRef = useRef(false);

  const sellerCompany = salesCompany || defaultCompany || null;
  const sellerCompanyId = sellerCompany?.id || null;

  const hasCart = Boolean(cart?.id);
  const cartAddressDestinationIri = toEntityIri(
    cart?.addressDestination || null,
    'addresses',
  );
  const hasDeliveryAddress = Boolean(
    cartAddressDestinationIri || localDeliveryAddressIri,
  );
  const cartItems = Array.isArray(cart?.orderProducts) ? cart.orderProducts : [];
  const itemsCount = cartItems.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
  const cartTotal = Number(cart?.price || 0);

  const shouldShowAddressForm =
    !addressOptionsLoading &&
    (deliveryAddresses.length === 0 || addressFormVisible);

  const handleBackFromCheckout = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('ShopCartPage');
  }, [navigation]);

  const handleAddressFormChange = useCallback((field, value) => {
    setAddressForm(current => ({
      ...current,
      [field]: field === 'cep' ? normalizePostalCodeInput(value) : value,
    }));
  }, []);

  const updateCartDeliveryAddress = useCallback(
    async addressIri => {
      if (!cart?.id) {
        throw new Error('Carrinho não encontrado para atualizar a entrega.');
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
    [cart?.id, cart?.['@id'], currentCompany, ordersActions, refreshCart, sellerCompany],
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
        setLocalDeliveryAddressIri(addressIri);
        setAddressFormVisible(false);
        setMessage('Endereço de entrega selecionado.');
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
      setError('Carrinho não encontrado para atualizar a entrega.');
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
    const state = String(addressForm.uf || addressForm.state || '').trim();
    const country = String(addressForm.countryCode || addressForm.country || 'BR').trim();
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
          street, district, city, state, country,
          number: Number(number), cep, nickname, complement,
          people: clientIri,
        }),
      );
      const savedAddressIri = toEntityIri(savedAddress, 'addresses');

      if (!savedAddressIri) {
        throw new Error('Endereco criado sem identificador valido.');
      }

      await updateCartDeliveryAddress(savedAddressIri);
      setLocalDeliveryAddressIri(savedAddressIri);
      setDeliveryAddresses(current => [
        savedAddress,
        ...current.filter(
          address => toEntityIri(address, 'addresses') !== savedAddressIri,
        ),
      ]);
      setAddressForm({...createEmptyAddressForm(), country: 'BR'});
      setAddressFormVisible(false);
      setMessage('Endereco de entrega salvo no pedido.');
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setAddressSaveLoading(false);
    }
  }, [addressActions, addressForm, cart?.id, currentCompany, updateCartDeliveryAddress]);

  const loadDeliveryQuotes = useCallback(
    async orderId => {
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
    },
    [cart?.id],
  );

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
      setMessage('Cotação de entrega solicitada.');
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

    if (loadDataInFlightRef.current) {
      return;
    }

    loadDataInFlightRef.current = true;
    setIsLoading(true);
    setAddressOptionsLoading(true);
    setError('');
    setMessage('');

    // Resolve asaasConfigured locally for loadData without depending on derived state
    const currentConfigs =
      salesCompany?.configs && typeof salesCompany.configs === 'object'
        ? salesCompany.configs
        : settingsCompanyConfigs && typeof settingsCompanyConfigs === 'object'
        ? settingsCompanyConfigs
        : {};
    const asaasConfiguredForLoad = Boolean(currentConfigs?.['asaas-key']);

    try {
      const refreshedCart = await refreshCart();
      const resolvedCart = refreshedCart?.id ? refreshedCart : cart;
      const clientIri = currentCompany?.id ? `/people/${currentCompany.id}` : '';

      const [
        cardsResponse,
        statusResponse,
        invoicesResponse,
        addressesResponse,
        walletPaymentTypesResponse,
      ] = await Promise.all([
        asaasConfiguredForLoad
          ? cardActions.getItems({itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE})
          : Promise.resolve([]),
        statusActions.getItems({
          context: 'invoice',
          itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
        }),
        resolvedCart?.id
          ? invoiceActions.getItems({
              orderId: resolvedCart.id,
              'order.order': `/orders/${resolvedCart.id}`,
              itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
            })
          : Promise.resolve([]),
        clientIri
          ? addressActions.getItems({
              people: clientIri,
              itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
            }).catch(() => [])
          : Promise.resolve([]),
        currentCompany?.id && currentConfigs
          ? walletPaymentTypeActions.getItems({
              people: `/people/${currentCompany.id}`,
              itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
            }).catch(() => [])
          : Promise.resolve([]),
      ]);

      const fetchedCards = extractItems(cardsResponse);
      const fetchedStatuses = extractItems(statusResponse);
      const fetchedInvoices = sortInvoicesByDateDesc(extractItems(invoicesResponse));
      const fetchedAddresses = extractItems(addressesResponse);
      const fetchedWalletPaymentTypes = extractItems(walletPaymentTypesResponse);

      /*
       * @agents Checkout owns the payment bar visibility. Load the wallet
       * payment types here too so the page is not dependent on provider timing
       * when entered directly from the shop purchase flow.
       */
      if (fetchedWalletPaymentTypes.length > 0) {
        walletPaymentTypeActions.setItems(fetchedWalletPaymentTypes);
      }

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
      setError(e?.message || 'Não foi possível carregar os dados de pagamento.');
    } finally {
      setIsLoading(false);
      setAddressOptionsLoading(false);
      loadDataInFlightRef.current = false;
    }
  }, [
    addressActions,
    cardActions,
    cart?.id,
    currentCompany?.id,
    invoiceActions,
    isLogged,
    loadDeliveryQuotes,
    refreshCart,
    salesCompany?.configs,
    sessionChecked,
    settingsCompanyConfigs,
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

  return {
    navigation, isLogged, sessionChecked,
    cart, currentCompany, defaultCompany, salesCompany,
    sellerCompany, sellerCompanyId,
    shopChargeOnDeliveryEnabled, settingsCompanyConfigs, deliveryFeeEnabled, deliveryFeeValue,
    walletPaymentTypes, walletPaymentTypeActions,
    cardActions, invoiceActions, asaasActions, deviceConfigActions,
    cards, setCards, invoices, setInvoices, selectedCard, setSelectedCard,
    pendingStatus, isLoading, isProcessing, setIsProcessing,
    deliveryAddresses, setDeliveryAddresses, addressForm, setAddressForm,
    addressFormVisible, setAddressFormVisible,
    localDeliveryAddressIri, setLocalDeliveryAddressIri,
    addressOptionsLoading, addressSaveLoading, addressSelectingId, quoteLoading,
    deliveryQuotes, setDeliveryQuotes, selectedDeliveryQuote, setSelectedDeliveryQuote,
    error, setError, message, setMessage,
    hasCart, cartAddressDestinationIri, hasDeliveryAddress,
    cartItems, itemsCount, cartTotal, shouldShowAddressForm,
    handleBackFromCheckout, handleAddressFormChange, updateCartDeliveryAddress,
    handleSelectDeliveryAddress, saveDeliveryAddress,
    loadDeliveryQuotes, requestDeliveryQuote, loadData,
  };
}
