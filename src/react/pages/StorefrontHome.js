import React, {useCallback, useMemo, useState} from 'react';
import {ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {SHOP_HOME_OPTION_SALES} from '@controleonline/ui-common/src/react/utils/shopConfig';

import {
  inlineStyle_78_12,
  inlineStyle_87_14,
  inlineStyle_95_20,
  inlineStyle_98_20,
  inlineStyle_101_20,
  inlineStyle_106_14,
  inlineStyle_114_40,
  inlineStyle_124_18,
  inlineStyle_134_24,
} from './StorefrontHome.styles';

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
  const {franchiseLocatorEnabled, salesPageEnabled} = useShopSettings();
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

  if (!salesPageEnabled) {
    return (
      <ShopShell
        activeHomeEntry={SHOP_HOME_OPTION_SALES}
        onSearch={query =>
          navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {
            q: query,
          })
        }
        showHomeEntryControls>
        {() => (
          <ScrollView style={inlineStyle_78_12}>
            <ShopFeatureState
              theme={theme}
              iconName="storefront"
              title="Pagina de vendas desativada"
              description="A vitrine principal do shop foi ocultada para esta empresa."
              primaryActionLabel={
                franchiseLocatorEnabled ? 'Abrir localizador' : null
              }
              onPrimaryAction={
                franchiseLocatorEnabled
                  ? () => navigation.navigate('ShopFranchiseLocatorPage')
                  : null
              }
            />
          </ScrollView>
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_SALES}
      searchValue=""
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {
          q: query,
        })
      }
      showHomeEntryControls>
      {() => (
        <>
          <ShopCategoryMenu
            categories={categories}
            onSelect={goToCategory}
            company={defaultCompany}
          />
          <ScrollView
            style={inlineStyle_78_12}
            onLayout={event => {
              const nextWidth = event?.nativeEvent?.layout?.width;
              if (!nextWidth) return;
              setLayoutWidth(current =>
                Math.abs(current - nextWidth) < 1 ? current : nextWidth,
              );
            }}>
            <View
              style={inlineStyle_87_14({
                theme: theme,
              })}>
              <Text style={inlineStyle_95_20({
                theme: theme,
              })}>
                CARDAPIO DIGITAL
              </Text>
              <Text style={inlineStyle_98_20({
                theme: theme,
              })}>
                Escolha sua categoria
              </Text>
              <Text style={inlineStyle_101_20({
                theme: theme,
              })}>
                Navegue pelos pratos e monte seu pedido em poucos toques.
              </Text>
            </View>
            <View
              style={inlineStyle_106_14({
                gap: gap,
              })}>
              {topCategories.map(category => (
                <View key={category.id} style={inlineStyle_114_40({
                  cardWidth: cardWidth,
                })}>
                  <ShopCategoryCard
                    category={category}
                    company={defaultCompany}
                    onPress={() => goToCategory(category)}
                  />
                </View>
              ))}
              {topCategories.length === 0 && (
                <View
                  style={inlineStyle_124_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_134_24({
                    theme: theme,
                  })}>
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
