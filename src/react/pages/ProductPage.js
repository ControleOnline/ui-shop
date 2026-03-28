import React, {useCallback, useState} from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopBottomCart from '@controleonline/ui-shop/src/react/components/storefront/ShopBottomCart';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {buildFileUrl, formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

export default function ProductPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = String(route.params?.id || '');
  const productsStore = useStore('products');
  const categoriesStore = useStore('categories');
  const [product, setProduct] = useState({});
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  useFocusEffect(
    useCallback(() => {
      if (!productId) return;
      productsStore.actions.get(productId).then(result => {
        setProduct(result || {});
        productsStore.actions.setItem(result || {});
      });
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany?.id,
      });
    }, [categoriesStore.actions, defaultCompany?.id, productId, productsStore.actions]),
  );

  const imageUrl = product?.productFiles?.[0]?.file?.id
    ? buildFileUrl(product.productFiles[0].file.id)
    : '';
  const categories = categoriesStore.getters.items || [];

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <>
          <ScrollView style={{flex: 1}}>
            <View style={{padding: 16, flexDirection: 'row', flexWrap: 'wrap'}}>
              <View style={{flex: 1, minWidth: 420, padding: 8}}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{flexDirection: 'row', alignItems: 'center', marginBottom: 18}}>
                  <Icon name="arrow-back" size={20} color={theme.primary} />
                  <Text style={{marginLeft: 8, color: theme.primary, fontWeight: '600'}}>
                    Voltar
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    minHeight: 500,
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {imageUrl ? (
                    <Image
                      source={{uri: imageUrl}}
                      resizeMode="contain"
                      style={{width: '90%', height: 480}}
                    />
                  ) : null}
                </View>

                <Text style={{marginTop: 18, color: '#111', fontSize: 16}}>
                  {product?.description}
                </Text>
              </View>

              <View style={{flex: 1, minWidth: 320, padding: 8}}>
                <Text style={{fontSize: 36, fontWeight: '700', color: '#111'}}>
                  {product?.product}
                </Text>
                <Text
                  style={{
                    marginTop: 24,
                    fontSize: 34,
                    fontWeight: '700',
                    color: '#111',
                  }}>
                  {formatMoney(product?.price)}
                </Text>
                <Text style={{marginTop: 20, fontSize: 16, color: '#111'}}>
                  {product?.description}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={{backgroundColor: '#fff', padding: 16, paddingBottom: 92}}>
            {product?.type === 'custom' ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('CustomizeScreen', {product})}
                style={{
                  minHeight: 48,
                  borderRadius: 4,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: '#fff', fontWeight: '700'}}>Adicionar</Text>
              </TouchableOpacity>
            ) : (
              <View style={{flexDirection: 'row', gap: 16}}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <ShopQuantityControl
                    product={product}
                    cart={cart}
                    refreshCart={refreshCart}
                    iconColor={theme.primary}
                    defaultQuantity={1}
                    style={{width: '100%', maxWidth: 260}}
                  />
                </View>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ShopCartPage')}
                    style={{
                      minHeight: 52,
                      width: '100%',
                      borderRadius: 4,
                      backgroundColor: theme.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{color: '#fff', fontWeight: '700'}}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          <ShopBottomCart />
        </>
      )}
    </ShopShell>
  );
}
