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

import {
  inlineStyle_54_10,
  inlineStyle_57_12,
  inlineStyle_66_14,
  inlineStyle_79_18,
  inlineStyle_82_22,
  inlineStyle_88_14,
  inlineStyle_96_18,
  inlineStyle_99_18,
  inlineStyle_105_12,
  inlineStyle_115_14,
  inlineStyle_124_16,
  inlineStyle_126_22,
  inlineStyle_135_14,
  inlineStyle_144_16,
  inlineStyle_146_22,
  inlineStyle_155_14,
  inlineStyle_164_16,
  inlineStyle_166_22,
  inlineStyle_175_14,
  inlineStyle_184_16,
  inlineStyle_186_22,
  inlineStyle_195_14,
  inlineStyle_202_16,
  inlineStyle_204_22,
  inlineStyle_217_12,
  inlineStyle_225_18,
} from './ProfilePage.styles';

import { inlineStyle_85_10 } from './ProfilePage.styles';

const getAvatarUrl = user => {
  if (user?.avatar) return buildFileUrl(user.avatar);
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
          style={inlineStyle_54_10}
          contentContainerStyle={inlineStyle_85_10}>
          <View
            style={inlineStyle_57_12({
              theme: theme,
            })}>
            <View
              style={inlineStyle_66_14({
                theme: theme,
              })}>
              {avatarUrl ? (
                <Image
                  source={{uri: avatarUrl}}
                  resizeMode="cover"
                  style={inlineStyle_79_18}
                />
              ) : (
                <Text style={inlineStyle_82_22}>
                  {getInitials(displayName)}
                </Text>
              )}
            </View>
            <Text
              style={inlineStyle_88_14({
                theme: theme,
              })}>
              {displayName}
            </Text>
            <Text style={inlineStyle_96_18({
              theme: theme,
            })}>
              {email}
            </Text>
            <Text style={inlineStyle_99_18({
              theme: theme,
            })}>
              {phone}
            </Text>
          </View>

          <View
            style={inlineStyle_105_12({
              theme: theme,
            })}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfilePage')}
              style={inlineStyle_115_14({
                theme: theme,
              })}>
              <View
                style={inlineStyle_124_16}>
                <Icon name="person-outline" size={20} color={theme.primary} />
                <Text style={inlineStyle_126_22({
                  theme: theme,
                })}>
                  Editar perfil completo
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCartPage')}
              style={inlineStyle_135_14({
                theme: theme,
              })}>
              <View
                style={inlineStyle_144_16}>
                <Icon name="shopping-cart" size={20} color={theme.primary} />
                <Text style={inlineStyle_146_22({
                  theme: theme,
                })}>
                  Meu carrinho
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCheckoutPage')}
              style={inlineStyle_155_14({
                theme: theme,
              })}>
              <View
                style={inlineStyle_164_16}>
                <Icon name="payments" size={20} color={theme.primary} />
                <Text style={inlineStyle_166_22({
                  theme: theme,
                })}>
                  Pagamento e Pix
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCardsPage')}
              style={inlineStyle_175_14({
                theme: theme,
              })}>
              <View
                style={inlineStyle_184_16}>
                <Icon name="credit-card" size={20} color={theme.primary} />
                <Text style={inlineStyle_186_22({
                  theme: theme,
                })}>
                  Meus cartões
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={theme.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopOrdersPage')}
              style={inlineStyle_195_14}>
              <View
                style={inlineStyle_202_16}>
                <Icon name="receipt-long" size={20} color={theme.primary} />
                <Text style={inlineStyle_204_22({
                  theme: theme,
                })}>
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
            style={inlineStyle_217_12({
              theme: theme,
            })}>
            <Text style={inlineStyle_225_18({
              theme: theme,
            })}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ShopShell>
  );
}
