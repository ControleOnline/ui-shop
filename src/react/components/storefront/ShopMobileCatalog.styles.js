export const mobileCatalogRootStyle = ({theme}) => ({
  flex: 1,
  backgroundColor: theme.background,
});

export const mobileCatalogCategoryListContentStyle = {
  paddingHorizontal: 14,
  paddingBottom: 12,
  gap: 10,
};

export const mobileCatalogCategoryStickyStyle = ({theme}) => ({
  backgroundColor: theme.background,
  paddingTop: 8,
  zIndex: 20,
});

export const mobileCatalogCategoryCardStyle = ({isActive, theme}) => ({
  width: 104,
  minHeight: 122,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: isActive ? theme.primary : theme.cardBorder,
  backgroundColor: isActive ? `${theme.primary}10` : theme.surface,
  padding: 8,
  gap: 7,
});

export const mobileCatalogCategoryCardImageStyle = {
  width: '100%',
  height: 66,
  borderRadius: 14,
};

export const mobileCatalogCategoryCardTextStyle = ({isActive, theme}) => ({
  color: isActive ? theme.primary : theme.text,
  fontSize: 12,
  lineHeight: 15,
  fontWeight: '800',
});

export const mobileCatalogControlsStyle = ({theme}) => ({
  marginHorizontal: 14,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 12,
  gap: 10,
});

export const mobileCatalogSearchWrapStyle = {
  minWidth: 0,
};

export const mobileCatalogSearchStyle = ({theme}) => ({
  minHeight: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.background,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 9,
  paddingLeft: 12,
  paddingRight: 8,
});

export const mobileCatalogSearchInputStyle = ({theme}) => ({
  flex: 1,
  minHeight: 44,
  color: theme.text,
  fontSize: 14,
  outlineColor: 'transparent',
  outlineStyle: 'none',
  outlineWidth: 0,
});

export const mobileCatalogSearchButtonStyle = ({theme}) => ({
  width: 34,
  height: 34,
  borderRadius: 12,
  backgroundColor: theme.primary,
  alignItems: 'center',
  justifyContent: 'center',
});

export const mobileCatalogSectionStackStyle = {
  paddingHorizontal: 14,
  paddingTop: 18,
  paddingBottom: 128,
  gap: 24,
};

export const mobileCatalogSearchResultsStyle = ({theme}) => ({
  borderRadius: 22,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  backgroundColor: theme.surface,
  padding: 12,
  gap: 10,
});

export const mobileCatalogSearchResultsTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 20,
  fontWeight: '800',
});
