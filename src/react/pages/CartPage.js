import React, {useMemo, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {useStore} from '@store';
import {useFocusEffect} from '@react-navigation/native';

export default function CartPage() {
  const navigation = useNavigation();
  const categoriesStore = useStore('categories');
  const orderProductsStore = useStore('order_products');
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const categories = categoriesStore.getters.items || [];
  const theme = pickTheme(defaultCompany);
  const [orderProducts, setOrderProducts] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany?.id,
      });

      if (cart?.id) {
        orderProductsStore.actions
          .getItems({
            order: `orders/${cart.id}`,
            'exists[parentProduct]': 'false',
          })
          .then(data => setOrderProducts(data || []));
      } else {
        setOrderProducts([]);
      }
    }, [cart?.id, categoriesStore.actions, defaultCompany?.id, orderProductsStore.actions]),
  );

  const rows = useMemo(() => orderProducts.filter(Boolean), [orderProducts]);

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <>
          <ScrollView style={{flex: 1, backgroundColor: '#111'}}>
            <View style={{padding: 16, flexDirection: 'row', gap: 16}}>
              <View
                style={{
                  flex: 2,
                  backgroundColor: '#1f1f1f',
                  borderRadius: 4,
                  padding: 18,
                }}>
                <Text style={{color: theme.primary, fontSize: 22, fontWeight: '700'}}>
                  Order Details
                </Text>

                <View
                  style={{
                    marginTop: 28,
                    borderWidth: 1,
                    borderColor: '#555',
                    padding: 16,
                  }}>
                  <Text style={{color: '#fff', fontSize: 18}}>
                    Order #{cart?.id || '---'}
                  </Text>
                  <Text style={{color: '#fff', marginTop: 6}}>
                    {cart?.orderDate || new Date().toLocaleDateString('pt-BR')}
                  </Text>
                  <Text
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      color: '#fff',
                      fontSize: 18,
                    }}>
                    {formatMoney(cart?.price)}
                  </Text>
                </View>
              </View>

              <View style={{flex: 1, gap: 16}}>
                <View style={{backgroundColor: '#1f1f1f', borderRadius: 4, padding: 18}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="person" color={theme.primary} size={26} />
                    <Text style={{marginLeft: 12, color: '#fff', fontSize: 18, fontWeight: '700'}}>
                      Client
                    </Text>
                  </View>
                  <Text style={{marginTop: 18, color: '#fff'}}>
                    {cart?.client?.name} {cart?.client?.alias}
                  </Text>
                  {(cart?.client?.phone || []).map(phone => (
                    <Text key={`${phone.ddd}-${phone.phone}`} style={{color: '#333'}}>
                      ({phone.ddd}) {phone.phone}
                    </Text>
                  ))}
                  {(cart?.client?.email || []).map(email => (
                    <Text key={email.email} style={{color: '#333'}}>
                      {email.email}
                    </Text>
                  ))}
                </View>

                <View style={{backgroundColor: '#1f1f1f', borderRadius: 4, padding: 18}}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="place" color="#f44336" size={26} />
                    <Text style={{marginLeft: 12, color: '#fff', fontSize: 18, fontWeight: '700'}}>
                      Delivery Address
                    </Text>
                  </View>
                  {cart?.addressDestination ? (
                    <Text style={{marginTop: 16, color: '#fff'}}>
                      {cart.addressDestination.nickname}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={{paddingHorizontal: 16, paddingBottom: 24}}>
              <TouchableOpacity
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                <Icon name="add" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={{backgroundColor: '#1f1f1f'}}>
                {rows.map(orderProduct => {
                  const total = Number(orderProduct.total ?? orderProduct.quantity * orderProduct.price);
                  return (
                    <View
                      key={orderProduct.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderColor: '#555',
                        minHeight: 58,
                        paddingHorizontal: 16,
                      }}>
                      <Text style={{flex: 2, color: '#fff', fontSize: 16}}>
                        {orderProduct?.product?.product}
                      </Text>

                      <View style={{flex: 1, alignItems: 'center'}}>
                        <ShopQuantityControl
                          product={orderProduct.product}
                          cart={cart}
                          refreshCart={() => {
                            refreshCart();
                            orderProductsStore.actions
                              .getItems({
                                order: `orders/${cart.id}`,
                                'exists[parentProduct]': 'false',
                              })
                              .then(data => setOrderProducts(data || []));
                          }}
                          iconColor={theme.primary}
                          style={{
                            width: 140,
                            minHeight: 40,
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                          }}
                        />
                      </View>

                      <Text style={{flex: 1, color: '#fff', textAlign: 'center'}}>
                        {orderProduct?.orderProductQueues?.[0]
                          ? `${orderProduct.orderProductQueues[0]?.queue?.queue || ''}/${orderProduct.orderProductQueues[0]?.status?.status || ''}`
                          : '---'}
                      </Text>
                      <Text style={{flex: 1, color: '#fff', textAlign: 'center'}}>
                        {formatMoney(orderProduct.price)}
                      </Text>
                      <Text style={{flex: 1, color: '#fff', textAlign: 'center'}}>
                        {formatMoney(total)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          orderProductsStore.actions
                            .remove(orderProduct.id)
                            .then(() => {
                              refreshCart();
                              return orderProductsStore.actions.getItems({
                                order: `orders/${cart.id}`,
                                'exists[parentProduct]': 'false',
                              });
                            })
                            .then(data => setOrderProducts(data || []));
                        }}
                        style={{paddingLeft: 12}}>
                        <Icon name="delete" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {rows.length > 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                    }}>
                    <Text style={{color: '#fff', fontSize: 18, fontWeight: '700'}}>
                      {formatMoney(
                        rows.reduce(
                          (sum, row) => sum + Number(row.total ?? (row.quantity * row.price) ?? 0),
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </ShopShell>
  );
}
