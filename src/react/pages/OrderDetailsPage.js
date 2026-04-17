import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_34_20,
  inlineStyle_37_12,
  inlineStyle_39_18,
  inlineStyle_43_12,
  inlineStyle_51_18,
  inlineStyle_52_18,
  inlineStyle_55_18,
  inlineStyle_63_12,
  inlineStyle_71_18,
  inlineStyle_72_18,
  inlineStyle_73_20,
  inlineStyle_74_22,
  inlineStyle_75_22,
  inlineStyle_79_20,
  inlineStyle_80_22,
  inlineStyle_81_22,
  inlineStyle_85_20,
  inlineStyle_86_22,
  inlineStyle_87_22,
  inlineStyle_95_12,
  inlineStyle_102_18,
  inlineStyle_103_20,
  inlineStyle_108_16,
  inlineStyle_114_22,
  inlineStyle_117_22,
  inlineStyle_118_24,
  inlineStyle_121_24,
  inlineStyle_128_20,
  inlineStyle_129_22,
} from './OrderDetailsPage.styles';

import { inlineStyle_66_46 } from './OrderDetailsPage.styles';

export default function OrderDetailsPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = String(route.params?.id || '');
  const ordersStore = useStore('orders');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const theme = pickTheme(defaultCompany);
  const [order, setOrder] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!orderId) return;
      ordersStore.actions.get(orderId).then(setOrder);
    }, [orderId, ordersStore.actions]),
  );

  const items = order?.orderProducts || [];

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <ScrollView style={inlineStyle_34_20} contentContainerStyle={inlineStyle_66_46}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={inlineStyle_37_12}>
            <Icon name="arrow-back" size={20} color={theme.primary} />
            <Text style={inlineStyle_39_18({
              theme: theme,
            })}>Voltar</Text>
          </TouchableOpacity>

          <View
            style={inlineStyle_43_12({
              theme: theme,
            })}>
            <Text style={inlineStyle_51_18({
              theme: theme,
            })}>PEDIDO</Text>
            <Text style={inlineStyle_52_18({
              theme: theme,
            })}>
              #{order?.id || orderId}
            </Text>
            <Text style={inlineStyle_55_18({
              theme: theme,
            })}>
              {order?.orderDate
                ? new Date(order.orderDate).toLocaleDateString('pt-BR')
                : 'Carregando data...'}
            </Text>
          </View>

          <View
            style={inlineStyle_63_12({
              theme: theme,
            })}>
            <Text style={inlineStyle_71_18({
              theme: theme,
            })}>Resumo</Text>
            <View style={inlineStyle_72_18}>
              <View style={inlineStyle_73_20}>
                <Text style={inlineStyle_74_22({
                  theme: theme,
                })}>Status</Text>
                <Text style={inlineStyle_75_22({
                  theme: theme,
                })}>
                  {order?.status?.status || '--'}
                </Text>
              </View>
              <View style={inlineStyle_79_20}>
                <Text style={inlineStyle_80_22({
                  theme: theme,
                })}>Cliente</Text>
                <Text style={inlineStyle_81_22({
                  theme: theme,
                })}>
                  {order?.client?.alias || order?.client?.name || '--'}
                </Text>
              </View>
              <View style={inlineStyle_85_20}>
                <Text style={inlineStyle_86_22({
                  theme: theme,
                })}>Total</Text>
                <Text style={inlineStyle_87_22({
                  theme: theme,
                })}>
                  {formatMoney(order?.price)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={inlineStyle_95_12({
              theme: theme,
            })}>
            <View style={inlineStyle_102_18({
              theme: theme,
            })}>
              <Text style={inlineStyle_103_20({
                theme: theme,
              })}>Itens</Text>
            </View>
            {items.map(orderProduct => (
              <View
                key={orderProduct.id}
                style={inlineStyle_108_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_114_22({
                  theme: theme,
                })}>
                  {orderProduct?.product?.product}
                </Text>
                <View style={inlineStyle_117_22}>
                  <Text style={inlineStyle_118_24({
                    theme: theme,
                  })}>
                    {orderProduct.quantity} x {formatMoney(orderProduct.price)}
                  </Text>
                  <Text style={inlineStyle_121_24({
                    theme: theme,
                  })}>
                    {formatMoney(orderProduct.total ?? orderProduct.quantity * orderProduct.price)}
                  </Text>
                </View>
              </View>
            ))}
            {items.length === 0 && (
              <View style={inlineStyle_128_20}>
                <Text style={inlineStyle_129_22({
                  theme: theme,
                })}>Nenhum item encontrado.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ShopShell>
  );
}
