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
import {
  SHOP_HOME_OPTION_SALES,
  SHOP_SHOWCASE_TYPE_ECOMMERCE,
} from '@controleonline/ui-common/src/react/utils/shopConfig';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  catalogPageScrollContentStyle,
  catalogPageSectionStackStyle,
  catalogPageSearchCategoriesStyle,
  catalogPageSearchCategoryButtonStyle,
  catalogPageSearchCategoryTextStyle,
} from '@controleonline/ui-shop/src/react/pages/ShopCatalogPage.styles';

const t = (type, key, fallback) =>
  global.t?.t?.('shop', type, key) || fallback;

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
    categoryTotalItems,
    defaultCompany,
    franchiseLocatorEnabled,
    hasMoreCategories,
    hasMoreProducts,
    isLoadingCatalog,
    isAllProductsCatalog,
    isLoadingMoreCategories,
    isLoadingMoreProducts,
    isLoadingSalesCompanies,
    products,
    productTotalItems,
    refreshCart,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    salesPageEnabled,
    searchCategoriesTotalItems,
    searchCategories,
    searchProductsTotalItems,
    searchProducts,
    selectSalesCompany,
    setActiveCategoryId,
    shopShowcaseType,
    loadMoreCategories,
    loadMoreProducts,
    theme,
  } = useShopCatalogState({
    mode,
    routeCategoryId: categoryId,
    searchQuery: normalizedSearchQuery,
  });
  const [pageLayoutHeight, setPageLayoutHeight] = useState(0);
  const [pageContentHeight, setPageContentHeight] = useState(0);
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
  const isEcommerce = shopShowcaseType === SHOP_SHOWCASE_TYPE_ECOMMERCE;
  const searchPlaceholder = isEcommerce
    ? t('placeholder', 'searchProductsOrCategories', 'Busque produtos ou categorias')
    : t(
        'placeholder',
        'searchFoodOrCategories',
        'Busque pratos, bebidas ou categorias',
      );

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

  const handleCatalogScroll = useCallback(
    event => {
      if (mode === 'search' || !hasMoreProducts || isLoadingMoreProducts) {
        return;
      }

      const scrollY = Number(event?.nativeEvent?.contentOffset?.y || 0);
      const viewportHeight = Number(event?.nativeEvent?.layoutMeasurement?.height || 0);
      const contentHeight = Number(event?.nativeEvent?.contentSize?.height || 0);

      if (
        viewportHeight > 0 &&
        contentHeight > 0 &&
        scrollY + viewportHeight >= contentHeight - 220
      ) {
        loadMoreProducts?.();
      }
    },
    [hasMoreProducts, isLoadingMoreProducts, loadMoreProducts, mode],
  );

  useEffect(() => {
    if (
      mode === 'search' ||
      !hasMoreProducts ||
      isLoadingMoreProducts ||
      !pageLayoutHeight ||
      !pageContentHeight
    ) {
      return;
    }

    if (pageContentHeight <= pageLayoutHeight + 180) {
      loadMoreProducts?.();
    }
  }, [
    hasMoreProducts,
    isLoadingMoreProducts,
    loadMoreProducts,
    mode,
    pageContentHeight,
    pageLayoutHeight,
  ]);

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
      hideHeader={showMobileCatalog}
      onSearch={handleSearch}
      searchPlaceholder={searchPlaceholder}
      searchValue={normalizedSearchQuery}
      showBottomCart={showBottomCart}
      showSearch={!showMobileCatalog}
      showHomeEntryControls>
      {({openAccountMenu}) =>
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
            activeCategory={activeCategory}
            cart={cart}
            categories={categories}
            company={catalogCompany}
            defaultCompany={defaultCompany}
            hasMoreCategories={hasMoreCategories}
            hasMoreProducts={hasMoreProducts}
            isLoadingCatalog={isLoadingCatalog}
            isAllProductsCatalog={isAllProductsCatalog}
            isLoadingMoreCategories={isLoadingMoreCategories}
            isLoadingMoreProducts={isLoadingMoreProducts}
            mode={mode}
            onOpenMenu={openAccountMenu}
            onSearch={handleSearch}
            searchPlaceholder={searchPlaceholder}
            onLoadMoreCategories={loadMoreCategories}
            onLoadMoreProducts={loadMoreProducts}
            onSelectCategory={handleSelectCategory}
            refreshCart={refreshCart}
            products={mode === 'search' ? searchProducts : products}
            productTotalItems={productTotalItems}
            searchCategoriesTotalItems={searchCategoriesTotalItems}
            searchProducts={searchProducts}
            searchProductsTotalItems={searchProductsTotalItems}
            searchValue={normalizedSearchQuery}
          />
        ) : (
          <ScrollView
            contentContainerStyle={catalogPageScrollContentStyle}
            onContentSizeChange={(_, height) => setPageContentHeight(height || 0)}
            onLayout={event =>
              setPageLayoutHeight(event?.nativeEvent?.layout?.height || 0)
            }
            onScroll={handleCatalogScroll}
            scrollEventThrottle={80}>
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
                  hasMoreCategories={hasMoreCategories}
                  isLoadingMoreCategories={isLoadingMoreCategories}
                  onLoadMoreCategories={loadMoreCategories}
                  onSelect={handleSelectCategory}
                />
              }
              isSidebarCompact={isSidebarCompact}
              mainContent={
                <View style={catalogPageSectionStackStyle}>
                  <ShopCategoryHero
                    categoriesCount={mode === 'search' ? searchCategoriesTotalItems : categoryTotalItems}
                    category={activeCategory}
                    company={catalogCompany}
                    isAllProducts={isAllProductsCatalog}
                    mode={mode}
                    productsCount={mode === 'search' ? searchProductsTotalItems : productTotalItems}
                    query={normalizedSearchQuery}
                  />

                  <ShopProductsSection
                    cart={cart}
                    company={catalogCompany}
                    defaultCompany={defaultCompany}
                    emptyDescription={
                      mode === 'search'
                        ? normalizedSearchQuery
                          ? t(
                              'message',
                              'tryAnotherSearchOrCategory',
                              'Tente outro termo ou abra uma categoria pelo menu.',
                            )
                          : isEcommerce
                            ? t(
                                'message',
                                'searchProductsOrCategoriesHint',
                                'Use a busca para encontrar produtos e categorias.',
                              )
                            : t(
                                'message',
                                'searchFoodOrCategoriesHint',
                                'Use a busca para encontrar pratos, bebidas e categorias.',
                              )
                        : isAllProductsCatalog
                          ? t(
                              'message',
                              'tryAgainProducts',
                              'Tente novamente em instantes.',
                            )
                          : t(
                              'message',
                              'chooseAnotherCategory',
                              'Escolha outra categoria ou tente novamente em instantes.',
                            )
                    }
                    emptyTitle={
                      mode === 'search'
                        ? normalizedSearchQuery
                          ? t(
                              'title',
                              'emptyProductSearch',
                              'Nenhum produto encontrado',
                            )
                          : isEcommerce
                            ? t('title', 'searchProducts', 'Busque produtos')
                            : t(
                                'title',
                                'searchMenuItems',
                                'Busque itens do cardapio',
                              )
                        : isAllProductsCatalog
                          ? t('title', 'emptyProducts', 'Nenhum produto encontrado')
                          : t(
                              'title',
                              'emptyCategoryProducts',
                              'Nenhum produto nesta categoria',
                            )
                    }
                    isLoading={isLoadingCatalog}
                    isLoadingMore={isLoadingMoreProducts}
                    products={mode === 'search' ? searchProducts : products}
                    refreshCart={refreshCart}
                    totalProductsCount={
                      mode === 'search' ? searchProductsTotalItems : productTotalItems
                    }
                    title={
                      mode === 'search'
                        ? 'Produtos encontrados'
                        : isAllProductsCatalog
                          ? t('title', 'allProducts', 'Produtos')
                          : activeCategory?.name || 'Produtos'
                    }
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
                  isLoadingMoreCategories={isLoadingMoreCategories}
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
