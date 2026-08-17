import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import {
  productPageLoadingActionStyle,
  productPageCustomizeButtonStyle,
  productPageCustomizeButtonTextStyle,
  productPageSimpleActionRowStyle,
  productPageQuantitySlotStyle,
  productPageCartButtonStyle,
  productPageCartButtonTextStyle,
} from './ProductPage.styles';

/**
 * Renders the product action area: loading indicator, customize button,
 * or add-to-cart / quantity control row. Used in both desktop and mobile.
 */
export default function ProductActionBlock({
  theme,
  isMobile,
  isCheckingGroups,
  requiresCustomization,
  product,
  cart,
  refreshCart,
  handleOpenCustomize,
  onNavigateCart,
}) {
  if (isCheckingGroups) {
    return (
      <View style={productPageLoadingActionStyle({theme})}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (requiresCustomization) {
    return (
      <TouchableOpacity
        accessibilityLabel={`Personalizar ${product?.product || 'produto'}`}
        onPress={handleOpenCustomize}
        style={productPageCustomizeButtonStyle({theme})}>
        <Text style={productPageCustomizeButtonTextStyle({theme})}>Personalizar</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={productPageSimpleActionRowStyle({isMobile})}>
      <View style={productPageQuantitySlotStyle}>
        <ShopQuantityControl
          product={product}
          cart={cart}
          refreshCart={refreshCart}
          iconColor={theme.primary}
        />
      </View>
      <TouchableOpacity onPress={onNavigateCart} style={productPageCartButtonStyle({theme})}>
        <Text style={productPageCartButtonTextStyle({theme})}>Ir para carrinho</Text>
      </TouchableOpacity>
    </View>
  );
}
