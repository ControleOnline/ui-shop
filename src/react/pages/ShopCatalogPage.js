import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ShopCategoryMenu from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryMenu';
import ShopCategoryHero from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryHero';
import ShopCartAside from '@controleonline/ui-shop/src/react/components/storefront/ShopCartAside';
import ShopCategorySidebar from '@controleonline/ui-shop/src/react/components/storefront/ShopCategorySidebar';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopMobileCatalog from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCatalog';
import ShopProductsSection from '@controleonline/ui-shop/src/react/components/storefront/ShopProductsSection';
import ShopPurchasesLayout from '@controleonline/ui-shop/src/react/components/storefront/ShopPurchasesLayout';
import ShopSalesCompanySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCatalogState from '@controleonline/ui-shop/src/react/hooks/useShopCatalogState';
import {SHOP_HOME_OPTION_SALES} from '@controleonline/ui-common/src/react/utils/shopConfig';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  catalogPageScrollContentStyle,
  catalogPageSectionStackStyle,
  catalogPageSearchCategoriesStyle,
  catalogPageSearchCategoryButtonStyle,
  catalogPageSearchCategoryTextStyle,
} from '@controleonline/ui-shop/src/react/pages/ShopCatalogPage.styles';

// Share the same `Compras` shell across the default, category and search routes.
export default function ShopCatalogPage({
  categoryId = '',
  mode = 'default',
  searchQuery = '',
}) {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const normalizedSearchQuery = decodeURIComponent(String(searchQuery || ''));
  const showMobileCatalog = width < 1120;
  const showSidebar = width >= 1120;
  const showCartAside = width >= 1440;
  const [isSidebarCompact, setIsSidebarCompact] = useState(width < 1380);
  const {
    activeCategory,
    activeCategoryId,
    cart,
    categories,
    defaultCompany,
    franchiseLocatorEnabled,
    isLoadingCatalog,
    isLoadingSalesCompanies,
    products,
    productsByCategoryId,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    salesPageEnabled,
    searchCategories,
    searchProducts,
    selectSalesCompany,
    setActiveCategoryId,
    theme,
  } = useShopCatalogState({
    loadCategorySections: showMobileCatalog,
    mode,
    routeCategoryId: categoryId,
    searchQuery: normalizedSearchQuery,
  });
  const company = salesCompany || defaultCompany;
  const catalogCompany = useMemo(() => {
    const companyTheme = company?.theme || {};
    const companyColors = companyTheme?.colors || {};

    // Keep phase 1 copy readable while the catalog still uses light panels.
    return {
      ...company,
      theme: {
        ...companyTheme,
        colors: {
          ...companyColors,
          'text-primary': '#111827',
          'text-secondary': '#475569',
        },
      },
    };
  }, [company]);
  const catalogTheme = useMemo(() => pickTheme(catalogCompany), [catalogCompany]);
  const showBottomCart = !requiresCompanySelection && !showCartAside;

  // Compact the desktop sidebar on narrower wide screens while keeping the toggle under user control.
  useEffect(() => {
    if (!showSidebar) {
      setIsSidebarCompact(false);
      return;
    }

    if (width < 1380) {
      setIsSidebarCompact(true);
    }
  }, [showSidebar, width]);

  // Route all catalog searches through the existing search page contract.
  const handleSearch = useCallback(
    query => {
      navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query});
    },
    [navigation],
  );

  // Keep category changes lightweight in `ShopIndex`, while deep links still update the route param.
  const handleSelectCategory = useCallback(
    category => {
      const nextCategoryId = String(category?.id || category?.['@id'] || '');

      if (!nextCategoryId) {
        return;
      }

      if (mode === 'default') {
        setActiveCategoryId(nextCategoryId);
        return;
      }

      if (mode === 'category') {
        navigation.setParams?.({id: nextCategoryId});
        setActiveCategoryId(nextCategoryId);
        return;
      }

      navigation.navigate('ShopCategoryPage', {id: nextCategoryId});
    },
    [mode, navigation, setActiveCategoryId],
  );

  if (!salesPageEnabled) {
    return (
      <ShopShell
        activeHomeEntry={SHOP_HOME_OPTION_SALES}
        onSearch={handleSearch}
        searchValue={normalizedSearchQuery}
        showHomeEntryControls>
        {() => (
          <ShopFeatureState
            description="A vitrine de compras esta desativada para esta empresa."
            iconName="storefront"
            onPrimaryAction={
              franchiseLocatorEnabled
                ? () => navigation.navigate('ShopFranchiseLocatorPage')
                : null
            }
            primaryActionLabel={
              franchiseLocatorEnabled ? 'Abrir localizador' : null
            }
            theme={theme}
            title="Compras indisponivel"
          />
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_SALES}
      onSearch={handleSearch}
      searchValue={normalizedSearchQuery}
      showBottomCart={showBottomCart}
      showSearch={!showMobileCatalog}
      showHomeEntryControls>
      {() =>
        requiresCompanySelection ? (
          <ShopSalesCompanySelector
            companies={salesCompanyOptions}
            description="Selecione a unidade primeiro para abrir o catalogo principal."
            isLoading={isLoadingSalesCompanies}
            onSelect={selectSalesCompany}
            theme={theme}
            title="Escolha a unidade para continuar"
          />
        ) : showMobileCatalog ? (
          <ShopMobileCatalog
            activeCategoryId={activeCategoryId}
            categories={categories}
            company={catalogCompany}
            isLoadingCatalog={isLoadingCatalog}
            mode={mode}
            onSearch={handleSearch}
            onSelectCategory={handleSelectCategory}
            productsByCategoryId={productsByCategoryId}
            searchProducts={searchProducts}
            searchValue={normalizedSearchQuery}
          />
        ) : (
          <ScrollView contentContainerStyle={catalogPageScrollContentStyle}>
            <ShopPurchasesLayout
              cartAside={
                showCartAside ? (
                <ShopCartAside
                  cart={cart}
                  company={catalogCompany}
                  onOpenCart={() => navigation.navigate('ShopCartPage')}
                />
              ) : null
            }
            categoryMenu={
              <ShopCategoryMenu
                activeCategoryId={activeCategoryId}
                categories={categories}
                company={catalogCompany}
                onSelect={handleSelectCategory}
              />
            }
              isSidebarCompact={isSidebarCompact}
              mainContent={
                <View style={catalogPageSectionStackStyle}>
                  <ShopCategoryHero
                    categoriesCount={searchCategories.length}
                    category={activeCategory}
                    company={catalogCompany}
                    mode={mode}
                    productsCount={mode === 'search' ? searchProducts.length : products.length}
                    query={normalizedSearchQuery}
                  />

                  <ShopProductsSection
                    company={catalogCompany}
                    emptyDescription={
                      mode === 'search'
                        ? normalizedSearchQuery
                          ? 'Tente outro termo ou abra uma categoria pelo menu.'
                          : 'Use a busca para encontrar pratos, bebidas e categorias.'
                        : 'Escolha outra categoria ou tente novamente em instantes.'
                    }
                    emptyTitle={
                      mode === 'search'
                        ? normalizedSearchQuery
                          ? 'Nenhum produto encontrado'
                          : 'Busque itens do cardapio'
                        : 'Nenhum produto nesta categoria'
                    }
                    isLoading={isLoadingCatalog}
                    products={mode === 'search' ? searchProducts : products}
                    title={mode === 'search' ? 'Produtos encontrados' : activeCategory?.name || 'Produtos'}
                  />

                  {mode === 'search' && searchCategories.length > 0 ? (
                    <View
                      style={catalogPageSearchCategoriesStyle({
                        theme: catalogTheme,
                      })}>
                      <Text
                        style={catalogPageSearchCategoryTextStyle({
                          highlight: false,
                          theme: catalogTheme,
                        })}>
                        Categorias encontradas
                      </Text>

                      <View style={catalogPageSectionStackStyle}>
                        {searchCategories.map(category => {
                          const nextCategoryId = String(
                            category?.id || category?.['@id'] || '',
                          );

                          return (
                            <TouchableOpacity
                              key={nextCategoryId}
                              activeOpacity={0.9}
                              onPress={() =>
                                navigation.navigate('ShopCategoryPage', {
                                  id: nextCategoryId,
                                })
                              }
                              style={catalogPageSearchCategoryButtonStyle({
                                theme: catalogTheme,
                              })}>
                              <Text
                                style={catalogPageSearchCategoryTextStyle({
                                  highlight: true,
                                  theme: catalogTheme,
                                })}>
                                {category?.name || 'Categoria'}
                              </Text>
                              <Text
                                style={catalogPageSearchCategoryTextStyle({
                                  highlight: false,
                                  theme: catalogTheme,
                                })}>
                                Abrir secao
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </View>
              }
              showCartAside={showCartAside}
              showSidebar={showSidebar}
              sidebar={
                showSidebar ? (
                <ShopCategorySidebar
                  activeCategoryId={activeCategoryId}
                  categories={categories}
                  company={catalogCompany}
                  compact={isSidebarCompact}
                  onSelect={handleSelectCategory}
                  onToggleCompact={() =>
                      setIsSidebarCompact(currentValue => !currentValue)
                    }
                  />
                ) : null
              }
            />
          </ScrollView>
        )
      }
    </ShopShell>
  );
}
