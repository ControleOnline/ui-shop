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
import ShopCartTree from '@controleonline/ui-shop/src/react/components/storefront/ShopCartTree';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {getCartTreeRoots} from '@controleonline/ui-shop/src/react/domain/cartTree';
import {
  formatMoney,
  normalizeId,
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

import {inlineStyle_185_12} from './CartPage.styles';

const SHOP_COLLECTION_ITEMS_PER_PAGE = 50;

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
    if (cart?.anonymous === true) {
      const anonymousRows = Array.isArray(cart.orderProducts)
        ? cart.orderProducts
        : [];
      setOrderProducts(anonymousRows);
      return Promise.resolve(anonymousRows);
    }

    if (!cart?.id) {
      setOrderProducts([]);
      return Promise.resolve([]);
    }

    return orderProductsStore.actions
      .getItems({
        'order.id': Number(cart.id),
        itemsPerPage: SHOP_COLLECTION_ITEMS_PER_PAGE,
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

  const rows = useMemo(
    () => getCartTreeRoots(orderProducts.filter(Boolean)),
    [orderProducts],
  );
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

  const handleClearCart = () => {
    if (!rows.length) return;

    const clearAction = async () => {
      setIsClearing(true);
      try {
        await Promise.all(
          rows
            .filter(item => item?.id)
            .map(item => {
              const orderIri =
                cart?.['@id'] || (cart?.id ? `/orders/${cart.id}` : null);
              const productIri =
                item?.product?.['@id'] ||
                (item?.product?.id ? `/products/${item.product.id}` : null);
              const providerId = normalizeId(
                cart?.provider?.id ||
                  cart?.provider?.['@id'] ||
                  cart?.provider ||
                  salesCompany?.id,
              );

              return orderProductsStore.actions.saveQuantityQueued({
                anonymous: cart?.anonymous === true,
                externalCode: cart?.externalCode,
                id: item.id,
                order: orderIri,
                product: productIri,
                provider: providerId,
                quantity: 0,
              });
            }),
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

  const handleEditRow = row => {
    const productId = normalizeId(row?.product?.id || row?.product?.['@id']);
    const orderProductId = normalizeId(row?.id || row?.['@id']);
    if (!productId || !orderProductId) return;

    navigation.navigate('CustomizeScreen', {
      productId,
      orderProductId,
      redirectToCart: true,
    });
  };

  const refreshRows = async () => {
    await refreshCart();
    await reloadRows();
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
                  <ShopCartTree
                    cart={cart}
                    compact={isMobile}
                    onEdit={handleEditRow}
                    orderProducts={orderProducts}
                    refreshCart={refreshRows}
                    theme={theme}
                  />
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
