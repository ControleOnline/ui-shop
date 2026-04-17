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

import {
  inlineStyle_85_12,
  inlineStyle_95_16,
  inlineStyle_109_18,
  inlineStyle_115_14,
  inlineStyle_120_20,
  inlineStyle_123_20,
  inlineStyle_130_14,
  inlineStyle_139_39,
  inlineStyle_145_18,
  inlineStyle_154_24,
} from './CategoryPage.styles';

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
            style={inlineStyle_85_12}
            onLayout={event => {
              const nextWidth = event?.nativeEvent?.layout?.width;
              if (!nextWidth) return;
              setLayoutWidth(current =>
                Math.abs(current - nextWidth) < 1 ? current : nextWidth,
              );
            }}>
            {heroUrl ? (
              <View
                style={inlineStyle_95_16({
                  theme: theme,
                })}>
                <Image
                  source={{uri: heroUrl}}
                  resizeMode="cover"
                  style={inlineStyle_109_18}
                />
              </View>
            ) : null}

            <View
              style={inlineStyle_115_14({
                heroUrl: heroUrl,
              })}>
              <Text style={inlineStyle_120_20({
                theme: theme,
              })}>
                {category?.name || 'Categoria'}
              </Text>
              <Text style={inlineStyle_123_20({
                theme: theme,
              })}>
                {products.length} item(ns) disponivel(is)
              </Text>
            </View>

            <ShopTitleBar title="Produtos" company={defaultCompany} />
            <View
              style={inlineStyle_130_14({
                gap: gap,
              })}>
              {products.map(product => (
                <View key={product.id} style={inlineStyle_139_39({
                  cardWidth: cardWidth,
                })}>
                  <ShopProductCard product={product} compact />
                </View>
              ))}
              {products.length === 0 && (
                <View
                  style={inlineStyle_145_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_154_24({
                    theme: theme,
                  })}>
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
