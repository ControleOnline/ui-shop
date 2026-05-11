export const mobileProductCardStyle = ({theme}) => ({
  borderRadius: 18,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 12,
  gap: 10,
});

export const mobileProductBodyStyle = {
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: 12,
};

export const mobileProductInfoStyle = {
  flex: 1,
  minWidth: 0,
};

export const mobileProductNameStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: '800',
});

export const mobileProductDescriptionStyle = ({theme}) => ({
  marginTop: 5,
  color: theme.muted,
  fontSize: 12,
  lineHeight: 17,
});

export const mobileProductMetaRowStyle = {
  marginTop: 9,
  flexDirection: 'row',
  alignItems: 'center',
};

export const mobileProductPriceStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 16,
  fontWeight: '800',
});

export const mobileProductImageStyle = {
  width: 104,
  height: 104,
  borderRadius: 18,
};

export const mobileProductImageFallbackStyle = ({theme}) => ({
  width: 104,
  height: 104,
  borderRadius: 18,
  backgroundColor: `${theme.primary}0D`,
  alignItems: 'center',
  justifyContent: 'center',
});

export const mobileProductImageFallbackTextStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 10,
  fontWeight: '800',
  textTransform: 'uppercase',
});

export const mobileProductActionButtonStyle = ({theme}) => ({
  minHeight: 42,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: `${theme.primary}45`,
  backgroundColor: `${theme.primary}0F`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 7,
});

export const mobileProductActionTextStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 13,
  fontWeight: '800',
});

export const mobileProductQuantityStyle = ({theme}) => ({
  minHeight: 42,
  borderRadius: 14,
  backgroundColor: theme.surface,
});

export const mobileProductQuantityTextStyle = () => ({
  fontSize: 16,
  fontWeight: '800',
});
