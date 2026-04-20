import React from 'react';
import {View} from 'react-native';

import {
  purchasesLayoutRootStyle,
  purchasesMainRowStyle,
  purchasesMainSlotStyle,
  purchasesSidebarSlotStyle,
  purchasesAsideSlotStyle,
  purchasesTopSlotStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopPurchasesLayout.styles';

// Arrange the `Compras` experience without hard-coding device-specific markup in the page.
export default function ShopPurchasesLayout({
  showSidebar = false,
  showCartAside = false,
  isSidebarCompact = false,
  categoryMenu = null,
  sidebar = null,
  mainContent = null,
  cartAside = null,
}) {
  return (
    <View style={purchasesLayoutRootStyle}>
      {categoryMenu ? <View style={purchasesTopSlotStyle}>{categoryMenu}</View> : null}

      <View
        style={purchasesMainRowStyle({
          showSidebar,
          showCartAside,
        })}>
        {showSidebar && sidebar ? (
          <View
            style={purchasesSidebarSlotStyle({
              compact: isSidebarCompact,
            })}>
            {sidebar}
          </View>
        ) : null}

        <View style={purchasesMainSlotStyle}>{mainContent}</View>

        {showCartAside && cartAside ? (
          <View style={purchasesAsideSlotStyle}>{cartAside}</View>
        ) : null}
      </View>
    </View>
  );
}
