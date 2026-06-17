import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {getTopLevelShopCategories} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  categoryMenuContainerStyle,
  categoryMenuChipStyle,
  categoryMenuChipTextStyle,
  categoryMenuContentStyle,
} from './ShopCategoryMenu.styles';

// Keep a quick horizontal category navigator visible across all `Compras` routes.
export default function ShopCategoryMenu({
  activeCategoryId = '',
  categories = [],
  hasMoreCategories = false,
  isLoadingMoreCategories = false,
  onLoadMoreCategories = null,
  onSelect,
  company,
}) {
  const theme = pickTheme(company);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const topLevel = useMemo(
    () => getTopLevelShopCategories(categories),
    [categories],
  );

  const handleScroll = useCallback(
    event => {
      if (!hasMoreCategories || isLoadingMoreCategories) {
        return;
      }

      const scrollX = Number(event?.nativeEvent?.contentOffset?.x || 0);
      const viewportWidth = Number(
        event?.nativeEvent?.layoutMeasurement?.width || 0,
      );
      const scrollContentWidth = Number(
        event?.nativeEvent?.contentSize?.width || 0,
      );

      if (
        viewportWidth > 0 &&
        scrollContentWidth > 0 &&
        scrollX + viewportWidth >= scrollContentWidth - 96
      ) {
        onLoadMoreCategories?.();
      }
    },
    [hasMoreCategories, isLoadingMoreCategories, onLoadMoreCategories],
  );

  useEffect(() => {
    if (
      !hasMoreCategories ||
      isLoadingMoreCategories ||
      !containerWidth ||
      !contentWidth
    ) {
      return;
    }

    if (contentWidth <= containerWidth + 72) {
      onLoadMoreCategories?.();
    }
  }, [
    containerWidth,
    contentWidth,
    hasMoreCategories,
    isLoadingMoreCategories,
    onLoadMoreCategories,
  ]);

  return (
    <View
      style={categoryMenuContainerStyle({
        theme: theme,
      })}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={categoryMenuContentStyle}
        onContentSizeChange={(_, width) => setContentWidth(width || 0)}
        onLayout={event =>
          setContainerWidth(event?.nativeEvent?.layout?.width || 0)
        }
        onScroll={handleScroll}
        scrollEventThrottle={80}>
        {topLevel.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect?.(category)}
            activeOpacity={0.9}
            style={categoryMenuChipStyle({
              isActive:
                String(activeCategoryId || '') ===
                String(category?.id || category?.['@id'] || ''),
              theme: theme,
            })}>
            <Text
              style={categoryMenuChipTextStyle({
                isActive:
                  String(activeCategoryId || '') ===
                  String(category?.id || category?.['@id'] || ''),
                theme: theme,
              })}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}

        {isLoadingMoreCategories ? (
          <View
            style={categoryMenuChipStyle({
              isActive: false,
              theme,
            })}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
