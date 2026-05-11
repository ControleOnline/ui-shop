import React, {useMemo} from 'react';
import {Image, Text, View} from 'react-native';

import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {getShopCategoryFile} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import {resolveShopSalesCompanyAddress} from '@controleonline/ui-shop/src/react/utils/shopSalesCompany';
import {
  mobileStoreCardStyle,
  mobileStoreCoverFallbackTextStyle,
  mobileStoreCoverImageStyle,
  mobileStoreCoverStyle,
  mobileStoreLogoFallbackTextStyle,
  mobileStoreLogoFallbackStyle,
  mobileStoreLogoStyle,
  mobileStoreMetaPillStyle,
  mobileStoreMetaPillTextStyle,
  mobileStoreMetaRowStyle,
  mobileStoreNameStyle,
  mobileStorePanelStyle,
  mobileStoreSubtitleStyle,
  mobileStoreTextColumnStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader.styles';

const gyrosDeliveryCoverPreview = require('@controleonline/ui-shop/src/react/assets/storefront/gyros-combos-cover-mobile.png');

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

const isGyrosCompany = company => {
  const companyIdentity = [
    company?.alias,
    company?.name,
    company?.domain,
    company?.appDomain,
    company?.app_domain,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return companyIdentity.includes('gyros');
};

const resolveCoverSource = (company, categories) => {
  if (isGyrosCompany(company)) {
    return gyrosDeliveryCoverPreview;
  }

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
      <View style={mobileStoreCoverStyle({theme})}>
        {coverSource ? (
          <Image
            resizeMode="cover"
            source={coverSource}
            style={mobileStoreCoverImageStyle}
          />
        ) : (
          <Text style={mobileStoreCoverFallbackTextStyle({theme})}>
            {storeName}
          </Text>
        )}
      </View>

      <View style={mobileStoreCardStyle({theme})}>
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
      </View>
    </View>
  );
}
