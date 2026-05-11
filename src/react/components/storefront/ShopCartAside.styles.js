export const cartAsidePanelStyle = ({theme}) => ({
  backgroundColor: theme.surface,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  overflow: 'hidden',
});

export const cartAsideHeaderStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  padding: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#00000000',
};

export const cartAsideTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: '800',
});

export const cartAsideHintStyle = ({theme}) => ({
  marginTop: 4,
  color: theme.muted,
  fontSize: 11,
  lineHeight: 16,
});

export const cartAsideCountStyle = ({theme}) => ({
  color: theme.primary,
  fontSize: 12,
  fontWeight: '800',
  borderWidth: 1,
  borderColor: `${theme.primary}25`,
  backgroundColor: `${theme.primary}10`,
  borderRadius: 999,
  paddingHorizontal: 9,
  paddingVertical: 6,
});

export const cartAsideBodyStyle = {
  paddingHorizontal: 14,
  paddingBottom: 14,
};

export const cartAsideEmptyStyle = ({theme}) => ({
  borderWidth: 1,
  borderColor: `${theme.primary}18`,
  borderRadius: 16,
  padding: 16,
  alignItems: 'center',
  backgroundColor: `${theme.primary}04`,
});

export const cartAsideEmptyTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 14,
  fontWeight: '800',
  textAlign: 'center',
});

export const cartAsideListStyle = {
  gap: 8,
};

export const cartAsideRowStyle = ({theme}) => ({
  borderWidth: 1,
  borderColor: theme.cardBorder,
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingVertical: 10,
  gap: 3,
  backgroundColor: `${theme.primary}06`,
});

export const cartAsideRowNameStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 14,
  fontWeight: '800',
  lineHeight: 18,
});

export const cartAsideRowMetaStyle = ({theme}) => ({
  color: theme.muted,
  fontSize: 12,
  lineHeight: 18,
});

export const cartAsideFooterStyle = {
  padding: 14,
  borderTopWidth: 1,
  borderTopColor: '#00000000',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

export const cartAsideTotalLabelStyle = ({theme}) => ({
  color: theme.muted,
  fontSize: 12,
  fontWeight: '700',
});

export const cartAsideTotalValueStyle = ({theme}) => ({
  marginTop: 4,
  color: theme.text,
  fontSize: 22,
  fontWeight: '800',
});

export const cartAsideButtonStyle = ({disabled, theme}) => ({
  minHeight: 42,
  minWidth: 124,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: disabled ? theme.cardBorder : theme.primary,
  backgroundColor: disabled ? `${theme.primary}06` : `${theme.primary}14`,
  paddingHorizontal: 16,
});

export const cartAsideButtonTextStyle = ({disabled, theme}) => ({
  color: disabled ? theme.muted : theme.primary,
  fontSize: 13,
  fontWeight: '800',
});
