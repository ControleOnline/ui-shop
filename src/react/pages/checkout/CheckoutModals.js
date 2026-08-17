import React from 'react';
import {Modal, Text, TextInput, TouchableOpacity, View} from 'react-native';
import styles from '../CheckoutPage.styles';
import {formatMoney} from '@controleonline/ui-shop/src/react/utils/shop';

export default function CheckoutModals({
  theme,
  deliveryModeModalVisible,
  setDeliveryModeModalVisible,
  deliveryModeOptions,
  handleSelectDeliveryMode,
  deliveryChangeModalVisible,
  setDeliveryChangeModalVisible,
  deliveryChangeForValue,
  handleDeliveryChangeInputChange,
  pendingAmount,
  cashPaymentDetails,
  handleConfirmDeliveryChange,
}) {
  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={deliveryModeModalVisible}
        onRequestClose={() => setDeliveryModeModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {backgroundColor: theme.surface, borderColor: theme.cardBorder},
            ]}>
            <Text style={[styles.modalTitle, {color: theme.text}]}>
              Pagamento na entrega
            </Text>
            <Text style={[styles.modalSubtitle, {color: theme.muted}]}>
              Escolha como o cliente vai pagar ao motoboy na entrega.
            </Text>

            {deliveryModeOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalItem,
                  {borderColor: theme.cardBorder, backgroundColor: theme.background},
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectDeliveryMode(option)}>
                <Text style={[styles.modalItemTitle, {color: theme.text}]}>
                  {option.label}
                </Text>
                <Text style={[styles.modalItemMeta, {color: theme.muted}]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.modalCloseButton,
                {backgroundColor: theme.surface, borderColor: theme.cardBorder},
              ]}
              onPress={() => setDeliveryModeModalVisible(false)}>
              <Text style={[styles.modalCloseText, {color: theme.text}]}>Fechar</Text>
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
              {backgroundColor: theme.surface, borderColor: theme.cardBorder},
            ]}>
            <Text style={[styles.modalTitle, {color: theme.text}]}>
              Dinheiro na entrega
            </Text>
            <Text style={[styles.modalSubtitle, {color: theme.muted}]}>
              Informe para quanto precisa de troco quando o motoboy levar o dinheiro.
            </Text>

            <TextInput
              style={[styles.modalInput, {borderColor: theme.cardBorder, color: theme.text}]}
              keyboardType="numeric"
              placeholder="Troco para quanto?"
              placeholderTextColor={theme.muted}
              value={deliveryChangeForValue}
              onChangeText={handleDeliveryChangeInputChange}
            />

            <Text style={[styles.modalSubtitle, {color: theme.text}]}>
              Valor do pedido: {formatMoney(pendingAmount)}
            </Text>
            <Text style={[styles.modalSubtitle, {color: theme.text}]}>
              Troco: {formatMoney(cashPaymentDetails.changeAmount)}
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[
                  styles.modalCloseButton,
                  {flex: 1, backgroundColor: theme.surface, borderColor: theme.cardBorder},
                ]}
                onPress={() => setDeliveryChangeModalVisible(false)}>
                <Text style={[styles.modalCloseText, {color: theme.text}]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, {backgroundColor: theme.primary}]}
                onPress={handleConfirmDeliveryChange}>
                <Text style={[styles.confirmButtonText, {color: '#FFFFFF'}]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
