import React from 'react';
import {Text, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopTitleBar({title, company}) {
  const theme = pickTheme(company);

  return (
    <View
      style={{
        backgroundColor: theme.primary,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}>
      <Text style={{color: '#fff', fontSize: 26, fontWeight: '500'}}>
        {title}
      </Text>
    </View>
  );
}
