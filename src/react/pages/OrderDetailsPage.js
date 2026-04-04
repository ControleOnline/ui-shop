import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

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
        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 14, paddingBottom: 24}}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <Icon name="arrow-back" size={20} color={theme.primary} />
            <Text style={{marginLeft: 8, color: theme.primary, fontWeight: '700'}}>Voltar</Text>
          </TouchableOpacity>

          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: `${theme.primary}30`,
              backgroundColor: `${theme.primary}10`,
              padding: 14,
              marginBottom: 12,
            }}>
            <Text style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>PEDIDO</Text>
            <Text style={{marginTop: 5, color: theme.text, fontSize: 22, fontWeight: '800'}}>
              #{order?.id || orderId}
            </Text>
            <Text style={{marginTop: 4, color: theme.muted, fontSize: 13}}>
              {order?.orderDate
                ? new Date(order.orderDate).toLocaleDateString('pt-BR')
                : 'Carregando data...'}
            </Text>
          </View>

          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              padding: 14,
              marginBottom: 12,
            }}>
            <Text style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>Resumo</Text>
            <View style={{marginTop: 10, gap: 8}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: theme.muted}}>Status</Text>
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  {order?.status?.status || '--'}
                </Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: theme.muted}}>Cliente</Text>
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  {order?.client?.alias || order?.client?.name || '--'}
                </Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: theme.text, fontSize: 16, fontWeight: '700'}}>Total</Text>
                <Text style={{color: theme.primary, fontSize: 20, fontWeight: '900'}}>
                  {formatMoney(order?.price)}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              overflow: 'hidden',
            }}>
            <View style={{padding: 14, borderBottomWidth: 1, borderBottomColor: theme.cardBorder}}>
              <Text style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>Itens</Text>
            </View>
            {items.map(orderProduct => (
              <View
                key={orderProduct.id}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.cardBorder,
                }}>
                <Text style={{color: theme.text, fontSize: 14, fontWeight: '700'}}>
                  {orderProduct?.product?.product}
                </Text>
                <View style={{marginTop: 6, flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{color: theme.muted, fontSize: 12}}>
                    {orderProduct.quantity} x {formatMoney(orderProduct.price)}
                  </Text>
                  <Text style={{color: theme.primary, fontWeight: '800'}}>
                    {formatMoney(orderProduct.total ?? orderProduct.quantity * orderProduct.price)}
                  </Text>
                </View>
              </View>
            ))}
            {items.length === 0 && (
              <View style={{padding: 18, alignItems: 'center'}}>
                <Text style={{color: theme.muted}}>Nenhum item encontrado.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ShopShell>
  );
}
