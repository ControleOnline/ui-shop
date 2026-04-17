import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import md5 from 'md5';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';

import {
  buildFileUrl,
  getHost,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

import {
  inlineStyle_118_10,
  inlineStyle_119_12,
  inlineStyle_121_10,
  inlineStyle_128_12,
  inlineStyle_135_14,
  inlineStyle_146_20,
  inlineStyle_155_20,
  inlineStyle_164_22,
  inlineStyle_175_20,
  inlineStyle_177_18,
  inlineStyle_180_20,
  inlineStyle_191_22,
  inlineStyle_214_18,
  inlineStyle_224_18,
  inlineStyle_228_18,
  inlineStyle_241_16,
  inlineStyle_255_12,
  inlineStyle_273_14,
  inlineStyle_282_14,
  inlineStyle_303_10,
  inlineStyle_305_12,
  inlineStyle_329_16,
  inlineStyle_332_18,
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
  inlineStyle_508_18,
  inlineStyle_531_18,
  inlineStyle_538_24,
} from './ShopShell.styles';

const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem('session') || '{}');
  } catch (error) {
    return {};
  }
};

const getAvatarUrl = user => {
  if (user?.avatar?.file?.id) return buildFileUrl(user.avatar.file.id);
  if (user?.avatar?.url)
    return `${user?.avatar?.domain || ''}${user.avatar.url}`;
  if (!user?.email) return '';
  return `https://www.gravatar.com/avatar/${md5(String(user.email).trim().toLowerCase())}?s=200&d=identicon`;
};

export default function ShopShell({children, searchValue = '', onSearch}) {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const isMobile = width < 920;
  const shellPadding = isMobile ? 14 : 26;

  const authStore = useStore('auth');
  const peopleStore = useStore('people');
  const {currentCompany, defaultCompany} = useShopCart();

  const {user} = authStore.getters;
  const authActions = authStore.actions;
  const peopleActions = peopleStore.actions;
  const {companies = []} = peopleStore.getters;

  const theme = pickTheme(defaultCompany);

  const [searchTerm, setSearchTerm] = useState(searchValue);
  const [accountOpen, setAccountOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem('config') || '{}')?.themeMode === 'dark',
  );

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  const session = getSession();
  const accountUser = user && Object.keys(user).length > 0 ? user : session;
  const avatarUrl = getAvatarUrl(accountUser);
  const displayName = String(
    accountUser?.realname ||
      accountUser?.name ||
      accountUser?.username ||
      'Usuario',
  ).trim();
  const displayCompany =
    currentCompany?.alias || currentCompany?.name || 'Empresa';

  const logoUrl = defaultCompany?.logo?.id
    ? buildFileUrl(defaultCompany.logo.id)
    : defaultCompany?.logo?.file?.id
      ? buildFileUrl(defaultCompany.logo.file.id)
      : defaultCompany?.logo?.domain && defaultCompany?.logo?.url
        ? `https://${defaultCompany.logo.domain}${defaultCompany.logo.url}?app-domain=${encodeURIComponent(
            getHost(defaultCompany),
          )}`
        : '';

  const submitSearch = useCallback(() => {
    if (onSearch) onSearch(searchTerm);
  }, [onSearch, searchTerm]);

  const toggleDarkMode = useCallback(value => {
    setDarkMode(value);
    const config = JSON.parse(localStorage.getItem('config') || '{}');
    localStorage.setItem(
      'config',
      JSON.stringify({
        ...config,
        themeMode: value ? 'dark' : 'light',
      }),
    );
  }, []);

  const shellBackground = darkMode ? '#0f1720' : theme.background;
  const surface = darkMode ? '#17212B' : theme.surface;
  const foreground = darkMode ? '#F8FAFC' : theme.text;
  const muted = darkMode ? '#93A4B7' : theme.muted;

  const companyList = useMemo(
    () => (Array.isArray(companies) ? companies : []).filter(Boolean),
    [companies],
  );

  return (
    <View style={inlineStyle_118_10({
      shellBackground: shellBackground,
    })}>
      <View style={inlineStyle_119_12({
        theme: theme,
      })}>
        <View
          style={inlineStyle_121_10({
            isMobile: isMobile,
            shellPadding: shellPadding,
          })}>
          <View
            style={inlineStyle_128_12}>
            <View
              style={inlineStyle_135_14}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ShopIndex')}>
                {logoUrl ? (
                  <Image
                    source={{uri: logoUrl}}
                    style={inlineStyle_146_20({
                      isMobile: isMobile,
                    })}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={inlineStyle_155_20({
                      isMobile: isMobile,
                    })}>
                    <Text
                      style={inlineStyle_164_22({
                        isMobile: isMobile,
                      })}>
                      {getInitials(defaultCompany?.alias || 'CO')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={inlineStyle_175_20}>
                <View
                  style={inlineStyle_177_18}>
                  <Text
                    numberOfLines={1}
                    style={inlineStyle_180_20({
                      isMobile: isMobile,
                    })}>
                    {displayCompany}
                  </Text>
                  {companyList.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setCompanyOpen(open => !open)}
                      style={inlineStyle_191_22}>
                      <Icon
                        name={
                          companyOpen
                            ? 'keyboard-arrow-up'
                            : 'keyboard-arrow-down'
                        }
                        size={18}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={inlineStyle_214_18}>
                  Cardapio digital
                </Text>
              </View>
            </View>

            <View style={inlineStyle_224_18}>
              {!isMobile && (
                <TouchableOpacity
                  onPress={() => setAccountOpen(true)}
                  style={inlineStyle_228_18}>
                  <Icon name="notifications" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setAccountOpen(true)}
                style={inlineStyle_241_16}>
                <Icon name="account-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={inlineStyle_255_12}>
            <Icon name="search" size={20} color="rgba(255,255,255,0.85)" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={submitSearch}
              placeholder="Busque pratos, bebidas ou categorias"
              placeholderTextColor="rgba(255,255,255,0.75)"
              style={inlineStyle_273_14}
            />
            <TouchableOpacity
              onPress={submitSearch}
              style={inlineStyle_282_14}>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        visible={companyOpen && companyList.length > 1}
        transparent
        animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCompanyOpen(false)}
          style={inlineStyle_303_10}>
          <View
            style={inlineStyle_305_12({
              isMobile: isMobile,
              shellPadding: shellPadding,
              surface: surface,
            })}>
            {companyList.map(company => (
              <TouchableOpacity
                key={company.id}
                onPress={() => {
                  peopleActions.setCurrentCompany(company);
                  setCompanyOpen(false);
                }}
                style={inlineStyle_329_16}>
                <Text
                  numberOfLines={1}
                  style={inlineStyle_332_18({
                    foreground: foreground,
                  })}>
                  {company.alias || company.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {children({foreground, surface, theme})}
      <Modal visible={accountOpen} transparent animationType="fade">
        <TouchableOpacity
          style={inlineStyle_345_10({
            isMobile: isMobile,
          })}
          activeOpacity={1}
          onPress={() => setAccountOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={inlineStyle_358_12({
              isMobile: isMobile,
              surface: surface,
            })}>
            <View style={inlineStyle_369_18({
              isMobile: isMobile,
            })}>
              <View style={inlineStyle_370_20({
                isMobile: isMobile,
              })}>
                <Text
                  style={inlineStyle_372_18({
                    foreground: foreground,
                  })}>
                  Minha Conta
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopProfilePage');
                  }}
                  style={inlineStyle_381_18}>
                  <Icon name="face" size={22} color={foreground} />
                  <Text
                    style={inlineStyle_388_20({
                      foreground: foreground,
                    })}>
                    Meu Perfil
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopOrdersPage');
                  }}
                  style={inlineStyle_398_18}>
                  <Text style={inlineStyle_399_24({
                    foreground: foreground,
                  })}>
                    Meus Pedidos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCartPage');
                  }}
                  style={inlineStyle_409_18}>
                  <Text style={inlineStyle_410_24({
                    foreground: foreground,
                  })}>
                    Carrinho
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCheckoutPage');
                  }}
                  style={inlineStyle_420_18}>
                  <Text style={inlineStyle_421_24({
                    foreground: foreground,
                  })}>
                    Pagamento e Pix
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCardsPage');
                  }}
                  style={inlineStyle_431_18}>
                  <Text style={inlineStyle_432_24({
                    foreground: foreground,
                  })}>
                    Meus Cartões
                  </Text>
                </TouchableOpacity>

                <View
                  style={inlineStyle_438_18}>
                  <Icon name="g-translate" size={22} color={foreground} />
                  <View style={inlineStyle_444_24}>
                    <Text style={inlineStyle_445_26({
                      muted: muted,
                    })}>Idioma</Text>
                    <Text
                      style={inlineStyle_447_22({
                        foreground: foreground,
                      })}>
                      {JSON.parse(localStorage.getItem('config') || '{}')
                        ?.language || 'Pt-BR'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={inlineStyle_460_16({
                  darkMode: darkMode,
                  isMobile: isMobile,
                })}
              />

              <View
                style={inlineStyle_468_16({
                  isMobile: isMobile,
                })}>
                <View
                  style={inlineStyle_473_18({
                    theme: theme,
                  })}>
                  {avatarUrl ? (
                    <Image
                      source={{uri: avatarUrl}}
                      style={inlineStyle_485_22}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={inlineStyle_490_22}>
                      {getInitials(displayName)}
                    </Text>
                  )}
                </View>

                <Text
                  style={inlineStyle_497_18({
                    foreground: foreground,
                  })}>
                  {displayName}
                </Text>

                <View
                  style={inlineStyle_508_18}>
                  <Icon
                    name={darkMode ? 'dark-mode' : 'light-mode'}
                    size={20}
                    color={foreground}
                  />
                  <Switch value={darkMode} onValueChange={toggleDarkMode} />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    authActions.logOut();
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'SignInPage'}],
                    });
                  }}
                  style={inlineStyle_531_18({
                    theme: theme,
                  })}>
                  <Text style={inlineStyle_538_24}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
