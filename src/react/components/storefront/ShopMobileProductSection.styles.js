export const mobileProductSectionStyle = {
  gap: 12,
};

export const mobileProductSectionHeaderStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
};

export const mobileProductSectionTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 20,
  fontWeight: '800',
});

export const mobileProductSectionSubtitleStyle = ({theme}) => ({
  marginTop: 4,
  color: theme.muted,
  fontSize: 12,
  lineHeight: 17,
});

export const mobileProductSectionMetaStyle = ({theme}) => ({
  minWidth: 34,
  textAlign: 'center',
  color: theme.primary,
  fontSize: 12,
  fontWeight: '800',
  borderRadius: 999,
  borderWidth: 1,
  borderColor: `${theme.primary}26`,
  backgroundColor: `${theme.primary}10`,
  paddingHorizontal: 9,
  paddingVertical: 7,
});

export const mobileProductSectionListStyle = ({isTabletGrid}) => ({
  flexDirection: isTabletGrid ? 'row' : 'column',
  flexWrap: isTabletGrid ? 'wrap' : 'nowrap',
  gap: 10,
});

export const mobileProductSectionCardSlotStyle = ({isTabletGrid}) => ({
  width: isTabletGrid ? '48.8%' : '100%',
});

export const mobileProductSectionEmptyStyle = ({theme}) => ({
  minHeight: 72,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 14,
});

export const mobileProductSectionEmptyTextStyle = ({theme}) => ({
  color: theme.muted,
  fontSize: 13,
  textAlign: 'center',
});
