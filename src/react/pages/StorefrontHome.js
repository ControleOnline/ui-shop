import React, {useCallback, useMemo, useState} from 'react';
import {ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const getColumns = width => {
  if (width >= 1500) return 4;
  if (width >= 1100) return 3;
  if (width >= 800) return 2;
  return 2;
};

export default function StorefrontHome() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(width);
  const categoriesStore = useStore('categories');
  const {actions: categoryActions, getters: categoryGetters} = categoriesStore;
  const peopleStore = useStore('people');
  const {defaultCompany} = peopleStore.getters;
  const categories = categoryGetters.items || [];
  const theme = pickTheme(defaultCompany);

  useFocusEffect(
    useCallback(() => {
      if (!defaultCompany?.id) {
        categoryActions.setItems([]);
        return;
      }
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
  const effectiveWidth = layoutWidth || width;
  const pageWidth = Math.max(effectiveWidth - 28, 320);
  const gap = width < 640 ? 10 : 16;
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
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {
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
                borderRadius: 18,
                backgroundColor: `${theme.primary}10`,
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
                padding: 16,
              }}>
              <Text style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>
                CARDAPIO DIGITAL
              </Text>
              <Text style={{marginTop: 6, color: theme.text, fontSize: 20, fontWeight: '800'}}>
                Escolha sua categoria
              </Text>
              <Text style={{marginTop: 6, color: theme.muted, fontSize: 13}}>
                Navegue pelos pratos e monte seu pedido em poucos toques.
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap,
                paddingHorizontal: 14,
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
              {topCategories.length === 0 && (
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    borderRadius: 16,
                    padding: 24,
                    backgroundColor: theme.surface,
                  }}>
                  <Text style={{color: theme.text, fontSize: 15, fontWeight: '700'}}>
                    Nenhuma categoria encontrada
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
