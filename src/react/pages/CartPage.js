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
  formatMoney,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

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
  const {cart, refreshCart, defaultCompany} = useShopCart({autoRefresh: true});
  const theme = pickTheme(defaultCompany);

  const [orderProducts, setOrderProducts] = useState([]);
  const [isClearing, setIsClearing] = useState(false);

  const isMobile = width < 980;

  const reloadRows = React.useCallback(() => {
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
  }, [cart?.id, orderProductsStore.actions]);

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
        (sum, row) =>
          sum + Number(row?.total ?? row?.quantity * row?.price ?? 0),
        0,
      ),
    [rows],
  );

  const handleRemoveRow = async row => {
    if (!row?.id) return;
    await orderProductsStore.actions.remove(row.id);
    await refreshCart();
    await reloadRows();
  };

  const handleClearCart = () => {
    if (!rows.length) return;

    const clearAction = async () => {
      setIsClearing(true);
      try {
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

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={{flex: 1}}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{padding: 14, paddingBottom: 130}}>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
                backgroundColor: `${theme.primary}10`,
                padding: 14,
                marginBottom: 12,
              }}>
              <Text
                style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>
                CARRINHO
              </Text>
              <Text
                style={{
                  marginTop: 5,
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '800',
                }}>
                Seu pedido
              </Text>
              <Text style={{marginTop: 5, color: theme.muted, fontSize: 13}}>
                {itemsCount} item(ns) no carrinho
              </Text>
            </View>

            {rows.length === 0 ? (
              <View
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 42,
                  paddingHorizontal: 20,
                }}>
                <Icon name="shopping-cart" size={44} color={theme.muted} />
                <Text
                  style={{
                    marginTop: 10,
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                  Carrinho vazio
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    color: theme.muted,
                    fontSize: 13,
                    textAlign: 'center',
                  }}>
                  Volte ao cardapio para adicionar produtos.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ShopIndex')}
                  style={{
                    marginTop: 18,
                    minHeight: 42,
                    minWidth: 180,
                    borderRadius: 12,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 18,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 14, fontWeight: '800'}}>
                    Ver cardapio
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.surface,
                    overflow: 'hidden',
                  }}>
                  {rows.map(row => {
                    const rowTotal = Number(
                      row?.total ?? row?.quantity * row?.price ?? 0,
                    );
                    const groupedComponents = groupOrderProductComponents(row);
                    return (
                      <View
                        key={row.id}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.cardBorder,
                          gap: 10,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                          <Text
                            numberOfLines={2}
                            style={{
                              flex: 1,
                              color: theme.text,
                              fontSize: 15,
                              fontWeight: '700',
                            }}>
                            {row?.product?.product}
                          </Text>
                          <Text
                            style={{
                              color: theme.primary,
                              fontSize: 14,
                              fontWeight: '800',
                            }}>
                            {formatMoney(rowTotal)}
                          </Text>
                        </View>

                        {Object.entries(groupedComponents).map(
                          ([groupName, components]) => (
                            <Text
                              key={`${row.id}-${groupName}`}
                              style={{
                                color: theme.muted,
                                fontSize: 12,
                                lineHeight: 16,
                              }}>
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
                          style={{
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}>
                          <View style={{maxWidth: isMobile ? '100%' : 190}}>
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
                              style={{
                                minHeight: 42,
                                borderRadius: 10,
                              }}
                              textStyle={{fontSize: 18, fontWeight: '700'}}
                            />
                          </View>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                            }}>
                            <Text style={{color: theme.muted, fontSize: 12}}>
                              {formatMoney(row?.price)}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleRemoveRow(row)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                backgroundColor: `${theme.danger}18`,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
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
                  style={{
                    marginTop: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.surface,
                    padding: 14,
                    gap: 8,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: theme.muted}}>Itens</Text>
                    <Text style={{color: theme.text, fontWeight: '700'}}>
                      {itemsCount}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      Total
                    </Text>
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 20,
                        fontWeight: '900',
                      }}>
                      {formatMoney(total)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              padding: 10,
              flexDirection: isMobile ? 'column' : 'row',
              gap: 10,
            }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopIndex')}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: theme.text, fontWeight: '700'}}>
                Continuar comprando
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearCart}
              disabled={isClearing || rows.length === 0}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                backgroundColor:
                  rows.length === 0 ? theme.cardBorder : `${theme.danger}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isClearing ? (
                <ActivityIndicator color={theme.danger} />
              ) : (
                <Text
                  style={{
                    color: rows.length === 0 ? theme.muted : theme.danger,
                    fontWeight: '800',
                  }}>
                  Limpar carrinho
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCheckoutPage')}
              disabled={rows.length === 0}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                backgroundColor:
                  rows.length === 0 ? theme.cardBorder : theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: rows.length === 0 ? theme.muted : '#fff',
                  fontWeight: '800',
                }}>
                Finalizar e pagar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ShopShell>
  );
}
