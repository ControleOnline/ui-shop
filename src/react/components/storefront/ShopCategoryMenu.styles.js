export const categoryMenuContainerStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.cardBorder,
  paddingVertical: 10,
});

export const categoryMenuChipStyle = ({isActive, theme}) => ({
  backgroundColor: isActive ? `${theme.primary}18` : `${theme.primary}08`,
  borderColor: isActive ? `${theme.primary}55` : `${theme.primary}25`,
  borderWidth: 1,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
});

export const categoryMenuChipTextStyle = ({isActive, theme}) => ({
  color: isActive ? theme.primary : theme.text,
  fontSize: 12,
  fontWeight: '700',
});

export const categoryMenuContentStyle = {
  paddingHorizontal: 14,
  gap: 10,
};
