import React from 'react';
import {Text, View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import { inlineStyle_10_6, inlineStyle_19_12 } from './ShopTitleBar.styles';

export default function ShopTitleBar({title, company}) {
  const theme = pickTheme(company);

  return (
    <View
      style={inlineStyle_10_6({
        theme: theme,
      })}>
      <Text style={inlineStyle_19_12({
        theme: theme,
      })}>
        {title}
      </Text>
    </View>
  );
}
