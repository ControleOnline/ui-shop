import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  buildFileUrl,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  getShopCategoryDescription,
  getShopCategoryFile,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  mobileCategoryModalCardStyle,
  mobileCategoryModalCloseStyle,
  mobileCategoryModalContentStyle,
  mobileCategoryModalHeaderStyle,
  mobileCategoryModalOptionCheckStyle,
  mobileCategoryModalOptionImageStyle,
  mobileCategoryModalOptionInfoStyle,
  mobileCategoryModalOptionStyle,
  mobileCategoryModalOptionSubtitleStyle,
  mobileCategoryModalOptionTitleStyle,
  mobileCategoryModalOverlayStyle,
  mobileCategoryModalTitleStyle,
  mobileCategoryTriggerCaptionStyle,
  mobileCategoryTriggerStyle,
  mobileCategoryTriggerTextStyle,
  mobileCategoryTriggerTextWrapStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileCategorySelector.styles';

export default function ShopMobileCategorySelector({
  activeCategoryId = '',
  categories = [],
  company = null,
  hasMoreCategories = false,
  isLoadingMoreCategories = false,
  onLoadMoreCategories = null,
  onSelect = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const theme = pickTheme(company);
  const activeCategory = useMemo(
    () =>
      categories.find(
        category =>
          String(category?.id || category?.['@id'] || '') ===
          String(activeCategoryId || ''),
      ) ||
      categories[0] ||
      null,
    [activeCategoryId, categories],
  );

  const handleScroll = useCallback(
    event => {
      if (!hasMoreCategories || isLoadingMoreCategories) {
        return;
      }

      const scrollY = Number(event?.nativeEvent?.contentOffset?.y || 0);
      const viewportHeight = Number(
        event?.nativeEvent?.layoutMeasurement?.height || 0,
      );
      const scrollContentHeight = Number(
        event?.nativeEvent?.contentSize?.height || 0,
      );

      if (
        viewportHeight > 0 &&
        scrollContentHeight > 0 &&
        scrollY + viewportHeight >= scrollContentHeight - 96
      ) {
        onLoadMoreCategories?.();
      }
    },
    [hasMoreCategories, isLoadingMoreCategories, onLoadMoreCategories],
  );

  useEffect(() => {
    if (!isOpen || !hasMoreCategories || isLoadingMoreCategories) {
      return;
    }

    if (listHeight > 0 && contentHeight > 0 && contentHeight <= listHeight + 72) {
      onLoadMoreCategories?.();
    }
  }, [
    contentHeight,
    hasMoreCategories,
    isLoadingMoreCategories,
    isOpen,
    listHeight,
    onLoadMoreCategories,
  ]);

  const handleSelect = category => {
    setIsOpen(false);
    onSelect?.(category);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsOpen(true)}
        style={mobileCategoryTriggerStyle({theme})}>
        <Icon name="restaurant-menu" size={20} color={theme.primary} />
        <View style={mobileCategoryTriggerTextWrapStyle}>
          <Text style={mobileCategoryTriggerCaptionStyle({theme})}>
            Categoria
          </Text>
          <Text numberOfLines={1} style={mobileCategoryTriggerTextStyle({theme})}>
            {activeCategory?.name || 'Todas'}
          </Text>
        </View>
        <Icon name="keyboard-arrow-down" size={22} color={theme.primary} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={mobileCategoryModalOverlayStyle}>
            <TouchableWithoutFeedback>
              <View style={mobileCategoryModalCardStyle({theme})}>
                <View style={mobileCategoryModalHeaderStyle}>
                  <Text style={mobileCategoryModalTitleStyle({theme})}>
                    Escolha uma categoria
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsOpen(false)}
                    style={mobileCategoryModalCloseStyle({theme})}>
                    <Icon name="close" size={20} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={mobileCategoryModalContentStyle}
                  onContentSizeChange={(_, height) =>
                    setContentHeight(height || 0)
                  }
                  onLayout={event =>
                    setListHeight(event?.nativeEvent?.layout?.height || 0)
                  }
                  onScroll={handleScroll}
                  scrollEventThrottle={80}>
                  {categories.map(category => {
                    const categoryId = String(
                      category?.id || category?.['@id'] || '',
                    );
                    const isActive =
                      String(activeCategoryId || '') === categoryId;
                    const categoryFile = getShopCategoryFile(category);
                    const imageUrl = categoryFile
                      ? buildFileUrl(categoryFile, company)
                      : '';

                    return (
                      <TouchableOpacity
                        key={categoryId}
                        activeOpacity={0.9}
                        onPress={() => handleSelect(category)}
                        style={mobileCategoryModalOptionStyle({
                          isActive,
                          theme,
                        })}>
                        {imageUrl ? (
                          <Image
                            resizeMode="cover"
                            source={{uri: imageUrl}}
                            style={mobileCategoryModalOptionImageStyle}
                          />
                        ) : null}

                        <View style={mobileCategoryModalOptionInfoStyle}>
                          <Text
                            numberOfLines={1}
                            style={mobileCategoryModalOptionTitleStyle({
                              isActive,
                              theme,
                            })}>
                            {category?.name || 'Categoria'}
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={mobileCategoryModalOptionSubtitleStyle({
                              theme,
                            })}>
                            {getShopCategoryDescription(category)}
                          </Text>
                        </View>

                        {isActive ? (
                          <View style={mobileCategoryModalOptionCheckStyle({theme})}>
                            <Icon name="check" size={16} color={theme.onPrimary} />
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}

                  {isLoadingMoreCategories ? (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 14,
                        gap: 10,
                      }}>
                      <ActivityIndicator color={theme.primary} />
                      <Text style={mobileCategoryModalOptionSubtitleStyle({theme})}>
                        Carregando mais categorias
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
