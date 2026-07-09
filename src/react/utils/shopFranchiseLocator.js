import {
  normalizeShopTextConfig,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

const normalizeCoordinate = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export const extractAddressCoordinates = address => {
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

export const buildFranchiseMarkerAddresses = ({
  directory = [],
  franchisePinIconUrl = '',
}) => {
  const normalizedConfiguredIconUrl = normalizeShopTextConfig(
    franchisePinIconUrl,
  );

  return directory.flatMap(company =>
    (company?.shopAddresses || [])
      .map(address => {
        const coordinates = extractAddressCoordinates(address);

        if (
          coordinates &&
          (normalizeCoordinate(coordinates.latitude) === null ||
            normalizeCoordinate(coordinates.longitude) === null)
        ) {
          return null;
        }

        const resolvedMarkerIconUrl =
          normalizedConfiguredIconUrl ||
          normalizeShopTextConfig(address?.markerIconUrl);

        return {
          ...address,
          latitude: coordinates?.latitude ?? address?.latitude ?? null,
          longitude: coordinates?.longitude ?? address?.longitude ?? null,
          ...(resolvedMarkerIconUrl
            ? {markerIconUrl: resolvedMarkerIconUrl}
            : {}),
        };
      })
      .filter(Boolean),
  );
};
