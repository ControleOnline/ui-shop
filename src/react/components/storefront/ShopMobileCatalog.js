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
  mobileCatalogControlsStyle,
  mobileCatalogRootStyle,
  mobileCatalogSearchButtonStyle,
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
  categories = [],
  company = null,
  isLoadingCatalog = false,
  mode = 'default',
  onSearch = null,
  onSelectCategory = null,
  productsByCategoryId = {},
  searchProducts = [],
  searchValue = '',
}) {
  const theme = pickTheme(company);
  const scrollRef = useRef(null);
  const sectionPositionsRef = useRef({});
  const initialScrollDoneRef = useRef(false);
  const [visibleCategoryId, setVisibleCategoryId] = useState(activeCategoryId);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const categoryIdsWithProducts = useMemo(
    () => Object.keys(productsByCategoryId || {}).join('|'),
    [productsByCategoryId],
  );

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (visibleCategoryId || !activeCategoryId) {
      return;
    }

    setVisibleCategoryId(activeCategoryId);
  }, [activeCategoryId, visibleCategoryId]);

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
      !categoryIdsWithProducts
    ) {
      return;
    }

    initialScrollDoneRef.current = true;
    setTimeout(() => scrollToCategory(activeCategoryId), 180);
  }, [activeCategoryId, categoryIdsWithProducts, mode, scrollToCategory]);

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
    onSearch?.(String(searchTerm || '').trim());
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
      style={mobileCatalogRootStyle({theme})}>
      <ShopMobileStoreHeader categories={categories} company={company} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mobileCatalogCategoryListContentStyle}>
        {categories.map(category => {
          const categoryId = getCategoryId(category);
          const isActive = String(visibleCategoryId || '') === categoryId;
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
      </ScrollView>

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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmitSearch}
              style={mobileCatalogSearchButtonStyle({theme})}>
              <Icon name="arrow-forward" size={17} color={theme.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ShopMobileCategorySelector
          activeCategoryId={visibleCategoryId || activeCategoryId}
          categories={categories}
          company={company}
          onSelect={handleSelectCategory}
        />
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
                company={company}
                product={product}
              />
            ))}
          </View>
        ) : (
          categories.map(category => {
            const categoryId = getCategoryId(category);

            return (
              <View
                key={categoryId}
                onLayout={event => {
                  sectionPositionsRef.current[categoryId] =
                    event?.nativeEvent?.layout?.y || 0;
                }}>
                <ShopMobileProductSection
                  category={category}
                  company={company}
                  isLoading={isLoadingCatalog}
                  products={productsByCategoryId?.[categoryId] || []}
                />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
