export const mobileStorePanelStyle = {
  marginBottom: 14,
};

export const mobileStoreCoverStyle = ({theme}) => ({
  height: 98,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.header,
});

export const mobileStoreCoverImageStyle = {
  width: '100%',
  height: '100%',
};

export const mobileStoreCoverFallbackTextStyle = ({theme}) => ({
  color: theme.onPrimary,
  fontSize: 26,
  fontWeight: '800',
});

export const mobileStoreCardStyle = ({hasCover, theme}) => ({
  marginHorizontal: 14,
  marginTop: hasCover ? -18 : 14,
  padding: 14,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  flexDirection: 'row',
  gap: 12,
  shadowColor: '#0F172A',
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: {
    width: 0,
    height: 6,
  },
  elevation: 4,
});

export const mobileStoreMenuButtonStyle = ({theme}) => ({
  width: 42,
  height: 42,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: `${theme.primary}24`,
  backgroundColor: `${theme.primary}10`,
  alignItems: 'center',
  justifyContent: 'center',
});

export const mobileStoreLogoStyle = ({theme}) => ({
  width: 64,
  height: 64,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: theme.cardBorder,
});

export const mobileStoreLogoFallbackStyle = ({theme}) => ({
  width: 64,
  height: 64,
  borderRadius: 18,
  backgroundColor: theme.primary,
  alignItems: 'center',
  justifyContent: 'center',
});

export const mobileStoreLogoFallbackTextStyle = ({theme}) => ({
  color: theme.onPrimary,
  fontSize: 20,
  fontWeight: '800',
});

export const mobileStoreTextColumnStyle = {
  flex: 1,
  minWidth: 0,
};

export const mobileStoreNameStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 18,
  fontWeight: '800',
});

export const mobileStoreSubtitleStyle = ({theme}) => ({
  marginTop: 4,
  color: theme.muted,
  fontSize: 12,
  lineHeight: 17,
});

export const mobileStoreMetaRowStyle = {
  marginTop: 9,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 7,
};

export const mobileStoreMetaPillStyle = ({theme}) => ({
  paddingHorizontal: 9,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: `${theme.primary}10`,
  borderWidth: 1,
  borderColor: `${theme.primary}24`,
});

export const mobileStoreMetaPillTextStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 11,
  fontWeight: '800',
});
