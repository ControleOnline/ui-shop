export const catalogPageScrollContentStyle = {
  flexGrow: 1,
};

export const catalogPageSectionStackStyle = {
  width: '100%',
  alignSelf: 'stretch',
  gap: 10,
};

export const catalogPageSearchCategoriesStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  padding: 16,
  gap: 12,
});

export const catalogPageSearchCategoryButtonStyle = ({theme}) => ({
  borderWidth: 1,
  borderColor: `${theme.primary}30`,
  borderRadius: 16,
  backgroundColor: `${theme.primary}08`,
  padding: 14,
});

export const catalogPageSearchCategoryTextStyle = ({highlight, theme}) => ({
  color: highlight ? theme.primary : theme.muted,
  fontSize: highlight ? 14 : 12,
  fontWeight: highlight ? '800' : '600',
  lineHeight: highlight ? 18 : 16,
});
