import React, {useCallback, useState} from 'react';
import {ScrollView, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopBottomCart from '@controleonline/ui-shop/src/react/components/storefront/ShopBottomCart';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopTitleBar from '@controleonline/ui-shop/src/react/components/storefront/ShopTitleBar';

export default function SearchPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const q = decodeURIComponent(String(route.params?.q || ''));
  const productsStore = useStore('products');
  const categoriesStore = useStore('categories');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const [fullCategories, setFullCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      categoriesStore.actions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany?.id,
      }).then(data => setFullCategories(data || []));

      productsStore.actions.getItems({
        itemsPerPage: 32,
        exists: {productFiles: 'true'},
        productFiles: {file: {fileType: 'image'}},
        'order[product]': 'ASC',
        product: q,
      }).then(data => setSearchProducts(data || []));

      categoriesStore.actions.getItems({
        itemsPerPage: 32,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        'order[name]': 'ASC',
        context: 'products',
        name: q,
      }).then(data => setSearchCategories(data || []));
    }, [categoriesStore.actions, defaultCompany?.id, productsStore.actions, q]),
  );

  const categories = fullCategories;
  const columns = width >= 1500 ? 4 : width >= 1000 ? 3 : 2;
  const pageWidth = Math.max(width - 32, 320);
  const gap = 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  return (
    <ShopShell
      searchValue={q}
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <>
          <ShopCategoryMenu
            categories={categories}
            onSelect={category =>
              navigation.navigate('ShopCategoryPage', {id: String(category.id)})
            }
            company={defaultCompany}
          />
          <ShopTitleBar title="Products List" company={defaultCompany} />
          <ScrollView style={{flex: 1}}>
            <View style={{backgroundColor: '#111', minHeight: 40}} />
            <View style={{padding: 16, gap: 16, paddingBottom: 92}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
                {searchProducts.map(product => (
                  <View key={product.id} style={{width: cardWidth}}>
                    <ShopProductCard product={product} compact />
                  </View>
                ))}
              </View>
              {searchCategories.length > 0 && (
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 16}}>
                  {searchCategories.map(category => (
                    <View key={category.id} style={{width: cardWidth}}>
                      <ShopCategoryCard
                        category={category}
                        company={defaultCompany}
                        onPress={() =>
                          navigation.navigate('ShopCategoryPage', {id: String(category.id)})
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <ShopBottomCart />
        </>
      )}
    </ShopShell>
  );
}
