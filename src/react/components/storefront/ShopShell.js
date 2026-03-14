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
  if (user?.avatar?.url) return `${user?.avatar?.domain || ''}${user.avatar.url}`;
  if (!user?.email) return '';
  return `https://www.gravatar.com/avatar/${md5(String(user.email).trim().toLowerCase())}?s=200&d=identicon`;
};

export default function ShopShell({children, searchValue = '', onSearch}) {
  const navigation = useNavigation();
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
  const [socketMessages, setSocketMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem('config') || '{}')?.themeMode === 'dark',
  );

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const socket = new WebSocket('wss://ws.controleonline.com');
    socket.onmessage = event => {
      setSocketMessages(previous => [...previous.slice(-4), event.data]);
    };
    return () => socket.close();
  }, []);

  const session = getSession();
  const accountUser = user && Object.keys(user).length > 0 ? user : session;
  const avatarUrl = getAvatarUrl(accountUser);
  const displayName = String(
    accountUser?.realname || accountUser?.name || accountUser?.username || 'Usuario',
  ).trim();
  const displayCompany = currentCompany?.alias || currentCompany?.name || 'Empresa';
  const logoUrl = defaultCompany?.logo?.id
    ? buildFileUrl(defaultCompany.logo.id)
    : defaultCompany?.logo?.file?.id
      ? buildFileUrl(defaultCompany.logo.file.id)
      : defaultCompany?.logo?.domain && defaultCompany?.logo?.url
        ? `https://${defaultCompany.logo.domain}${defaultCompany.logo.url}?app-domain=${encodeURIComponent(getHost())}`
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

  const shellBackground = darkMode ? '#111315' : '#ffffff';
  const surface = darkMode ? '#1f1f1f' : '#ffffff';
  const foreground = darkMode ? '#f8fafc' : '#111827';

  const companyList = useMemo(
    () => (Array.isArray(companies) ? companies : []).filter(Boolean),
    [companies],
  );

  return (
    <View style={{flex: 1, backgroundColor: shellBackground}}>
      <View style={{backgroundColor: theme.header}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 28,
            paddingTop: 18,
            paddingBottom: 18,
            gap: 16,
            position: 'relative',
            zIndex: 20,
            overflow: 'visible',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 18}}>
            <TouchableOpacity onPress={() => navigation.navigate('SalesOrderIndex')}>
              {logoUrl ? (
                <Image
                  source={{uri: logoUrl}}
                  style={{width: 96, height: 72}}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 72,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: '#fff', fontSize: 24, fontWeight: '700'}}>
                    {getInitials(defaultCompany?.alias || 'CO')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {companyList.length > 1 && (
                <TouchableOpacity
                  onPress={() => setCompanyOpen(open => !open)}
                  style={{
                    width: 34,
                    height: 34,
                    borderWidth: 1,
                    borderColor: '#fff',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 18,
                  }}>
                  <Icon
                    name={companyOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}

              <Text style={{color: '#fff', fontSize: 20, fontWeight: '500'}}>
                {displayCompany}
              </Text>
            </View>
          </View>

          <View style={{flex: 1, maxWidth: 460}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#d4dee8',
              }}>
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={submitSearch}
                placeholder=""
                placeholderTextColor="#d4dee8"
                style={{
                  flex: 1,
                  color: '#fff',
                  fontSize: 18,
                  minHeight: 44,
                }}
              />
              <TouchableOpacity onPress={submitSearch}>
                <Icon name="search" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
            <TouchableOpacity onPress={() => setAccountOpen(true)}>
              <Icon name="notifications" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAccountOpen(true)}>
              <Icon name="account-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <Modal visible={companyOpen && companyList.length > 1} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCompanyOpen(false)}
          style={{flex: 1}}>
          <View
            style={{
              position: 'absolute',
              top: 84,
              left: 94,
              zIndex: 99999,
              elevation: 20,
              backgroundColor: '#1f1f1f',
              minWidth: 320,
              maxWidth: 420,
              borderRadius: 4,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: {width: 0, height: 6},
            }}>
            {companyList.map(company => (
              <TouchableOpacity
                key={company.id}
                onPress={() => {
                  peopleActions.setCurrentCompany(company);
                  setCompanyOpen(false);
                }}
                style={{paddingHorizontal: 14, paddingVertical: 10}}>
                <Text
                  numberOfLines={1}
                  style={{color: '#fff', fontSize: 13, lineHeight: 18}}>
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
            backgroundColor: 'rgba(0,0,0,0.15)',
            alignItems: 'flex-end',
            paddingTop: 110,
            paddingRight: 12,
          }}
          activeOpacity={1}
          onPress={() => setAccountOpen(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: 690,
              maxWidth: '96%',
              backgroundColor: surface,
              borderRadius: 4,
              shadowColor: '#000',
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: {width: 0, height: 6},
              padding: 22,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, paddingRight: 20}}>
                <Text style={{color: foreground, fontSize: 20, fontWeight: '700'}}>
                  My Account
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopProfilePage');
                  }}
                  style={{flexDirection: 'row', alignItems: 'center', marginTop: 28}}>
                  <Icon name="face" size={24} color={foreground} />
                  <Text style={{marginLeft: 28, color: foreground, fontSize: 16}}>
                    My Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    navigation.navigate('ShopOrdersPage');
                  }}
                  style={{marginLeft: 52, marginTop: 24}}>
                  <Text style={{color: foreground, fontSize: 16}}>My Orders</Text>
                </TouchableOpacity>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 28}}>
                  <Icon name="g-translate" size={24} color={foreground} />
                  <View style={{marginLeft: 28}}>
                    <Text style={{color: foreground, fontSize: 14}}>Language</Text>
                    <Text style={{color: foreground, fontSize: 16}}>
                      {JSON.parse(localStorage.getItem('config') || '{}')?.language ||
                        'Pt br'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: 1,
                  backgroundColor: darkMode ? '#3a3a3a' : '#d7dee8',
                  marginHorizontal: 18,
                }}
              />

              <View style={{flex: 1.2, alignItems: 'center'}}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: '#2563eb',
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
                    <Text style={{color: '#fff', fontSize: 24, fontWeight: '700'}}>
                      {getInitials(displayName)}
                    </Text>
                  )}
                </View>

                <Text
                  style={{
                    marginTop: 18,
                    textAlign: 'center',
                    color: foreground,
                    fontSize: 14,
                    lineHeight: 22,
                  }}>
                  {displayName}
                </Text>

                <View
                  style={{
                    marginTop: 22,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                  <Icon
                    name={darkMode ? 'dark-mode' : 'light-mode'}
                    size={22}
                    color={foreground}
                  />
                  <Switch value={darkMode} onValueChange={toggleDarkMode} />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setAccountOpen(false);
                    authActions.logOut();
                    navigation.reset({index: 0, routes: [{name: 'SignInPage'}]});
                  }}
                  style={{
                    marginTop: 22,
                    backgroundColor: theme.primary,
                    paddingHorizontal: 22,
                    paddingVertical: 12,
                    borderRadius: 4,
                  }}>
                  <Text style={{color: '#fff', fontWeight: '700'}}>LOGOUT</Text>
                </TouchableOpacity>
              </View>
            </View>

            {socketMessages.length > 0 && (
              <View
                style={{
                  marginTop: 18,
                  backgroundColor: darkMode ? '#1f1f1f' : '#111',
                  padding: 16,
                  borderRadius: 4,
                }}>
                <Text style={{color: '#fff', fontSize: 16, fontWeight: '700'}}>
                  Mensagens do WebSocket
                </Text>
                <ScrollView style={{maxHeight: 120, marginTop: 8}}>
                  {socketMessages.map((message, index) => (
                    <Text key={`${index}-${message}`} style={{color: '#fff'}}>
                      {message}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
