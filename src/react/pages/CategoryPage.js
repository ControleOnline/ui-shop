import React, {useCallback, useState} from 'react';
import {Image, ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopTitleBar from '@controleonline/ui-shop/src/react/components/storefront/ShopTitleBar';
import {
  buildFileUrl,
  pickTheme,
  SHOP_PRODUCT_TYPES,
} from '@controleonline/ui-shop/src/react/utils/shop';

export default function CategoryPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);
  const categoryId = String(route.params?.id || '');
  const categoriesStore = useStore('categories');
  const productsStore = useStore('products');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const theme = pickTheme(defaultCompany);
  const [category, setCategory] = useState({});

  useFocusEffect(
    useCallback(() => {
      if (!defaultCompany?.id) {
        categoriesStore.actions.setItems([]);
        productsStore.actions.setItems([]);
        setCategory({});
        return;
      }

      if (!categoryId) return;
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany?.id,
      });
      categoriesStore.actions.get(categoryId).then(setCategory);
      productsStore.actions.getItems({
        'productCategory.category': `/categories/${categoryId}`,
        exists: {productFiles: 'true'},
        productFiles: {file: {fileType: 'image'}},
        active: 1,
        type: SHOP_PRODUCT_TYPES,
        itemsPerPage: 500,
        'order[product]': 'ASC',
        company: defaultCompany?.id,
      });
    }, [categoriesStore.actions, categoryId, defaultCompany?.id, productsStore.actions]),
  );

  const allCategories = categoriesStore.getters.items || [];
  const products = productsStore.getters.items || [];
  const heroFileId = category?.categoryFiles?.[0]?.file?.id;
  const heroUrl = heroFileId ? buildFileUrl(heroFileId, defaultCompany) : '';
  const columns = width >= 1300 ? 4 : width >= 1000 ? 3 : width >= 640 ? 2 : 2;
  const effectiveWidth = layoutWidth || width;
  const pageWidth = Math.max(effectiveWidth - 28, 320);
  const gap = width < 640 ? 10 : 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <>
          <ShopCategoryMenu
            categories={allCategories}
            onSelect={selected =>
              navigation.navigate('ShopCategoryPage', {id: String(selected.id)})
            }
            company={defaultCompany}
          />
          <ScrollView
            style={{flex: 1}}
            onLayout={event => {
              const nextWidth = event?.nativeEvent?.layout?.width;
              if (!nextWidth) return;
              setLayoutWidth(current =>
                Math.abs(current - nextWidth) < 1 ? current : nextWidth,
              );
            }}>
            {heroUrl ? (
              <View
                style={{
                  margin: 14,
                  minHeight: 170,
                  borderRadius: 18,
                  backgroundColor: `${theme.primary}10`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: `${theme.primary}30`,
                  overflow: 'hidden',
                }}>
                <Image
                  source={{uri: heroUrl}}
                  resizeMode="cover"
                  style={{width: '100%', height: 190}}
                />
              </View>
            ) : null}

            <View
              style={{
                marginHorizontal: 14,
                marginTop: heroUrl ? 0 : 14,
                marginBottom: 10,
              }}>
              <Text style={{color: theme.text, fontSize: 22, fontWeight: '800'}}>
                {category?.name || 'Categoria'}
              </Text>
              <Text style={{marginTop: 4, color: theme.muted, fontSize: 13}}>
                {products.length} item(ns) disponivel(is)
              </Text>
            </View>

            <ShopTitleBar title="Produtos" company={defaultCompany} />
            <View
              style={{
                paddingHorizontal: 14,
                paddingTop: 12,
                paddingBottom: 92,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap,
              }}>
              {products.map(product => (
                <View key={product.id} style={{width: cardWidth}}>
                  <ShopProductCard product={product} compact />
                </View>
              ))}
              {products.length === 0 && (
                <View
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.surface,
                    padding: 24,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: theme.text, fontSize: 15, fontWeight: '700'}}>
                    Nenhum produto nesta categoria
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </ShopShell>
  );
}
