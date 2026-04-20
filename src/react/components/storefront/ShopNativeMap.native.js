import React, {useEffect, useMemo, useRef} from 'react';
import {Image, Linking, Text, View} from 'react-native';

import styles from './ShopNativeMap.styles';

const getNativeMapComponents = () => {
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
export const HAS_NATIVE_MAP_SUPPORT = Boolean(
  NativeMapView && Marker && Callout,
);

const DEFAULT_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.24,
  longitudeDelta: 0.24,
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
  markerPayloads = [],
  userCoordinates = null,
}) {
  const mapRef = useRef(null);
  const hasUserCoordinates =
    Number.isFinite(userCoordinates?.latitude) &&
    Number.isFinite(userCoordinates?.longitude);
  const mapCoordinates = useMemo(() => {
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

  const initialRegion = useMemo(
    () => buildRegion(mapCoordinates),
    [mapCoordinates],
  );

  useEffect(() => {
    if (!mapRef.current || mapCoordinates.length === 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (!mapRef.current) {
        return;
      }

      if (mapCoordinates.length === 1) {
        mapRef.current.animateToRegion(buildRegion(mapCoordinates), 250);
        return;
      }

      mapRef.current.fitToCoordinates(mapCoordinates, {
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
  }, [mapCoordinates]);

  if (!HAS_NATIVE_MAP_SUPPORT) {
    return null;
  }

  return (
    <NativeMapView
      ref={mapRef}
      style={styles.mapViewport}
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass
      rotateEnabled
      toolbarEnabled={false}>
      {hasUserCoordinates ? (
        <Marker
          key="shop-user-location"
          coordinate={{
            latitude: Number(userCoordinates.latitude),
            longitude: Number(userCoordinates.longitude),
          }}
          title="Sua localizacao"
          description="Posicao atual do cliente"
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
          description={item.addressLine}>
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
