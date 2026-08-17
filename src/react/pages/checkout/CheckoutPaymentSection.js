import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import styles from '../CheckoutPage.styles';
import {
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
} from '../CheckoutPage.styles';
import CheckoutSkeletonRows from './CheckoutSkeletonRows';

export default function CheckoutPaymentSection({
  theme,
  isLoading,
  paymentMethodChips,
  chargeOnDeliveryEnabled,
  deliveryModeLabels,
  loadingRemoteDevices,
  cardPaymentTypes,
  cards,
  selectedCard,
  setSelectedCard,
  navigation,
  pixData,
  handleCopyPix,
  error,
  message,
}) {
  return (
    <>
      <View style={inlineStyle_366_14({theme})}>
        <Text style={inlineStyle_375_16({theme})}>Barra de pagamento</Text>

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
                  style={[styles.methodChip, {borderColor: theme.cardBorder, backgroundColor}]}>
                  <Text style={inlineStyle_410_26({theme})}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={inlineStyle_422_22({theme})}>
            Nenhuma forma de pagamento disponível para esta empresa.
          </Text>
        )}
      </View>

      {chargeOnDeliveryEnabled && (
        <View style={inlineStyle_429_14({theme})}>
          <View style={styles.methodCardHeader}>
            <Text style={[styles.methodCardTitle, {color: theme.text}]}>
              Cobrar na entrega
            </Text>
            <View
              style={[
                styles.methodChip,
                {
                  borderColor: deliveryModeLabels.length > 0 ? theme.primary : theme.cardBorder,
                  backgroundColor:
                    deliveryModeLabels.length > 0
                      ? `${theme.primary}14`
                      : `${theme.cardBorder}30`,
                },
              ]}>
              <Text
                style={[
                  inlineStyle_410_26({theme}),
                  {color: deliveryModeLabels.length > 0 ? theme.primary : theme.muted},
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
              <Text style={[styles.methodCardHint, {color: theme.text}]}>
                Escolha uma forma liberada para pagar quando o pedido chegar.
              </Text>
              <Text style={[styles.methodCardHint, {color: theme.text}]}>
                Opcoes liberadas: {deliveryModeLabels.join(', ')}.
              </Text>
            </>
          ) : (
            <Text style={[styles.methodCardHint, {color: theme.text}]}>
              Configure devices de cobranca e/ou dinheiro na empresa para usar o
              pagamento na entrega.
            </Text>
          )}
        </View>
      )}

      {cardPaymentTypes.length > 0 && (
        <View style={inlineStyle_429_14({theme})}>
          <View style={inlineStyle_438_16}>
            <Text style={inlineStyle_445_18({theme})}>Cartões salvos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopCardsPage')}>
              <Text style={inlineStyle_450_24({theme})}>Gerenciar</Text>
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <Text style={inlineStyle_457_22({theme})}>
              Nenhum cartão salvo. Cadastre um cartão para pagar com crédito.
            </Text>
          ) : (
            cards.map(card => {
              const isSelected = card?.id === selectedCard?.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCard(card)}
                  style={inlineStyle_468_22({isSelected, theme})}>
                  <Text style={inlineStyle_480_28({theme})}>
                    {(card?.type || 'Crédito').toUpperCase()}
                  </Text>
                  <Text style={inlineStyle_484_24({theme})}>
                    {card?.number_group_1 || '****'} •••• ••••{' '}
                    {card?.number_group_4 || '****'}
                  </Text>
                  <Text style={inlineStyle_489_24({theme})}>
                    {card?.name || 'Titular'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}

      {!!pixData?.payload && (
        <View style={inlineStyle_504_16({theme})}>
          <Text style={inlineStyle_513_18({theme})}>Pix gerado</Text>
          {pixData?.encodedImage ? (
            <Image
              source={{uri: `data:image/png;base64,${pixData.encodedImage}`}}
              resizeMode="contain"
              style={inlineStyle_522_20}
            />
          ) : null}
          <View style={inlineStyle_526_18({theme})}>
            <Text style={inlineStyle_534_24({theme})}>{pixData.payload}</Text>
          </View>
          <TouchableOpacity onPress={handleCopyPix} style={inlineStyle_540_18({theme})}>
            <Text style={inlineStyle_549_24({theme})}>Copiar código Pix</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!error && (
        <View style={inlineStyle_558_16({theme})}>
          <Text style={inlineStyle_564_22({theme})}>{error}</Text>
        </View>
      )}

      {!!message && (
        <View style={inlineStyle_572_16({theme})}>
          <Text style={inlineStyle_578_22({theme})}>{message}</Text>
        </View>
      )}
    </>
  );
}
