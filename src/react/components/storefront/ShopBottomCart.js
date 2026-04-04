import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

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
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: bottomOffset + 12,
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        shadowColor: '#0F172A',
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 4},
        elevation: 6,
      }}>
      <Text
        style={{
          minWidth: 90,
          color: theme.primary,
          fontSize: 20,
          fontWeight: '800',
        }}>
        {formatMoney(total)}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('ShopCartPage')}
        style={{
          flex: 1,
          backgroundColor: itemsCount > 0 ? theme.primary : theme.cardBorder,
          minHeight: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}>
        {itemsCount > 0 && (
          <View
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: 'rgba(255,255,255,0.24)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 6,
            }}>
            <Text style={{color: theme.onPrimary, fontSize: 12, fontWeight: '700'}}>
              {itemsCount}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: itemsCount > 0 ? theme.onPrimary : theme.muted,
            fontSize: 15,
            fontWeight: '800',
          }}>
          Ver carrinho
        </Text>
      </TouchableOpacity>
    </View>
  );
}
