import {useCallback, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  filterDeviceConfigsByCompany,
  filterWalletPaymentTypesByAllowedIds,
  isOrderChargeOnDeliveryEnabled,
  resolveRemotePaymentDeviceOptions,
  resolveDevicePaymentTypeIds,
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
  parseMoneyInputValue,
  resolveCashPaymentDetails,
} from '@controleonline/ui-common/src/react/utils/cashPayment';
import {normalizeEntityId} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';
import {
  buildDeliveryPaymentLabel,
  getQuotePrice,
  isSelectableDeliveryQuote,
  isPaidInvoice,
  SHOP_COLLECTION_ITEMS_PER_PAGE,
} from './checkoutHelpers';

export default function useCheckoutPaymentState(core) {
  const {
    salesCompany,
    settingsCompanyConfigs,
    shopChargeOnDeliveryEnabled,
    deliveryFeeEnabled,
    deliveryFeeValue,
    walletPaymentTypes,
    walletPaymentTypeActions,
    sessionChecked,
    isLogged,
    sellerCompany,
    sellerCompanyId,
    selectedDeliveryQuote,
    cartTotal,
    invoices,
    pendingStatus,
    isProcessing,
    setIsProcessing,
    setError,
    setMessage,
    invoiceActions,
    asaasActions,
    deviceConfigActions,
  } = core;

  const [companyDeviceConfigs, setCompanyDeviceConfigs] = useState([]);
  const [loadingRemoteDevices, setLoadingRemoteDevices] = useState(false);
  const [deliveryModeModalVisible, setDeliveryModeModalVisible] = useState(false);
  const [deliveryChangeModalVisible, setDeliveryChangeModalVisible] = useState(false);
  const [deliveryChangeForValue, setDeliveryChangeForValue] = useState('');
  const [selectedDeliveryPaymentType, setSelectedDeliveryPaymentType] = useState(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [pixData, setPixData] = useState(null);

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
  const allowedPaymentTypeIds = useMemo(
    () => resolveDevicePaymentTypeIds(effectiveCompanyConfigs, walletPaymentTypes),
    [effectiveCompanyConfigs, walletPaymentTypes],
  );
  const paymentTypes = useMemo(
    () =>
      filterWalletPaymentTypesByAllowedIds(
        walletPaymentTypes,
        allowedPaymentTypeIds,
      ),
    [allowedPaymentTypeIds, walletPaymentTypes],
  );

  const configuredDeliveryFee = deliveryFeeEnabled
    ? Number(deliveryFeeValue || 0)
    : 0;
  const quotedDeliveryFee = getQuotePrice(selectedDeliveryQuote);
  const hasSelectedDeliveryQuote = isSelectableDeliveryQuote(selectedDeliveryQuote);
  const deliveryFee = hasSelectedDeliveryQuote ? quotedDeliveryFee : configuredDeliveryFee;
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
  } else if ((core.deliveryQuotes || []).length > 0) {
    deliveryFeeSourceLabel = 'Selecione uma cotacao disponivel para aplicar a taxa.';
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
  const deliveryPaymentTypes = useMemo(() => {
    if (!sellerCompanyId || !chargeOnDeliveryEnabled || !sessionChecked || !isLogged) {
      return [];
    }
    return paymentTypes;
  }, [chargeOnDeliveryEnabled, isLogged, paymentTypes, sellerCompanyId, sessionChecked]);

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
      chips.push({key: 'delivery', label: 'Cobrar na entrega'});
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

      if (!walletId) return;
      map[walletId] = [...(map[walletId] || []), device];
    });

    return map;
  }, [effectiveCompanyConfigs, remotePaymentDevices]);

  const deliveryModeOptions = useMemo(() => {
    const options = [];

    deliveryPaymentTypes
      .filter(
        item => isIntegratedPaymentOption(item) && !isCashPaymentOption(item),
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
          itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
        })
        .then(data => {
          if (!isMounted) return;
          setCompanyDeviceConfigs(filterDeviceConfigsByCompany(data, sellerCompanyId));
        })
        .catch(() => {
          if (isMounted) setCompanyDeviceConfigs([]);
        })
        .finally(() => {
          if (isMounted) setLoadingRemoteDevices(false);
        });

      return () => {
        isMounted = false;
      };
    }, [chargeOnDeliveryEnabled, deviceConfigActions, isLogged, sellerCompanyId, sessionChecked]),
  );

  return {
    effectiveCompanyConfigs, chargeOnDeliveryEnabled, asaasConfigured, asaasPixConfigured,
    paymentTypes, cardPaymentTypes, pixPaymentTypes, deliveryPaymentTypes, paymentMethodChips,
    companyDeviceConfigs, loadingRemoteDevices,
    remotePaymentDevices, deliveryCashPayment, deliveryDeviceOptionsByWalletId,
    deliveryModeOptions, deliveryModeLabels,
    deliveryFee, deliveryFeeSourceLabel, financialTotal,
    paidAmount, pendingAmount, changeForAmount, cashPaymentDetails,
    pixData, setPixData,
    deliveryModeModalVisible, setDeliveryModeModalVisible,
    deliveryChangeModalVisible, setDeliveryChangeModalVisible,
    deliveryChangeForValue, setDeliveryChangeForValue,
    selectedDeliveryPaymentType, setSelectedDeliveryPaymentType,
    selectedDeliveryOption, setSelectedDeliveryOption,
    // pass-through for payment actions
    pendingStatus, isProcessing, setIsProcessing, invoiceActions, asaasActions,
    invoices: core.invoices, setInvoices: core.setInvoices,
  };
}
