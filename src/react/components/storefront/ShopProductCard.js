import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {
  formatMoney,
  getImageFromRelations,
  normalizeId,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopProductCard({product, compact = false}) {
  const navigation = useNavigation();
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);
  const imageUrl = getImageFromRelations(product?.productFiles);
  const hasInlineGroups =
    Array.isArray(product?.productGroups) && product.productGroups.length > 0;
  const requiresCustomization = product?.type === 'custom' || hasInlineGroups;

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        overflow: 'hidden',
        flex: 1,
        minWidth: compact ? 150 : 180,
      }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('ShopProductPage', {
            id: String(product?.id || ''),
          })
        }>
        <View
          style={{
            minHeight: compact ? 118 : 148,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${theme.primary}10`,
            position: 'relative',
          }}>
          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              resizeMode="cover"
              style={{width: '100%', height: compact ? 140 : 170}}
            />
          ) : (
            <Text style={{color: theme.primary, fontWeight: '800'}}>
              SEM IMAGEM
            </Text>
          )}

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ShopProductPage', {
                id: String(product?.id || ''),
              })
            }
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: 34,
              height: 34,
              backgroundColor: theme.surface,
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: {width: 0, height: 3},
            }}>
            <Icon name="open-in-full" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={{paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 6,
          }}>
          <Text
            style={{
              flex: 1,
              color: theme.text,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 18,
            }}
            numberOfLines={2}>
            {product?.product}
          </Text>
          <Text
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: '800',
            }}>
            {formatMoney(product?.price)}
          </Text>
        </View>
        {product?.description ? (
          <Text
            numberOfLines={2}
            style={{
              marginTop: 6,
              color: theme.muted,
              fontSize: 12,
              lineHeight: 16,
            }}>
            {product.description}
          </Text>
        ) : null}

        {requiresCustomization ? (
          <TouchableOpacity
            onPress={async () => {
              try {
                await refreshCart?.();
              } catch {}
              navigation.navigate('CustomizeScreen', {
                product,
                productId: normalizeId(product?.id || product?.['@id']),
                redirectToCart: true,
              });
            }}
            style={{
              marginTop: 12,
              minHeight: 42,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${theme.primary}10`,
            }}>
            <Text
              style={{color: theme.primary, fontSize: 13, fontWeight: '800'}}>
              Personalizar
            </Text>
          </TouchableOpacity>
        ) : (
          <ShopQuantityControl
            product={product}
            cart={cart}
            refreshCart={refreshCart}
            iconColor={theme.primary}
            style={{marginTop: 12, minHeight: 44, borderRadius: 12}}
            textStyle={{fontSize: 18, fontWeight: '700'}}
          />
        )}
      </View>
    </View>
  );
}
