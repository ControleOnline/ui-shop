import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';

import {
  inlineStyle_45_10,
  inlineStyle_55_12,
  inlineStyle_63_18,
  inlineStyle_64_18,
  inlineStyle_67_18,
  inlineStyle_72_16,
  inlineStyle_80_16,
  inlineStyle_89_22,
  inlineStyle_90_24,
  inlineStyle_94_20,
  inlineStyle_100_26,
  inlineStyle_106_22,
  inlineStyle_110_40,
  inlineStyle_114_22,
  inlineStyle_123_14,
  inlineStyle_132_20,
  inlineStyle_135_20,
  inlineStyle_140_16,
  inlineStyle_150_22,
} from './OrdersPage.styles';

import { inlineStyle_75_10 } from './OrdersPage.styles';

export default function OrdersPage() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);
  const ordersStore = useStore('orders');
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = peopleStore.getters;
  const {defaultCompany: shellCompany, salesCompany} = useShopCart();
  const theme = pickTheme(shellCompany);

  useFocusEffect(
    useCallback(() => {
      if (!currentCompany?.id || !(salesCompany?.id || defaultCompany?.id)) {
        return;
      }

      ordersStore.actions.getItems({
        client: currentCompany.id,
        provider: salesCompany?.id || defaultCompany.id,
        page: 1,
        itemsPerPage: 24,
      });
    }, [
      currentCompany?.id,
      defaultCompany?.id,
      ordersStore.actions,
      salesCompany?.id,
    ]),
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
          style={inlineStyle_45_10}
          onLayout={event => {
            const nextWidth = event?.nativeEvent?.layout?.width;
            if (!nextWidth) return;
            setLayoutWidth(current =>
              Math.abs(current - nextWidth) < 1 ? current : nextWidth,
            );
          }}
          contentContainerStyle={inlineStyle_75_10}>
          <View
            style={inlineStyle_55_12({
              theme: theme,
            })}>
            <Text style={inlineStyle_63_18({
              theme: theme,
            })}>AREA LOGADA</Text>
            <Text style={inlineStyle_64_18({
              theme: theme,
            })}>
              Meus pedidos
            </Text>
            <Text style={inlineStyle_67_18({
              theme: theme,
            })}>
              {orders.length} pedido(s) encontrado(s)
            </Text>
          </View>

          <View style={inlineStyle_72_16({
            gap: gap,
          })}>
            {orders.map(order => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('ShopOrderDetailsPage', {id: String(order.id)})
                }
                style={inlineStyle_80_16({
                  cardWidth: cardWidth,
                  theme: theme,
                })}>
                <View style={inlineStyle_89_22}>
                  <Text style={inlineStyle_90_24({
                    theme: theme,
                  })}>
                    Pedido #{order.id}
                  </Text>
                  <View
                    style={inlineStyle_94_20({
                      order: order,
                      theme: theme,
                    })}>
                    <Text style={inlineStyle_100_26}>
                      {order?.status?.status || 'Status'}
                    </Text>
                  </View>
                </View>

                <Text style={inlineStyle_106_22({
                  theme: theme,
                })}>
                  {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                </Text>

                <Text numberOfLines={1} style={inlineStyle_110_40({
                  theme: theme,
                })}>
                  {order?.provider?.alias || order?.provider?.name}
                </Text>

                <Text style={inlineStyle_114_22({
                  theme: theme,
                })}>
                  {formatMoney(order?.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {orders.length === 0 && (
            <View
              style={inlineStyle_123_14({
                theme: theme,
              })}>
              <Text style={inlineStyle_132_20({
                theme: theme,
              })}>
                Nenhum pedido ainda
              </Text>
              <Text style={inlineStyle_135_20({
                theme: theme,
              })}>
                Seus pedidos aparecerao aqui.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ShopIndex')}
                style={inlineStyle_140_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_150_22}>Voltar ao cardapio</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </ShopShell>
  );
}
