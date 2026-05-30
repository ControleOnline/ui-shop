import React, {useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {
  clearAnonymousCart,
  updateAnonymousCartProduct,
} from '@controleonline/ui-shop/src/react/utils/anonymousCart';

import {
  formatMoney,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_139_14,
  inlineStyle_141_12,
  inlineStyle_144_14,
  inlineStyle_153_16,
  inlineStyle_157_16,
  inlineStyle_165_20,
  inlineStyle_172_16,
  inlineStyle_184_18,
  inlineStyle_193_18,
  inlineStyle_203_18,
  inlineStyle_214_20,
  inlineStyle_222_18,
  inlineStyle_237_24,
  inlineStyle_244_26,
  inlineStyle_252_28,
  inlineStyle_261_28,
  inlineStyle_274_30,
  inlineStyle_295_26,
  inlineStyle_301_32,
  inlineStyle_312_30,
  inlineStyle_321_28,
  inlineStyle_326_34,
  inlineStyle_331_30,
  inlineStyle_353_18,
  inlineStyle_363_20,
  inlineStyle_367_26,
  inlineStyle_368_26,
  inlineStyle_373_20,
  inlineStyle_378_22,
  inlineStyle_386_22,
  inlineStyle_400_12,
  inlineStyle_415_14,
  inlineStyle_424_20,
  inlineStyle_457_14,
  inlineStyle_467_16,
  cartSummaryClearBadgeStyle,
  cartSummaryClearBadgeTextStyle,
  cartSummaryClearButtonStyle,
  cartSummaryHeaderRowStyle,
  cartSummaryTitleWrapStyle,
} from './CartPage.styles';

import { inlineStyle_185_12, inlineStyle_310_30 } from './CartPage.styles';

const groupOrderProductComponents = orderProduct => {
  const components = Array.isArray(orderProduct?.orderProductComponents)
    ? orderProduct.orderProductComponents
    : [];

  return components.reduce((acc, component) => {
    const groupName = component?.productGroup?.productGroup || 'Opções';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(component);
    return acc;
  }, {});
};

export default function CartPage() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const orderProductsStore = useStore('order_products');
  const {cart, refreshCart, defaultCompany, salesCompany} = useShopCart({
    autoRefresh: true,
  });
  const theme = pickTheme(salesCompany || defaultCompany);

  const [orderProducts, setOrderProducts] = useState([]);
  const [isClearing, setIsClearing] = useState(false);

  const isMobile = width < 980;

  const reloadRows = React.useCallback(() => {
    if (cart?.anonymous) {
      const localRows = Array.isArray(cart.orderProducts)
        ? cart.orderProducts
        : [];
      setOrderProducts(localRows);
      return Promise.resolve(localRows);
    }

    if (!cart?.id) {
      setOrderProducts([]);
      return Promise.resolve([]);
    }

    return orderProductsStore.actions
      .getItems({
        order: `orders/${cart.id}`,
        'exists[parentProduct]': 'false',
      })
      .then(data => {
        setOrderProducts(data || []);
        return data || [];
      });
  }, [cart, cart?.id, orderProductsStore.actions]);

  useFocusEffect(
    React.useCallback(() => {
      reloadRows();
    }, [reloadRows]),
  );

  const rows = useMemo(() => orderProducts.filter(Boolean), [orderProducts]);
  const itemsCount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row?.quantity || 0), 0),
    [rows],
  );
  const total = useMemo(
    () =>
      rows.reduce(
        (sum, row) => {
          const computedTotal =
            Number(row?.quantity || 0) * Number(row?.price || 0);
          return sum + Number(row?.total ?? computedTotal);
        },
        0,
      ),
    [rows],
  );

  const handleRemoveRow = async row => {
    if (!row?.id) return;
    if (cart?.anonymous) {
      updateAnonymousCartProduct({
        providerId: cart.providerId,
        product: row.product,
        quantity: 0,
      });
      await refreshCart();
      await reloadRows();
      return;
    }

    await orderProductsStore.actions.remove(row.id);
    await refreshCart();
    await reloadRows();
  };

  const handleClearCart = () => {
    if (!rows.length) return;

    const clearAction = async () => {
      setIsClearing(true);
      try {
        if (cart?.anonymous) {
          clearAnonymousCart(cart.providerId);
          await refreshCart();
          await reloadRows();
          return;
        }

        await Promise.all(
          rows
            .filter(item => item?.id)
            .map(item => orderProductsStore.actions.remove(item.id)),
        );
        await refreshCart();
        await reloadRows();
      } finally {
        setIsClearing(false);
      }
    };

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm('Deseja remover todos os itens do carrinho?')) {
        clearAction();
      }
      return;
    }

    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: clearAction,
        },
      ],
    );
  };

  const handleCheckout = () => {
    if (cart?.id) {
      navigation.navigate('ShopCheckoutPage');
      return;
    }

    navigation.navigate('SignInPage', {
      redirectRoute: 'ShopCheckoutPage',
    });
  };

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={inlineStyle_139_14}>
          <ScrollView
            style={inlineStyle_141_12}
            contentContainerStyle={inlineStyle_185_12}>
            <View
              style={inlineStyle_144_14({
                theme: theme,
              })}>
              <View style={cartSummaryHeaderRowStyle}>
                <View style={cartSummaryTitleWrapStyle}>
                  <Text
                    style={inlineStyle_153_16({
                      theme: theme,
                    })}>
                    CARRINHO
                  </Text>
                  <Text
                    style={inlineStyle_157_16({
                      theme: theme,
                    })}>
                    Seu pedido
                  </Text>
                  <Text style={inlineStyle_165_20({
                    theme: theme,
                  })}>
                    {itemsCount} item(ns) no carrinho
                  </Text>
                </View>
                {rows.length > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isClearing}
                    onPress={handleClearCart}
                    style={cartSummaryClearButtonStyle({theme})}>
                    {isClearing ? (
                      <ActivityIndicator color={theme.danger} />
                    ) : (
                      <>
                        <Icon
                          name="delete-sweep"
                          size={21}
                          color={theme.danger}
                        />
                        <View style={cartSummaryClearBadgeStyle({theme})}>
                          <Text style={cartSummaryClearBadgeTextStyle({theme})}>
                            {itemsCount}
                          </Text>
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {rows.length === 0 ? (
              <View
                style={inlineStyle_172_16({
                  theme: theme,
                })}>
                <Icon name="shopping-cart" size={44} color={theme.muted} />
                <Text
                  style={inlineStyle_184_18({
                    theme: theme,
                  })}>
                  Carrinho vazio
                </Text>
                <Text
                  style={inlineStyle_193_18({
                    theme: theme,
                  })}>
                  Volte ao cardapio para adicionar produtos.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ShopIndex')}
                  style={inlineStyle_203_18({
                    theme: theme,
                  })}>
                  <Text
                    style={inlineStyle_214_20}>
                    Ver cardapio
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View
                  style={inlineStyle_222_18({
                    theme: theme,
                  })}>
                  {rows.map(row => {
                    const computedRowTotal =
                      Number(row?.quantity || 0) * Number(row?.price || 0);
                    const rowTotal = Number(
                      row?.total ?? computedRowTotal,
                    );
                    const groupedComponents = groupOrderProductComponents(row);
                    return (
                      <View
                        key={row.id}
                        style={inlineStyle_237_24({
                          theme: theme,
                        })}>
                        <View
                          style={inlineStyle_244_26}>
                          <Text
                            numberOfLines={2}
                            style={inlineStyle_252_28({
                              theme: theme,
                            })}>
                            {row?.product?.product}
                          </Text>
                          <Text
                            style={inlineStyle_261_28({
                              theme: theme,
                            })}>
                            {formatMoney(rowTotal)}
                          </Text>
                        </View>
                        {Object.entries(groupedComponents).map(
                          ([groupName, components]) => (
                            <Text
                              key={`${row.id}-${groupName}`}
                              style={inlineStyle_274_30({
                                theme: theme,
                              })}>
                              {groupName}:{' '}
                              {components
                                .map(component => {
                                  const componentName =
                                    component?.product?.product || '--';
                                  const qty = Number(component?.quantity || 1);
                                  return qty > 1
                                    ? `${qty}x ${componentName}`
                                    : componentName;
                                })
                                .join(', ')}
                            </Text>
                          ),
                        )}
                        <View
                          style={inlineStyle_295_26({
                            isMobile: isMobile,
                          })}>
                          <View style={inlineStyle_301_32({
                            isMobile: isMobile,
                          })}>
                            <ShopQuantityControl
                              product={row.product}
                              orderProduct={row}
                              orderProductId={row.id}
                              cart={cart}
                              refreshCart={async () => {
                                await refreshCart();
                                await reloadRows();
                              }}
                              iconColor={theme.primary}
                              style={inlineStyle_312_30}
                              textStyle={inlineStyle_310_30}
                            />
                          </View>

                          <View
                            style={inlineStyle_321_28}>
                            <Text style={inlineStyle_326_34({
                              theme: theme,
                            })}>
                              {formatMoney(row?.price)}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleRemoveRow(row)}
                              style={inlineStyle_331_30({
                                theme: theme,
                              })}>
                              <Icon
                                name="delete-outline"
                                size={20}
                                color={theme.danger}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View
                  style={inlineStyle_353_18({
                    theme: theme,
                  })}>
                  <View
                    style={inlineStyle_363_20}>
                    <Text style={inlineStyle_367_26({
                      theme: theme,
                    })}>Itens</Text>
                    <Text style={inlineStyle_368_26({
                      theme: theme,
                    })}>
                      {itemsCount}
                    </Text>
                  </View>
                  <View
                    style={inlineStyle_373_20}>
                    <Text
                      style={inlineStyle_378_22({
                        theme: theme,
                      })}>
                      Total
                    </Text>
                    <Text
                      style={inlineStyle_386_22({
                        theme: theme,
                      })}>
                      {formatMoney(total)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View
            style={inlineStyle_400_12({
              isMobile: isMobile,
              theme: theme,
            })}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopIndex')}
              style={inlineStyle_415_14({
                theme: theme,
              })}>
              <Text style={inlineStyle_424_20({
                theme: theme,
              })}>
                Continuar comprando
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCheckout}
              disabled={rows.length === 0}
              style={inlineStyle_457_14({
                rows: rows,
                theme: theme,
              })}>
              <Text
                style={inlineStyle_467_16({
                  rows: rows,
                  theme: theme,
                })}>
                Finalizar e pagar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ShopShell>
  );
}
