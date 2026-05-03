export const inlineStyle_25_6 = (
  {
    compact: compact,
    theme: theme,
  },
) => ({
  backgroundColor: theme.surface,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  overflow: 'hidden',
  flex: 1,
  minWidth: compact ? 300 : 280,
  flexDirection: compact ? 'row' : 'column',
  minHeight: compact ? 166 : undefined,
  shadowColor: '#0F172A',
  shadowOpacity: compact ? 0.05 : 0,
  shadowRadius: compact ? 12 : 0,
  shadowOffset: {
    width: 0,
    height: compact ? 4 : 0,
  },
});

export const inlineStyle_42_10 = (
  {
    compact: compact,
    theme: theme,
  },
) => ({
  width: compact ? 150 : '100%',
  minHeight: compact ? 166 : 142,
  height: compact ? '100%' : undefined,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${theme.primary}08`,
  position: 'relative',
});

export const inlineStyle_53_14 = (
  {
    compact: compact,
  },
) => ({
  width: '100%',
  height: compact ? '100%' : 174,
});

export const inlineStyle_56_18 = (
  {
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontWeight: '800',
});

export const inlineStyle_67_12 = (
  {
    compact: compact,
    theme: theme,
  },
) => ({
  position: 'absolute',
  right: compact ? 8 : 10,
  top: compact ? 8 : 10,
  minWidth: compact ? 34 : 88,
  height: compact ? 30 : 32,
  backgroundColor: theme.surface,
  borderRadius: 16,
  alignItems: 'center',
  flexDirection: 'row',
  gap: compact ? 0 : 6,
  justifyContent: 'center',
  paddingHorizontal: compact ? 7 : 10,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,

  shadowOffset: {
    width: 0,
    height: 3,
  },
});

export const inlineStyle_68_12 = (
  {
    compact: compact,
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontSize: 11,
  fontWeight: '800',
  display: compact ? 'none' : 'flex',
});

export const inlineStyle_87_12 = {
  flex: 1,
  minWidth: 0,
  paddingHorizontal: 14,
  paddingTop: 12,
  paddingBottom: 12,
  justifyContent: 'space-between',
};

export const inlineStyle_89_10 = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 6,
};

export const inlineStyle_96_12 = (
  {
    theme: theme,
  },
) => ({
  flex: 1,
  color: theme.text,
  fontSize: 16,
  fontWeight: '800',
  lineHeight: 20,
});

export const inlineStyle_107_12 = (
  {
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontSize: 17,
  fontWeight: '900',
});

export const inlineStyle_118_12 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 6,
  color: theme.muted,
  fontSize: 12,
  lineHeight: 16,
});

export const inlineStyle_140_12 = (
  {
    theme: theme,
  },
) => ({
  marginTop: 10,
  minHeight: 36,
  minWidth: 132,
  alignSelf: 'flex-start',
  borderRadius: 999,
  borderWidth: 1,
  borderColor: `${theme.primary}70`,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${theme.primary}08`,
  paddingHorizontal: 18,
});

export const inlineStyle_151_14 = (
  {
    theme: theme,
  },
) => ({
  color: theme.primary,
  fontSize: 12,
  fontWeight: '800',
});

export const inlineStyle_161_12 = {
  marginTop: 10,
  minHeight: 42,
  borderRadius: 12,
};

export const inlineStyle_143_12 = {
  fontSize: 16,
  fontWeight: '700',
};
