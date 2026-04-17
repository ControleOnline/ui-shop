import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {buildAddressOptionSummary} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {fetchShopFranchiseDirectory} from '@controleonline/ui-common/src/react/utils/shopFranchises';
import {
  normalizeShopEntityId,
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

const buildAddressSearchText = (company, address) => {
  const summary = buildAddressOptionSummary(address);

  return [
    company?.alias,
    company?.name,
    summary.primary,
    summary.secondary,
    address?.nickname,
    address?.searchFor,
    address?.openingHours,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const buildMapQuery = (company, address) => {
  const summary = buildAddressOptionSummary(address);

  return [
    company?.alias || company?.name,
    summary.primary,
    summary.secondary,
    address?.searchFor,
  ]
    .filter(Boolean)
    .join(', ');
};

export default function ShopFranchiseLocatorPage() {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const isMobile = width < 1040;
  const {
    defaultCompany,
    franchiseLocatorEnabled,
    primaryEntryRouteName,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  } = useShopSettings();
  const theme = pickTheme(defaultCompany);

  const [directory, setDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!defaultCompany?.id || !franchiseLocatorEnabled) {
        setDirectory([]);
        return;
      }

      let isMounted = true;
      setIsLoading(true);

      fetchShopFranchiseDirectory({
        companyId: defaultCompany.id,
      })
        .then(items => {
          if (isMounted) {
            setDirectory(Array.isArray(items) ? items : []);
          }
        })
        .catch(() => {
          if (isMounted) {
            setDirectory([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [defaultCompany?.id, franchiseLocatorEnabled]),
  );

  const hasLocatorSelection =
    visibleFranchiseCompanyIds.length > 0 && visibleFranchiseAddressIds.length > 0;

  const filteredDirectory = useMemo(() => {
    if (!hasLocatorSelection) {
      return [];
    }

    const normalizedQuery = String(query || '').trim().toLowerCase();

    return directory
      .map(company => {
        const companyId = normalizeShopEntityId(company);

        if (!visibleFranchiseCompanyIds.includes(companyId)) {
          return null;
        }

        const companyAddresses = (company?.shopAddresses || [])
          .filter(address =>
            visibleFranchiseAddressIds.includes(normalizeShopEntityId(address)),
          )
          .filter(address => {
            if (!normalizedQuery) {
              return true;
            }

            const companyMatches = String(
              company?.alias || company?.name || '',
            )
              .toLowerCase()
              .includes(normalizedQuery);

            if (companyMatches) {
              return true;
            }

            return buildAddressSearchText(company, address).includes(
              normalizedQuery,
            );
          });

        if (companyAddresses.length === 0) {
          return null;
        }

        return {
          ...company,
          shopAddresses: companyAddresses,
        };
      })
      .filter(Boolean);
  }, [
    directory,
    hasLocatorSelection,
    query,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  ]);

  const selectedAddressRecord = useMemo(() => {
    for (const company of filteredDirectory) {
      const matchedAddress = (company?.shopAddresses || []).find(
        address =>
          normalizeShopEntityId(address) === normalizeShopEntityId(selectedAddressId),
      );

      if (matchedAddress) {
        return {
          company,
          address: matchedAddress,
        };
      }
    }

    return null;
  }, [filteredDirectory, selectedAddressId]);

  useEffect(() => {
    if (selectedAddressRecord) {
      return;
    }

    const firstCompany = filteredDirectory[0];
    const firstAddress = firstCompany?.shopAddresses?.[0];
    setSelectedAddressId(normalizeShopEntityId(firstAddress));
  }, [filteredDirectory, selectedAddressRecord]);

  const openSelectedAddress = useCallback(() => {
    if (!selectedAddressRecord) {
      return;
    }

    const mapQuery = buildMapQuery(
      selectedAddressRecord.company,
      selectedAddressRecord.address,
    );

    if (!mapQuery) {
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        mapQuery,
      )}`,
    ).catch(() => {});
  }, [selectedAddressRecord]);

  const iframeSource = selectedAddressRecord
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        buildMapQuery(
          selectedAddressRecord.company,
          selectedAddressRecord.address,
        ),
      )}&output=embed`
    : '';

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_FRANCHISE_LOCATOR}
      onSearch={setQuery}
      searchPlaceholder="Busque unidade, bairro ou cidade"
      searchValue={query}
      showHomeEntryControls
      subtitle="Localizador de franquias">
      {() => (
        <ScrollView
          style={styles.page}
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.darkCard,
                borderColor: theme.darkBorder,
              },
            ]}>
            <Text style={[styles.heroEyebrow, {color: theme.accent}]}>
              UNIDADES DISPONIVEIS
            </Text>
            <Text style={[styles.heroTitle, {color: theme.onPrimary}]}>
              Encontre a franquia mais conveniente
            </Text>
            <Text style={[styles.heroText, {color: 'rgba(255,255,255,0.78)'}]}>
              Veja apenas as empresas e os enderecos liberados no manager e abra
              a rota no mapa com um toque.
            </Text>
          </View>

          {!franchiseLocatorEnabled ? (
            <ShopFeatureState
              theme={theme}
              iconName="place"
              title="Localizador de franquias desativado"
              description="Esta entrada do shop nao esta liberada para esta empresa."
              primaryActionLabel={
                primaryEntryRouteName && primaryEntryRouteName !== 'ShopFranchiseLocatorPage'
                  ? 'Voltar para a entrada principal'
                  : null
              }
              onPrimaryAction={
                primaryEntryRouteName && primaryEntryRouteName !== 'ShopFranchiseLocatorPage'
                  ? () => navigation.navigate(primaryEntryRouteName)
                  : null
              }
            />
          ) : isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, {color: theme.muted}]}>
                Carregando franquias liberadas...
              </Text>
            </View>
          ) : !hasLocatorSelection ? (
            <ShopFeatureState
              theme={theme}
              iconName="map"
              title="Nenhuma franquia foi liberada"
              description="O localizador so mostra empresas e enderecos marcados explicitamente no manager."
              secondaryText="Selecione pelo menos uma empresa e um endereco na aba Shop das configuracoes gerais."
            />
          ) : filteredDirectory.length === 0 ? (
            <ShopFeatureState
              theme={theme}
              iconName="search-off"
              title="Nenhum endereco encontrado"
              description={
                String(query || '').trim()
                  ? 'A busca atual nao encontrou nenhuma unidade liberada.'
                  : 'Nao ha enderecos disponiveis para as franquias selecionadas.'
              }
            />
          ) : (
            <View
              style={[
                styles.layout,
                isMobile && styles.layoutMobile,
              ]}>
              <View style={styles.listColumn}>
                {filteredDirectory.map(company => (
                  <View
                    key={company.id}
                    style={[
                      styles.companyCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.cardBorder,
                      },
                    ]}>
                    <View style={styles.companyHeader}>
                      <View
                        style={[
                          styles.companyBadge,
                          {backgroundColor: `${theme.primary}14`},
                        ]}>
                        <Icon name="storefront" size={18} color={theme.primary} />
                      </View>
                      <View style={styles.companyCopy}>
                        <Text style={[styles.companyTitle, {color: theme.text}]}>
                          {company.alias || company.name}
                        </Text>
                        <Text style={[styles.companyMeta, {color: theme.muted}]}>
                          {(company.shopAddresses || []).length} endereco(s)
                          liberado(s)
                        </Text>
                      </View>
                    </View>

                    {(company.shopAddresses || []).map(address => {
                      const addressId = normalizeShopEntityId(address);
                      const summary = buildAddressOptionSummary(address);
                      const selected =
                        normalizeShopEntityId(selectedAddressId) === addressId;

                      return (
                        <TouchableOpacity
                          key={`${company.id}-${addressId}`}
                          activeOpacity={0.9}
                          onPress={() => setSelectedAddressId(addressId)}
                          style={[
                            styles.addressCard,
                            {
                              backgroundColor: selected
                                ? '#EFF6FF'
                                : theme.background,
                              borderColor: selected
                                ? '#93C5FD'
                                : theme.cardBorder,
                            },
                          ]}>
                          <Icon
                            name={selected ? 'place' : 'place-outline'}
                            size={18}
                            color={selected ? theme.primary : theme.muted}
                          />
                          <View style={styles.addressCopy}>
                            <Text
                              style={[
                                styles.addressTitle,
                                {color: theme.text},
                              ]}>
                              {summary.primary || address.nickname || 'Endereco'}
                            </Text>
                            <Text
                              style={[
                                styles.addressMeta,
                                {color: theme.muted},
                              ]}>
                              {summary.secondary ||
                                address.searchFor ||
                                'Toque para ver no mapa'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <View
                style={[
                  styles.mapCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.cardBorder,
                  },
                ]}>
                {selectedAddressRecord ? (
                  <>
                    <Text style={[styles.mapTitle, {color: theme.text}]}>
                      {selectedAddressRecord.company?.alias ||
                        selectedAddressRecord.company?.name}
                    </Text>
                    <Text style={[styles.mapMeta, {color: theme.muted}]}>
                      {buildAddressOptionSummary(selectedAddressRecord.address)
                        .primary || 'Endereco selecionado'}
                    </Text>
                    <Text style={[styles.mapMeta, {color: theme.muted}]}>
                      {buildAddressOptionSummary(selectedAddressRecord.address)
                        .secondary || 'Sem complemento adicional'}
                    </Text>

                    {Platform.OS === 'web' && iframeSource ? (
                      <iframe
                        src={iframeSource}
                        title="Mapa da franquia"
                        style={{
                          width: '100%',
                          height: 320,
                          border: '0',
                          borderRadius: '18px',
                          marginTop: '14px',
                        }}
                      />
                    ) : (
                      <View
                        style={[
                          styles.nativeMapPlaceholder,
                          {
                            backgroundColor: theme.background,
                            borderColor: theme.cardBorder,
                          },
                        ]}>
                        <Icon name="map" size={36} color={theme.primary} />
                        <Text
                          style={[
                            styles.nativeMapText,
                            {color: theme.muted},
                          ]}>
                          O mapa detalhado aparece na web. No app, use o botao
                          abaixo para abrir a rota no Google Maps.
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={openSelectedAddress}
                      style={[
                        styles.mapButton,
                        {backgroundColor: theme.primary},
                      ]}>
                      <Text
                        style={[
                          styles.mapButtonText,
                          {color: theme.onPrimary},
                        ]}>
                        Abrir no mapa
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ShopFeatureState
                    theme={theme}
                    iconName="map"
                    title="Selecione uma unidade"
                    description="Escolha um endereco liberado ao lado para visualizar o mapa."
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 140,
  },
  hero: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  layout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  layoutMobile: {
    flexDirection: 'column',
  },
  listColumn: {
    flex: 1.05,
    gap: 14,
  },
  companyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  companyBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyCopy: {
    flex: 1,
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  companyMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  addressCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressCopy: {
    flex: 1,
    marginLeft: 10,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  addressMeta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  mapCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    minHeight: 360,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  mapMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  nativeMapPlaceholder: {
    marginTop: 14,
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nativeMapText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  mapButton: {
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
