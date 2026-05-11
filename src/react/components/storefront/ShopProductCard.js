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

import {
  inlineStyle_25_6,
  inlineStyle_42_10,
  inlineStyle_53_14,
  inlineStyle_56_18,
  inlineStyle_67_12,
  inlineStyle_68_12,
  inlineStyle_87_12,
  inlineStyle_89_10,
  inlineStyle_96_12,
  inlineStyle_107_12,
  inlineStyle_118_12,
  inlineStyle_140_12,
  inlineStyle_151_14,
  inlineStyle_161_12,
} from './ShopProductCard.styles';

import {inlineStyle_143_12} from './ShopProductCard.styles';

export default function ShopProductCard({product, compact = false, company = null}) {
  const navigation = useNavigation();
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(company || defaultCompany);
  const imageUrl = getImageFromRelations(product?.productFiles);
  const productId = String(product?.id || '');
  const hasInlineGroups =
    Array.isArray(product?.productGroups) && product.productGroups.length > 0;
  const requiresCustomization = product?.type === 'custom' || hasInlineGroups;
  const openProductDetails = () =>
    navigation.navigate('ShopProductPage', {
      id: productId,
    });

  return (
    <View
      style={inlineStyle_25_6({
        compact: compact,
        theme: theme,
      })}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openProductDetails}>
        <View
          style={inlineStyle_42_10({
            compact: compact,
            theme: theme,
          })}>
          {imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              resizeMode="cover"
              style={inlineStyle_53_14({
                compact: compact,
              })}
            />
          ) : (
            <Text style={inlineStyle_56_18({
              theme: theme,
            })}>
              SEM IMAGEM
            </Text>
          )}

          <TouchableOpacity
            onPress={openProductDetails}
            style={inlineStyle_67_12({
              compact: compact,
              theme: theme,
            })}>
            <Text
              style={inlineStyle_68_12({
                compact: compact,
                theme: theme,
              })}>
              Detalhes
            </Text>
            <Icon name="open-in-full" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <View style={inlineStyle_87_12}>
        <TouchableOpacity activeOpacity={0.82} onPress={openProductDetails}>
          <View
            style={inlineStyle_89_10}>
            <Text
              style={inlineStyle_96_12({
                theme: theme,
              })}
              numberOfLines={2}>
              {product?.product}
            </Text>
            <Text
              style={inlineStyle_107_12({
                theme: theme,
              })}>
              {formatMoney(product?.price)}
            </Text>
          </View>
          {product?.description ? (
            <Text
              numberOfLines={2}
              style={inlineStyle_118_12({
                theme: theme,
              })}>
              {product.description}
            </Text>
          ) : null}
        </TouchableOpacity>

        {requiresCustomization ? (
          <TouchableOpacity
            onPress={async () => {
              try {
                await refreshCart?.();
              } catch {}
              navigation.navigate('CustomizeScreen', {
                productId: normalizeId(product?.id || product?.['@id']),
                redirectToCart: true,
              });
            }}
            style={inlineStyle_140_12({
              theme: theme,
            })}>
            <Text
              style={inlineStyle_151_14({
                theme: theme,
              })}>
              Personalizar
            </Text>
          </TouchableOpacity>
        ) : (
          <ShopQuantityControl
            product={product}
            cart={cart}
            refreshCart={refreshCart}
            iconColor={theme.primary}
            style={inlineStyle_161_12}
            textStyle={inlineStyle_143_12}
          />
        )}
      </View>
    </View>
  );
}
