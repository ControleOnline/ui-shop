import {useCallback, useMemo} from 'react';
import {api} from '@controleonline/ui-common/src/api';
import Formatter from '@controleonline/ui-common/src/utils/formatter';
import {
  normalizeMoneyInputText,
  formatMoneyInputValue,
} from '@controleonline/ui-common/src/react/utils/cashPayment';
import {isCashPaymentOption, detectPaymentOptionKind} from '@controleonline/ui-common/src/react/utils/paymentOptions';
import {
  buildDeliveryPaymentLabel,
  findReusableInvoiceForPaymentType,
  formatApiError,
  getActionResult,
  sortInvoicesByDateDesc,
} from './checkoutHelpers';

export default function useCheckoutPaymentActions(state) {
  const {
    navigation,
    cart,
    currentCompany,
    sellerCompanyId,
    pendingStatus,
    invoices,
    setInvoices,
    setError,
    setMessage,
    hasCart,
    hasDeliveryAddress,
    selectedDeliveryQuote,
    cartTotal,
    asaasActions,
    invoiceActions,
    loadData,
    // payment state
    cardPaymentTypes,
    pixPaymentTypes,
    deliveryModeOptions,
    chargeOnDeliveryEnabled,
    deliveryFee,
    financialTotal,
    pendingAmount,
    cashPaymentDetails,
    pixData,
    setPixData,
    setDeliveryModeModalVisible,
    setDeliveryChangeModalVisible,
    setDeliveryChangeForValue,
    selectedDeliveryPaymentType,
    setSelectedDeliveryPaymentType,
    selectedDeliveryOption,
    setSelectedDeliveryOption,
    isProcessing,
    setIsProcessing,
  } = state;

  const pickPaymentTypeForGateway = useCallback(
    gateway => {
      if (gateway === 'card' && cardPaymentTypes.length > 0) {
        return cardPaymentTypes[0];
      }

      if (gateway === 'pix' && pixPaymentTypes.length > 0) {
        return pixPaymentTypes[0];
      }

      return (state.paymentTypes || [])[0] || null;
    },
    [cardPaymentTypes, pixPaymentTypes, state.paymentTypes],
  );

  const ensureInvoiceForPaymentType = useCallback(
    async (
      selectedPaymentType,
      {additionalInfo = null, price = pendingAmount, reuseExisting = true} = {},
    ) => {
      if (!hasCart) {
        throw new Error('Carrinho não encontrado para checkout.');
      }

      if (!hasDeliveryAddress) {
        throw new Error(
          'Selecione ou cadastre um endereço de entrega antes de concluir o checkout.',
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
        throw new Error('Forma de pagamento indisponível para gerar a cobrança.');
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
      cartTotal,
      currentCompany?.id,
      deliveryFee,
      financialTotal,
      hasCart,
      hasDeliveryAddress,
      invoiceActions,
      invoices,
      pendingAmount,
      pendingStatus,
      selectedDeliveryQuote,
      sellerCompanyId,
      setInvoices,
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
        changeFor: Number(changeFor || 0) > 0 ? Number(changeFor) : null,
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
            'Não foi possível registrar a cobrança para pagamento na entrega.',
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
      setError,
      setIsProcessing,
      setMessage,
      setPixData,
      setSelectedDeliveryOption,
      setSelectedDeliveryPaymentType,
    ],
  );

  const startDeliveryPayment = useCallback(
    async deliveryOption => {
      const selectedPaymentType = deliveryOption?.paymentType || null;

      if (!selectedPaymentType) {
        setError('Não foi possível identificar o meio de pagamento da entrega.');
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
    [
      finalizeDeliveryRegistration,
      pendingAmount,
      setDeliveryChangeForValue,
      setDeliveryChangeModalVisible,
      setDeliveryModeModalVisible,
      setError,
      setSelectedDeliveryOption,
      setSelectedDeliveryPaymentType,
    ],
  );

  const handlePayWithCard = useCallback(async () => {
    setError('');
    setMessage('');
    setPixData(null);

    if (!state.selectedCard?.id) {
      setError('Selecione um cartão salvo antes de confirmar o pagamento.');
      return;
    }

    setIsProcessing(true);
    try {
      const targetInvoice = await ensureInvoice('card');
      await asaasActions.payWithCard({invoice: targetInvoice, card: state.selectedCard});
      setMessage('Pagamento com cartão enviado. Aguarde alguns instantes para confirmação.');
      await loadData();
    } catch (e) {
      setError(e?.message || 'Não foi possível processar o pagamento com cartão.');
    } finally {
      setIsProcessing(false);
    }
  }, [asaasActions, ensureInvoice, loadData, setError, setIsProcessing, setMessage, setPixData, state.selectedCard]);

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
  }, [asaasActions, ensureInvoice, loadData, setError, setIsProcessing, setMessage, setPixData]);

  const handleCopyPix = useCallback(async () => {
    if (!pixData?.payload) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(pixData.payload);
      setMessage('Código Pix copiado.');
      return;
    }
    setMessage('Copie manualmente o código Pix exibido.');
  }, [pixData?.payload, setMessage]);

  const handleChargeOnDelivery = useCallback(async () => {
    setError('');
    setMessage('');
    setPixData(null);

    if (!chargeOnDeliveryEnabled) return;

    if (!hasDeliveryAddress) {
      setError('Selecione ou cadastre um endereço de entrega antes de concluir o checkout.');
      return;
    }

    if (deliveryModeOptions.length === 0) {
      setError('A loja ainda não configurou maquininha ou dinheiro para cobrar na entrega.');
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
    setDeliveryModeModalVisible,
    setError,
    setMessage,
    setPixData,
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
  }, [setDeliveryChangeForValue]);

  const handleConfirmDeliveryChange = useCallback(async () => {
    if (!selectedDeliveryPaymentType) {
      setError('Não foi possível identificar o pagamento em dinheiro para registrar a entrega.');
      return;
    }

    if (cashPaymentDetails.receivedAmount <= 0.009) {
      setError('Informe para quanto precisa de troco.');
      return;
    }

    if (cashPaymentDetails.missingAmount > 0.009) {
      setError('O valor informado para troco não pode ser menor que o total do pedido.');
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
    setDeliveryChangeModalVisible,
    setError,
  ]);

  const checkoutBlocked = state.isLoading || isProcessing || !hasCart || !state.itemsCount;
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
              !state.selectedCard?.id,
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
      cardPaymentTypes.length, chargeOnDeliveryEnabled, deliveryCheckoutBlocked,
      handleChargeOnDelivery, handleGeneratePix, handlePayWithCard,
      isProcessing, paymentCheckoutBlocked, pendingAmount,
      pixPaymentTypes.length, state.selectedCard?.id,
    ],
  );

  return {
    checkoutActions, checkoutBlocked, paymentCheckoutBlocked, deliveryCheckoutBlocked,
    handlePayWithCard, handleGeneratePix, handleCopyPix, handleChargeOnDelivery,
    handleSelectDeliveryMode, handleDeliveryChangeInputChange,
    handleConfirmDeliveryChange, finalizeDeliveryRegistration,
  };
}
