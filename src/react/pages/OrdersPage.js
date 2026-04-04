import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';

export default function OrdersPage() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);
  const ordersStore = useStore('orders');
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;
  const {defaultCompany: shellCompany} = useShopCart();
  const theme = pickTheme(shellCompany);

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id || !defaultCompany?.id) return;
      ordersStore.actions.getItems({
        client: currentCompany.id,
        provider: defaultCompany.id,
        page: 1,
        itemsPerPage: 24,
      });
    }, [currentCompany?.id, defaultCompany?.id, ordersStore.actions]),
  );

  const orders = ordersStore.getters.items || [];
  const columns = width >= 1300 ? 3 : width >= 1000 ? 2 : 1;
  const effectiveWidth = layoutWidth || width;
  const pageWidth = Math.max(effectiveWidth - 28, 320);
  const gap = width < 640 ? 10 : 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <ScrollView
          style={{flex: 1}}
          onLayout={event => {
            const nextWidth = event?.nativeEvent?.layout?.width;
            if (!nextWidth) return;
            setLayoutWidth(current =>
              Math.abs(current - nextWidth) < 1 ? current : nextWidth,
            );
          }}
          contentContainerStyle={{padding: 14, paddingBottom: 30}}>
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: `${theme.primary}30`,
              backgroundColor: `${theme.primary}10`,
              padding: 14,
              marginBottom: 12,
            }}>
            <Text style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>AREA LOGADA</Text>
            <Text style={{marginTop: 6, color: theme.text, fontSize: 22, fontWeight: '800'}}>
              Meus pedidos
            </Text>
            <Text style={{marginTop: 4, color: theme.muted, fontSize: 13}}>
              {orders.length} pedido(s) encontrado(s)
            </Text>
          </View>

          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap}}>
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('ShopOrderDetailsPage', {id: String(order.id)})
                }
                style={{
                  width: cardWidth,
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  padding: 14,
                  gap: 10,
                }}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                  <Text style={{fontSize: 16, fontWeight: '800', color: theme.text}}>
                    Pedido #{order.id}
                  </Text>
                  <View
                    style={{
                      backgroundColor: order?.status?.color || theme.primary,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text style={{color: '#fff', fontSize: 11, fontWeight: '800'}}>
                      {order?.status?.status || 'Status'}
                    </Text>
                  </View>
                </View>

                <Text style={{color: theme.muted, fontSize: 12}}>
                  {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                </Text>

                <Text numberOfLines={1} style={{color: theme.text, fontSize: 13}}>
                  {order?.provider?.alias || order?.provider?.name}
                </Text>

                <Text style={{marginTop: 4, fontSize: 20, fontWeight: '900', color: theme.primary}}>
                  {formatMoney(order?.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {orders.length === 0 && (
            <View
              style={{
                marginTop: 4,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                backgroundColor: theme.surface,
                padding: 24,
                alignItems: 'center',
              }}>
              <Text style={{color: theme.text, fontSize: 16, fontWeight: '700'}}>
                Nenhum pedido ainda
              </Text>
              <Text style={{marginTop: 6, color: theme.muted, fontSize: 13}}>
                Seus pedidos aparecerao aqui.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ShopIndex')}
                style={{
                  marginTop: 16,
                  minHeight: 42,
                  minWidth: 180,
                  borderRadius: 12,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 18,
                }}>
                <Text style={{color: '#fff', fontWeight: '800'}}>Voltar ao cardapio</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </ShopShell>
  );
}
