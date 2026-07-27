import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import DefaultMap from '@controleonline/ui-default/src/react/components/map/DefaultMap';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopSalesCompanySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  buildFranchiseMarkerAddresses,
} from '@controleonline/ui-shop/src/react/utils/shopFranchiseLocator';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  fetchShopFranchiseDirectory,
  SHOP_FRANCHISE_PAGE_SIZE,
} from '@controleonline/ui-common/src/react/utils/shopFranchises';
import {
  normalizeShopEntityId,
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

const ANDROID_LOCATION_TIMEOUT_MS = 12000;

const requestUserCoordinates = async () => {
  if (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    navigator.geolocation
  ) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position =>
          resolve({
            latitude: Number(position?.coords?.latitude),
            longitude: Number(position?.coords?.longitude),
          }),
        error => reject(error),
        {
          enableHighAccuracy: true,
          maximumAge: 60 * 1000,
          timeout: 12 * 1000,
        },
      );
    });
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission?.status !== 'granted') {
    throw new Error('location-denied');
  }

  if (Platform.OS === 'android') {
    try {
      await Location.enableNetworkProviderAsync();
    } catch {}

    try {
      return await new Promise((resolve, reject) => {
        let isSettled = false;
        let timeoutId = null;
        let subscription = null;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (subscription) {
            subscription.remove();
          }
        };

        const settle = (callback, value) => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          cleanup();
          callback(value);
        };

        timeoutId = setTimeout(() => {
          settle(reject, new Error('location-timeout'));
        }, ANDROID_LOCATION_TIMEOUT_MS);

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 0,
            mayShowUserSettingsDialog: true,
            timeInterval: 1000,
          },
          position => {
            const latitude = Number(position?.coords?.latitude);
            const longitude = Number(position?.coords?.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              return;
            }

            settle(resolve, {latitude, longitude});
          },
          error => {
            settle(reject, error);
          },
        )
          .then(nextSubscription => {
            subscription = nextSubscription;
          })
          .catch(error => {
            settle(reject, error);
          });
      });
    } catch {}
  }

  const currentPosition = await Location.getCurrentPositionAsync(
    Platform.OS === 'android'
      ? {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 0,
          mayShowUserSettingsDialog: true,
          timeInterval: 1000,
        }
      : {
          accuracy: Location.Accuracy.Balanced,
        },
  );

  return {
    latitude: Number(currentPosition?.coords?.latitude),
    longitude: Number(currentPosition?.coords?.longitude),
  };
};

export default function ShopFranchiseLocatorPage() {
  const navigation = useNavigation();
  const {height} = useWindowDimensions();
  const {
    defaultCompany,
    franchiseLocatorEnabled,
    primaryEntryRouteName,
    salesPageEnabled,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
    ...mapSettings
  } = useShopSettings();
  const {salesCompany, selectSalesCompany} = useShopSalesCompany({
    loadOptions: false,
  });
  const theme = pickTheme(defaultCompany);
  const mapHeight = Math.max(height - (Platform.OS === 'web' ? 118 : 150), 420);

  const [directory, setDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState(null);

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
        publicDirectory: true,
        itemsPerPage: SHOP_FRANCHISE_PAGE_SIZE,
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

  useFocusEffect(
    useCallback(() => {
      if (!franchiseLocatorEnabled) {
        setUserCoordinates(null);
        return undefined;
      }

      let isMounted = true;

      requestUserCoordinates()
        .then(coords => {
          if (!isMounted) {
            return;
          }

          if (
            Number.isFinite(coords?.latitude) &&
            Number.isFinite(coords?.longitude)
          ) {
            setUserCoordinates(coords);
          } else {
            setUserCoordinates(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setUserCoordinates(null);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [franchiseLocatorEnabled]),
  );

  const configuredDirectory = useMemo(() => {
    if (visibleFranchiseCompanyIds.length === 0) {
      return [];
    }

    const visibleCompanyIdSet = new Set(visibleFranchiseCompanyIds);
    const visibleAddressIdSet = new Set(visibleFranchiseAddressIds);

    return directory
      .map(company => {
        const companyId = normalizeShopEntityId(company);

        if (!visibleCompanyIdSet.has(companyId)) {
          return null;
        }

        const addresses = (company?.shopAddresses || []).filter(address =>
          visibleAddressIdSet.size === 0 ||
          visibleAddressIdSet.has(normalizeShopEntityId(address)),
        );

        return {
          ...company,
          shopAddresses: addresses,
        };
      })
      .filter(Boolean);
  }, [directory, visibleFranchiseAddressIds, visibleFranchiseCompanyIds]);

  const effectiveDirectory = configuredDirectory;

  const markerAddresses = useMemo(
    () =>
      buildFranchiseMarkerAddresses({
        directory: effectiveDirectory,
        fallbackCompany: defaultCompany,
      }),
    [defaultCompany, effectiveDirectory],
  );

  const selectedCompanyId = normalizeShopEntityId(salesCompany);
  const shouldRenderFranchiseList =
    effectiveDirectory.length > 0 &&
    markerAddresses.length === 0;
  const mapConfig = {
    ...mapSettings,
    addresses: {
      markers: markerAddresses,
      user: userCoordinates,
    },
  };

  const handleSelectFranchise = useCallback(
    company => {
      selectSalesCompany(company);

      if (salesPageEnabled) {
        navigation.navigate('ShopIndex');
      }
    },
    [navigation, salesPageEnabled, selectSalesCompany],
  );

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_FRANCHISE_LOCATOR}
      showBottomCart={false}
      showHomeEntryControls
      showSalesShortcuts={false}
      showSearch={false}
      subtitle={markerAddresses.length > 0 ? 'Mapa das unidades' : 'Escolha uma unidade'}>
      {() => {
        if (!franchiseLocatorEnabled) {
          return (
            <ShopFeatureState
              theme={theme}
              iconName="place"
              title="Localizador indisponivel no momento"
              description="No momento nao foi possivel abrir o mapa das unidades."
              primaryActionLabel={
                primaryEntryRouteName &&
                primaryEntryRouteName !== 'ShopFranchiseLocatorPage'
                  ? 'Voltar para a entrada principal'
                  : null
              }
              onPrimaryAction={
                primaryEntryRouteName &&
                primaryEntryRouteName !== 'ShopFranchiseLocatorPage'
                  ? () => navigation.navigate(primaryEntryRouteName)
                  : null
              }
            />
          );
        }

        if (isLoading) {
          return (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          );
        }

        if (effectiveDirectory.length === 0) {
          return (
            <ShopFeatureState
              theme={theme}
              iconName="place"
              title="Nenhuma franquia disponivel"
              description="Nenhuma franquia foi configurada para aparecer no shop desta empresa."
            />
          );
        }

        if (shouldRenderFranchiseList) {
          return (
            <ShopSalesCompanySelector
              companies={effectiveDirectory}
              description={
                'Selecione a franquia que vai atender o pedido.'
              }
              onSelect={handleSelectFranchise}
              selectedCompanyId={selectedCompanyId}
              theme={theme}
              title="Escolha a franquia para comprar"
            />
          );
        }

        return (
          <View style={styles.page}>
            <View
              style={[
                styles.mapViewport,
                {
                  height: mapHeight,
                  backgroundColor: theme.pageBackground,
                },
              ]}>
              {markerAddresses.length > 0 ? (
                <DefaultMap
                  config={mapConfig}
                  popupTheme={theme}
                />
              ) : (
                <ShopFeatureState
                  theme={theme}
                  iconName="map"
                  title="Sem coordenadas para montar o mapa"
                  description="Nao foi possivel abrir o mapa neste ambiente."
                />
              )}
            </View>
          </View>
        );
      }}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapViewport: {
    width: '100%',
    flex: 1,
  },
});
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores e evitar chamadas HTTP diretas quando o store ja resolver isso.
