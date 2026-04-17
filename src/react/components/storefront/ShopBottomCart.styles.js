export const inlineStyle_23_6 = (
  {
    bottomOffset: bottomOffset,
    theme: theme,
  },
) => ({
  position: 'absolute',
  left: 12,
  right: 12,
  bottom: bottomOffset + 12,
  zIndex: 50,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.surface,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 10,
  gap: 10,
  shadowColor: '#0F172A',
  shadowOpacity: 0.16,
  shadowRadius: 10,

  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 6,
});

export const inlineStyle_45_8 = (
  {
    theme: theme,
  },
) => ({
  minWidth: 90,
  color: theme.primary,
  fontSize: 20,
  fontWeight: '800',
});

export const inlineStyle_56_8 = (
  {
    itemsCount: itemsCount,
    theme: theme,
  },
) => ({
  flex: 1,
  backgroundColor: itemsCount > 0 ? theme.primary : theme.cardBorder,
  minHeight: 44,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
});

export const inlineStyle_68_12 = {
  minWidth: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: 'rgba(255,255,255,0.24)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 6,
};

export const inlineStyle_77_18 = (
  {
    theme: theme,
  },
) => ({
  color: theme.onPrimary,
  fontSize: 12,
  fontWeight: '700',
});

export const inlineStyle_83_10 = (
  {
    itemsCount: itemsCount,
    theme: theme,
  },
) => ({
  color: itemsCount > 0 ? theme.onPrimary : theme.muted,
  fontSize: 15,
  fontWeight: '800',
});
