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
          alias: 'Lave-go Unidade 5',
          shopAddresses: [
            {
              id: 10,
              nickname: 'Lave-go Unidade 5',
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
        companyName: 'Lave-go Unidade 5',
        unitAlias: 'Lave-go Unidade 5',
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

  it('prefers the company alias from People over the address nickname', () => {
    const markers = buildFranchiseMarkerAddresses({
      franchisePinIconUrl: '',
      directory: [
        {
          alias: 'Alias do People',
          name: 'Nome da Empresa',
          shopAddresses: [
            {
              id: 12,
              nickname: 'Nickname da Unidade',
              latitude: -15.61,
              longitude: -56.09,
            },
          ],
        },
      ],
    });

    expect(markers).toEqual([
      expect.objectContaining({
        id: 12,
        companyName: 'Alias do People',
        unitAlias: 'Alias do People',
      }),
    ]);
  });

  it('uses the People logo as the popup logo source', () => {
    const markers = buildFranchiseMarkerAddresses({
      franchisePinIconUrl: '',
      directory: [
        {
          alias: 'Alias do People',
          logo: {id: 321},
          domain: 'maincompany.controleonline.com',
          shopAddresses: [
            {
              id: 13,
              latitude: -15.61,
              longitude: -56.09,
            },
          ],
        },
      ],
    });

    expect(markers).toEqual([
      expect.objectContaining({
        id: 13,
        companyLogoUrl: expect.stringContaining(
          '/files/321/download?app-domain=maincompany.controleonline.com',
        ),
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
