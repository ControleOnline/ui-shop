import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {getImageFromRelations, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopCategoryCard({category, onPress, company}) {
  const theme = pickTheme(company);
  const imageUrl = getImageFromRelations(category?.categoryFiles);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: theme.darkCard,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
        flex: 1,
        minWidth: 260,
      }}>
      <View
        style={{
          margin: 12,
          borderWidth: 2,
          borderStyle: 'dotted',
          borderColor: theme.darkBorder,
          minHeight: 220,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.darkCard,
        }}>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            resizeMode="contain"
            style={{width: '80%', height: 160}}
          />
        ) : null}
      </View>

      <View style={{paddingHorizontal: 14, paddingBottom: 18}}>
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: '600',
            textDecorationLine: 'underline',
          }}>
          {category?.name}
        </Text>
        <Text
          style={{
            marginTop: 10,
            color: '#fff',
            fontSize: 13,
            textDecorationLine: 'underline',
          }}>
          {category?.['@type'] || 'Category'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
