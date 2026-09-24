import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  productsSectionPanelStyle,
  productsSectionHeaderStyle,
  productsSectionTitleStyle,
  productsSectionHintStyle,
  productsSectionCountStyle,
  productsSectionGridStyle,
  productsSectionCardSlotStyle,
  productsSectionEmptyStateStyle,
  productsSectionEmptyTitleStyle,
  productsSectionEmptyTextStyle,
  productsSectionFooterStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopProductsSection.styles';

// Render the main product grid used by the shared storefront page.
export default function ShopProductsSection({
  cart = null,
  company = null,
  defaultCompany = null,
  emptyDescription = '',
  emptyTitle = '',
  isLoading = false,
  isLoadingMore = false,
  products = [],
  refreshCart = null,
  totalProductsCount = 0,
  title = 'Produtos',
}) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const theme = pickTheme(company);
  const normalizedProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products],
  );
  const availableWidth = Math.max(layoutWidth || 720, 320);
  const gap = availableWidth < 720 ? 12 : 14;
  const minCardWidth = availableWidth < 720 ? 280 : 360;
  const maxColumns = availableWidth >= 1440 ? 4 : 3;
  const columns = Math.max(
    1,
    Math.min(
      maxColumns,
      Math.floor((availableWidth + gap) / (minCardWidth + gap)),
    ),
  );
  const cardWidth =
    columns === 1
      ? availableWidth
      : (availableWidth - gap * (columns - 1)) / columns;

  return (
    <View
      onLayout={event => {
        const nextWidth = event?.nativeEvent?.layout?.width;
        if (!nextWidth) {
          return;
        }

        setLayoutWidth(currentWidth =>
          Math.abs(currentWidth - nextWidth) < 1 ? currentWidth : nextWidth,
        );
      }}
      style={productsSectionPanelStyle({
        theme: company,
      })}>
      <View style={productsSectionHeaderStyle}>
        <View>
          <Text
            style={productsSectionTitleStyle({
              theme: company,
            })}>
            {title}
          </Text>
          <Text
            style={productsSectionHintStyle({
              theme: company,
            })}>
            Escolha os itens e personalize apenas quando fizer sentido.
          </Text>
        </View>

        <Text
          style={productsSectionCountStyle({
            theme: company,
          })}>
          {totalProductsCount || normalizedProducts.length} item(ns)
        </Text>
      </View>

      {isLoading && normalizedProducts.length === 0 ? (
        <View style={productsSectionGridStyle({gap})}>
          {[0, 1, 2, 3].map(item => (
            <View
              key={`product-skeleton-${item}`}
              style={productsSectionCardSlotStyle({cardWidth})}>
              <View style={{gap: 10}}>
                <ShopSkeleton height={132} radius={16} theme={company} />
                <ShopSkeleton height={18} width="72%" theme={company} />
                <ShopSkeleton height={14} width="44%" theme={company} />
                <ShopSkeleton height={42} radius={12} theme={company} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!isLoading && normalizedProducts.length === 0 ? (
        <View
          style={productsSectionEmptyStateStyle({
            theme: company,
          })}>
          <Text
            style={productsSectionEmptyTitleStyle({
              theme: company,
            })}>
            {emptyTitle}
          </Text>
          <Text
            style={productsSectionEmptyTextStyle({
              theme: company,
            })}>
            {emptyDescription}
          </Text>
        </View>
      ) : null}

      {normalizedProducts.length > 0 ? (
        <View
          style={productsSectionGridStyle({
            gap,
          })}>
          {normalizedProducts.map(product => (
            <View
              key={String(product?.id || product?.['@id'] || product?.product || '')}
              style={productsSectionCardSlotStyle({
                cardWidth,
              })}>
              <ShopProductCard
                cart={cart}
                company={company}
                compact={columns > 1}
                defaultCompany={defaultCompany}
                product={product}
                refreshCart={refreshCart}
              />
            </View>
          ))}
        </View>
      ) : null}

      {isLoadingMore && normalizedProducts.length > 0 ? (
        <View style={productsSectionFooterStyle({theme: company})}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
    </View>
  );
}
