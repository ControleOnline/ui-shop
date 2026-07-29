import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {getImageFromRelations, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryDescription} from '@controleonline/ui-shop/src/react/utils/shopCatalog';

import {
  inlineStyle_13_6,
  inlineStyle_23_8,
  inlineStyle_33_12,
  inlineStyle_36_16,
  inlineStyle_40_12,
  inlineStyle_42_10,
  inlineStyle_50_10,
} from './ShopCategoryCard.styles';

export default function ShopCategoryCard({category, onPress, company}) {
  const theme = pickTheme(company);
  const imageUrl = getImageFromRelations(category?.categoryFiles);
  const description = getShopCategoryDescription(category);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={inlineStyle_13_6({
        theme: theme,
      })}>
      <View
        style={inlineStyle_23_8({
          theme: theme,
        })}>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            resizeMode="cover"
            style={inlineStyle_33_12}
          />
        ) : (
          <Text style={inlineStyle_36_16({
            theme: theme,
          })}>MENU</Text>
        )}
      </View>
      <View style={inlineStyle_40_12}>
        <Text
          style={inlineStyle_42_10({
            theme: theme,
          })}>
          {category?.name}
        </Text>
        {description ? (
          <Text
            style={inlineStyle_50_10({
              theme: theme,
            })}>
            {description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
