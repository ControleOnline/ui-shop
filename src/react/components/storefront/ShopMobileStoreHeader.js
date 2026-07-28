import React, {useMemo} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryFile} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {resolveShopSalesCompanyAddress} from '@controleonline/ui-shop/src/react/utils/shopSalesCompany';
import {
  mobileStoreCardStyle,
  mobileStoreCoverImageStyle,
  mobileStoreCoverStyle,
  mobileStoreLogoFallbackTextStyle,
  mobileStoreLogoFallbackStyle,
  mobileStoreLogoStyle,
  mobileStoreMetaPillStyle,
  mobileStoreMetaPillTextStyle,
  mobileStoreMetaRowStyle,
  mobileStoreNameStyle,
  mobileStoreMenuButtonStyle,
  mobileStorePanelStyle,
  mobileStoreSubtitleStyle,
  mobileStoreTextColumnStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader.styles';

const isColorValue = value =>
  typeof value === 'string' &&
  (/^#([0-9a-f]{3,8})$/i.test(value.trim()) ||
    /^rgba?\(/i.test(value.trim()) ||
    /^hsla?\(/i.test(value.trim()));

const isImageCandidate = value =>
  Boolean(value) && (typeof value !== 'string' || !isColorValue(value));

const resolveCompanyCoverUrl = company => {
  const coverCandidate =
    company?.theme?.background ||
    company?.background ||
    company?.cover ||
    company?.banner;

  return isImageCandidate(coverCandidate)
    ? buildFileUrl(coverCandidate, company)
    : '';
};

const resolveCategoryCoverUrl = (company, categories) => {
  const firstCategoryFile = categories
    .map(category => getShopCategoryFile(category))
    .find(Boolean);

  return firstCategoryFile ? buildFileUrl(firstCategoryFile, company) : '';
};

const resolveCoverSource = (company, categories) => {
  const coverUrl = resolveCompanyCoverUrl(company);

  if (coverUrl) {
    return {uri: coverUrl};
  }

  const categoryCoverUrl = resolveCategoryCoverUrl(company, categories);

  return categoryCoverUrl ? {uri: categoryCoverUrl} : null;
};

export default function ShopMobileStoreHeader({
  categories = [],
  company = null,
  onOpenMenu = null,
}) {
  const theme = pickTheme(company);
  const coverSource = useMemo(
    () => resolveCoverSource(company, categories),
    [categories, company],
  );
  const logoUrl = company?.logo ? buildFileUrl(company.logo, company) : '';
  const address = resolveShopSalesCompanyAddress(company);
  const storeName = company?.alias || company?.name || 'Loja';
  const storeSubtitle =
    address.primary || address.secondary || 'Cardapio digital';

  return (
    <View style={mobileStorePanelStyle}>
      {coverSource ? (
        <View style={mobileStoreCoverStyle({theme})}>
          <Image
            resizeMode="cover"
            source={coverSource}
            style={mobileStoreCoverImageStyle}
          />
        </View>
      ) : null}

      <View style={mobileStoreCardStyle({hasCover: Boolean(coverSource), theme})}>
        {logoUrl ? (
          <Image
            resizeMode="cover"
            source={{uri: logoUrl}}
            style={mobileStoreLogoStyle({theme})}
          />
        ) : (
          <View style={mobileStoreLogoFallbackStyle({theme})}>
            <Text style={mobileStoreLogoFallbackTextStyle({theme})}>
              {getInitials(storeName)}
            </Text>
          </View>
        )}

        <View style={mobileStoreTextColumnStyle}>
          <Text numberOfLines={1} style={mobileStoreNameStyle({theme})}>
            {storeName}
          </Text>
          <Text numberOfLines={2} style={mobileStoreSubtitleStyle({theme})}>
            {storeSubtitle}
          </Text>

          <View style={mobileStoreMetaRowStyle}>
            <View style={mobileStoreMetaPillStyle({theme})}>
              <Text style={mobileStoreMetaPillTextStyle({theme})}>
                Compras
              </Text>
            </View>
            <View style={mobileStoreMetaPillStyle({theme})}>
              <Text style={mobileStoreMetaPillTextStyle({theme})}>
                Cardapio
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenMenu}
          style={mobileStoreMenuButtonStyle({theme})}>
          <Icon name="menu" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
