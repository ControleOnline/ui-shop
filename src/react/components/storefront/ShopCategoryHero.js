import React from 'react';
import {Image, Text, View, useWindowDimensions} from 'react-native';

import {buildFileUrl} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  getShopCategoryDescription,
  getShopCategoryFile,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {
  categoryHeroCardStyle,
  categoryHeroImageStyle,
  categoryHeroContentStyle,
  categoryHeroEyebrowStyle,
  categoryHeroTitleStyle,
  categoryHeroDescriptionStyle,
  categoryHeroMetaRowStyle,
  categoryHeroMetaChipStyle,
  categoryHeroMetaTextStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopCategoryHero.styles';

// Show the current context so the user always knows where they are in the menu.
export default function ShopCategoryHero({
  category = null,
  company = null,
  mode = 'default',
  productsCount = 0,
  categoriesCount = 0,
  query = '',
}) {
  const {width} = useWindowDimensions();
  const isCompact = width < 1040;
  const categoryFile = getShopCategoryFile(category);
  const imageUrl = categoryFile ? buildFileUrl(categoryFile, company) : '';
  const title =
    mode === 'search'
      ? query
        ? `Resultados para "${query}"`
        : 'Busque no cardapio'
      : category?.name || 'Categoria';
  const description =
    mode === 'search'
      ? query
        ? `${productsCount} produto(s) e ${categoriesCount} categoria(s) encontrados.`
        : 'Use a busca para encontrar itens do cardapio sem sair da tela principal.'
      : getShopCategoryDescription(category);

  return (
    <View
      style={categoryHeroCardStyle({
        compact: isCompact,
        hasImage: !!imageUrl,
        theme: company,
      })}>
      {imageUrl ? (
        <Image
          source={{uri: imageUrl}}
          resizeMode="cover"
          style={categoryHeroImageStyle({
            compact: isCompact,
          })}
        />
      ) : null}

      <View style={categoryHeroContentStyle}>
        <Text
          style={categoryHeroEyebrowStyle({
            theme: company,
          })}>
          {mode === 'search' ? 'BUSCA' : 'CATEGORIA ATIVA'}
        </Text>
        <Text
          style={categoryHeroTitleStyle({
            theme: company,
          })}>
          {title}
        </Text>
        <Text
          style={categoryHeroDescriptionStyle({
            theme: company,
          })}>
          {description}
        </Text>

        <View style={categoryHeroMetaRowStyle}>
          <View
            style={categoryHeroMetaChipStyle({
              theme: company,
            })}>
            <Text
              style={categoryHeroMetaTextStyle({
                theme: company,
              })}>
              {productsCount} item(ns)
            </Text>
          </View>
          {mode !== 'search' && category?.name ? (
            <View
              style={categoryHeroMetaChipStyle({
                theme: company,
              })}>
              <Text
                style={categoryHeroMetaTextStyle({
                  theme: company,
                })}>
                Produtos da categoria
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
