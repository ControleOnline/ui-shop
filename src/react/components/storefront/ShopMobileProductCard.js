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
  mobileProductActionButtonStyle,
  mobileProductActionTextStyle,
  mobileProductBodyStyle,
  mobileProductCardStyle,
  mobileProductDescriptionStyle,
  mobileProductImageFallbackStyle,
  mobileProductImageFallbackTextStyle,
  mobileProductImageStyle,
  mobileProductInfoStyle,
  mobileProductMetaRowStyle,
  mobileProductNameStyle,
  mobileProductPriceStyle,
  mobileProductQuantityStyle,
  mobileProductQuantityTextStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductCard.styles';

export default function ShopMobileProductCard({company = null, product = null}) {
  const navigation = useNavigation();
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(company || defaultCompany);
  const imageUrl = getImageFromRelations(product?.productFiles);
  const productId = normalizeId(product?.id || product?.['@id']);
  const hasInlineGroups =
    Array.isArray(product?.productGroups) && product.productGroups.length > 0;
  const requiresCustomization = product?.type === 'custom' || hasInlineGroups;

  const openDetails = () => {
    if (!productId) {
      return;
    }

    navigation.navigate('ShopProductPage', {id: productId});
  };

  const openCustomize = async () => {
    try {
      await refreshCart?.();
    } catch {}

    navigation.navigate('CustomizeScreen', {
      productId,
      redirectToCart: true,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openDetails}
      style={mobileProductCardStyle({theme})}>
      <View style={mobileProductBodyStyle}>
        <View style={mobileProductInfoStyle}>
          <Text numberOfLines={2} style={mobileProductNameStyle({theme})}>
            {product?.product || 'Produto'}
          </Text>

          {product?.description ? (
            <Text
              numberOfLines={2}
              style={mobileProductDescriptionStyle({theme})}>
              {product.description}
            </Text>
          ) : null}

          <View style={mobileProductMetaRowStyle}>
            <Text style={mobileProductPriceStyle({theme})}>
              {formatMoney(product?.price)}
            </Text>
          </View>
        </View>

        {imageUrl ? (
          <Image
            resizeMode="cover"
            source={{uri: imageUrl}}
            style={mobileProductImageStyle}
          />
        ) : (
          <View style={mobileProductImageFallbackStyle({theme})}>
            <Text style={mobileProductImageFallbackTextStyle({theme})}>
              Sem imagem
            </Text>
          </View>
        )}
      </View>

      {requiresCustomization ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openCustomize}
          style={mobileProductActionButtonStyle({theme})}>
          <Text style={mobileProductActionTextStyle({theme})}>
            Personalizar
          </Text>
          <Icon name="tune" size={17} color={theme.primary} />
        </TouchableOpacity>
      ) : (
        <ShopQuantityControl
          cart={cart}
          iconColor={theme.primary}
          product={product}
          refreshCart={refreshCart}
          style={mobileProductQuantityStyle({theme})}
          textStyle={mobileProductQuantityTextStyle({theme})}
        />
      )}
    </TouchableOpacity>
  );
}
