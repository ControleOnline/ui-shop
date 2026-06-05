import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  buildFileUrl,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  getShopCategoryDescription,
  getShopCategoryFile,
  getTopLevelShopCategories,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  sidebarPanelStyle,
  sidebarHeaderStyle,
  sidebarTitleStyle,
  sidebarHintStyle,
  sidebarCountBadgeStyle,
  sidebarToggleButtonStyle,
  sidebarListStyle,
  sidebarItemStyle,
  sidebarItemContentStyle,
  sidebarThumbStyle,
  sidebarNameStyle,
  sidebarDescriptionStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopCategorySidebar.styles';

// Render the richer category navigation used in desktop and wide tablet experiences.
export default function ShopCategorySidebar({
  categories = [],
  activeCategoryId = '',
  compact = false,
  company = null,
  onSelect = null,
  onToggleCompact = null,
}) {
  return (
    <View
      style={sidebarPanelStyle({
        compact,
        theme: company,
      })}>
      <View style={sidebarHeaderStyle}>
        <View style={sidebarItemContentStyle}>
          <Text
            numberOfLines={1}
            style={sidebarTitleStyle({
              theme: company,
            })}>
            Categorias
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onToggleCompact}
          style={sidebarToggleButtonStyle({
            theme: company,
          })}>
          <Icon
            color={company?.theme?.colors?.primary || '#0E7490'}
            name={compact ? 'keyboard-double-arrow-right' : 'keyboard-double-arrow-left'}
            size={18}
          />
        </TouchableOpacity>
      </View>

      <View style={sidebarListStyle}>
        <View
          style={sidebarCountBadgeStyle({
            theme: company,
          })}>
          <Text
            style={sidebarHintStyle({
              theme: company,
            })}>
            {categories.length} categoria(s)
          </Text>
        </View>

        {getTopLevelShopCategories(categories).map(category => {
          const categoryId = String(category?.id || category?.['@id'] || '');
          const categoryFile = getShopCategoryFile(category);
          const categoryImageUrl = categoryFile
            ? buildFileUrl(categoryFile, company)
            : '';
          const isActive = String(activeCategoryId || '') === categoryId;

          return (
            <TouchableOpacity
              key={categoryId}
              activeOpacity={0.92}
              onPress={() => onSelect?.(category)}
              style={sidebarItemStyle({
                compact,
                isActive,
                theme: company,
              })}>
              {categoryImageUrl ? (
                <Image
                  source={{uri: categoryImageUrl}}
                  resizeMode="cover"
                  style={sidebarThumbStyle({
                    compact,
                  })}
                />
              ) : null}

              <View style={sidebarItemContentStyle}>
                <Text
                  numberOfLines={compact ? 2 : 1}
                  style={sidebarNameStyle({
                    isActive,
                    theme: company,
                  })}>
                  {category?.name || 'Categoria'}
                </Text>
                {!compact ? (
                  <Text
                    numberOfLines={2}
                    style={sidebarDescriptionStyle({
                      theme: company,
                    })}>
                    {getShopCategoryDescription(category)}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
