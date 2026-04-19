import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  resolveShopSalesCompanyAddress,
  resolveShopSalesCompanyPhone,
} from '@controleonline/ui-shop/src/react/utils/shopSalesCompany';
import {normalizeShopEntityId} from '@controleonline/ui-common/src/react/utils/shopConfig';

export default function ShopSalesCompanySelector({
  companies = [],
  isLoading = false,
  onSelect,
  selectedCompanyId = '',
  theme,
  title = 'Escolha a unidade para comprar',
  description = 'Selecione a empresa que vai atender este pedido.',
}) {
  const {width} = useWindowDimensions();
  const isMobile = width < 900;

  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder,
          },
        ]}>
        <Text style={[styles.heroEyebrow, {color: theme.primary}]}>
          EMPRESA DE VENDA
        </Text>
        <Text style={[styles.heroTitle, {color: theme.text}]}>{title}</Text>
        <Text style={[styles.heroText, {color: theme.muted}]}>
          {description}
        </Text>
      </View>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {companies.map(company => {
          const companyId = normalizeShopEntityId(company);
          const phone = resolveShopSalesCompanyPhone(company);
          const address = resolveShopSalesCompanyAddress(company);
          const isSelected =
            normalizeShopEntityId(selectedCompanyId) === companyId;

          return (
            <TouchableOpacity
              key={companyId}
              activeOpacity={0.9}
              onPress={() => onSelect?.(company)}
              style={[
                styles.card,
                isMobile && styles.cardMobile,
                {
                  backgroundColor: theme.surface,
                  borderColor: isSelected ? theme.primary : theme.cardBorder,
                },
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardBadge,
                    {backgroundColor: `${theme.primary}12`},
                  ]}>
                  <Icon name="storefront" size={18} color={theme.primary} />
                </View>
                <Text style={[styles.cardTitle, {color: theme.text}]}>
                  {company?.alias || company?.name || 'Empresa'}
                </Text>
              </View>

              <View style={styles.metaList}>
                <View style={styles.metaRow}>
                  <Icon name="place" size={16} color={theme.primary} />
                  <View style={styles.metaCopy}>
                    <Text style={[styles.metaPrimary, {color: theme.text}]}>
                      {address.primary || 'Endereco indisponivel'}
                    </Text>
                    {!!address.secondary && (
                      <Text style={[styles.metaSecondary, {color: theme.muted}]}>
                        {address.secondary}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Icon name="phone" size={16} color={theme.primary} />
                  <View style={styles.metaCopy}>
                    <Text style={[styles.metaPrimary, {color: theme.text}]}>
                      {phone || 'Telefone indisponivel'}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isSelected
                      ? `${theme.primary}12`
                      : theme.background,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.actionText,
                    {color: isSelected ? theme.primary : theme.text},
                  ]}>
                  {isSelected ? 'Selecionada' : 'Comprar nesta unidade'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
  },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 14,
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardMobile: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  metaList: {
    gap: 10,
    marginTop: 16,
    minHeight: 98,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaCopy: {
    flex: 1,
    marginLeft: 10,
  },
  metaPrimary: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  metaSecondary: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
});
