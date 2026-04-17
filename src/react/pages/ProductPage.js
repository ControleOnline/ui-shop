import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {useStore} from '@store';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';

import {
  buildFileUrl,
  formatMoney,
  normalizeId,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_137_22,
  inlineStyle_139_14,
  inlineStyle_145_20,
  inlineStyle_148_18,
  inlineStyle_155_20,
  inlineStyle_165_20,
  inlineStyle_167_18,
  inlineStyle_181_22,
  inlineStyle_184_26,
  inlineStyle_190_22,
  inlineStyle_195_20,
  inlineStyle_197_18,
  inlineStyle_205_18,
  inlineStyle_213_22,
  inlineStyle_221_12,
  inlineStyle_230_16,
  inlineStyle_252_16,
  inlineStyle_259_22,
  inlineStyle_264_20,
  inlineStyle_266_18,
  inlineStyle_277_20,
  inlineStyle_282_18,
  inlineStyle_289_20,
  inlineStyle_297_26,
} from './ProductPage.styles';

import { inlineStyle_285_20 } from './ProductPage.styles';

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member']))
    return response['hydra:member'];
  return [];
};

export default function ProductPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const isMobile = width < 900;
  const productId = String(route.params?.id || '');
  const productsStore = useStore('products');
  const categoriesStore = useStore('categories');
  const productGroupStore = useStore('product_group');
  const [product, setProduct] = useState({});
  const [hasCustomizationGroups, setHasCustomizationGroups] = useState(false);
  const [isCheckingGroups, setIsCheckingGroups] = useState(false);
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  useFocusEffect(
    useCallback(() => {
      if (!productId) return;
      setIsCheckingGroups(true);
      productsStore.actions
        .get(productId)
        .then(async result => {
          const nextProduct = result || {};
          setProduct(nextProduct);
          productsStore.actions.setItem(nextProduct);

          const nextProductId = normalizeId(
            nextProduct?.id || nextProduct?.['@id'],
          );
          const providerId = defaultCompany?.id || '';
          const inlineHasGroups =
            Array.isArray(nextProduct?.productGroups) &&
            nextProduct.productGroups.length > 0;

          if (!nextProductId) {
            setHasCustomizationGroups(
              (!providerId && inlineHasGroups) ||
                nextProduct?.type === 'custom',
            );
            return;
          }

          const baseFilter = {
            parentProduct: `/products/${nextProductId}`,
            itemsPerPage: 1,
          };

          const groupFilters = providerId
            ? {...baseFilter, people: providerId}
            : baseFilter;

          const response = await productGroupStore.actions.getItems(groupFilters);
          const groups = extractItems(response);

          setHasCustomizationGroups(
            (!providerId && inlineHasGroups) ||
              nextProduct?.type === 'custom' ||
              groups.length > 0,
          );
        })
        .catch(() => {
          setHasCustomizationGroups(false);
        })
        .finally(() => {
          setIsCheckingGroups(false);
        });
      if (defaultCompany?.id) {
        categoriesStore.actions.getItems({
          itemsPerPage: 500,
          exists: {categoryFiles: 'true'},
          categoryFiles: {file: {fileType: 'image'}},
          order: {name: 'ASC'},
          context: 'products',
          company: defaultCompany.id,
        });
      } else {
        categoriesStore.actions.setItems([]);
      }
    }, [
      categoriesStore.actions,
      defaultCompany?.id,
      productGroupStore.actions,
      productId,
      productsStore.actions,
    ]),
  );

  const imageUrl = product?.productFiles?.[0]?.file?.id
    ? buildFileUrl(product.productFiles[0].file.id)
    : '';
  const requiresCustomization = Boolean(
    product?.type === 'custom' || hasCustomizationGroups,
  );

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <>
          <ScrollView style={inlineStyle_137_22}>
            <View
              style={inlineStyle_139_14}>
              <View style={inlineStyle_145_20}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={inlineStyle_148_18}>
                  <Icon name="arrow-back" size={20} color={theme.primary} />
                  <Text
                    style={inlineStyle_155_20({
                      theme: theme,
                    })}>
                    Voltar
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={inlineStyle_165_20({
                isMobile: isMobile,
              })}>
                <View
                  style={inlineStyle_167_18({
                    isMobile: isMobile,
                    theme: theme,
                  })}>
                  {imageUrl ? (
                    <Image
                      source={{uri: imageUrl}}
                      resizeMode="cover"
                      style={inlineStyle_181_22({
                        isMobile: isMobile,
                      })}
                    />
                  ) : (
                    <Text style={inlineStyle_184_26({
                      theme: theme,
                    })}>
                      SEM IMAGEM
                    </Text>
                  )}
                </View>

                <Text style={inlineStyle_190_22({
                  theme: theme,
                })}>
                  {product?.description}
                </Text>
              </View>

              <View style={inlineStyle_195_20({
                isMobile: isMobile,
              })}>
                <Text
                  style={inlineStyle_197_18({
                    isMobile: isMobile,
                    theme: theme,
                  })}>
                  {product?.product}
                </Text>
                <Text
                  style={inlineStyle_205_18({
                    isMobile: isMobile,
                    theme: theme,
                  })}>
                  {formatMoney(product?.price)}
                </Text>
                <Text style={inlineStyle_213_22({
                  theme: theme,
                })}>
                  {product?.description}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={inlineStyle_221_12({
              theme: theme,
            })}>
            {isCheckingGroups ? (
              <View
                style={inlineStyle_230_16({
                  theme: theme,
                })}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : requiresCustomization ? (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await refreshCart?.();
                  } catch {}
                  navigation.navigate('CustomizeScreen', {
                    product,
                    productId: normalizeId(product?.id || product?.['@id']),
                    redirectToCart: true,
                  });
                }}
                style={inlineStyle_252_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_259_22}>
                  Personalizar e adicionar
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={inlineStyle_264_20}>
                <View
                  style={inlineStyle_266_18}>
                  <ShopQuantityControl
                    product={product}
                    cart={cart}
                    refreshCart={refreshCart}
                    iconColor={theme.primary}
                    defaultQuantity={1}
                    style={inlineStyle_277_20}
                    textStyle={inlineStyle_285_20}
                  />
                </View>
                <View
                  style={inlineStyle_282_18}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ShopCartPage')}
                    style={inlineStyle_289_20({
                      theme: theme,
                    })}>
                    <Text style={inlineStyle_297_26}>
                      Ir para carrinho
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </ShopShell>
  );
}
