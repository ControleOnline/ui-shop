export const mobileStorePanelStyle = {
  marginBottom: 10,
};

export const mobileStoreCoverStyle = ({theme}) => ({
  minHeight: 108,
  paddingTop: 18,
  paddingBottom: 20,
  paddingHorizontal: 18,
  borderBottomLeftRadius: 26,
  borderBottomRightRadius: 26,
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

export const mobileStoreCardStyle = ({theme}) => ({
  marginHorizontal: 14,
  marginTop: -16,
  padding: 10,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  shadowColor: '#0F172A',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 5,
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
  width: 168,
  height: 68,
});

export const mobileStoreLogoFallbackStyle = ({theme}) => ({
  width: 82,
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

export const mobileStoreSearchStyle = ({theme}) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 42,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.background,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 11,
});

export const mobileStoreSearchInputStyle = ({theme}) => ({
  flex: 1,
  color: theme.text,
  fontSize: 14,
  minHeight: 38,
  outlineColor: 'transparent',
  outlineStyle: 'none',
  outlineWidth: 0,
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
