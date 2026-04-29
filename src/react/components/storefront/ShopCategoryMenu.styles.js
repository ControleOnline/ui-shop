export const categoryMenuContainerStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.cardBorder,
  paddingVertical: 8,
});

export const categoryMenuChipStyle = ({isActive, theme}) => ({
  backgroundColor: isActive ? `${theme.primary}14` : theme.surface,
  borderColor: isActive ? `${theme.primary}55` : theme.cardBorder,
  borderWidth: 1,
  minHeight: 38,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 999,
  justifyContent: 'center',
});

export const categoryMenuChipTextStyle = ({isActive, theme}) => ({
  color: isActive ? theme.primary : theme.text,
  fontSize: 12,
  fontWeight: isActive ? '800' : '700',
});

export const categoryMenuContentStyle = {
  paddingHorizontal: 16,
  gap: 8,
};
