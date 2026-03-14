import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopBottomCart() {
  const navigation = useNavigation();
  const {cart, defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#d7dee8',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 16,
      }}>
      <Text
        style={{
          minWidth: 110,
          color: theme.primary,
          fontSize: 28,
          fontWeight: '500',
        }}>
        {formatMoney(cart?.price || 0)}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('ShopCartPage')}
        style={{
          flex: 1,
          backgroundColor: theme.primary,
          minHeight: 40,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{color: '#fff', fontSize: 26, fontWeight: '500'}}>
          VER CARRINHO
        </Text>
      </TouchableOpacity>
    </View>
  );
}
