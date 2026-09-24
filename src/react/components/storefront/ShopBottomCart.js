import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_23_6,
  inlineStyle_45_8,
  inlineStyle_56_8,
  inlineStyle_68_12,
  inlineStyle_77_18,
  inlineStyle_83_10,
} from './ShopBottomCart.styles';

export default function ShopBottomCart({
  bottomOffset = 0,
  navigation: navigationProp = null,
}) {
  const navigationHook = useNavigation();
  const navigation = navigationProp || navigationHook;
  const {cart, defaultCompany} = useShopCart({autoRefresh: true});
  const theme = pickTheme(defaultCompany);
  const itemsCount = (cart?.orderProducts || []).reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0,
  );
  const total = Number(cart?.price || 0);

  return (
    <View
      style={inlineStyle_23_6({
        bottomOffset: bottomOffset,
        theme: theme,
      })}>
      <Text
        style={inlineStyle_45_8({
          theme: theme,
        })}>
        {formatMoney(total)}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('ShopCartPage')}
        style={inlineStyle_56_8({
          itemsCount: itemsCount,
          theme: theme,
        })}>
        {itemsCount > 0 && (
          <View
            style={inlineStyle_68_12}>
            <Text style={inlineStyle_77_18({
              theme: theme,
            })}>
              {itemsCount}
            </Text>
          </View>
        )}
        <Text
          style={inlineStyle_83_10({
            itemsCount: itemsCount,
            theme: theme,
          })}>
          Ver carrinho
        </Text>
      </TouchableOpacity>
    </View>
  );
}
