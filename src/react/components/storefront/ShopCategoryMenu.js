import React, {useMemo} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import { inlineStyle_14_6, inlineStyle_29_12, inlineStyle_38_14 } from './ShopCategoryMenu.styles';
import { inlineStyle_21_8 } from './ShopCategoryMenu.styles';

export default function ShopCategoryMenu({categories = [], onSelect, company}) {
  const theme = pickTheme(company);
  const topLevel = useMemo(
    () => categories.filter(category => !category?.parent),
    [categories],
  );

  return (
    <View
      style={inlineStyle_14_6({
        theme: theme,
      })}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={inlineStyle_21_8}>
        {topLevel.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect?.(category)}
            activeOpacity={0.9}
            style={inlineStyle_29_12({
              theme: theme,
            })}>
            <Text
              style={inlineStyle_38_14({
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
