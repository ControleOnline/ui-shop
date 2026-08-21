import React from 'react';
import {View} from 'react-native';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import styles from '../CheckoutPage.styles';

export default function CheckoutSkeletonRows({theme}) {
  return (
    <View style={styles.skeletonStack}>
      <ShopSkeleton height={18} width="48%" theme={{theme: {colors: theme}}} />
      <ShopSkeleton height={14} width="86%" theme={{theme: {colors: theme}}} />
      <ShopSkeleton height={46} radius={12} theme={{theme: {colors: theme}}} />
    </View>
  );
}
