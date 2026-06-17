import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, Linking, Platform, Text, View} from 'react-native';

import styles from './ShopNativeMap.styles';

const getNativeMapComponents = () => {
  // No Android, não usar MapView nativo pois requer API key no AndroidManifest.xml
  // Em vez disso, usar WebView com chave dinâmica do banco de dados
  if (Platform.OS === 'android') {
    return null;
  }

  try {
    return require('react-native-maps');
  } catch {
    return null;
  }
};

const nativeMapComponents = getNativeMapComponents();
const NativeMapView = nativeMapComponents?.default || null;
const Marker = nativeMapComponents?.Marker || null;
const Callout = nativeMapComponents?.Callout || null;
const CalloutSubview = nativeMapComponents?.CalloutSubview || null;
const Polyline = nativeMapComponents?.Polyline || null;
const PROVIDER_GOOGLE = nativeMapComponents?.PROVIDER_GOOGLE || null;
export const HAS_NATIVE_MAP_SUPPORT = Boolean(
  NativeMapView && Marker && Callout,
);

const DEFAULT_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.24,
  longitudeDelta: 0.24,
};

const decodePolyline = encoded => {
  if (!encoded) {
    return [];
  }

  const coordinates = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = null;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
};

const fetchRouteCoordinates = async ({apiKey, origin, destination}) => {
  if (
    !apiKey ||
    !Number.isFinite(origin?.latitude) ||
    !Number.isFinite(origin?.longitude) ||
    !Number.isFinite(destination?.latitude) ||
    !Number.isFinite(destination?.longitude)
  ) {
    return [];
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      `${origin.latitude},${origin.longitude}`,
    )}&destination=${encodeURIComponent(
      `${destination.latitude},${destination.longitude}`,
    )}&mode=driving&key=${encodeURIComponent(apiKey)}`,
  );
  const payload = await response.json();
  const encodedPoints = payload?.routes?.[0]?.overview_polyline?.points;

  if (payload?.status !== 'OK' || !encodedPoints) {
    return [];
  }

  return decodePolyline(encodedPoints);
};

const buildRegion = coordinates => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return DEFAULT_REGION;
  }

  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }

  const latitudes = coordinates.map(item => item.latitude);
  const longitudes = coordinates.map(item => item.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.45, 0.04),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.45, 0.04),
  };
};

const MetaRow = ({label, value}) => {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
};

const CalloutAction = ({label, onPress, primary = false}) => {
  if (!CalloutSubview || !label || typeof onPress !== 'function') {
    return null;
  }

  return (
    <CalloutSubview
      onPress={onPress}
      style={[
        styles.actionButton,
        primary && styles.actionButtonPrimary,
      ]}>
      <Text
        style={[
          styles.actionText,
          primary && styles.actionTextPrimary,
        ]}>
        {label}
      </Text>
    </CalloutSubview>
  );
};

export default function ShopNativeMap({
  apiKey = '',
  markerPayloads = [],
  userCoordinates = null,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const hasUserCoordinates =
    Number.isFinite(userCoordinates?.latitude) &&
    Number.isFinite(userCoordinates?.longitude);
  const baseMapCoordinates = useMemo(() => {
    const coordinates = markerPayloads
      .map(item => ({
        latitude: Number(item?.latitude),
        longitude: Number(item?.longitude),
      }))
      .filter(
        item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
      );

    if (hasUserCoordinates) {
      coordinates.push({
        latitude: Number(userCoordinates.latitude),
        longitude: Number(userCoordinates.longitude),
      });
    }

    return coordinates;
  }, [hasUserCoordinates, markerPayloads, userCoordinates]);
  const selectedMarker = useMemo(
    () => markerPayloads.find(item => item.id === selectedMarkerId) || null,
    [markerPayloads, selectedMarkerId],
  );
  const focusCoordinates = useMemo(() => {
    if (routeCoordinates.length > 1) {
      return routeCoordinates;
    }

    if (
      hasUserCoordinates &&
      Number.isFinite(selectedMarker?.latitude) &&
      Number.isFinite(selectedMarker?.longitude)
    ) {
      return [
        {
          latitude: Number(userCoordinates.latitude),
          longitude: Number(userCoordinates.longitude),
        },
        {
          latitude: Number(selectedMarker.latitude),
          longitude: Number(selectedMarker.longitude),
        },
      ];
    }

    return baseMapCoordinates;
  }, [
    baseMapCoordinates,
    hasUserCoordinates,
    routeCoordinates,
    selectedMarker?.latitude,
    selectedMarker?.longitude,
    userCoordinates,
  ]);

  const initialRegion = useMemo(
    () => buildRegion(focusCoordinates),
    [focusCoordinates],
  );

  useEffect(() => {
    if (!selectedMarkerId) {
      return;
    }

    if (!selectedMarker) {
      setSelectedMarkerId(null);
    }
  }, [selectedMarker, selectedMarkerId]);

  useEffect(() => {
    if (!hasUserCoordinates || !selectedMarker || !apiKey || !Polyline) {
      setRouteCoordinates([]);
      return undefined;
    }

    let cancelled = false;

    fetchRouteCoordinates({
      apiKey,
      origin: {
        latitude: Number(userCoordinates.latitude),
        longitude: Number(userCoordinates.longitude),
      },
      destination: {
        latitude: Number(selectedMarker.latitude),
        longitude: Number(selectedMarker.longitude),
      },
    })
      .then(coordinates => {
        if (!cancelled) {
          setRouteCoordinates(Array.isArray(coordinates) ? coordinates : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteCoordinates([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    Polyline,
    apiKey,
    hasUserCoordinates,
    selectedMarker,
    userCoordinates,
  ]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || focusCoordinates.length === 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (!mapRef.current) {
        return;
      }

      if (focusCoordinates.length === 1) {
        mapRef.current.animateToRegion(buildRegion(focusCoordinates), 250);
        return;
      }

      mapRef.current.fitToCoordinates(focusCoordinates, {
        animated: true,
        edgePadding: {
          top: 56,
          right: 32,
          bottom: 56,
          left: 32,
        },
      });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [focusCoordinates, mapReady]);

  if (!HAS_NATIVE_MAP_SUPPORT) {
    return null;
  }

  return (
    <NativeMapView
      ref={mapRef}
      style={styles.mapViewport}
      initialRegion={initialRegion}
      provider={Platform.OS === 'android' && PROVIDER_GOOGLE ? PROVIDER_GOOGLE : undefined}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass
      rotateEnabled
      toolbarEnabled={false}
      onMapReady={() => setMapReady(true)}>
      {hasUserCoordinates ? (
        <Marker
          key="shop-user-location"
          coordinate={{
            latitude: Number(userCoordinates.latitude),
            longitude: Number(userCoordinates.longitude),
          }}
          title="Sua localizacao"
          description="Posicao atual do cliente"
          onPress={() => {
            setSelectedMarkerId(null);
            setRouteCoordinates([]);
          }}
        />
      ) : null}
      {Polyline && routeCoordinates.length > 1 ? (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0EA5E9"
          strokeWidth={5}
        />
      ) : null}
      {markerPayloads.map(item => (
        <Marker
          key={item.id}
          coordinate={{
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
          }}
          title={item.title}
          description={item.addressLine}
          onPress={() => setSelectedMarkerId(item.id)}>
          {item.markerIconUrl ? (
            <View style={styles.markerWrap}>
              <Image
                source={{uri: item.markerIconUrl}}
                style={styles.markerIcon}
                resizeMode="contain"
              />
            </View>
          ) : null}
          <Callout tooltip>
            <View style={styles.calloutCard}>
              <Text style={styles.companyName}>{item.companyName}</Text>
              <Text style={styles.title}>{item.title}</Text>
              {item.addressLine ? (
                <Text style={styles.line}>{item.addressLine}</Text>
              ) : null}
              {item.addressExtra ? (
                <Text style={styles.line}>{item.addressExtra}</Text>
              ) : null}

              <View style={styles.metaList}>
                <MetaRow label="Telefone" value={item.phoneLabel} />
                <MetaRow label="Distancia" value={item.distanceLabel} />
                <MetaRow label="Horario" value={item.openingHours} />
              </View>

              <View style={styles.actionsRow}>
                <CalloutAction
                  label="Abrir no Maps"
                  onPress={() => Linking.openURL(item.googleMapsUrl).catch(() => {})}
                  primary
                />
                <CalloutAction
                  label="Waze"
                  onPress={() => Linking.openURL(item.wazeUrl).catch(() => {})}
                />
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </NativeMapView>
  );
}
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores e evitar chamadas HTTP diretas quando o store ja resolver isso.
