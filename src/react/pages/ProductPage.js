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
          <ScrollView style={{flex: 1}}>
            <View
              style={{
                padding: 14,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
              }}>
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Icon name="arrow-back" size={20} color={theme.primary} />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: theme.primary,
                      fontWeight: '700',
                    }}>
                    Voltar
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{flex: 1, minWidth: isMobile ? '100%' : 380}}>
                <View
                  style={{
                    minHeight: isMobile ? 260 : 460,
                    backgroundColor: `${theme.primary}10`,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: `${theme.primary}25`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                  {imageUrl ? (
                    <Image
                      source={{uri: imageUrl}}
                      resizeMode="cover"
                      style={{width: '100%', height: isMobile ? 280 : 460}}
                    />
                  ) : (
                    <Text style={{color: theme.primary, fontWeight: '800'}}>
                      SEM IMAGEM
                    </Text>
                  )}
                </View>

                <Text style={{marginTop: 14, color: theme.muted, fontSize: 14}}>
                  {product?.description}
                </Text>
              </View>

              <View style={{flex: 1, minWidth: isMobile ? '100%' : 320}}>
                <Text
                  style={{
                    fontSize: isMobile ? 28 : 36,
                    fontWeight: '800',
                    color: theme.text,
                  }}>
                  {product?.product}
                </Text>
                <Text
                  style={{
                    marginTop: 14,
                    fontSize: isMobile ? 30 : 34,
                    fontWeight: '800',
                    color: theme.primary,
                  }}>
                  {formatMoney(product?.price)}
                </Text>
                <Text style={{marginTop: 14, fontSize: 15, color: theme.text}}>
                  {product?.description}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={{
              backgroundColor: theme.surface,
              borderTopWidth: 1,
              borderColor: theme.cardBorder,
              padding: 14,
              paddingBottom: 92,
            }}>
            {isCheckingGroups ? (
              <View
                style={{
                  minHeight: 50,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
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
                style={{
                  minHeight: 50,
                  borderRadius: 12,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: '#fff', fontWeight: '800'}}>
                  Personalizar e adicionar
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{flexDirection: 'row', gap: 16}}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ShopQuantityControl
                    product={product}
                    cart={cart}
                    refreshCart={refreshCart}
                    iconColor={theme.primary}
                    defaultQuantity={1}
                    style={{width: '100%', maxWidth: 280, borderRadius: 12}}
                    textStyle={{fontSize: 20, fontWeight: '700'}}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ShopCartPage')}
                    style={{
                      minHeight: 50,
                      width: '100%',
                      borderRadius: 12,
                      backgroundColor: theme.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{color: '#fff', fontWeight: '800'}}>
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
