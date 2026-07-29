import React, {useState} from 'react';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  mobileStoreCardStyle,
  mobileStoreCoverStyle,
  mobileStoreLogoFallbackTextStyle,
  mobileStoreLogoFallbackStyle,
  mobileStoreLogoStyle,
  mobileStoreMenuButtonStyle,
  mobileStorePanelStyle,
  mobileStoreSearchInputStyle,
  mobileStoreSearchStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader.styles';

export default function ShopMobileStoreHeader({
  company = null,
  onOpenMenu = null,
  onSearch = null,
  searchValue = '',
}) {
  const theme = pickTheme(company);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const logoUrl = company?.logo ? buildFileUrl(company.logo, company) : '';
  const storeName = company?.alias || company?.name || 'Loja';

  const submitSearch = () => {
    const normalizedTerm = String(searchTerm || '').trim();
    if (normalizedTerm.length === 0 || normalizedTerm.length >= 3) {
      onSearch?.(normalizedTerm);
    }
  };

  return (
    <View style={mobileStorePanelStyle}>
      <View style={mobileStoreCoverStyle({theme})}>
        {logoUrl ? (
          <Image
            resizeMode="contain"
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
      </View>

      <View style={mobileStoreCardStyle({theme})}>
        <View style={mobileStoreSearchStyle({theme})}>
          <Icon name="search" size={19} color={theme.muted} />
          <TextInput
            onChangeText={setSearchTerm}
            onSubmitEditing={submitSearch}
            placeholder="Buscar produtos"
            placeholderTextColor={theme.muted}
            returnKeyType="search"
            style={mobileStoreSearchInputStyle({theme})}
            value={searchTerm}
          />
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
