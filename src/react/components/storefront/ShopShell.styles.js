export const inlineStyle_118_10 = (
  {
    shellBackground: shellBackground,
  },
) => ({
  flex: 1,
  backgroundColor: shellBackground,
});

export const inlineStyle_119_12 = (
  {
    theme: theme,
  },
) => ({
  backgroundColor: theme.header,
});

export const inlineStyle_121_10 = (
  {
    isMobile: isMobile,
    shellPadding: shellPadding,
  },
) => ({
  paddingHorizontal: shellPadding,
  paddingTop: isMobile ? 10 : 10,
  paddingBottom: isMobile ? 10 : 12,
  gap: 8,
  ...(isMobile
    ? {}
    : {
        flexDirection: 'row',
        alignItems: 'center',
      }),
});

export const inlineStyle_128_12 = ({isMobile} = {}) => ({
  width: isMobile ? '100%' : undefined,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: isMobile ? 'center' : 'flex-start',
  gap: 12,
});

export const inlineStyle_135_14 = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
};

export const inlineStyle_146_20 = (
  {
    isMobile: isMobile,
  },
) => ({
  width: isMobile ? 118 : 142,
  height: isMobile ? 54 : 56,
  borderRadius: 0,
});

export const inlineStyle_155_20 = (
  {
    isMobile: isMobile,
  },
) => ({
  width: isMobile ? 56 : 58,
  height: isMobile ? 56 : 54,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.2)',
});

export const inlineStyle_164_22 = (
  {
    isMobile: isMobile,
  },
) => ({
  color: '#fff',
  fontSize: isMobile ? 18 : 24,
  fontWeight: '800',
});

export const inlineStyle_175_20 = {
  flex: 1,
};

export const inlineStyle_177_18 = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

export const inlineStyle_180_20 = (
  {
    isMobile: isMobile,
  },
) => ({
  color: '#fff',
  fontSize: isMobile ? 18 : 18,
  fontWeight: '700',
  flexShrink: 1,
});

export const inlineStyle_191_22 = {
  width: 28,
  height: 28,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.45)',
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
};

export const inlineStyle_214_18 = {
  color: 'rgba(255,255,255,0.86)',
  fontSize: 11,
  marginTop: 2,
};

export const inlineStyle_224_18 = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

export const inlineStyle_228_18 = ({isMobile, theme} = {}) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor:
    !isMobile || !theme ? 'rgba(255,255,255,0.2)' : `${theme.primary}10`,
  borderWidth: isMobile && theme ? 1 : 0,
  borderColor: isMobile && theme ? `${theme.primary}22` : 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
});

export const inlineStyle_241_16 = ({isMobile, theme} = {}) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor:
    !isMobile || !theme ? 'rgba(255,255,255,0.2)' : `${theme.primary}10`,
  borderWidth: isMobile && theme ? 1 : 0,
  borderColor: isMobile && theme ? `${theme.primary}22` : 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
});

export const inlineStyle_255_12 = ({isMobile, theme}) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flex: isMobile ? undefined : 1,
  backgroundColor: isMobile ? theme.surface : 'transparent',
  borderRadius: isMobile ? 18 : 0,
  borderWidth: isMobile ? 1 : 0,
  borderColor: isMobile ? theme.cardBorder : 'transparent',
  paddingHorizontal: isMobile ? 10 : 0,
  paddingVertical: isMobile ? 8 : 0,
  minHeight: 52,
  gap: 10,
  zIndex: 30,
  position: isMobile ? 'sticky' : 'relative',
  top: 0,
});

export const inlineStyle_273_14 = ({isMobile, theme}) => ({
  flex: 1,
  color: isMobile ? theme.text : '#fff',
  fontSize: 14,
  minHeight: 36,
  outlineColor: 'transparent',
  outlineStyle: 'none',
  outlineWidth: 0,
});

export const inlineStyle_282_14 = ({isMobile, theme}) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 42,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: isMobile ? theme.cardBorder : 'rgba(255,255,255,0.3)',
  backgroundColor: isMobile ? theme.background : 'rgba(255,255,255,0.18)',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 9,
  paddingHorizontal: 12,
});

export const inlineStyle_303_10 = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.25)',
};

export const inlineStyle_305_12 = (
  {
    isMobile: isMobile,
    shellPadding: shellPadding,
    surface: surface,
  },
) => ({
  position: 'absolute',
  top: isMobile ? 78 : 92,
  left: shellPadding,
  right: isMobile ? shellPadding : undefined,
  zIndex: 99999,
  elevation: 20,
  backgroundColor: surface,
  minWidth: isMobile ? undefined : 320,
  maxWidth: isMobile ? undefined : 420,
  borderRadius: 12,
  paddingVertical: 6,
  shadowColor: '#000',
  shadowOpacity: 0.28,
  shadowRadius: 12,

  shadowOffset: {
    width: 0,
    height: 6,
  },
});

export const inlineStyle_329_16 = {
  paddingHorizontal: 14,
  paddingVertical: 12,
};

export const inlineStyle_332_18 = (
  {
    foreground: foreground,
  },
) => ({
  color: foreground,
  fontSize: 14,
  fontWeight: '600',
});

export const inlineStyle_345_10 = (
  {
    isMobile: isMobile,
    menuPalette: menuPalette,
  },
) => ({
  flex: 1,
  backgroundColor: menuPalette.modalOverlay,
  alignItems: 'center',
  justifyContent: isMobile ? 'flex-end' : 'flex-start',
  paddingTop: isMobile ? 0 : 92,
  paddingBottom: isMobile ? 14 : 0,
  paddingHorizontal: 12,
});

export const inlineStyle_358_12 = (
  {
    isMobile: isMobile,
    menuPalette: menuPalette,
  },
) => ({
  width: isMobile ? '100%' : 700,
  maxWidth: '100%',
  backgroundColor: menuPalette.modalBackground,
  borderRadius: 16,
  shadowColor: menuPalette.modalShadow,
  shadowOpacity: 0.16,
  shadowRadius: 12,

  shadowOffset: {
    width: 0,
    height: 6,
  },

  padding: 18,
});

export const inlineStyle_369_18 = (
  {
    isMobile: isMobile,
  },
) => ({
  flexDirection: isMobile ? 'column' : 'row',
  gap: 18,
});

export const inlineStyle_370_20 = (
  {
    isMobile: isMobile,
  },
) => ({
  flex: 1,
  paddingRight: isMobile ? 0 : 20,
});

export const inlineStyle_372_18 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalHeaderText,
  fontSize: 20,
  fontWeight: '800',
});

export const inlineStyle_381_18 = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 24,
};

export const inlineStyle_388_20 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  marginLeft: 18,
  color: menuPalette.modalText,
  fontSize: 16,
});

export const inlineStyle_398_18 = {
  marginLeft: 40,
  marginTop: 20,
};

export const inlineStyle_399_24 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalText,
  fontSize: 16,
});

export const inlineStyle_409_18 = {
  marginLeft: 40,
  marginTop: 16,
};

export const inlineStyle_410_24 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalText,
  fontSize: 16,
});

export const inlineStyle_420_18 = {
  marginLeft: 40,
  marginTop: 16,
};

export const inlineStyle_421_24 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalText,
  fontSize: 16,
});

export const inlineStyle_431_18 = {
  marginLeft: 40,
  marginTop: 16,
};

export const inlineStyle_432_24 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalText,
  fontSize: 16,
});

export const inlineStyle_438_18 = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 24,
};

export const inlineStyle_444_24 = {
  marginLeft: 18,
};

export const inlineStyle_445_26 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.textMuted,
  fontSize: 13,
});

export const inlineStyle_447_22 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.modalText,
  fontSize: 15,
  fontWeight: '600',
});

export const inlineStyle_460_16 = (
  {
    isMobile: isMobile,
    menuPalette: menuPalette,
  },
) => ({
  width: isMobile ? '100%' : 1,
  height: isMobile ? 1 : undefined,
  backgroundColor: menuPalette.dividerBorder,
});

export const inlineStyle_468_16 = (
  {
    isMobile: isMobile,
  },
) => ({
  flex: isMobile ? undefined : 1.2,
  alignItems: 'center',
});

export const inlineStyle_473_18 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  width: 74,
  height: 74,
  borderRadius: 37,
  backgroundColor: menuPalette.buttonBackground,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const inlineStyle_485_22 = {
  width: '100%',
  height: '100%',
};

export const inlineStyle_490_22 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.buttonText,
  fontSize: 24,
  fontWeight: '700',
});

export const inlineStyle_497_18 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  marginTop: 14,
  textAlign: 'center',
  color: menuPalette.modalText,
  fontSize: 14,
  lineHeight: 20,
});

export const inlineStyle_508_18 = {
  marginTop: 18,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
};

export const inlineStyle_531_18 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  marginTop: 18,
  backgroundColor: menuPalette.buttonBackground,
  paddingHorizontal: 20,
  paddingVertical: 11,
  borderRadius: 10,
});

export const inlineStyle_538_24 = (
  {
    menuPalette: menuPalette,
  },
) => ({
  color: menuPalette.buttonText,
  fontWeight: '700',
});
