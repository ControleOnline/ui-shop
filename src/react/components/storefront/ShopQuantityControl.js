import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';

const productGroupRequirementCache = new Map();

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member']))
    return response['hydra:member'];
  return [];
};

const findOrderProduct = (cart, product, orderProductId = null) => {
  if (orderProductId) {
    const targetId = normalizeId(orderProductId);
    return (cart?.orderProducts || []).find(
      item => normalizeId(item?.id || item?.['@id']) === targetId,
    );
  }

  const productId = normalizeId(product?.id || product?.['@id']);
  return (cart?.orderProducts || []).find(
    item =>
      normalizeId(item?.product?.id || item?.product?.['@id']) === productId,
  );
};

export default function ShopQuantityControl({
  product,
  cart,
  orderProduct = null,
  orderProductId = null,
  refreshCart,
  style,
  textStyle,
  iconColor = '#1f95c6',
  defaultQuantity = 0,
}) {
  const navigation = useNavigation();
  const orderProductsStore = useStore('order_products');
  const {actions: orderProductActions} = orderProductsStore;
  const productGroupStore = useStore('product_group');
  const {salesCompany} = useShopSalesCompany();
  const {width} = useWindowDimensions();
  const [quantity, setQuantity] = useState(defaultQuantity);
  const timeoutRef = useRef(null);

  const currentOrderProduct = useMemo(() => {
    if (orderProduct?.id || orderProduct?.['@id']) {
      return orderProduct;
    }
    return findOrderProduct(cart, product, orderProductId);
  }, [cart, orderProduct, orderProductId, product]);

  useEffect(() => {
    setQuantity(Number(currentOrderProduct?.quantity || defaultQuantity || 0));
  }, [currentOrderProduct?.id, currentOrderProduct?.quantity, defaultQuantity]);

  const persist = useCallback(
    nextQuantity => {
      const productIri =
        product?.['@id'] ||
        (normalizeId(product?.id) ? `/products/${normalizeId(product.id)}` : null);
      if (!productIri) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        try {
          let activeCart = cart;
          if (!activeCart?.id && refreshCart) {
            activeCart = await refreshCart();
          }
          if (!activeCart?.id) return;

          const targetId =
            currentOrderProduct?.id || normalizeId(orderProductId);
          const orderIri = activeCart?.['@id'] || `/orders/${activeCart.id}`;

          if (nextQuantity <= 0 && targetId) {
            await orderProductActions.remove(targetId);
          } else if (nextQuantity > 0) {
            await orderProductActions.save({
              id: targetId || null,
              parentProduct:
                currentOrderProduct?.parentProduct?.['@id'] || null,
              product: productIri,
              product_group_id: currentOrderProduct?.productGroup?.id || null,
              quantity: nextQuantity,
              order: orderIri,
            });
          }
        } finally {
          await refreshCart?.();
        }
      }, 350);
    },
    [
      cart?.id,
      cart?.['@id'],
      currentOrderProduct?.id,
      currentOrderProduct?.parentProduct?.['@id'],
      currentOrderProduct?.productGroup?.id,
      orderProductId,
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

  const ensureCustomizationRequired = useCallback(async () => {
    if (orderProductId || orderProduct?.id || orderProduct?.['@id']) {
      return false;
    }

    const providerId = salesCompany?.id || '';
    const inlineHasGroups =
      Array.isArray(product?.productGroups) && product.productGroups.length > 0;
    if ((!providerId && inlineHasGroups) || product?.type === 'custom') {
      return true;
    }

    const productId = normalizeId(product?.id || product?.['@id']);
    if (!productId) {
      return false;
    }

    const cacheKey = `${providerId}:${productId}`;
    if (productGroupRequirementCache.has(cacheKey)) {
      return productGroupRequirementCache.get(cacheKey);
    }

    const baseFilter = {
      parentProduct: `/products/${productId}`,
      itemsPerPage: 1,
    };

    const groupFilters = providerId
      ? {...baseFilter, people: providerId}
      : baseFilter;

    const response = await productGroupStore.actions.getItems(groupFilters);
    const groups = extractItems(response);

    const hasGroups = groups.length > 0;
    productGroupRequirementCache.set(cacheKey, hasGroups);
    return hasGroups;
  }, [
    orderProduct,
    orderProductId,
    product,
    productGroupStore.actions,
    salesCompany?.id,
  ]);

  const increase = useCallback(async () => {
    let requiresCustomization = false;
    try {
      requiresCustomization = await ensureCustomizationRequired();
    } catch {
      requiresCustomization = false;
    }

    if (requiresCustomization) {
      try {
        await refreshCart?.();
      } catch {}
      navigation.navigate('CustomizeScreen', {
        productId: normalizeId(product?.id || product?.['@id']),
      });
      return;
    }

    const next = quantity + 1;
    setQuantity(next);
    persist(next);
  }, [
    ensureCustomizationRequired,
    navigation,
    persist,
    product,
    quantity,
    refreshCart,
  ]);

  const decrease = useCallback(() => {
    const next = quantity > 0 ? quantity - 1 : 0;
    setQuantity(next);
    persist(next);
  }, [persist, quantity]);
  const isDesktopActiveState = width >= 900 && quantity > 0;
  const activeControlColor = isDesktopActiveState ? '#FFFFFF' : iconColor;

  return (
    <View
      style={[
        {
          minHeight: 54,
          borderWidth: 1,
          borderColor: iconColor,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDesktopActiveState ? iconColor : '#fff',
          paddingHorizontal: 14,
        },
        style,
      ]}>
      <TouchableOpacity onPress={decrease} disabled={quantity <= 0}>
        <Icon
          name={quantity <= 1 ? 'delete' : 'remove'}
          size={22}
          color={quantity > 0 ? activeControlColor : 'transparent'}
        />
      </TouchableOpacity>

      <Text
        style={[
          {
            color: activeControlColor,
            fontSize: 22,
            fontWeight: '700',
          },
          textStyle,
        ]}>
        {quantity}
      </Text>

      <TouchableOpacity onPress={increase}>
        <Icon name="add" size={24} color={activeControlColor} />
      </TouchableOpacity>
    </View>
  );
}
