import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney} from '@controleonline/ui-shop/src/react/utils/shop';

export default function OrderDetailsPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = String(route.params?.id || '');
  const ordersStore = useStore('orders');
  const categoriesStore = useStore('categories');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const [order, setOrder] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!orderId) return;
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany?.id,
      });
      ordersStore.actions.get(orderId).then(setOrder);
    }, [categoriesStore.actions, defaultCompany?.id, orderId, ordersStore.actions]),
  );

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <ScrollView style={{flex: 1, backgroundColor: '#111', padding: 16}}>
          <View style={{flexDirection: 'row', gap: 16}}>
            <View style={{flex: 2, backgroundColor: '#1f1f1f', padding: 20}}>
              <Text style={{color: '#1f95c6', fontSize: 22, fontWeight: '700'}}>
                Order Details
              </Text>
              <View style={{marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 18}}>Order #{order?.id}</Text>
                <Text style={{color: '#fff', marginTop: 8}}>
                  {order?.orderDate}
                </Text>
                <Text style={{color: '#fff', marginTop: 8}}>
                  {formatMoney(order?.price)}
                </Text>
              </View>
            </View>

            <View style={{flex: 1, gap: 16}}>
              <View style={{backgroundColor: '#1f1f1f', padding: 20}}>
                <Text style={{color: '#fff', fontWeight: '700'}}>Client</Text>
                <Text style={{color: '#fff', marginTop: 12}}>
                  {order?.client?.name} {order?.client?.alias}
                </Text>
              </View>
            </View>
          </View>

          <View style={{marginTop: 16, backgroundColor: '#1f1f1f', padding: 20}}>
            {(order?.orderProducts || []).map(orderProduct => (
              <View
                key={orderProduct.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderColor: '#444',
                }}>
                <Text style={{color: '#fff'}}>{orderProduct.product.product}</Text>
                <Text style={{color: '#fff'}}>
                  {orderProduct.quantity} x {formatMoney(orderProduct.price)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ShopShell>
  );
}
