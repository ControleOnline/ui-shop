import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {
  buildAddressOptionSummary,
  createEmptyAddressForm,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  normalizeEntityId,
  toEntityIri,
} from '@controleonline/ui-common/src/react/utils/commercialDocumentOrders';
import DefaultAddress from '@controleonline/ui-default/src/react/components/address/DefaultAddress';
import {
  inlineStyle_366_14,
  inlineStyle_375_16,
} from '../CheckoutPage.styles';
import styles from '../CheckoutPage.styles';
import CheckoutSkeletonRows from './CheckoutSkeletonRows';
import {formatMoney} from '@controleonline/ui-shop/src/react/utils/shop';

export default function CheckoutAddressSection({
  theme,
  hasDeliveryAddress,
  addressOptionsLoading,
  deliveryAddresses,
  cartAddressDestinationIri,
  addressSelectingId,
  addressSaveLoading,
  handleSelectDeliveryAddress,
  shouldShowAddressForm,
  addressForm,
  setAddressForm,
  setAddressFormVisible,
  saveDeliveryAddress,
  requestDeliveryQuote,
  quoteLoading,
  deliveryQuotes,
  selectedDeliveryQuote,
  setSelectedDeliveryQuote,
  deliveryFee,
  deliveryFeeSourceLabel,
}) {
  return (
    <View style={inlineStyle_366_14({theme})}>
      <Text style={inlineStyle_375_16({theme})}>Entrega</Text>

      {!hasDeliveryAddress ? (
        <Text style={[styles.methodCardHint, {color: theme.primary}]}>
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
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
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
        <Text style={[styles.methodCardHint, {color: theme.muted}]}>
          Nenhum endereco cadastrado para este cliente.
        </Text>
      )}

      {deliveryAddresses.length > 0 && !shouldShowAddressForm ? (
        <View style={styles.formRowAction}>
          <TouchableOpacity
            style={[styles.primaryButton, {flex: 1, backgroundColor: theme.primary}]}
            onPress={() => setAddressFormVisible(true)}>
            <Text style={[styles.confirmButtonText, {color: '#FFFFFF'}]}>
              Adicionar endereco
            </Text>
          </TouchableOpacity>
          {hasDeliveryAddress ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {flex: 1, backgroundColor: theme.primary, opacity: quoteLoading ? 0.7 : 1},
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
          <DefaultAddress
            mode="create"
            hideActions
            row={addressForm}
            onFormChange={next => setAddressForm(current => ({...current, ...next}))}
          />
          <View style={styles.formRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {flex: 1, borderColor: theme.cardBorder, opacity: addressSaveLoading ? 0.7 : 1},
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
                {flex: 1, backgroundColor: theme.primary, opacity: quoteLoading ? 0.7 : 1},
              ]}
              disabled={quoteLoading}
              onPress={requestDeliveryQuote}>
              <Text style={[styles.confirmButtonText, {color: '#FFFFFF'}]}>
                {quoteLoading ? 'Cotando...' : 'Cotar entrega'}
              </Text>
            </TouchableOpacity>
          </View>
          {deliveryAddresses.length > 0 ? (
            <TouchableOpacity
              style={[styles.secondaryButton, {borderColor: theme.cardBorder}]}
              onPress={() => {
                setAddressFormVisible(false);
                setAddressForm({...createEmptyAddressForm(), country: 'BR'});
              }}>
              <Text style={[styles.confirmButtonText, {color: theme.text}]}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {deliveryQuotes.length > 0 ? (
        <View style={{marginTop: 8}}>
          {deliveryQuotes.map(quote => {
            const quotePrice = Number(quote?.price || 0);
            const canSelectQuote = quote?.available !== false && quotePrice > 0;
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
                    backgroundColor: isSelected ? `${theme.primary}12` : theme.background,
                  },
                ]}
                disabled={!canSelectQuote}
                onPress={() => setSelectedDeliveryQuote(quote)}>
                <Text style={[styles.quoteTitle, {color: theme.text}]}>{providerLabel}</Text>
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
            {borderColor: theme.cardBorder, backgroundColor: theme.background},
          ]}>
          <Text style={[styles.quoteTitle, {color: theme.text}]}>Valor da entrega</Text>
          <Text style={[styles.quoteMeta, {color: theme.primary}]}>{formatMoney(deliveryFee)}</Text>
          <Text style={[styles.quoteMeta, {color: theme.muted}]}>{deliveryFeeSourceLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
