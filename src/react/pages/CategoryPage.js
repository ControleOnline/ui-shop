import React, {useCallback, useState} from 'react';
import {Image, ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopBottomCart from '@controleonline/ui-shop/src/react/components/storefront/ShopBottomCart';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopTitleBar from '@controleonline/ui-shop/src/react/components/storefront/ShopTitleBar';
import {buildFileUrl} from '@controleonline/ui-shop/src/react/utils/shop';

export default function CategoryPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const categoryId = String(route.params?.id || '');
  const categoriesStore = useStore('categories');
  const productsStore = useStore('products');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const [category, setCategory] = useState({});

  useFocusEffect(
    useCallback(() => {
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
        order: {name: 'ASC'},
        company: defaultCompany?.id,
      });
    }, [categoriesStore.actions, categoryId, defaultCompany?.id, productsStore.actions]),
  );

  const allCategories = categoriesStore.getters.items || [];
  const products = productsStore.getters.items || [];
  const heroFileId = category?.categoryFiles?.[0]?.file?.id;
  const heroUrl = heroFileId ? buildFileUrl(heroFileId) : '';
  const columns = width >= 1500 ? 4 : width >= 1000 ? 3 : 2;
  const pageWidth = Math.max(width - 32, 320);
  const gap = 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'SalesOrderIndex', {q: query})
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
          <ScrollView style={{flex: 1}}>
            {heroUrl ? (
              <View
                style={{
                  minHeight: 230,
                  backgroundColor: '#1f1f1f',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#8a8f98',
                  borderStyle: 'dotted',
                  margin: 4,
                }}>
                <Image
                  source={{uri: heroUrl}}
                  resizeMode="contain"
                  style={{width: 180, height: 140}}
                />
              </View>
            ) : null}

            <Text
              style={{
                color: '#fff',
                marginHorizontal: 4,
                marginTop: -6,
                marginBottom: 8,
                backgroundColor: '#111',
              }}>
              {category?.name || ''}
            </Text>

            <ShopTitleBar title="Products List" company={defaultCompany} />
            <View style={{backgroundColor: '#111', minHeight: 38}} />
            <View
              style={{
                padding: 16,
                paddingBottom: 92,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
              }}>
              {products.map(product => (
                <View key={product.id} style={{width: cardWidth}}>
                  <ShopProductCard product={product} compact />
                </View>
              ))}
            </View>
          </ScrollView>
          <ShopBottomCart />
        </>
      )}
    </ShopShell>
  );
}
