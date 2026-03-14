import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {formatMoney, getImageFromRelations, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopProductCard({product, compact = false}) {
  const navigation = useNavigation();
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);
  const imageUrl = getImageFromRelations(product?.productFiles);

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d7dee8',
        overflow: 'hidden',
        flex: 1,
        minWidth: compact ? 260 : 300,
      }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('ShopProductPage', {id: String(product?.id || '')})
        }>
        <View
          style={{
            margin: 12,
            borderWidth: 2,
            borderStyle: 'dotted',
            borderColor: '#8a8f98',
            minHeight: compact ? 200 : 230,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f1f1f',
            position: 'relative',
          }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#27a7dd',
              paddingHorizontal: 10,
              paddingVertical: 4,
              zIndex: 2,
            }}>
            <Text style={{color: '#fff', fontSize: 11, fontWeight: '700'}}>
              ON SALE
            </Text>
          </View>

          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              resizeMode="contain"
              style={{width: '80%', height: compact ? 140 : 170}}
            />
          ) : null}

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ShopProductPage', {id: String(product?.id || '')})
            }
            style={{
              position: 'absolute',
              left: 0,
              bottom: -12,
              width: 42,
              height: 42,
              backgroundColor: '#fff',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: {width: 0, height: 3},
            }}>
            <Icon name="open-in-full" size={20} color="#27a7dd" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={{paddingHorizontal: 18, paddingBottom: 16}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}>
          <Text
            style={{
              flex: 1,
              color: '#000',
              fontSize: 16,
              fontWeight: '700',
            }}>
            {product?.product}
          </Text>
          <Text
            style={{
              color: '#1d4ed8',
              fontSize: 15,
              fontWeight: '700',
            }}>
            {formatMoney(product?.price)}
          </Text>
        </View>

        {product?.type === 'custom' ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomizeScreen', {product})}
            style={{
              marginTop: 16,
              minHeight: 54,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
            }}>
            <Text style={{color: theme.primary, fontSize: 16, fontWeight: '600'}}>
              CUSTOMIZAR
            </Text>
          </TouchableOpacity>
        ) : (
          <ShopQuantityControl
            product={product}
            cart={cart}
            refreshCart={refreshCart}
            iconColor={theme.primary}
            style={{marginTop: 16}}
          />
        )}
      </View>
    </View>
  );
}
