import React from 'react';
import {Text, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopTitleBar({title, company}) {
  const theme = pickTheme(company);

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        minHeight: 52,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
      }}>
      <Text style={{color: theme.text, fontSize: 20, fontWeight: '700'}}>
        {title}
      </Text>
    </View>
  );
}
