const {
  buildAndroidWebMapHtml,
  resolveWebViewBaseUrlForDomain,
} = require('@controleonline/ui-default/src/react/components/map/DefaultNativeMap.shared');

const {describe, expect, it} = global;

describe('DefaultNativeMap.shared', () => {
  it('resolves the Android WebView base URL from the configured domain', () => {
    expect(resolveWebViewBaseUrlForDomain('https://app.lave-go.com')).toBe(
      'https://app.lave-go.com/',
    );
    expect(resolveWebViewBaseUrlForDomain('app.lave-go.com')).toBe(
      'https://app.lave-go.com/',
    );
    expect(resolveWebViewBaseUrlForDomain('')).toBe(
      'https://app.controleonline.com/',
    );
  });

  it('builds the Android Google Maps WebView document with the native bridge', () => {
    const html = buildAndroidWebMapHtml({
      apiKey: 'android-webview-key',
      markerPayloads: [
        {
          id: 'company-1-address-1',
          companyName: 'Loja Centro',
          unitAlias: 'Lave-go unidade 5',
          title: 'Unidade Centro',
          addressLine: 'Rua Principal, 100',
          addressExtra: 'Centro • Cuiaba/MT',
          distanceLabel: '2,1 km',
          latitude: -15.6,
          longitude: -56.1,
          markerIconUrl: 'https://cdn.example.com/pin.png',
          openingHours: '08:00 - 18:00',
          phoneLabel: '(65) 99999-0000',
        },
      ],
      paths: [
        {
          id: 'route-1',
          from: {
            latitude: -15.61,
            longitude: -56.09,
          },
          to: {
            latitude: -15.6,
            longitude: -56.1,
          },
        },
      ],
      routeColor: '#123456',
      userCoordinates: {
        latitude: -15.61,
        longitude: -56.09,
      },
    });

    expect(html).toContain('window.ReactNativeWebView.postMessage');
    expect(html).toContain('gm_authFailure');
    expect(html).toContain('callback=initMap');
    expect(html).toContain('android-webview-key');
    expect(html).toContain('#123456');
    expect(html).toContain('Loja Centro');
    expect(html).toContain('Lave-go unidade 5');
    expect(html).toContain('__SHOP_MAP_PATHS__');
    expect(html).toContain('Abrir no Maps');
    expect(html).toContain('Abrir no Waze');
    expect(html).toContain('popup-header');
  });
});
