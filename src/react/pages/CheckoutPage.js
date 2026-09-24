import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ShopAuthRequiredState from '@controleonline/ui-shop/src/react/components/storefront/ShopAuthRequiredState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopPaymentBar from '@controleonline/ui-shop/src/react/components/storefront/ShopPaymentBar';
import styles, {
  inlineStyle_326_14,
  inlineStyle_328_12,
  inlineStyle_331_14,
  inlineStyle_339_16,
  inlineStyle_343_16,
  inlineStyle_351_20,
  inlineStyle_355_16,
  inlineStyle_366_14,
  inlineStyle_375_16,
  inlineStyle_371_12,
} from './CheckoutPage.styles';
import {pickTheme, formatMoney} from '@controleonline/ui-shop/src/react/utils/shop';
import useCheckoutState from './checkout/useCheckoutState';
import useCheckoutPayments from './checkout/useCheckoutPayments';
import CheckoutAddressSection from './checkout/CheckoutAddressSection';
import CheckoutPaymentSection from './checkout/CheckoutPaymentSection';
import CheckoutModals from './checkout/CheckoutModals';

// Line counts before/after modularization:
// CheckoutPage.js before: 2330 lines
// CheckoutPage.js after: ~200 lines
// Extracted: checkoutHelpers.js, useCheckoutState.js, useCheckoutPaymentState.js,
//            useCheckoutPaymentActions.js, useCheckoutPayments.js,
//            CheckoutAddressSection.js, CheckoutPaymentSection.js, CheckoutModals.js

export default function CheckoutPage() {
  const core = useCheckoutState();
  const payments = useCheckoutPayments(core);

  const {
    navigation,
    isLogged,
    sessionChecked,
    cart,
    sellerCompany,
    defaultCompany,
    itemsCount,
    cartTotal,
    hasDeliveryAddress,
    cartAddressDestinationIri,
    shouldShowAddressForm,
    addressForm,
    setAddressForm,
    setAddressFormVisible,
    addressOptionsLoading,
    addressSaveLoading,
    addressSelectingId,
    deliveryAddresses,
    quoteLoading,
    deliveryQuotes,
    selectedDeliveryQuote,
    setSelectedDeliveryQuote,
    error,
    message,
    cards,
    selectedCard,
    setSelectedCard,
    isLoading,
    handleBackFromCheckout,
    handleSelectDeliveryAddress,
    saveDeliveryAddress,
    requestDeliveryQuote,
  } = core;

  const {
    chargeOnDeliveryEnabled,
    deliveryModeLabels,
    deliveryModeOptions,
    loadingRemoteDevices,
    cardPaymentTypes,
    paymentMethodChips,
    deliveryFee,
    deliveryFeeSourceLabel,
    financialTotal,
    paidAmount,
    pendingAmount,
    cashPaymentDetails,
    pixData,
    deliveryModeModalVisible,
    setDeliveryModeModalVisible,
    deliveryChangeModalVisible,
    setDeliveryChangeModalVisible,
    deliveryChangeForValue,
    checkoutActions,
    handleCopyPix,
    handleSelectDeliveryMode,
    handleDeliveryChangeInputChange,
    handleConfirmDeliveryChange,
  } = payments;

  const theme = pickTheme(sellerCompany || defaultCompany);

  if (sessionChecked && !isLogged) {
    return (
      <ShopShell
        onSearch={query =>
          navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
        }>
        {() => (
          <ShopAuthRequiredState
            theme={theme}
            title="Entre para finalizar o pedido"
            description="Para concluir a compra precisamos identificar o cliente e o endereco de entrega."
          />
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={inlineStyle_326_14}>
          <ScrollView
            style={inlineStyle_328_12}
            contentContainerStyle={[inlineStyle_371_12, {paddingBottom: 232}]}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={handleBackFromCheckout}
              style={[
                styles.backButton,
                {backgroundColor: theme.surface, borderColor: theme.cardBorder},
              ]}>
              <Icon name="arrow-back" size={19} color={theme.primary} />
              <Text style={[styles.backButtonText, {color: theme.primary}]}>
                Voltar ao carrinho
              </Text>
            </TouchableOpacity>

            <View style={inlineStyle_331_14({theme})}>
              <Text style={inlineStyle_339_16({theme})}>CHECKOUT</Text>
              <Text style={inlineStyle_343_16({theme})}>Pedido #{cart?.id || '--'}</Text>
              <Text style={inlineStyle_351_20({theme})}>{itemsCount} item(ns)</Text>
              <Text style={inlineStyle_355_16({theme})}>{formatMoney(financialTotal)}</Text>
            </View>

            {deliveryFee > 0 && (
              <View style={inlineStyle_366_14({theme})}>
                <Text style={inlineStyle_375_16({theme})}>Resumo da entrega</Text>
                <Text style={[styles.methodCardHint, {color: theme.text}]}>
                  Produtos: {formatMoney(cartTotal)}
                </Text>
                <Text style={[styles.methodCardHint, {color: theme.text}]}>
                  Entrega: {formatMoney(deliveryFee)}
                </Text>
                <Text style={[styles.methodCardHint, {color: theme.text}]}>
                  Total a cobrar: {formatMoney(financialTotal)}
                </Text>
              </View>
            )}

            <CheckoutAddressSection
              theme={theme}
              hasDeliveryAddress={hasDeliveryAddress}
              addressOptionsLoading={addressOptionsLoading}
              deliveryAddresses={deliveryAddresses}
              cartAddressDestinationIri={cartAddressDestinationIri}
              addressSelectingId={addressSelectingId}
              addressSaveLoading={addressSaveLoading}
              handleSelectDeliveryAddress={handleSelectDeliveryAddress}
              shouldShowAddressForm={shouldShowAddressForm}
              addressForm={addressForm}
              setAddressForm={setAddressForm}
              setAddressFormVisible={setAddressFormVisible}
              saveDeliveryAddress={saveDeliveryAddress}
              requestDeliveryQuote={requestDeliveryQuote}
              quoteLoading={quoteLoading}
              deliveryQuotes={deliveryQuotes}
              selectedDeliveryQuote={selectedDeliveryQuote}
              setSelectedDeliveryQuote={setSelectedDeliveryQuote}
              deliveryFee={deliveryFee}
              deliveryFeeSourceLabel={deliveryFeeSourceLabel}
            />

            <CheckoutPaymentSection
              theme={theme}
              isLoading={isLoading}
              paymentMethodChips={paymentMethodChips}
              chargeOnDeliveryEnabled={chargeOnDeliveryEnabled}
              deliveryModeLabels={deliveryModeLabels}
              loadingRemoteDevices={loadingRemoteDevices}
              cardPaymentTypes={cardPaymentTypes}
              cards={cards}
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
              navigation={navigation}
              pixData={pixData}
              handleCopyPix={handleCopyPix}
              error={error}
              message={message}
            />
          </ScrollView>

          <CheckoutModals
            theme={theme}
            deliveryModeModalVisible={deliveryModeModalVisible}
            setDeliveryModeModalVisible={setDeliveryModeModalVisible}
            deliveryModeOptions={deliveryModeOptions}
            handleSelectDeliveryMode={handleSelectDeliveryMode}
            deliveryChangeModalVisible={deliveryChangeModalVisible}
            setDeliveryChangeModalVisible={setDeliveryChangeModalVisible}
            deliveryChangeForValue={deliveryChangeForValue}
            handleDeliveryChangeInputChange={handleDeliveryChangeInputChange}
            pendingAmount={pendingAmount}
            cashPaymentDetails={cashPaymentDetails}
            handleConfirmDeliveryChange={handleConfirmDeliveryChange}
          />

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
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
