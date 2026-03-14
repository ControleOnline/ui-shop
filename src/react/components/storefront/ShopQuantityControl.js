import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useStore} from '@store';
import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';

const findOrderProduct = (cart, product) => {
  const productId = normalizeId(product?.id || product?.['@id']);
  return (cart?.orderProducts || []).find(
    item => normalizeId(item?.product?.id || item?.product?.['@id']) === productId,
  );
};

export default function ShopQuantityControl({
  product,
  cart,
  refreshCart,
  style,
  textStyle,
  iconColor = '#1f95c6',
  defaultQuantity = 0,
}) {
  const orderProductsStore = useStore('order_products');
  const {actions: orderProductActions} = orderProductsStore;
  const [quantity, setQuantity] = useState(defaultQuantity);
  const timeoutRef = useRef(null);

  const currentOrderProduct = useMemo(
    () => findOrderProduct(cart, product),
    [cart, product],
  );

  useEffect(() => {
    setQuantity(Number(currentOrderProduct?.quantity || defaultQuantity || 0));
  }, [currentOrderProduct?.id, currentOrderProduct?.quantity, defaultQuantity]);

  const persist = useCallback(
    nextQuantity => {
      if (!cart?.id || !product?.['@id']) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        try {
          if (nextQuantity <= 0 && currentOrderProduct?.id) {
            await orderProductActions.remove(currentOrderProduct.id);
          } else if (nextQuantity > 0) {
            await orderProductActions.save({
              id: currentOrderProduct?.id || null,
              parentProduct: null,
              product: product['@id'],
              product_group_id: null,
              quantity: nextQuantity,
              order: cart['@id'],
            });
          }
        } finally {
          refreshCart?.();
        }
      }, 350);
    },
    [
      cart?.id,
      cart?.['@id'],
      currentOrderProduct?.id,
      orderProductActions,
      product,
      refreshCart,
    ],
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const increase = useCallback(() => {
    const next = quantity + 1;
    setQuantity(next);
    persist(next);
  }, [persist, quantity]);

  const decrease = useCallback(() => {
    const next = quantity > 0 ? quantity - 1 : 0;
    setQuantity(next);
    persist(next);
  }, [persist, quantity]);

  return (
    <View
      style={[
        {
          minHeight: 54,
          borderWidth: 1,
          borderColor: iconColor,
          borderRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          paddingHorizontal: 14,
        },
        style,
      ]}>
      <TouchableOpacity onPress={decrease} disabled={quantity <= 0}>
        <Icon
          name={quantity <= 1 ? 'delete' : 'remove'}
          size={22}
          color={quantity > 0 ? iconColor : 'transparent'}
        />
      </TouchableOpacity>

      <Text
        style={[
          {
            color: iconColor,
            fontSize: 22,
            fontWeight: '400',
          },
          textStyle,
        ]}>
        {quantity}
      </Text>

      <TouchableOpacity onPress={increase}>
        <Icon name="add" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
