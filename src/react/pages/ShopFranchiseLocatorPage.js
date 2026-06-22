import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopGoogleMap from '@controleonline/ui-shop/src/react/components/storefront/ShopGoogleMap';
import ShopNativeMap, {
  HAS_NATIVE_MAP_SUPPORT,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopNativeMap';
import ShopSalesCompanySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  formatPhoneDisplay,
  resolveAddressDisplayParts,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {
  buildGoogleMapsNavigationUrl,
  buildNavigationMapQuery,
  buildWazeNavigationUrl,
} from '@controleonline/ui-common/src/react/utils/mapNavigation';
import {
  fetchShopFranchiseDirectory,
  SHOP_FRANCHISE_PAGE_SIZE,
} from '@controleonline/ui-common/src/react/utils/shopFranchises';
import {
  normalizeShopEntityId,
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

const geocodeCache = new Map();
const GEOCODE_BATCH_SIZE = 5;
const MAX_GEOCODE_RECORDS = 50;
const ANDROID_LOCATION_TIMEOUT_MS = 12000;

const normalizeCoordinate = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const extractAddressCoordinates = address => {
  const latitudeCandidates = [
    address?.latitude,
    address?.lat,
    address?.location?.latitude,
    address?.location?.lat,
    address?.coords?.latitude,
    address?.coords?.lat,
    address?.coordinate?.latitude,
    address?.coordinate?.lat,
  ];
  const longitudeCandidates = [
    address?.longitude,
    address?.lng,
    address?.lon,
    address?.location?.longitude,
    address?.location?.lng,
    address?.coords?.longitude,
    address?.coords?.lng,
    address?.coordinate?.longitude,
    address?.coordinate?.lng,
  ];

  const latitude = latitudeCandidates
    .map(normalizeCoordinate)
    .find(value => value !== null);
  const longitude = longitudeCandidates
    .map(normalizeCoordinate)
    .find(value => value !== null);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {latitude, longitude};
};

const buildMapQuery = (company, address) => {
  const parts = resolveAddressDisplayParts(address);

  return buildNavigationMapQuery([
    company?.alias || company?.name,
    parts.streetLine,
    parts.district,
    parts.cityStateLine,
    address?.searchFor,
  ]);
};

const calculateDistanceInKm = (origin, destination) => {
  if (!origin || !destination) {
    return null;
  }

  const toRadians = degrees => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const startLatitude = toRadians(origin.latitude);
  const endLatitude = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const formatDistance = distanceInKm => {
  if (!Number.isFinite(distanceInKm)) {
    return '';
  }

  if (distanceInKm < 1) {
    return `${Math.max(1, Math.round(distanceInKm * 1000))} m`;
  }

  return `${distanceInKm.toFixed(distanceInKm >= 10 ? 0 : 1).replace('.', ',')} km`;
};

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

const geocodeMapQuery = async ({apiKey, mapQuery}) => {
  const normalizedQuery = String(mapQuery || '').trim();

  if (!normalizedQuery || !apiKey) {
    return null;
  }

  const cacheKey = `${String(apiKey).trim()}::${normalizedQuery.toLowerCase()}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  const request = fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      normalizedQuery,
    )}&key=${encodeURIComponent(apiKey)}`,
  )
    .then(response => response.json())
    .then(payload => {
      const location = payload?.results?.[0]?.geometry?.location;
      const latitude = normalizeCoordinate(location?.lat);
      const longitude = normalizeCoordinate(location?.lng);

      if (latitude === null || longitude === null) {
        return null;
      }

      return {latitude, longitude};
    })
    .catch(() => null);

  geocodeCache.set(cacheKey, request);
  return request;
};

const resolveGeocodeRecords = async ({apiKey, records}) => {
  const entries = [];
  const limitedRecords = records.slice(0, MAX_GEOCODE_RECORDS);

  for (let index = 0; index < limitedRecords.length; index += GEOCODE_BATCH_SIZE) {
    const batch = limitedRecords.slice(index, index + GEOCODE_BATCH_SIZE);
    const batchEntries = await Promise.all(
      batch.map(async record => {
        const coordinates = await geocodeMapQuery({
          apiKey,
          mapQuery: record.mapQuery,
        });
        return [record.addressId, coordinates];
      }),
    );

    entries.push(...batchEntries);
  }

  return entries;
};

const resolveCompanyPhone = company => {
  const candidates = [company?.phone, company?.mobile, company?.whatsapp];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const match = candidate.map(formatPhoneDisplay).find(Boolean);
      if (match) {
        return match;
      }
      continue;
    }

    const formatted = formatPhoneDisplay(candidate);
    if (formatted) {
      return formatted;
    }
  }

  return '';
};

export default function ShopFranchiseLocatorPage() {
  const navigation = useNavigation();
  const {height} = useWindowDimensions();
  const {
    defaultCompany,
    franchiseLocatorEnabled,
    franchisePinIconUrl,
    googleMapsApiKey,
    primaryEntryRouteName,
    salesPageEnabled,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  } = useShopSettings();
  const {salesCompany, selectSalesCompany} = useShopSalesCompany({
    loadOptions: false,
  });
  const theme = pickTheme(defaultCompany);
  const mapHeight = Math.max(height - (Platform.OS === 'web' ? 118 : 150), 420);

  const [directory, setDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolvingCoordinates, setIsResolvingCoordinates] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [resolvedCoordinatesByAddressId, setResolvedCoordinatesByAddressId] =
    useState({});

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
      if (!franchiseLocatorEnabled || !googleMapsApiKey) {
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
    }, [franchiseLocatorEnabled, googleMapsApiKey]),
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

  const flattenedAddressRecords = useMemo(
    () =>
      effectiveDirectory.flatMap(company =>
        (company?.shopAddresses || []).map(address => ({
          address,
          addressId: normalizeShopEntityId(address),
          company,
          mapQuery: buildMapQuery(company, address),
          rawCoordinates: extractAddressCoordinates(address),
        })),
      ),
    [effectiveDirectory],
  );

  useEffect(() => {
    if (!googleMapsApiKey) {
      setIsResolvingCoordinates(false);
      return undefined;
    }

    const unresolvedRecords = flattenedAddressRecords.filter(record => {
      if (!record.addressId || record.rawCoordinates) {
        return false;
      }

      return !resolvedCoordinatesByAddressId[record.addressId];
    });

    if (unresolvedRecords.length === 0) {
      setIsResolvingCoordinates(false);
      return undefined;
    }

    let cancelled = false;
    setIsResolvingCoordinates(true);

    resolveGeocodeRecords({
      apiKey: googleMapsApiKey,
      records: unresolvedRecords,
    })
      .then(entries => {
        if (cancelled) {
          return;
        }

        setResolvedCoordinatesByAddressId(current => {
          const next = {...current};

          entries.forEach(([addressId, coordinates]) => {
            if (addressId && coordinates) {
              next[addressId] = coordinates;
            }
          });

          return next;
        });
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolvingCoordinates(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    flattenedAddressRecords,
    googleMapsApiKey,
    resolvedCoordinatesByAddressId,
  ]);

  const markerPayloads = useMemo(
    () =>
      effectiveDirectory
        .flatMap(company =>
          (company?.shopAddresses || []).map(address => {
            const addressId = normalizeShopEntityId(address);
            const coordinates =
              extractAddressCoordinates(address) ||
              resolvedCoordinatesByAddressId[addressId] ||
              null;

            if (!coordinates) {
              return null;
            }

            const lat = normalizeCoordinate(coordinates.latitude);
            const lng = normalizeCoordinate(coordinates.longitude);

            if (lat === null || lng === null) {
              return null;
            }

            const addressParts = resolveAddressDisplayParts(address);
            const distanceLabel = formatDistance(
              calculateDistanceInKm(userCoordinates, coordinates),
            );
            const addressTitle =
              addressParts.primary ||
              address?.nickname ||
              company?.alias ||
              company?.name ||
              'Unidade';
            const addressLine =
              addressParts.streetLine ||
              address?.searchFor ||
              addressTitle;
            const addressExtra = [
              addressParts.district,
              addressParts.cityStateLine,
              addressParts.postalCode,
            ]
              .filter(Boolean)
              .join(' • ');
            const mapQuery = buildMapQuery(company, address);

            return {
              id: `${normalizeShopEntityId(company)}-${addressId}`,
              companyName: company?.alias || company?.name || 'Franquia',
              title: addressTitle,
              addressLine,
              addressExtra,
              distanceLabel,
              googleMapsUrl: buildGoogleMapsNavigationUrl({
                coordinates,
                mapQuery,
                origin: userCoordinates,
              }),
              latitude: lat,
              longitude: lng,
              markerIconUrl: franchisePinIconUrl,
              openingHours: address?.openingHours || '',
              phoneLabel: resolveCompanyPhone(company),
              wazeUrl: buildWazeNavigationUrl({coordinates, mapQuery}),
            };
          }),
        )
        .filter(Boolean),
    [
      effectiveDirectory,
      franchisePinIconUrl,
      resolvedCoordinatesByAddressId,
      userCoordinates,
    ],
  );

  const selectedCompanyId = normalizeShopEntityId(salesCompany);
  const shouldRenderFranchiseList =
    effectiveDirectory.length > 0 &&
    (!googleMapsApiKey || (!isResolvingCoordinates && markerPayloads.length === 0));

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
      subtitle={googleMapsApiKey ? 'Mapa das unidades' : 'Escolha uma unidade'}>
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
                googleMapsApiKey
                  ? 'Nao foi possivel posicionar as unidades no mapa. Selecione uma franquia na lista para continuar.'
                  : 'Selecione a franquia que vai atender o pedido.'
              }
              onSelect={handleSelectFranchise}
              selectedCompanyId={selectedCompanyId}
              theme={theme}
              title="Escolha a franquia para comprar"
            />
          );
        }

        if (isResolvingCoordinates) {
          return (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          );
        }

        return (
          <View style={styles.page}>
            <View style={[styles.mapViewport, {height: mapHeight}]}>
              {Platform.OS === 'web' ? (
                <ShopGoogleMap
                  apiKey={googleMapsApiKey}
                  markerPayloads={markerPayloads}
                  userCoordinates={userCoordinates}
                />
              ) : HAS_NATIVE_MAP_SUPPORT ? (
                <ShopNativeMap
                  apiKey={googleMapsApiKey}
                  markerPayloads={markerPayloads}
                  routeColor={theme.primary || '#0EA5E9'}
                  userCoordinates={userCoordinates}
                />
              ) : (
                <ShopFeatureState
                  theme={theme}
                  iconName="map"
                  title="Mapa indisponivel no dispositivo"
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
    backgroundColor: '#E5EEF5',
  },
});
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores e evitar chamadas HTTP diretas quando o store ja resolver isso.
