import {
  buildFranchiseMarkerAddresses,
  extractAddressCoordinates,
} from '@controleonline/ui-shop/src/react/utils/shopFranchiseLocator';

describe('shopFranchiseLocator', () => {
  it('adds the configured general-settings pin icon URL to franchise markers', () => {
    const markers = buildFranchiseMarkerAddresses({
      franchisePinIconUrl:
        'https://app.lave-go.com/assets/src/assets/go_google_maps_pin.png',
      directory: [
        {
          shopAddresses: [
            {
              id: 10,
              latitude: '-15.6001',
              longitude: '-56.1001',
            },
          ],
        },
      ],
    });

    expect(markers).toEqual([
      expect.objectContaining({
        id: 10,
        latitude: -15.6001,
        longitude: -56.1001,
        markerIconUrl:
          'https://app.lave-go.com/assets/src/assets/go_google_maps_pin.png',
      }),
    ]);
  });

  it('keeps the default pin when there is no custom icon configured', () => {
    const markers = buildFranchiseMarkerAddresses({
      franchisePinIconUrl: '',
      directory: [
        {
          shopAddresses: [
            {
              id: 11,
              latitude: -15.61,
              longitude: -56.09,
            },
          ],
        },
      ],
    });

    expect(markers).toEqual([
      expect.not.objectContaining({
        markerIconUrl: expect.anything(),
      }),
    ]);
  });

  it('extracts coordinates from nested address shapes used by the directory payload', () => {
    expect(
      extractAddressCoordinates({
        location: {
          lat: '-15,62',
          lng: '-56,08',
        },
      }),
    ).toEqual({
      latitude: -15.62,
      longitude: -56.08,
    });
  });
});
