export const categoryMenuContainerStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.cardBorder,
  paddingVertical: 7,
});

export const categoryMenuChipStyle = ({isActive, theme}) => ({
  backgroundColor: isActive ? `${theme.accent}18` : `${theme.primary}05`,
  borderColor: isActive ? theme.accent : `${theme.primary}25`,
  borderWidth: 1,
  minHeight: 34,
  paddingVertical: 7,
  paddingHorizontal: 14,
  borderRadius: 999,
  justifyContent: 'center',
});

export const categoryMenuChipTextStyle = ({isActive, theme}) => ({
  color: isActive ? theme.primary : theme.text,
  fontSize: 12,
  fontWeight: isActive ? '800' : '700',
});

export const categoryMenuContentStyle = {
  paddingHorizontal: 14,
  gap: 10,
};
