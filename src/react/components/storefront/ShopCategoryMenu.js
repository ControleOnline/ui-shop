import React, {useMemo} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
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
  onSelect,
  company,
}) {
  const theme = pickTheme(company);
  const topLevel = useMemo(
    () => categories.filter(category => !category?.parent),
    [categories],
  );

  return (
    <View
      style={categoryMenuContainerStyle({
        theme: theme,
      })}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={categoryMenuContentStyle}>
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
      </ScrollView>
    </View>
  );
}
