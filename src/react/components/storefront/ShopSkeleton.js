import React from 'react';
import {View} from 'react-native';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ShopSkeleton({
  height = 16,
  radius = 8,
  style = null,
  theme: company = null,
  width = '100%',
}) {
  const theme = pickTheme(company);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: `${theme.primary}14`,
          borderWidth: 1,
          borderColor: `${theme.primary}10`,
        },
        style,
      ]}
    />
  );
}
