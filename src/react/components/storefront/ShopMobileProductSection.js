import React from 'react';
import {Text, View, useWindowDimensions} from 'react-native';

import ShopMobileProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductCard';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryDescription} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  mobileProductSectionEmptyStyle,
  mobileProductSectionEmptyTextStyle,
  mobileProductSectionHeaderStyle,
  mobileProductSectionCardSlotStyle,
  mobileProductSectionListStyle,
  mobileProductSectionMetaStyle,
  mobileProductSectionStyle,
  mobileProductSectionSubtitleStyle,
  mobileProductSectionTitleStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductSection.styles';

export default function ShopMobileProductSection({
  cart = null,
  category = null,
  company = null,
  defaultCompany = null,
  isLoading = false,
  products = [],
  refreshCart = null,
}) {
  const {width} = useWindowDimensions();
  const theme = pickTheme(company);
  const rows = Array.isArray(products) ? products.filter(Boolean) : [];
  const isTabletGrid = width >= 760;

  return (
    <View style={mobileProductSectionStyle}>
      <View style={mobileProductSectionHeaderStyle}>
        <View>
          <Text numberOfLines={1} style={mobileProductSectionTitleStyle({theme})}>
            {category?.name || 'Produtos'}
          </Text>
          <Text
            numberOfLines={2}
            style={mobileProductSectionSubtitleStyle({theme})}>
            {getShopCategoryDescription(category)}
          </Text>
        </View>

        <Text style={mobileProductSectionMetaStyle({theme})}>
          {rows.length}
        </Text>
      </View>

      {isLoading && rows.length === 0 ? (
        <View style={mobileProductSectionListStyle({isTabletGrid})}>
          {[0, 1].map(item => (
            <View
              key={`mobile-product-skeleton-${item}`}
              style={mobileProductSectionCardSlotStyle({isTabletGrid})}>
              <View style={mobileProductSectionEmptyStyle({theme})}>
                <ShopSkeleton height={18} width="68%" theme={company} />
                <ShopSkeleton height={13} width="92%" theme={company} />
                <ShopSkeleton height={42} radius={14} theme={company} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!isLoading && rows.length === 0 ? (
        <View style={mobileProductSectionEmptyStyle({theme})}>
          <Text style={mobileProductSectionEmptyTextStyle({theme})}>
            Nenhum produto nesta categoria.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={mobileProductSectionListStyle({isTabletGrid})}>
          {rows.map(product => (
            <View
              key={String(product?.id || product?.['@id'] || product?.product)}
              style={mobileProductSectionCardSlotStyle({isTabletGrid})}>
              <ShopMobileProductCard
                cart={cart}
                company={company}
                defaultCompany={defaultCompany}
                product={product}
                refreshCart={refreshCart}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
