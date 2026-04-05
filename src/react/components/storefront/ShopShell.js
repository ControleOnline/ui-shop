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
    <View style={{flex: 1, backgroundColor: shellBackground}}>
      <View style={{backgroundColor: theme.header}}>
        <View
          style={{
            paddingHorizontal: shellPadding,
            paddingTop: isMobile ? 12 : 18,
            paddingBottom: isMobile ? 14 : 18,
            gap: 14,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                flex: 1,
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ShopIndex')}>
                {logoUrl ? (
                  <Image
                    source={{uri: logoUrl}}
                    style={{
                      width: isMobile ? 56 : 82,
                      height: isMobile ? 56 : 64,
                      borderRadius: 10,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: isMobile ? 56 : 82,
                      height: isMobile ? 56 : 64,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: isMobile ? 18 : 24,
                        fontWeight: '800',
                      }}>
                      {getInitials(defaultCompany?.alias || 'CO')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{flex: 1}}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#fff',
                      fontSize: isMobile ? 15 : 20,
                      fontWeight: '700',
                      flexShrink: 1,
                    }}>
                    {displayCompany}
                  </Text>
                  {companyList.length > 1 && (
                    <TouchableOpacity
                      onPress={() => setCompanyOpen(open => !open)}
                      style={{
                        width: 28,
                        height: 28,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.45)',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
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
                  style={{
                    color: 'rgba(255,255,255,0.86)',
                    fontSize: 12,
                    marginTop: 3,
                  }}>
                  Cardapio digital
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              {!isMobile && (
                <TouchableOpacity
                  onPress={() => setAccountOpen(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="notifications" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setAccountOpen(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="account-circle" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.16)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.24)',
              paddingHorizontal: 12,
              minHeight: 44,
              gap: 8,
            }}>
            <Icon name="search" size={20} color="rgba(255,255,255,0.85)" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={submitSearch}
              placeholder="Busque pratos, bebidas ou categorias"
              placeholderTextColor="rgba(255,255,255,0.75)"
              style={{
                flex: 1,
                color: '#fff',
                fontSize: 14,
                minHeight: 40,
              }}
            />
            <TouchableOpacity
              onPress={submitSearch}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
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
          style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.25)'}}>
          <View
            style={{
              position: 'absolute',
              top: isMobile ? 78 : 92,
              left: shellPadding,
              right: isMobile ? shellPadding : undefined,
              zIndex: 99999,
              elevation: 20,
              backgroundColor: surface,
              minWidth: isMobile ? undefined : 320,
              maxWidth: isMobile ? undefined : 420,
              borderRadius: 12,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOpacity: 0.28,
              shadowRadius: 12,
              shadowOffset: {width: 0, height: 6},
            }}>
            {companyList.map(company => (
              <TouchableOpacity
                key={company.id}
                onPress={() => {
                  peopleActions.setCurrentCompany(company);
                  setCompanyOpen(false);
                }}
                style={{paddingHorizontal: 14, paddingVertical: 12}}>
                <Text
                  numberOfLines={1}
                  style={{color: foreground, fontSize: 14, fontWeight: '600'}}>
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
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.22)',
            alignItems: 'center',
            justifyContent: isMobile ? 'flex-end' : 'flex-start',
            paddingTop: isMobile ? 0 : 92,
            paddingBottom: isMobile ? 14 : 0,
            paddingHorizontal: 12,
          }}
          activeOpacity={1}
          onPress={() => setAccountOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: isMobile ? '100%' : 700,
              maxWidth: '100%',
              backgroundColor: surface,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: {width: 0, height: 6},
              padding: 18,
            }}>
            <View style={{flexDirection: isMobile ? 'column' : 'row', gap: 18}}>
              <View style={{flex: 1, paddingRight: isMobile ? 0 : 20}}>
                <Text
                  style={{color: foreground, fontSize: 20, fontWeight: '800'}}>
                  Minha Conta
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopProfilePage');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 24,
                  }}>
                  <Icon name="face" size={22} color={foreground} />
                  <Text
                    style={{marginLeft: 18, color: foreground, fontSize: 16}}>
                    Meu Perfil
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopOrdersPage');
                  }}
                  style={{marginLeft: 40, marginTop: 20}}>
                  <Text style={{color: foreground, fontSize: 16}}>
                    Meus Pedidos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCartPage');
                  }}
                  style={{marginLeft: 40, marginTop: 16}}>
                  <Text style={{color: foreground, fontSize: 16}}>
                    Carrinho
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCheckoutPage');
                  }}
                  style={{marginLeft: 40, marginTop: 16}}>
                  <Text style={{color: foreground, fontSize: 16}}>
                    Pagamento e Pix
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopCardsPage');
                  }}
                  style={{marginLeft: 40, marginTop: 16}}>
                  <Text style={{color: foreground, fontSize: 16}}>
                    Meus Cartões
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 24,
                  }}>
                  <Icon name="g-translate" size={22} color={foreground} />
                  <View style={{marginLeft: 18}}>
                    <Text style={{color: muted, fontSize: 13}}>Idioma</Text>
                    <Text
                      style={{
                        color: foreground,
                        fontSize: 15,
                        fontWeight: '600',
                      }}>
                      {JSON.parse(localStorage.getItem('config') || '{}')
                        ?.language || 'Pt-BR'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: isMobile ? '100%' : 1,
                  height: isMobile ? 1 : undefined,
                  backgroundColor: darkMode ? '#2B3A4A' : '#d7dee8',
                }}
              />

              <View
                style={{
                  flex: isMobile ? undefined : 1.2,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 37,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                  {avatarUrl ? (
                    <Image
                      source={{uri: avatarUrl}}
                      style={{width: '100%', height: '100%'}}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={{color: '#fff', fontSize: 24, fontWeight: '700'}}>
                      {getInitials(displayName)}
                    </Text>
                  )}
                </View>

                <Text
                  style={{
                    marginTop: 14,
                    textAlign: 'center',
                    color: foreground,
                    fontSize: 14,
                    lineHeight: 20,
                  }}>
                  {displayName}
                </Text>

                <View
                  style={{
                    marginTop: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}>
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
                  style={{
                    marginTop: 18,
                    backgroundColor: theme.primary,
                    paddingHorizontal: 20,
                    paddingVertical: 11,
                    borderRadius: 10,
                  }}>
                  <Text style={{color: '#fff', fontWeight: '700'}}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
