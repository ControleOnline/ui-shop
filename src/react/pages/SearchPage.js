import React, {useCallback, useState} from 'react';
import {ScrollView, Text, View, useWindowDimensions} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import ShopCategoryCard from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryCard';
import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopSalesCompanySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopProductCard';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import ShopTitleBar from '@controleonline/ui-shop/src/react/components/storefront/ShopTitleBar';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme, SHOP_PRODUCT_TYPES} from '@controleonline/ui-shop/src/react/utils/shop';
import {SHOP_HOME_OPTION_SALES} from '@controleonline/ui-common/src/react/utils/shopConfig';

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
  const {defaultCompany, franchiseLocatorEnabled, salesPageEnabled} =
    useShopSettings();
  const {
    isLoading: isLoadingSalesCompanies,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    selectSalesCompany,
  } = useShopSalesCompany();
  const theme = pickTheme(defaultCompany);
  const [fullCategories, setFullCategories] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!salesCompany?.id || requiresCompanySelection) {
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
        company: salesCompany?.id,
      }).then(data => setFullCategories(data || []));

      productsStore.actions.getItems({
        itemsPerPage: 32,
        exists: {productFiles: 'true'},
        productFiles: {file: {fileType: 'image'}},
        company: salesCompany?.id,
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
        company: salesCompany?.id,
        name: q,
      }).then(data => setSearchCategories(data || []));
    }, [
      categoriesStore.actions,
      productsStore.actions,
      q,
      requiresCompanySelection,
      salesCompany?.id,
    ]),
  );

  const categories = fullCategories;
  const columns = width >= 1300 ? 4 : width >= 1000 ? 3 : width >= 640 ? 2 : 2;
  const effectiveWidth = layoutWidth || width;
  const pageWidth = Math.max(effectiveWidth - 28, 320);
  const gap = width < 640 ? 10 : 16;
  const cardWidth = (pageWidth - gap * (columns - 1)) / columns;

  if (!salesPageEnabled) {
    return (
      <ShopShell
        activeHomeEntry={SHOP_HOME_OPTION_SALES}
        onSearch={query =>
          navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
        }
        searchValue={q}
        showHomeEntryControls>
        {() => (
          <ScrollView style={inlineStyle_92_12}>
            <ShopFeatureState
              theme={theme}
              iconName="search-off"
              title="Busca de produtos indisponivel"
              description="A pagina de vendas esta desativada, entao a busca do cardapio nao pode ser exibida."
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
      showBottomCart={!requiresCompanySelection}
      searchValue={q}
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }
      showHomeEntryControls>
      {() => (
        <>
          {requiresCompanySelection ? (
            <ShopSalesCompanySelector
              companies={salesCompanyOptions}
              isLoading={isLoadingSalesCompanies}
              onSelect={selectSalesCompany}
              theme={theme}
              title="Escolha a unidade para buscar"
              description="Selecione primeiro a empresa que vai atender seu pedido."
            />
          ) : (
            <>
          <ShopCategoryMenu
            categories={categories}
            onSelect={category =>
              navigation.navigate('ShopCategoryPage', {id: String(category.id)})
            }
            company={salesCompany || defaultCompany}
          />
          <ShopTitleBar
            title="Resultados"
            company={salesCompany || defaultCompany}
          />
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
                        company={salesCompany || defaultCompany}
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
        </>
      )}
    </ShopShell>
  );
}
