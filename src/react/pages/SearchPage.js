import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopTitleBar from '@controleonline/ui-shop/src/react/components/storefront/ShopTitleBar';
import {pickTheme, SHOP_PRODUCT_TYPES} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_92_12,
  inlineStyle_101_14,
  inlineStyle_109_20,
  inlineStyle_110_20,
  inlineStyle_114_18,
  inlineStyle_115_20,
  inlineStyle_117_41,
  inlineStyle_123_22,
  inlineStyle_125_44,
  inlineStyle_139_18,
  inlineStyle_147_24,
  inlineStyle_150_24,
} from './SearchPage.styles';

export default function SearchPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);
  const q = decodeURIComponent(String(route.params?.q || ''));
  const productsStore = useStore('products');
  const categoriesStore = useStore('categories');
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const theme = pickTheme(defaultCompany);
  const [fullCategories, setFullCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!defaultCompany?.id) {
        setFullCategories([]);
        setSearchCategories([]);
        setSearchProducts([]);
        return;
      }

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
        company: defaultCompany?.id,
        active: 1,
        type: SHOP_PRODUCT_TYPES,
        'order[product]': 'ASC',
        product: q,
      }).then(data => setSearchProducts(data || []));

      categoriesStore.actions.getItems({
        itemsPerPage: 32,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        'order[name]': 'ASC',
        context: 'products',
        company: defaultCompany?.id,
        name: q,
      }).then(data => setSearchCategories(data || []));
    }, [categoriesStore.actions, defaultCompany?.id, productsStore.actions, q]),
  );

  const categories = fullCategories;
  const columns = width >= 1300 ? 4 : width >= 1000 ? 3 : width >= 640 ? 2 : 2;
  const effectiveWidth = layoutWidth || width;
  const pageWidth = Math.max(effectiveWidth - 28, 320);
  const gap = width < 640 ? 10 : 16;
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
          <ShopTitleBar title="Resultados" company={defaultCompany} />
          <ScrollView
            style={inlineStyle_92_12}
            onLayout={event => {
              const nextWidth = event?.nativeEvent?.layout?.width;
              if (!nextWidth) return;
              setLayoutWidth(current =>
                Math.abs(current - nextWidth) < 1 ? current : nextWidth,
              );
            }}>
            <View
              style={inlineStyle_101_14({
                theme: theme,
              })}>
              <Text style={inlineStyle_109_20({
                theme: theme,
              })}>BUSCA</Text>
              <Text style={inlineStyle_110_20({
                theme: theme,
              })}>
                {q ? `Resultados para "${q}"` : 'Digite algo para buscar'}
              </Text>
            </View>
            <View style={inlineStyle_114_18}>
              <View style={inlineStyle_115_20({
                gap: gap,
              })}>
                {searchProducts.map(product => (
                  <View key={product.id} style={inlineStyle_117_41({
                    cardWidth: cardWidth,
                  })}>
                    <ShopProductCard product={product} compact />
                  </View>
                ))}
              </View>
              {searchCategories.length > 0 && (
                <View style={inlineStyle_123_22({
                  gap: gap,
                })}>
                  {searchCategories.map(category => (
                    <View key={category.id} style={inlineStyle_125_44({
                      cardWidth: cardWidth,
                    })}>
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
              {searchProducts.length === 0 && searchCategories.length === 0 && q && (
                <View
                  style={inlineStyle_139_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_147_24({
                    theme: theme,
                  })}>
                    Nenhum resultado encontrado
                  </Text>
                  <Text style={inlineStyle_150_24({
                    theme: theme,
                  })}>
                    Tente outro termo de busca.
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
