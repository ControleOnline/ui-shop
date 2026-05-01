import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
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
  productsSectionLoadingStateStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopProductsSection.styles';

// Render the main product grid used by the shared storefront page.
export default function ShopProductsSection({
  company = null,
  emptyDescription = '',
  emptyTitle = '',
  isLoading = false,
  products = [],
  title = 'Produtos',
}) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const normalizedProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products],
  );
  const availableWidth = Math.max(layoutWidth || 720, 320);
  const gap = availableWidth < 720 ? 12 : 14;
  const columns =
    availableWidth >= 1680
      ? 4
      : availableWidth >= 1120
        ? 3
        : availableWidth >= 760
          ? 2
          : 1;
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
          {normalizedProducts.length} item(ns)
        </Text>
      </View>

      {isLoading && normalizedProducts.length === 0 ? (
        <View
          style={productsSectionLoadingStateStyle({
            theme: company,
          })}>
          <ActivityIndicator
            color={company?.theme?.colors?.primary || '#0E7490'}
            size="small"
          />
          <Text
            style={productsSectionHintStyle({
              theme: company,
            })}>
            Carregando os itens desta secao...
          </Text>
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
                company={company}
                compact={columns > 1}
                product={product}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
