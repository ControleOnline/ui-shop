export const productPageScrollStyle = {
  flex: 1,
};

export const productPageContentStyle = ({isMobile}) => ({
  paddingHorizontal: isMobile ? 14 : 24,
  paddingTop: isMobile ? 14 : 22,
  paddingBottom: isMobile ? 18 : 36,
});

export const productPageBackRowStyle = {
  width: '100%',
};

export const productPageBackButtonStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: 8,
  marginBottom: 14,
};

export const productPageBackTextStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 14,
  fontWeight: '700',
});

export const productPageHeroStyle = ({isMobile, theme}) => ({
  flexDirection: isMobile ? 'column' : 'row',
  alignItems: 'stretch',
  gap: isMobile ? 16 : 18,
  backgroundColor: theme.surface,
  borderRadius: 28,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  padding: isMobile ? 14 : 18,
});

export const productPageMediaPanelStyle = ({isMobile, theme}) => ({
  flex: isMobile ? 0 : 1.15,
  minHeight: isMobile ? 280 : 420,
  backgroundColor: `${theme.primary}08`,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: `${theme.primary}18`,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const productPageMediaStyle = ({isMobile}) => ({
  width: '100%',
  height: isMobile ? 300 : 420,
});

export const productPageMediaEmptyStyle = ({theme}) => ({
  color: theme.primary,
  fontWeight: '800',
});

export const productPageInfoColumnStyle = ({isMobile}) => ({
  flex: isMobile ? 0 : 0.95,
  minWidth: isMobile ? '100%' : 320,
});

export const productPageEyebrowStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 12,
  fontWeight: '800',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
});

export const productPageTitleStyle = ({isMobile, theme}) => ({
  marginTop: isMobile ? 0 : 8,
  color: theme.text,
  fontSize: isMobile ? 28 : 38,
  fontWeight: '800',
  lineHeight: isMobile ? 34 : 44,
});

export const productPagePriceStyle = ({isMobile, theme}) => ({
  marginTop: 12,
  color: theme.primary,
  fontSize: isMobile ? 32 : 42,
  fontWeight: '800',
});

export const productPageDescriptionStyle = ({theme}) => ({
  marginTop: 14,
  color: theme.muted,
  fontSize: 15,
  lineHeight: 22,
});

export const productPageHelperChipStyle = ({theme, highlighted}) => ({
  alignSelf: 'flex-start',
  marginTop: 16,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: highlighted ? `${theme.primary}30` : theme.cardBorder,
  backgroundColor: highlighted ? `${theme.primary}08` : theme.background,
  paddingHorizontal: 12,
  paddingVertical: 8,
});

export const productPageHelperChipTextStyle = ({theme, highlighted}) => ({
  color: highlighted ? theme.primary : theme.muted,
  fontSize: 12,
  fontWeight: '700',
});

export const productPageInlineActionWrapStyle = {
  marginTop: 20,
};

export const productPageLoadingActionStyle = ({theme}) => ({
  minHeight: 54,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  alignItems: 'center',
  justifyContent: 'center',
});

export const productPageCustomizeButtonStyle = ({theme}) => ({
  minHeight: 54,
  borderRadius: 16,
  backgroundColor: theme.primary,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
});

export const productPageCustomizeButtonTextStyle = ({theme}) => ({
  color: theme.onPrimary,
  fontSize: 15,
  fontWeight: '800',
});

export const productPageSimpleActionRowStyle = ({isMobile}) => ({
  flexDirection: isMobile ? 'column' : 'row',
  gap: 12,
});

export const productPageQuantitySlotStyle = {
  flex: 1.15,
};

export const productPageCartButtonStyle = ({theme}) => ({
  minHeight: 54,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: `${theme.primary}25`,
  backgroundColor: `${theme.primary}0F`,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
  minWidth: 178,
});

export const productPageCartButtonTextStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 14,
  fontWeight: '800',
});

export const productPageDetailsCardStyle = ({theme}) => ({
  flex: 0.72,
  minWidth: 248,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.background,
  padding: 16,
  alignSelf: 'stretch',
});

export const productPageDetailsTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 17,
  fontWeight: '800',
});

export const productPageDetailsTextStyle = ({theme}) => ({
  marginTop: 10,
  color: theme.muted,
  fontSize: 14,
  lineHeight: 22,
});

export const productPageMobileFooterStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderTopWidth: 1,
  borderTopColor: theme.cardBorder,
  padding: 14,
  paddingBottom: 92,
});
