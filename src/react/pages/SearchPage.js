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
            style={{flex: 1}}
            onLayout={event => {
              const nextWidth = event?.nativeEvent?.layout?.width;
              if (!nextWidth) return;
              setLayoutWidth(current =>
                Math.abs(current - nextWidth) < 1 ? current : nextWidth,
              );
            }}>
            <View
              style={{
                margin: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.primary}25`,
                backgroundColor: `${theme.primary}10`,
                padding: 14,
              }}>
              <Text style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>BUSCA</Text>
              <Text style={{color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 4}}>
                {q ? `Resultados para "${q}"` : 'Digite algo para buscar'}
              </Text>
            </View>
            <View style={{paddingHorizontal: 14, gap: 14, paddingBottom: 92}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap}}>
                {searchProducts.map(product => (
                  <View key={product.id} style={{width: cardWidth}}>
                    <ShopProductCard product={product} compact />
                  </View>
                ))}
              </View>
              {searchCategories.length > 0 && (
                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap}}>
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
              {searchProducts.length === 0 && searchCategories.length === 0 && q && (
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    backgroundColor: theme.surface,
                    padding: 22,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: theme.text, fontSize: 15, fontWeight: '700'}}>
                    Nenhum resultado encontrado
                  </Text>
                  <Text style={{color: theme.muted, marginTop: 6, fontSize: 12}}>
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
