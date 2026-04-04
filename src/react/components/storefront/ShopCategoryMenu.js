import React, {useMemo} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopCategoryMenu({categories = [], onSelect, company}) {
  const theme = pickTheme(company);
  const topLevel = useMemo(
    () => categories.filter(category => !category?.parent),
    [categories],
  );

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
        paddingVertical: 10,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 14, gap: 10}}>
        {topLevel.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect?.(category)}
            activeOpacity={0.9}
            style={{
              backgroundColor: `${theme.primary}12`,
              borderColor: `${theme.primary}35`,
              borderWidth: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
            }}>
            <Text
              style={{
                color: theme.primary,
                fontSize: 12,
                fontWeight: '700',
              }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
