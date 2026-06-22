import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
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

const getNativeWebView = () => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    return require('react-native-webview').WebView;
  } catch {
    return null;
  }
};

const NativeWebView = getNativeWebView();

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

  const currentPosition = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

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

const safeJsonForHtml = value =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const buildMapDocument = ({apiKey, markerPayloads, theme, userCoordinates}) => {
  if (!apiKey) {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            html, body {
              margin: 0;
              height: 100%;
              background: ${theme?.surface || '#ffffff'};
              font-family: Arial, sans-serif;
            }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${theme?.text || '#0f1720'};
            }
          </style>
        </head>
        <body>Mapa indisponivel no momento.</body>
      </html>
    `;
  }

  const markerPayloadsJson = safeJsonForHtml(markerPayloads);
  const userCoordinatesJson = safeJsonForHtml(userCoordinates || null);
  const routeColor = theme?.primary || '#0ea5e9';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <style>
          html, body, #map {
            margin: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #f8fafc;
            font-family: Arial, sans-serif;
          }

          .popup {
            min-width: 220px;
            max-width: 280px;
            color: #0f172a;
          }

          .popup-company {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #0369a1;
            margin-bottom: 6px;
          }

          .popup-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .popup-line {
            font-size: 13px;
            line-height: 1.45;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .popup-meta-list {
            display: grid;
            gap: 6px;
            margin-top: 10px;
          }

          .popup-meta {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            font-size: 12px;
            color: #334155;
          }

          .popup-meta-label {
            color: #64748b;
          }

          .popup-actions {
            display: flex;
            gap: 8px;
            margin-top: 14px;
          }

          .popup-action {
            flex: 1;
            border-radius: 999px;
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            text-align: center;
            text-decoration: none;
            color: #0f172a;
            font-size: 12px;
            font-weight: 700;
            background: #ffffff;
          }

          .popup-action.primary {
            border-color: transparent;
            background: #0ea5e9;
            color: #ffffff;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.__SHOP_MAP_MARKERS__ = ${markerPayloadsJson};
          window.__SHOP_MAP_USER__ = ${userCoordinatesJson};

          function escapeHtml(value) {
            return String(value || '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          }

          function buildLine(value) {
            if (!value) {
              return '';
            }

            return '<div class="popup-line">' + escapeHtml(value) + '</div>';
          }

          function buildMeta(label, value) {
            if (!value) {
              return '';
            }

            return (
              '<div class="popup-meta">' +
                '<span class="popup-meta-label">' + escapeHtml(label) + '</span>' +
                '<span>' + escapeHtml(value) + '</span>' +
              '</div>'
            );
          }

          function buildPopupContent(item) {
            return (
              '<div class="popup">' +
                '<div class="popup-company">' + escapeHtml(item.companyName) + '</div>' +
                '<div class="popup-title">' + escapeHtml(item.title) + '</div>' +
                buildLine(item.addressLine) +
                buildLine(item.addressExtra) +
                '<div class="popup-meta-list">' +
                  buildMeta('Telefone', item.phoneLabel) +
                  buildMeta('Distancia', item.distanceLabel) +
                  buildMeta('Horario', item.openingHours) +
                '</div>' +
                '<div class="popup-actions">' +
                  '<a class="popup-action primary" href="' + escapeHtml(item.googleMapsUrl) + '" target="_blank" rel="noopener noreferrer">Abrir no Maps</a>' +
                  '<a class="popup-action" href="' + escapeHtml(item.wazeUrl) + '" target="_blank" rel="noopener noreferrer">Waze</a>' +
                '</div>' +
              '</div>'
            );
          }

          window.__initShopMap = function () {
            var markers = window.__SHOP_MAP_MARKERS__ || [];
            var userCoordinates = window.__SHOP_MAP_USER__;

            if (!window.google || !markers.length) {
              return;
            }

            var map = new window.google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              clickableIcons: false,
              gestureHandling: 'greedy',
              zoomControl: false,
            });

            var bounds = new window.google.maps.LatLngBounds();
            var infoWindow = new window.google.maps.InfoWindow({maxWidth: 320});
            var hasUserCoordinates =
              userCoordinates &&
              Number.isFinite(userCoordinates.latitude) &&
              Number.isFinite(userCoordinates.longitude);
            var directionsService = hasUserCoordinates
              ? new window.google.maps.DirectionsService()
              : null;
            var directionsRenderer = directionsService
              ? new window.google.maps.DirectionsRenderer({
                  map: map,
                  suppressMarkers: true,
                  preserveViewport: false,
                  polylineOptions: {
                    strokeColor: '${routeColor}',
                    strokeOpacity: 0.92,
                    strokeWeight: 5,
                  },
                })
              : null;
            var activeRouteRequestId = 0;

            if (
              userCoordinates &&
              Number.isFinite(userCoordinates.latitude) &&
              Number.isFinite(userCoordinates.longitude)
            ) {
              var userPosition = {
                lat: userCoordinates.latitude,
                lng: userCoordinates.longitude,
              };

              new window.google.maps.Marker({
                position: userPosition,
                map: map,
                title: 'Sua localizacao',
                zIndex: 999,
              });

              bounds.extend(userPosition);
            }

            markers.forEach(function (item) {
              var position = {
                lat: item.latitude,
                lng: item.longitude,
              };

              var marker = new window.google.maps.Marker({
                position: position,
                map: map,
                title: item.title,
                animation: window.google.maps.Animation.DROP,
                icon: item.markerIconUrl
                  ? {
                      url: item.markerIconUrl,
                      scaledSize: new window.google.maps.Size(42, 42),
                    }
                  : undefined,
              });

              bounds.extend(position);

              marker.addListener('click', function () {
                infoWindow.setContent(buildPopupContent(item));
                infoWindow.open({
                  anchor: marker,
                  map: map,
                  shouldFocus: false,
                });

                if (!directionsService || !directionsRenderer) {
                  return;
                }

                var routeRequestId = activeRouteRequestId + 1;
                activeRouteRequestId = routeRequestId;

                directionsService.route(
                  {
                    origin: {
                      lat: userCoordinates.latitude,
                      lng: userCoordinates.longitude,
                    },
                    destination: position,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                  },
                  function (response, status) {
                    if (routeRequestId !== activeRouteRequestId) {
                      return;
                    }

                    if (status === 'OK' && response) {
                      directionsRenderer.setDirections(response);
                      return;
                    }

                    directionsRenderer.set('directions', null);
                  },
                );
              });
            });

            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, {
                top: 56,
                right: 32,
                bottom: 56,
                left: 32,
              });

              window.google.maps.event.addListenerOnce(map, 'idle', function () {
                if (markers.length === 1 && map.getZoom() > 15) {
                  map.setZoom(15);
                }
              });
            }
          };
        </script>
        <script
          async
          src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
            apiKey,
          )}&loading=async&callback=__initShopMap"
        ></script>
      </body>
    </html>
  `;
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

  const mapDocument = useMemo(
    () =>
      buildMapDocument({
        apiKey: googleMapsApiKey,
        markerPayloads,
        theme,
        userCoordinates,
      }),
    [googleMapsApiKey, markerPayloads, theme, userCoordinates],
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

  const handleNativeNavigation = useCallback(request => {
    const url = String(request?.url || '');

    if (!url || url === 'about:blank') {
      return true;
    }

    if (
      url.includes('google.com/maps') ||
      url.includes('maps.google.com') ||
      url.includes('waze.com/ul')
    ) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    return true;
  }, []);

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
                  userCoordinates={userCoordinates}
                />
              ) : NativeWebView ? (
                <NativeWebView
                  originWhitelist={['*']}
                  source={{html: mapDocument}}
                  onShouldStartLoadWithRequest={handleNativeNavigation}
                  style={styles.mapNativeFrame}
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
  mapNativeFrame: {
    flex: 1,
    backgroundColor: '#E5EEF5',
  },
});
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores e evitar chamadas HTTP diretas quando o store ja resolver isso.
