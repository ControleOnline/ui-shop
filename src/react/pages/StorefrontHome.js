import React, {useCallback, useMemo} from 'react';
import {ScrollView, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopBottomCart from '@controleonline/ui-shop/src/react/components/storefront/ShopBottomCart';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';

const getColumns = width => {
  if (width >= 1700) return 4;
  if (width >= 1200) return 3;
  if (width >= 800) return 2;
  return 1;
};

export default function StorefrontHome() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const categoriesStore = useStore('categories');
  const {actions: categoryActions, getters: categoryGetters} = categoriesStore;
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const categories = categoryGetters.items || [];

  useFocusEffect(
    useCallback(() => {
      if (!defaultCompany?.id) return;
      categoryActions.getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: defaultCompany.id,
      });
    }, [categoryActions, defaultCompany?.id]),
  );

  const topCategories = useMemo(
    () => categories.filter(category => !category?.parent),
    [categories],
  );
  const columns = getColumns(width);
  const pageWidth = Math.max(width - 32, 320);
  const gap = 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  const goToCategory = useCallback(
    category => {
      navigation.navigate('ShopCategoryPage', {id: String(category.id)});
    },
    [navigation],
  );

  return (
    <ShopShell
      searchValue=""
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'SalesOrderIndex', {
          q: query,
        })
      }>
      {() => (
        <>
          <ShopCategoryMenu
            categories={categories}
            onSelect={goToCategory}
            company={defaultCompany}
          />
          <ScrollView style={{flex: 1}}>
            <View style={{backgroundColor: '#111', minHeight: 36}} />
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
                padding: 16,
                paddingBottom: 92,
              }}>
              {topCategories.map(category => (
                <View key={category.id} style={{width: cardWidth}}>
                  <ShopCategoryCard
                    category={category}
                    company={defaultCompany}
                    onPress={() => goToCategory(category)}
                  />
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
