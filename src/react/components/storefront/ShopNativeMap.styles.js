import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#E5EEF5',
  },
  mapViewport: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    gap: 12,
  },
  mapOverlayText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '600',
  },
  markerWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 42,
    height: 42,
  },
  calloutCard: {
    minWidth: 228,
    maxWidth: 288,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  companyName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#0369A1',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  line: {
    fontSize: 13,
    lineHeight: 19,
    color: '#0F172A',
    marginBottom: 4,
  },
  metaList: {
    marginTop: 10,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  actionButtonPrimary: {
    borderColor: 'transparent',
    backgroundColor: '#0EA5E9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionTextPrimary: {
    color: '#FFFFFF',
  },
});
