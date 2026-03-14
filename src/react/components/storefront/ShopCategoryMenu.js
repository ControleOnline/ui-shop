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
    <View style={{backgroundColor: theme.primary, paddingVertical: 16}}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 16, gap: 22}}>
        {topLevel.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect?.(category)}
            style={{paddingVertical: 8}}>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
