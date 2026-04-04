import React from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import md5 from 'md5';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {
  buildFileUrl,
  getInitials,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';

const getAvatarUrl = user => {
  if (user?.avatar?.file?.id) return buildFileUrl(user.avatar.file.id);
  if (user?.avatar?.url)
    return `${user?.avatar?.domain || ''}${user.avatar.url}`;
  if (!user?.email) return '';
  return `https://www.gravatar.com/avatar/${md5(String(user.email).trim().toLowerCase())}?s=200&d=identicon`;
};

export default function ShopProfilePage() {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const peopleStore = useStore('people');
  const {defaultCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  const {user} = authStore.getters;
  const authActions = authStore.actions;
  const {currentCompany} = peopleStore.getters;
  const avatarUrl = getAvatarUrl(user || {});

  const displayName =
    user?.realname ||
    user?.name ||
    user?.username ||
    currentCompany?.alias ||
    'Cliente';
  const email =
    user?.email || currentCompany?.email?.[0]?.email || 'Sem email cadastrado';
  const phone = currentCompany?.phone?.[0]
    ? `(${currentCompany.phone[0].ddd || ''}) ${currentCompany.phone[0].phone || ''}`
    : 'Sem telefone cadastrado';

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{padding: 14, paddingBottom: 20}}>
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: `${theme.primary}30`,
              backgroundColor: `${theme.primary}10`,
              padding: 16,
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 86,
                height: 86,
                borderRadius: 43,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.primary,
              }}>
              {avatarUrl ? (
                <Image
                  source={{uri: avatarUrl}}
                  resizeMode="cover"
                  style={{width: '100%', height: '100%'}}
                />
              ) : (
                <Text style={{color: '#fff', fontSize: 30, fontWeight: '800'}}>
                  {getInitials(displayName)}
                </Text>
              )}
            </View>
            <Text
              style={{
                marginTop: 12,
                color: theme.text,
                fontSize: 22,
                fontWeight: '800',
              }}>
              {displayName}
            </Text>
            <Text style={{marginTop: 4, color: theme.muted, fontSize: 13}}>
              {email}
            </Text>
            <Text style={{marginTop: 2, color: theme.muted, fontSize: 13}}>
              {phone}
            </Text>
          </View>

          <View
            style={{
              marginTop: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              overflow: 'hidden',
            }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfilePage')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBorder,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="person-outline" size={20} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  Editar perfil completo
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCartPage')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBorder,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="shopping-cart" size={20} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  Meu carrinho
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCheckoutPage')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBorder,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="payments" size={20} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  Pagamento e Pix
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCardsPage')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.cardBorder,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="credit-card" size={20} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  Meus cartões
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopOrdersPage')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Icon name="receipt-long" size={20} color={theme.primary} />
                <Text style={{color: theme.text, fontWeight: '700'}}>
                  Meus pedidos
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              authActions.logOut();
              navigation.reset({index: 0, routes: [{name: 'SignInPage'}]});
            }}
            style={{
              marginTop: 12,
              minHeight: 46,
              borderRadius: 12,
              backgroundColor: `${theme.danger}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: theme.danger, fontWeight: '800'}}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ShopShell>
  );
}
