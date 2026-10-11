// fluxo: compra-fluxo | etapa: checkout-home-header
// wiki: https://github.com/ControleOnline/app-community/wiki/Smoke-Test-Flows
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  inlineStyle_121_10,
  inlineStyle_128_12,
  inlineStyle_135_14,
  inlineStyle_146_20,
  inlineStyle_155_20,
  inlineStyle_164_22,
  inlineStyle_175_20,
  inlineStyle_177_18,
  inlineStyle_180_20,
  inlineStyle_224_18,
  inlineStyle_228_18,
  inlineStyle_241_16,
  inlineStyle_255_12,
  inlineStyle_273_14,
  inlineStyle_282_14,
  inlineStyle_119_12,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopShell.styles';
import {
  mobileStoreActionsRowStyle,
  mobileStoreCardStyle,
  mobileStoreContentColumnStyle,
  mobileStoreCoverStyle,
  mobileStoreLogoFallbackStyle,
  mobileStoreLogoFallbackTextStyle,
  mobileStoreLogoStyle,
  mobileStoreMenuButtonStyle,
  mobileStoreNameStyle,
  mobileStorePanelStyle,
  mobileStoreSearchInputStyle,
  mobileStoreSearchStyle,
  mobileStoreSubtitleStyle,
  mobileStoreTextColumnStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader.styles';

const DEFAULT_SEARCH_PLACEHOLDER = 'Buscar produtos';
const HOME_LABEL = 'Abrir pagina inicial do shop';
const HOME_ACTION_LABEL = 'Voltar ao inicio do shop';
const MENU_LABEL = 'Abrir menu do shop';

const resolveHeaderFile = company =>
  company?.logo || company?.icon || company?.stamp || null;

export default function ShopMobileStoreHeader({
  company = null,
  title = '',
  subtitle = '',
  onOpenMenu = null,
  onNavigateHome = null,
  onSearch = null,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  searchValue = '',
  showHomeAction = false,
  showSearch = true,
  variant = 'mobile',
  menuIconName = 'menu',
}) {
  const {width} = useWindowDimensions();
  const isMobile = variant !== 'shell' ? true : width < 920;
  const theme = pickTheme(company);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const searchValueRef = useRef(String(searchValue || '').trim());
  const logoFile = resolveHeaderFile(company);
  const logoUrl = logoFile ? buildFileUrl(logoFile, company) : '';
  const headerTitle = String(title || '').trim();
  const headerSubtitle = String(subtitle || '').trim();
  const showHeaderText = Boolean(headerTitle || headerSubtitle);
  const headerCompanyName = company?.alias || company?.name || 'Empresa';

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  useEffect(() => {
    searchValueRef.current = String(searchValue || '').trim();
  }, [searchValue]);

  const submitSearch = useCallback(() => {
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

  const renderLogo = ({shell = false} = {}) => (
    <TouchableOpacity
      accessibilityLabel={HOME_LABEL}
      activeOpacity={0.9}
      onPress={onNavigateHome || undefined}>
      {logoUrl ? (
        <Image
          resizeMode="contain"
          source={{uri: logoUrl}}
          style={
            shell
              ? inlineStyle_146_20({isMobile})
              : mobileStoreLogoStyle({theme})
          }
        />
      ) : shell ? (
        <View
          style={
            isMobile
              ? inlineStyle_155_20({isMobile})
              : inlineStyle_155_20({isMobile})
          }>
          <Text style={inlineStyle_164_22({isMobile})}>
            {getInitials(headerCompanyName)}
          </Text>
        </View>
      ) : (
        <View style={mobileStoreLogoFallbackStyle({theme})}>
          <Text style={mobileStoreLogoFallbackTextStyle({theme})}>
            {getInitials(headerCompanyName)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderActionButton = ({
    iconName,
    label,
    onPress,
    shell = false,
    testID,
  }) => {
    const buttonStyle = shell
      ? inlineStyle_241_16({isMobile, theme})
      : mobileStoreMenuButtonStyle({theme});

    return (
      <TouchableOpacity
        accessibilityLabel={label}
        activeOpacity={0.9}
        onPress={onPress}
        style={buttonStyle}
        testID={testID}>
        <Icon
          name={iconName}
          size={shell ? 22 : 22}
          color={isMobile ? theme.primary : theme.onPrimary}
        />
      </TouchableOpacity>
    );
  };

  const renderShellHeader = () => (
    <View
      style={inlineStyle_119_12({theme})}
      testID="shop-canonical-header">
      <View
        style={inlineStyle_121_10({
          isMobile,
          shellPadding: isMobile ? 14 : 26,
        })}>
        {isMobile && showSearch ? (
          <View
            style={[
              inlineStyle_128_12({isMobile, showSearch}),
              {justifyContent: 'flex-start', gap: 8},
            ]}>
            {/* Compact shell contract: Home -> search -> menu on internal routes. */}
            {showHomeAction
              ? renderActionButton({
                  iconName: 'home',
                  label: HOME_ACTION_LABEL,
                  onPress: onNavigateHome,
                  shell: true,
                  testID: 'shop-home-action',
                })
              : renderLogo({shell: true})}
            <View style={{flex: 1, minWidth: 0}}>
              <View style={inlineStyle_282_14({isMobile, theme})}>
                <Icon name="search" size={20} color={theme.muted} />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={submitSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.muted}
                  style={inlineStyle_273_14({isMobile, theme})}
                  testID="shop-search-input"
                />
              </View>
            </View>
            {renderActionButton({
              iconName: menuIconName,
              label: MENU_LABEL,
              onPress: onOpenMenu,
              shell: true,
              testID: 'shop-menu-action',
            })}
          </View>
        ) : (
          <View
            style={[
              inlineStyle_128_12({isMobile, showSearch}),
              !showSearch && {
                justifyContent: 'center',
                position: 'relative',
              },
            ]}>
            {/* Left cluster: Home (internal pages only) + logo */}
            <View
              style={[
                inlineStyle_135_14,
                {flexDirection: 'row', alignItems: 'center', gap: 8},
              ]}>
              {showHomeAction
                ? renderActionButton({
                    iconName: 'home',
                    label: HOME_ACTION_LABEL,
                    onPress: onNavigateHome,
                    shell: true,
                    testID: 'shop-home-action',
                  })
                : null}
              {renderLogo({shell: true})}
            </View>

            {/* Right cluster: menu only (Home never sits to the right of search) */}
            {!showSearch ? (
              <View
                style={[
                  inlineStyle_224_18,
                  {
                    position: 'absolute',
                    right: 0,
                  },
                ]}>
                {renderActionButton({
                  iconName: menuIconName,
                  label: MENU_LABEL,
                  onPress: onOpenMenu,
                  shell: true,
                  testID: 'shop-menu-action',
                })}
              </View>
            ) : null}
          </View>
        )}

        {showSearch && !isMobile ? (
          <View style={inlineStyle_255_12({isMobile, theme})}>
            <View style={inlineStyle_282_14({isMobile, theme})}>
              <Icon
                name="search"
                size={20}
                color={isMobile ? theme.muted : 'rgba(255,255,255,0.75)'}
              />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={submitSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={
                  isMobile ? theme.muted : 'rgba(255,255,255,0.75)'
                }
                style={inlineStyle_273_14({isMobile, theme})}
                testID="shop-search-input"
              />
            </View>
            <View style={inlineStyle_224_18}>
              {renderActionButton({
                iconName: menuIconName,
                label: MENU_LABEL,
                onPress: onOpenMenu,
                shell: true,
                testID: 'shop-menu-action',
              })}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (variant === 'shell') {
    return renderShellHeader();
  }

  // Keep the complete compact header in one row even when the checkout
  // provides a title. Splitting actions below the search hides the Home
  // affordance from the compact header viewport.
  const isCompactMobileSearch = isMobile && showSearch;

  return (
    <View style={mobileStorePanelStyle}>
      <View style={mobileStoreCoverStyle({theme})}>{renderLogo()}</View>

      <View style={mobileStoreCardStyle({theme})}>
        {showHeaderText ? (
          <View style={mobileStoreTextColumnStyle}>
            {headerTitle ? (
              <Text style={mobileStoreNameStyle({theme})}>{headerTitle}</Text>
            ) : null}
            {headerSubtitle ? (
              <Text style={mobileStoreSubtitleStyle({theme})}>
                {headerSubtitle}
              </Text>
            ) : null}
          </View>
        ) : null}

        {isCompactMobileSearch ? (
          <View
            style={[
              mobileStoreContentColumnStyle,
              {flexDirection: 'row', alignItems: 'center', gap: 10},
            ]}>
            {/* Home stays on the left of search; menu alone on the right */}
            {showHomeAction
              ? renderActionButton({
                  iconName: 'home',
                  label: HOME_ACTION_LABEL,
                  onPress: onNavigateHome,
                })
              : null}
            <View style={[mobileStoreSearchStyle({theme}), {flex: 1}]}>
              <Icon name="search" size={19} color={theme.muted} />
              <TextInput
                onChangeText={setSearchTerm}
                onSubmitEditing={submitSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.muted}
                returnKeyType="search"
                style={mobileStoreSearchInputStyle({theme})}
                testID="shop-search-input"
                value={searchTerm}
              />
            </View>

            <View style={[mobileStoreActionsRowStyle, {marginTop: 0}]}>
              {renderActionButton({
                iconName: menuIconName,
                label: MENU_LABEL,
                onPress: onOpenMenu,
                testID: 'shop-menu-action',
              })}
            </View>
          </View>
        ) : (
          <View style={mobileStoreContentColumnStyle}>
            {showSearch ? (
              <View style={mobileStoreSearchStyle({theme})}>
                <Icon name="search" size={19} color={theme.muted} />
                <TextInput
                  onChangeText={setSearchTerm}
                  onSubmitEditing={submitSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.muted}
                  returnKeyType="search"
                  style={mobileStoreSearchInputStyle({theme})}
                  value={searchTerm}
                />
              </View>
            ) : null}

            <View
              style={[
                mobileStoreActionsRowStyle,
                {
                  flexDirection: 'row',
                  justifyContent: showHomeAction ? 'space-between' : 'flex-end',
                  width: '100%',
                },
              ]}>
              {showHomeAction
                ? renderActionButton({
                    iconName: 'home',
                    label: HOME_ACTION_LABEL,
                    onPress: onNavigateHome,
                  })
                : null}
              {renderActionButton({
                iconName: menuIconName,
                label: MENU_LABEL,
                onPress: onOpenMenu,
                testID: 'shop-menu-action',
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
