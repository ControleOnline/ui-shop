import {resolveAppDomain} from '@controleonline/ui-common/src/utils/appDomain';

const serializeForHtml = value =>
  JSON.stringify(value).replace(/</g, '\\u003c');

export const resolveWebViewBaseUrlForDomain = configuredDomain => {
  const host = resolveAppDomain(configuredDomain);
  return host ? `https://${host}/` : 'https://app.controleonline.com/';
};

export const buildAndroidWebMapHtml = ({
  apiKey,
  markerPayloads = [],
  routeColor = '#0EA5E9',
  userCoordinates = null,
}) => {
  const markers = Array.isArray(markerPayloads) ? markerPayloads : [];

  return `<!DOCTYPE html>
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

        #error {
          position: absolute;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.78);
          color: #ffffff;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          z-index: 10;
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
      <div id="error"></div>
      <script>
        window.__SHOP_MAP_MARKERS__ = ${serializeForHtml(markers)};
        window.__SHOP_MAP_USER__ = ${serializeForHtml(userCoordinates || null)};

        function escapeHtml(value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function postMessage(payload) {
          if (!window.ReactNativeWebView) {
            return;
          }

          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }

        function bridgeConsole(method) {
          var original = console[method];

          console[method] = function bridgedConsole() {
            var args = Array.prototype.slice.call(arguments).map(function (item) {
              if (typeof item === 'string') {
                return item;
              }

              try {
                return JSON.stringify(item);
              } catch (error) {
                return String(item);
              }
            });

            postMessage({
              type: 'console',
              level: method,
              message: args.join(' '),
            });

            if (typeof original === 'function') {
              return original.apply(console, arguments);
            }

            return undefined;
          };
        }

        bridgeConsole('log');
        bridgeConsole('warn');
        bridgeConsole('error');

        function showError(message) {
          var errorElement = document.getElementById('error');
          errorElement.textContent = message;
          errorElement.style.display = 'flex';
          postMessage({type: 'error', message: message});
        }

        function buildPopupLine(value) {
          if (!value) {
            return '';
          }

          return '<div class="popup-line">' + escapeHtml(value) + '</div>';
        }

        function buildPopupMeta(label, value) {
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

        function buildPopupAction(url, label, className) {
          return (
            '<a class="popup-action ' +
              className +
              '" href="' + escapeHtml(url) + '">' +
              escapeHtml(label) +
            '</a>'
          );
        }

        function buildPopupContent(item) {
          return (
            '<div class="popup">' +
              '<div class="popup-company">' + escapeHtml(item.companyName) + '</div>' +
              '<div class="popup-title">' + escapeHtml(item.title) + '</div>' +
              buildPopupLine(item.addressLine) +
              buildPopupLine(item.addressExtra) +
              '<div class="popup-meta-list">' +
                buildPopupMeta('Telefone', item.phoneLabel) +
                buildPopupMeta('Distancia', item.distanceLabel) +
                buildPopupMeta('Horario', item.openingHours) +
              '</div>' +
              '<div class="popup-actions">' +
                buildPopupAction(item.googleMapsUrl, 'Abrir no Maps', 'primary') +
                buildPopupAction(item.wazeUrl, 'Waze', '') +
              '</div>' +
            '</div>'
          );
        }

        window.handleMapError = function handleMapError() {
          showError('Nao foi possivel carregar o Google Maps.');
        };

        window.gm_authFailure = function gmAuthFailure() {
          showError('Nao foi possivel autenticar a chave do Google Maps.');
        };

        window.addEventListener('error', function handleWindowError(event) {
          var message =
            event && event.message
              ? event.message
              : 'Ocorreu um erro ao carregar o mapa.';
          postMessage({type: 'window-error', message: message});
        });

        window.initMap = function initMap() {
          try {
            var markers = window.__SHOP_MAP_MARKERS__ || [];
            var userCoordinates = window.__SHOP_MAP_USER__;

            if (!window.google || !markers.length) {
              showError('Nao foi possivel localizar as franquias no mapa.');
              return;
            }

            var map = new window.google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              clickableIcons: false,
              gestureHandling: 'greedy',
              zoomControl: false,
              disableDefaultUI: true,
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
                    strokeColor: ${serializeForHtml(routeColor)},
                    strokeOpacity: 0.92,
                    strokeWeight: 5,
                  },
                })
              : null;
            var activeRouteRequestId = 0;

            if (hasUserCoordinates) {
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
              var markerOptions = {
                position: position,
                map: map,
                title: item.title,
                animation: window.google.maps.Animation.DROP,
              };

              if (item.markerIconUrl) {
                markerOptions.icon = {
                  url: item.markerIconUrl,
                  scaledSize: new window.google.maps.Size(42, 42),
                };
              }

              var marker = new window.google.maps.Marker(markerOptions);

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

            if (bounds.isEmpty()) {
              showError('Nao foi possivel localizar as franquias no mapa.');
              return;
            }

            map.fitBounds(bounds, {
              top: 56,
              right: 32,
              bottom: 56,
              left: 32,
            });

            postMessage({type: 'ready'});

            window.google.maps.event.addListenerOnce(map, 'idle', function () {
              if (markers.length === 1 && map.getZoom() > 15) {
                map.setZoom(15);
              }
            });
          } catch (error) {
            showError('Nao foi possivel carregar o Google Maps.');
          }
        };
      </script>
      <script
        async
        defer
        src="https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          apiKey,
        )}&loading=async&callback=initMap"
        onerror="handleMapError()"></script>
    </body>
  </html>`;
};
