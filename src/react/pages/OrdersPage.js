import React, {useCallback} from 'react';
import {ScrollView, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';

export default function OrdersPage() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const ordersStore = useStore('orders');
  const categoriesStore = useStore('categories');
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;
  const {defaultCompany: shellCompany} = useShopCart();
  const theme = pickTheme(shellCompany);

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id || !defaultCompany?.id) return;
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany.id,
      });
      ordersStore.actions.getItems({
        client: currentCompany.id,
        provider: defaultCompany.id,
        page: 1,
        itemsPerPage: 12,
      });
    }, [categoriesStore.actions, currentCompany?.id, defaultCompany?.id, ordersStore.actions]),
  );

  const orders = ordersStore.getters.items || [];
  const columns = width >= 1500 ? 3 : width >= 1000 ? 2 : 1;
  const pageWidth = Math.max(width - 32, 320);
  const gap = 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <ScrollView style={{flex: 1, padding: 16, backgroundColor: '#f5f5f5'}}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                onPress={() => navigation.navigate('ShopOrderDetailsPage', {id: String(order.id)})}
                style={{
                  width: cardWidth,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 18,
                }}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{fontSize: 18, fontWeight: '600'}}>Order #{order.id}</Text>
                  <View
                    style={{
                      backgroundColor: order?.status?.color || theme.primary,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}>
                    <Text style={{color: '#fff'}}>{order?.status?.status}</Text>
                  </View>
                </View>
                <Text style={{marginTop: 10, color: '#64748b'}}>
                  {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={{marginTop: 6, color: '#64748b'}}>
                  {order?.provider?.alias}
                </Text>
                <Text style={{marginTop: 12, fontSize: 18, fontWeight: '700'}}>
                  {formatMoney(order?.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </ShopShell>
  );
}
