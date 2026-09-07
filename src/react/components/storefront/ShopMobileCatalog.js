import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ShopMobileCategorySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCategorySelector';
import ShopMobileProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductCard';
import ShopMobileProductSection from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductSection';
import ShopMobileStoreHeader from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import {buildFileUrl, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryFile} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  mobileCatalogCategoryCardImageStyle,
  mobileCatalogCategoryCardStyle,
  mobileCatalogCategoryCardTextStyle,
  mobileCatalogCategoryListContentStyle,
  mobileCatalogCategoryStickyStyle,
  mobileCatalogControlsStyle,
  mobileCatalogRootStyle,
  mobileCatalogSectionStackStyle,
  mobileCatalogSearchResultsStyle,
  mobileCatalogSearchResultsTitleStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCatalog.styles';

const getCategoryId = category => String(category?.id || category?.['@id'] || '');

export default function ShopMobileCatalog({
  activeCategoryId = '',
  activeCategory = null,
  cart = null,
  categories = [],
  company = null,
  defaultCompany = null,
  hasMoreCategories = false,
  hasMoreProducts = false,
  isLoadingCatalog = false,
  isAllProductsCatalog = false,
  isLoadingMoreCategories = false,
  isLoadingMoreProducts = false,
  mode = 'default',
  onLoadMoreCategories = null,
  onLoadMoreProducts = null,
  onOpenMenu = null,
  onSearch = null,
  onSelectCategory = null,
  productTotalItems = 0,
  products = [],
  refreshCart = null,
  searchProducts = [],
  searchPlaceholder = 'Busque pratos, bebidas ou categorias',
  searchValue = '',
}) {
  const theme = pickTheme(company);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [categoryStripWidth, setCategoryStripWidth] = useState(0);
  const [categoryStripContentWidth, setCategoryStripContentWidth] = useState(0);
  const visibleCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter(Boolean) : []),
    [categories],
  );
  const resolvedActiveCategory = useMemo(
    () =>
      activeCategory ||
      visibleCategories.find(
        category =>
          String(category?.id || category?.['@id'] || '') ===
          String(activeCategoryId || ''),
      ) ||
      visibleCategories[0] ||
      null,
    [activeCategory, activeCategoryId, visibleCategories],
  );

  const handleSelectCategory = useCallback(
    category => {
      const categoryId = getCategoryId(category);

      if (!categoryId) {
        return;
      }

      onSelectCategory?.(category);
    },
    [onSelectCategory],
  );

  const handleRootScroll = useCallback(
    event => {
      if (mode === 'search' || !hasMoreProducts || isLoadingMoreProducts) {
        return;
      }

      const scrollY = Number(event?.nativeEvent?.contentOffset?.y || 0);
      const viewport = Number(event?.nativeEvent?.layoutMeasurement?.height || 0);
      const content = Number(event?.nativeEvent?.contentSize?.height || 0);

      if (viewport > 0 && content > 0 && scrollY + viewport >= content - 220) {
        onLoadMoreProducts?.();
      }
    },
    [hasMoreProducts, isLoadingMoreProducts, mode, onLoadMoreProducts],
  );

  useEffect(() => {
    if (
      mode === 'search' ||
      !hasMoreProducts ||
      isLoadingMoreProducts ||
      !viewportHeight ||
      !contentHeight
    ) {
      return;
    }

    if (contentHeight <= viewportHeight + 180) {
      onLoadMoreProducts?.();
    }
  }, [
    contentHeight,
    hasMoreProducts,
    isLoadingMoreProducts,
    mode,
    onLoadMoreProducts,
    viewportHeight,
  ]);

  const handleCategoryStripScroll = useCallback(
    event => {
      if (mode === 'search' || !hasMoreCategories || isLoadingMoreCategories) {
        return;
      }

      const scrollX = Number(event?.nativeEvent?.contentOffset?.x || 0);
      const viewport = Number(event?.nativeEvent?.layoutMeasurement?.width || 0);
      const content = Number(event?.nativeEvent?.contentSize?.width || 0);

      if (viewport > 0 && content > 0 && scrollX + viewport >= content - 96) {
        onLoadMoreCategories?.();
      }
    },
    [hasMoreCategories, isLoadingMoreCategories, mode, onLoadMoreCategories],
  );

  useEffect(() => {
    if (
      mode === 'search' ||
      !hasMoreCategories ||
      isLoadingMoreCategories ||
      !categoryStripWidth ||
      !categoryStripContentWidth
    ) {
      return;
    }

    if (categoryStripContentWidth <= categoryStripWidth + 72) {
      onLoadMoreCategories?.();
    }
  }, [
    categoryStripContentWidth,
    categoryStripWidth,
    hasMoreCategories,
    isLoadingMoreCategories,
    mode,
    onLoadMoreCategories,
  ]);

  const handleNavigateHome = useCallback(() => {
    navigation.navigate('ShopIndex');
  }, [navigation]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={(_, height) => setContentHeight(height || 0)}
      onLayout={event => setViewportHeight(event?.nativeEvent?.layout?.height || 0)}
      onScroll={handleRootScroll}
      scrollEventThrottle={80}
      stickyHeaderIndices={[1]}
      style={mobileCatalogRootStyle({theme})}>
      <ShopMobileStoreHeader
        categories={visibleCategories}
        company={company}
        onNavigateHome={handleNavigateHome}
        onOpenMenu={onOpenMenu}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        showHomeAction={false}
        variant="shell"
      />

      {mode !== 'search' && isLoadingCatalog && visibleCategories.length === 0 ? (
        <View style={mobileCatalogCategoryStickyStyle({theme})}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mobileCatalogCategoryListContentStyle}
            onContentSizeChange={(_, width) =>
              setCategoryStripContentWidth(width || 0)
            }
            onLayout={event =>
              setCategoryStripWidth(event?.nativeEvent?.layout?.width || 0)
            }
            onScroll={handleCategoryStripScroll}
            scrollEventThrottle={80}>
            {[0, 1, 2, 3].map(item => (
              <View
                key={`mobile-category-skeleton-${item}`}
                style={mobileCatalogCategoryCardStyle({isActive: false, theme})}>
                <ShopSkeleton height={54} radius={16} theme={company} />
                <ShopSkeleton height={14} width="76%" theme={company} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : mode !== 'search' && visibleCategories.length > 0 ? (
        <View style={mobileCatalogCategoryStickyStyle({theme})}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mobileCatalogCategoryListContentStyle}
            onContentSizeChange={(_, width) =>
              setCategoryStripContentWidth(width || 0)
            }
            onLayout={event =>
              setCategoryStripWidth(event?.nativeEvent?.layout?.width || 0)
            }
            onScroll={handleCategoryStripScroll}
            scrollEventThrottle={80}>
            {visibleCategories.map(category => {
              const categoryId = getCategoryId(category);
              const isActive = String(activeCategoryId || '') === categoryId;
              const categoryFile = getShopCategoryFile(category);
              const imageUrl = categoryFile ? buildFileUrl(categoryFile, company) : '';

              return (
                <TouchableOpacity
                  key={categoryId}
                  activeOpacity={0.9}
                  onPress={() => handleSelectCategory(category)}
                  style={mobileCatalogCategoryCardStyle({isActive, theme})}>
                  {imageUrl ? (
                    <Image
                      resizeMode="cover"
                      source={{uri: imageUrl}}
                      style={mobileCatalogCategoryCardImageStyle}
                    />
                  ) : null}
                  <Text
                    numberOfLines={2}
                    style={mobileCatalogCategoryCardTextStyle({isActive, theme})}>
                    {category?.name || 'Categoria'}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {isLoadingMoreCategories ? (
              <View
                style={[
                  mobileCatalogCategoryCardStyle({isActive: false, theme}),
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  },
                ]}>
                <ActivityIndicator color={theme.primary} />
                <Text
                  numberOfLines={1}
                  style={mobileCatalogCategoryCardTextStyle({
                    isActive: false,
                    theme,
                  })}>
                  Mais categorias
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      {mode !== 'search' && visibleCategories.length > 0 ? (
        <View style={mobileCatalogControlsStyle({theme})}>
          <ShopMobileCategorySelector
            activeCategoryId={activeCategoryId}
            categories={visibleCategories}
            company={company}
            hasMoreCategories={hasMoreCategories}
            isLoadingMoreCategories={isLoadingMoreCategories}
            onLoadMoreCategories={onLoadMoreCategories}
            onSelect={handleSelectCategory}
          />
        </View>
      ) : null}

      <View style={mobileCatalogSectionStackStyle}>
        {mode === 'search' ? (
          <View style={mobileCatalogSearchResultsStyle({theme})}>
            <Text style={mobileCatalogSearchResultsTitleStyle({theme})}>
              Produtos encontrados
            </Text>
            {isLoadingCatalog && searchProducts.length === 0 ? (
              <View style={{paddingVertical: 18, alignItems: 'center'}}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : null}
            {!isLoadingCatalog && searchProducts.length === 0 ? (
              <Text style={{color: theme.muted, fontSize: 13, lineHeight: 19}}>
                Nenhum produto encontrado para esta busca.
              </Text>
            ) : null}
            {(Array.isArray(searchProducts) ? searchProducts : []).map(product => (
              <ShopMobileProductCard
                key={String(product?.id || product?.['@id'] || product?.product)}
                cart={cart}
                company={company}
                defaultCompany={defaultCompany}
                product={product}
                refreshCart={refreshCart}
              />
            ))}
          </View>
        ) : isLoadingCatalog && visibleCategories.length === 0 ? (
          [0, 1, 2].map(item => (
            <View key={`mobile-section-skeleton-${item}`} style={{gap: 12}}>
              <ShopSkeleton height={22} width="42%" theme={company} />
              <ShopSkeleton height={13} width="86%" theme={company} />
              <ShopSkeleton height={118} radius={18} theme={company} />
            </View>
          ))
        ) : (
          <ShopMobileProductSection
            cart={cart}
            category={resolvedActiveCategory}
            company={company}
            defaultCompany={defaultCompany}
            isLoading={isLoadingCatalog}
            isAllProducts={isAllProductsCatalog}
            isLoadingMore={isLoadingMoreProducts}
            products={products}
            refreshCart={refreshCart}
            totalProductsCount={productTotalItems}
          />
        )}
      </View>
    </ScrollView>
  );
}
