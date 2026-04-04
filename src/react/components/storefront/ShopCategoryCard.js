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
        backgroundColor: theme.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        overflow: 'hidden',
        flex: 1,
        minWidth: 150,
      }}>
      <View
        style={{
          minHeight: 150,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${theme.primary}10`,
        }}>
        {imageUrl ? (
          <Image
            source={{uri: imageUrl}}
            resizeMode="cover"
            style={{width: '100%', height: 170}}
          />
        ) : (
          <Text style={{fontSize: 32, color: theme.primary, fontWeight: '700'}}>MENU</Text>
        )}
      </View>

      <View style={{paddingHorizontal: 12, paddingVertical: 12}}>
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: '700',
          }}>
          {category?.name}
        </Text>
        <Text
          style={{
            marginTop: 4,
            color: theme.muted,
            fontSize: 12,
          }}>
          {category?.description || 'Toque para ver os pratos'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
