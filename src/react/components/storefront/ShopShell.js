import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import md5 from 'md5';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useStore} from '@store';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import ShopHomeEntryControls from '@controleonline/ui-shop/src/react/components/storefront/ShopHomeEntryControls';
import ShopMobileStoreHeader from '@controleonline/ui-shop/src/react/components/storefront/ShopMobileStoreHeader';

import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
  SHOP_HOME_OPTION_LOYALTY,
  SHOP_HOME_OPTION_SALES,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

import {
  inlineStyle_118_10,
  inlineStyle_214_18,
  inlineStyle_345_10,
  inlineStyle_358_12,
  inlineStyle_369_18,
  inlineStyle_370_20,
  inlineStyle_372_18,
  inlineStyle_381_18,
  inlineStyle_388_20,
  inlineStyle_398_18,
  inlineStyle_399_24,
  inlineStyle_409_18,
  inlineStyle_410_24,
  inlineStyle_420_18,
  inlineStyle_421_24,
  inlineStyle_431_18,
  inlineStyle_432_24,
  inlineStyle_438_18,
  inlineStyle_444_24,
  inlineStyle_445_26,
  inlineStyle_447_22,
  inlineStyle_460_16,
  inlineStyle_468_16,
  inlineStyle_473_18,
  inlineStyle_485_22,
  inlineStyle_490_22,
  inlineStyle_497_18,
  inlineStyle_531_18,
  inlineStyle_538_24,
} from './ShopShell.styles';

const SALES_FLOW_ROUTE_NAMES = new Set([
  'ShopIndex',
  'ShopSearchPage',
  'ShopCategoryPage',
  'ShopProductPage',
]);

const HOME_ENTRY_ROUTE_NAMES = new Set([
  'ShopIndex',
  'ShopFranchiseLocatorPage',
  'ShopLoyaltyPage',
]);

const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem('session') || '{}');
  } catch {
    return {};
  }
};

const getAvatarUrl = user => {
  if (user?.avatar) return buildFileUrl(user.avatar);
  if (!user?.email) return '';
  return `https://www.gravatar.com/avatar/${md5(String(user.email).trim().toLowerCase())}?s=200&d=identicon`;
};

export default function ShopShell({
  children,
  hideHeader = false,
  searchValue = '',
  onSearch,
  showSalesShortcuts = true,
  showBottomCart = null,
  activeHomeEntry = '',
  showHomeEntryControls = false,
  showSearch = true,
  searchPlaceholder = 'Busque pratos, bebidas ou categorias',
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const isMobile = width < 920;

  const authStore = useStore('auth');
  const {defaultCompany, requiresCompanySelection, salesCompany} = useShopCart();
  const {
    bottomBarEnabled,
    companyConfigs,
    homeEntries,
    loyaltyCouponsEnabled,
    primaryEntryRouteName,
    salesPageEnabled,
  } = useShopSettings();

  const {isLogged, user} = authStore.getters;
  const authActions = authStore.actions;

  const theme = pickTheme(salesCompany || defaultCompany);
  const effectiveCompanyConfigs = useMemo(() => {
    if (salesCompany?.configs && typeof salesCompany.configs === 'object') {
      return salesCompany.configs;
    }
    return companyConfigs || {};
  }, [companyConfigs, salesCompany?.configs]);
  const cardRegistrationEnabled = Boolean(effectiveCompanyConfigs?.['asaas-key']);
  const canShowSalesShortcuts = showSalesShortcuts && salesPageEnabled;

  const [accountOpen, setAccountOpen] = useState(false);

  useLayoutEffect(() => {
    if (typeof showBottomCart !== 'boolean') {
      return;
    }

    navigation.setParams({showBottomCart});
  }, [navigation, showBottomCart]);

  const session = getSession();
  const accountUser = user && Object.keys(user).length > 0 ? user : session;
  const avatarUrl = getAvatarUrl(accountUser);
  const isSalesContext =
    activeHomeEntry === SHOP_HOME_OPTION_SALES ||
    SALES_FLOW_ROUTE_NAMES.has(route?.name);
  const displayName = String(
    accountUser?.realname ||
      accountUser?.name ||
      accountUser?.username ||
      'Usuario',
  ).trim();
  const displayCompany =
    requiresCompanySelection && isSalesContext
      ? 'selecione uma unidade'
      : salesCompany?.alias ||
        salesCompany?.name ||
        defaultCompany?.alias ||
        defaultCompany?.name ||
        'Empresa';
  const purchaseCompanyLabel = displayCompany;
  const headerCompany = salesCompany || defaultCompany || null;

  const shellBackground = theme.background;
  const surface = theme.surface;
  const foreground = theme.text;
  const muted = theme.muted;
  const menuPalette = {
    buttonBackground: theme.buttonBackground,
    buttonText: theme.buttonText,
    dividerBorder: theme.dividerBorder,
    modalBackground: theme.modalBackground,
    modalHeaderText: theme.modalHeaderText,
    modalOverlay: theme.modalOverlay,
    modalShadow: theme.modalShadow,
    modalText: theme.modalText,
    textMuted: theme.textMuted,
  };

  const routeActiveHomeEntry = useMemo(() => {
    if (route?.name === 'ShopFranchiseLocatorPage') {
      return SHOP_HOME_OPTION_FRANCHISE_LOCATOR;
    }

    if (route?.name === 'ShopLoyaltyPage') {
      return SHOP_HOME_OPTION_LOYALTY;
    }

    if (SALES_FLOW_ROUTE_NAMES.has(route?.name)) {
      return SHOP_HOME_OPTION_SALES;
    }

    return '';
  }, [route?.name]);
  const resolvedActiveHomeEntry = activeHomeEntry || routeActiveHomeEntry;
  const resolvedActiveEntryLabel = useMemo(() => {
    return (
      homeEntries.find(entry => entry.key === resolvedActiveHomeEntry)?.label || ''
    );
  }, [homeEntries, resolvedActiveHomeEntry]);
  const headerTitle = useMemo(() => {
    const baseName = String(purchaseCompanyLabel || '').trim();
    const sectionName = String(resolvedActiveEntryLabel || '').trim();
    const isLoyaltyHeader = resolvedActiveHomeEntry === SHOP_HOME_OPTION_LOYALTY;

    if (!baseName) return sectionName;
    if (!sectionName) return baseName;
    if (isLoyaltyHeader) return baseName;

    const normalizedBase = baseName.toLowerCase();
    const normalizedSection = sectionName.toLowerCase();
    if (
      normalizedBase === normalizedSection ||
      normalizedBase.endsWith(` - ${normalizedSection}`) ||
      normalizedBase.endsWith(`: ${normalizedSection}`)
    ) {
      return baseName;
    }

    return `${baseName} - ${sectionName}`;
  }, [purchaseCompanyLabel, resolvedActiveEntryLabel, resolvedActiveHomeEntry]);
  const isHomeEntryRoute = HOME_ENTRY_ROUTE_NAMES.has(route?.name);
  const showHomeAction =
    !isHomeEntryRoute && route?.name !== primaryEntryRouteName;
  const menuIconName = isHomeEntryRoute ? 'menu' : 'account-circle';
  const showConfiguredBottomBar =
    showHomeEntryControls && bottomBarEnabled && homeEntries.length > 1;
  const bottomBarOffset = showBottomCart === true ? 88 : 18;
  const publicHomeRouteName =
    homeEntries.find(entry => entry.routeName !== 'ShopLoyaltyPage')?.routeName ||
    'HomePage';

  const handleSelectHomeEntry = useCallback(
    entry => {
      if (!entry?.routeName || entry.routeName === route?.name) {
        return;
      }

      navigation.navigate(entry.routeName);
    },
    [navigation, route?.name],
  );

  const handleNavigateHome = useCallback(() => {
    const targetRoute =
      homeEntries.find(entry => entry.key === resolvedActiveHomeEntry)
        ?.routeName ||
      primaryEntryRouteName ||
      'ShopIndex';

    if (targetRoute === route?.name) {
      return;
    }

    navigation.navigate(targetRoute);
  }, [
    homeEntries,
    navigation,
    primaryEntryRouteName,
    resolvedActiveHomeEntry,
    route?.name,
  ]);

  const navigateToSignIn = useCallback(
    () =>
      navigation.navigate('SignInPage', {
        redirectRoute: route?.name || primaryEntryRouteName || 'HomePage',
      }),
    [navigation, primaryEntryRouteName, route?.name],
  );

  const openAccountMenu = useCallback(() => {
    setAccountOpen(true);
  }, []);

  return (
    <View style={inlineStyle_118_10({
      shellBackground: shellBackground,
    })}>
      {!hideHeader && (
        <ShopMobileStoreHeader
          company={headerCompany}
          menuIconName={menuIconName}
          onNavigateHome={handleNavigateHome}
          onOpenMenu={openAccountMenu}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          showHomeAction={showHomeAction}
          showSearch={showSearch}
          title={headerTitle}
          variant="shell"
        />
      )}
      {children({
        foreground,
        openAccountMenu,
        surface,
        theme,
      })}
      <ShopHomeEntryControls
        activeEntryKey={resolvedActiveHomeEntry}
        bottomOffset={bottomBarOffset}
        entries={homeEntries}
        onSelect={handleSelectHomeEntry}
        showBottomBar={showConfiguredBottomBar}
        showTopControl={false}
        theme={theme}
      />
      <Modal visible={accountOpen} transparent animationType="fade">
        <TouchableOpacity
          style={inlineStyle_345_10({
            isMobile: isMobile,
            menuPalette: menuPalette,
          })}
          activeOpacity={1}
          onPress={() => setAccountOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={inlineStyle_358_12({
              isMobile: isMobile,
              menuPalette: menuPalette,
            })}>
            <View style={inlineStyle_369_18({
              isMobile: isMobile,
            })}>
              <View style={inlineStyle_370_20({
                isMobile: isMobile,
              })}>
                <Text
                  style={inlineStyle_372_18({
                    menuPalette: menuPalette,
                  })}>
                  Menu
                </Text>

                {homeEntries.map(entry => (
                  <TouchableOpacity
                    key={entry.key}
                    onPress={() => {
                      setAccountOpen(false);
                      handleSelectHomeEntry(entry);
                    }}
                    style={inlineStyle_381_18}>
                    <Icon
                      name={entry.iconName}
                      size={22}
                      color={menuPalette.modalText}
                    />
                    <Text
                      style={inlineStyle_388_20({
                        menuPalette: menuPalette,
                      })}>
                      {entry.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                {isLogged && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopProfilePage');
                    }}
                    style={inlineStyle_381_18}>
                    <Icon name="face" size={22} color={menuPalette.modalText} />
                    <Text
                      style={inlineStyle_388_20({
                        menuPalette: menuPalette,
                      })}>
                      Meu Perfil
                    </Text>
                  </TouchableOpacity>
                )}

                {isLogged && salesPageEnabled && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopOrdersPage');
                    }}
                    style={inlineStyle_398_18}>
                    <Text style={inlineStyle_399_24({
                      menuPalette: menuPalette,
                    })}>
                      Meus Pedidos
                    </Text>
                  </TouchableOpacity>
                )}

                {canShowSalesShortcuts && cardRegistrationEnabled && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopCartPage');
                    }}
                    style={inlineStyle_409_18}>
                    <Text style={inlineStyle_410_24({
                      menuPalette: menuPalette,
                    })}>
                      Carrinho
                    </Text>
                  </TouchableOpacity>
                )}

                {canShowSalesShortcuts && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopCheckoutPage');
                    }}
                    style={inlineStyle_420_18}>
                    <Text style={inlineStyle_421_24({
                      menuPalette: menuPalette,
                    })}>
                      Pagamento e Pix
                    </Text>
                  </TouchableOpacity>
                )}

                {canShowSalesShortcuts && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopCardsPage');
                    }}
                    style={inlineStyle_431_18}>
                    <Text style={inlineStyle_432_24({
                      menuPalette: menuPalette,
                    })}>
                      Meus Cartões
                    </Text>
                  </TouchableOpacity>
                )}

                {loyaltyCouponsEnabled && !homeEntries.some(entry => entry.routeName === 'ShopLoyaltyPage') && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('ShopLoyaltyPage');
                    }}
                    style={inlineStyle_431_18}>
                    <Text style={inlineStyle_432_24({
                      menuPalette: menuPalette,
                    })}>
                      Fidelidade
                    </Text>
                  </TouchableOpacity>
                )}

                <View
                  style={inlineStyle_438_18}>
                  <Icon
                    name="g-translate"
                    size={22}
                    color={menuPalette.modalText}
                  />
                  <View style={inlineStyle_444_24}>
                    <Text style={inlineStyle_445_26({
                      menuPalette: menuPalette,
                    })}>Idioma</Text>
                    <Text
                      style={inlineStyle_447_22({
                        menuPalette: menuPalette,
                      })}>
                      {JSON.parse(localStorage.getItem('config') || '{}')
                        ?.language || 'Pt-BR'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={inlineStyle_460_16({
                  isMobile: isMobile,
                  menuPalette: menuPalette,
                })}
              />

              <View
                style={inlineStyle_468_16({
                  isMobile: isMobile,
                })}>
                <View
                  style={inlineStyle_473_18({
                    menuPalette: menuPalette,
                  })}>
                  {avatarUrl ? (
                    <Image
                      source={{uri: avatarUrl}}
                      style={inlineStyle_485_22}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={inlineStyle_490_22({
                        menuPalette: menuPalette,
                      })}>
                      {getInitials(displayName)}
                    </Text>
                  )}
                </View>

                <Text
                  style={inlineStyle_497_18({
                    menuPalette: menuPalette,
                  })}>
                  {displayName}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    if (isLogged) {
                      authActions.logOut();
                      navigation.reset({
                        index: 0,
                        routes: [{name: publicHomeRouteName}],
                      });
                      return;
                    }
                    navigateToSignIn();
                  }}
                  style={inlineStyle_531_18({
                    menuPalette: menuPalette,
                  })}>
                  <Text style={inlineStyle_538_24({
                    menuPalette: menuPalette,
                  })}>
                    {isLogged ? 'Sair' : 'Entrar'}
                  </Text>
                </TouchableOpacity>
                {!isLogged && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccountOpen(false);
                      navigation.navigate('CreateAccount', {
                        redirectRoute:
                          route?.name || primaryEntryRouteName || 'HomePage',
                      });
                    }}
                    style={inlineStyle_531_18({
                      menuPalette: menuPalette,
                    })}>
                    <Text style={inlineStyle_538_24({
                      menuPalette: menuPalette,
                    })}>Criar conta</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
