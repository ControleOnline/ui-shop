import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ShopMobileCategorySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCategorySelector';
import ShopMobileProductCard from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductCard';
import ShopMobileProductSection from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileProductSection';
import ShopMobileStoreHeader from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader';
import ShopSkeleton from '@controleonline/ui-shop/src/react/components/storefront/ShopSkeleton';
import {
  buildFileUrl,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryFile} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  mobileCatalogCategoryCardImageStyle,
  mobileCatalogCategoryCardStyle,
  mobileCatalogCategoryCardTextStyle,
  mobileCatalogCategoryListContentStyle,
  mobileCatalogCategoryStickyStyle,
  mobileCatalogControlsStyle,
  mobileCatalogRootStyle,
  mobileCatalogSearchInputStyle,
  mobileCatalogSearchStyle,
  mobileCatalogSearchWrapStyle,
  mobileCatalogSectionStackStyle,
  mobileCatalogSearchResultsStyle,
  mobileCatalogSearchResultsTitleStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCatalog.styles';

const getCategoryId = category => String(category?.id || category?.['@id'] || '');

export default function ShopMobileCatalog({
  activeCategoryId = '',
  cart = null,
  categories = [],
  company = null,
  defaultCompany = null,
  isLoadingCatalog = false,
  mode = 'default',
  onOpenMenu = null,
  onSearch = null,
  onSelectCategory = null,
  productsByCategoryId = {},
  refreshCart = null,
  searchProducts = [],
  searchValue = '',
}) {
  const theme = pickTheme(company);
  const scrollRef = useRef(null);
  const sectionPositionsRef = useRef({});
  const initialScrollDoneRef = useRef(false);
  const searchValueRef = useRef('');
  const [visibleCategoryId, setVisibleCategoryId] = useState(activeCategoryId);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const visibleCategories = useMemo(() => {
    const categoryList = Array.isArray(categories) ? categories : [];
    const loadedCategoryIds = Object.keys(productsByCategoryId || {});

    if (mode === 'search') {
      return [];
    }

    if (isLoadingCatalog || loadedCategoryIds.length === 0) {
      return categoryList;
    }

    return categoryList.filter(category => {
      const categoryId = getCategoryId(category);
      return (productsByCategoryId?.[categoryId] || []).length > 0;
    });
  }, [categories, isLoadingCatalog, mode, productsByCategoryId]);
  const visibleCategoryIdsKey = useMemo(
    () => visibleCategories.map(category => getCategoryId(category)).join('|'),
    [visibleCategories],
  );

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);
  useEffect(() => {
    searchValueRef.current = String(searchValue || '').trim();
  }, [searchValue]);

  useEffect(() => {
    if (visibleCategoryId || !activeCategoryId) {
      return;
    }

    setVisibleCategoryId(activeCategoryId);
  }, [activeCategoryId, visibleCategoryId]);

  useEffect(() => {
    if (mode === 'search' || visibleCategories.length === 0) {
      return;
    }

    const hasVisibleCategory = visibleCategories.some(
      category => getCategoryId(category) === String(visibleCategoryId || ''),
    );

    if (!hasVisibleCategory) {
      setVisibleCategoryId(getCategoryId(visibleCategories[0]));
    }
  }, [mode, visibleCategories, visibleCategoryId]);

  const scrollToCategory = useCallback(categoryId => {
    const y = sectionPositionsRef.current[categoryId];

    if (typeof y !== 'number') {
      return;
    }

    scrollRef.current?.scrollTo({
      y: Math.max(y - 120, 0),
      animated: true,
    });
  }, []);

  useEffect(() => {
    if (
      initialScrollDoneRef.current ||
      mode === 'search' ||
      !activeCategoryId ||
      !visibleCategoryIdsKey
    ) {
      return;
    }

    initialScrollDoneRef.current = true;
    setTimeout(() => scrollToCategory(activeCategoryId), 180);
  }, [activeCategoryId, mode, scrollToCategory, visibleCategoryIdsKey]);

  const handleSelectCategory = useCallback(
    category => {
      const categoryId = getCategoryId(category);

      if (!categoryId) {
        return;
      }

      setVisibleCategoryId(categoryId);
      onSelectCategory?.(category);
      setTimeout(() => scrollToCategory(categoryId), 80);
    },
    [onSelectCategory, scrollToCategory],
  );

  const handleSubmitSearch = useCallback(() => {
    const normalizedTerm = String(searchTerm || '').trim();
    if (normalizedTerm.length === 0 || normalizedTerm.length >= 3) {
      onSearch?.(normalizedTerm);
    }
  }, [onSearch, searchTerm]);

  useEffect(() => {
    if (!onSearch) {
      return undefined;
    }

    const normalizedTerm = String(searchTerm || '').trim();
    const currentSearchValue = searchValueRef.current;
    if (normalizedTerm.length > 0 && normalizedTerm.length < 3) {
      if (currentSearchValue) {
        const timeoutId = setTimeout(() => onSearch(''), 250);
        return () => clearTimeout(timeoutId);
      }
      return undefined;
    }

    if (normalizedTerm === currentSearchValue) {
      return undefined;
    }

    const timeoutId = setTimeout(() => onSearch(normalizedTerm), 300);
    return () => clearTimeout(timeoutId);
  }, [onSearch, searchTerm]);

  const handleScroll = useCallback(event => {
    const scrollY = Number(event?.nativeEvent?.contentOffset?.y || 0);
    const categoryEntries = Object.entries(sectionPositionsRef.current)
      .filter(([, y]) => typeof y === 'number')
      .sort((left, right) => left[1] - right[1]);
    const currentEntry = categoryEntries
      .filter(([, y]) => y <= scrollY + 170)
      .pop();

    if (currentEntry?.[0]) {
      setVisibleCategoryId(currentEntry[0]);
    }
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={80}
      stickyHeaderIndices={[1]}
      style={mobileCatalogRootStyle({theme})}>
      <ShopMobileStoreHeader
        categories={visibleCategories}
        company={company}
        onOpenMenu={onOpenMenu}
      />

      {isLoadingCatalog && visibleCategories.length === 0 ? (
        <View style={mobileCatalogCategoryStickyStyle({theme})}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mobileCatalogCategoryListContentStyle}>
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
      ) : visibleCategories.length > 0 ? (
        <View style={mobileCatalogCategoryStickyStyle({theme})}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mobileCatalogCategoryListContentStyle}>
            {visibleCategories.map(category => {
              const categoryId = getCategoryId(category);
              const isActive = String(visibleCategoryId || '') === categoryId;
              const categoryFile = getShopCategoryFile(category);
              const imageUrl = categoryFile
                ? buildFileUrl(categoryFile, company)
                : '';

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
          </ScrollView>
        </View>
      ) : null}

      <View style={mobileCatalogControlsStyle({theme})}>
        <View style={mobileCatalogSearchWrapStyle}>
          <View style={mobileCatalogSearchStyle({theme})}>
            <Icon name="search" size={19} color={theme.muted} />
            <TextInput
              onChangeText={setSearchTerm}
              onSubmitEditing={handleSubmitSearch}
              placeholder="Buscar produtos no cardapio"
              placeholderTextColor={theme.muted}
              returnKeyType="search"
              style={mobileCatalogSearchInputStyle({theme})}
              value={searchTerm}
            />
          </View>
        </View>

        {visibleCategories.length > 0 ? (
          <ShopMobileCategorySelector
            activeCategoryId={visibleCategoryId || activeCategoryId}
            categories={visibleCategories}
            company={company}
            onSelect={handleSelectCategory}
          />
        ) : null}
      </View>

      <View style={mobileCatalogSectionStackStyle}>
        {mode === 'search' ? (
          <View style={mobileCatalogSearchResultsStyle({theme})}>
            <Text style={mobileCatalogSearchResultsTitleStyle({theme})}>
              Produtos encontrados
            </Text>
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
          visibleCategories.map(category => {
            const categoryId = getCategoryId(category);

            return (
              <View
                key={categoryId}
                onLayout={event => {
                  sectionPositionsRef.current[categoryId] =
                    event?.nativeEvent?.layout?.y || 0;
                }}>
                <ShopMobileProductSection
                  cart={cart}
                  category={category}
                  company={company}
                  defaultCompany={defaultCompany}
                  isLoading={isLoadingCatalog}
                  products={productsByCategoryId?.[categoryId] || []}
                  refreshCart={refreshCart}
                />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
