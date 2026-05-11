export const mobileCategoryTriggerStyle = ({theme}) => ({
  minHeight: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: `${theme.primary}28`,
  backgroundColor: theme.surface,
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
});

export const mobileCategoryTriggerTextWrapStyle = {
  flex: 1,
  minWidth: 0,
};

export const mobileCategoryTriggerCaptionStyle = ({theme}) => ({
  color: theme.muted,
  fontSize: 10,
  fontWeight: '800',
  textTransform: 'uppercase',
});

export const mobileCategoryTriggerTextStyle = ({theme}) => ({
  marginTop: 2,
  color: theme.text,
  fontSize: 14,
  fontWeight: '800',
});

export const mobileCategoryModalOverlayStyle = {
  flex: 1,
  backgroundColor: 'rgba(15, 23, 42, 0.38)',
  justifyContent: 'flex-end',
};

export const mobileCategoryModalCardStyle = ({theme}) => ({
  maxHeight: '82%',
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  backgroundColor: theme.surface,
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 12,
});

export const mobileCategoryModalHeaderStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
};

export const mobileCategoryModalTitleStyle = ({theme}) => ({
  color: theme.text,
  fontSize: 18,
  fontWeight: '800',
});

export const mobileCategoryModalCloseStyle = ({theme}) => ({
  width: 38,
  height: 38,
  borderRadius: 19,
  borderWidth: 1,
  borderColor: theme.cardBorder,
  alignItems: 'center',
  justifyContent: 'center',
});

export const mobileCategoryModalContentStyle = {
  gap: 10,
  paddingBottom: 12,
};

export const mobileCategoryModalOptionStyle = ({isActive, theme}) => ({
  minHeight: 78,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: isActive ? theme.primary : theme.cardBorder,
  backgroundColor: isActive ? `${theme.primary}10` : theme.background,
  padding: 10,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
});

export const mobileCategoryModalOptionImageStyle = {
  width: 58,
  height: 58,
  borderRadius: 16,
};

export const mobileCategoryModalOptionInfoStyle = {
  flex: 1,
  minWidth: 0,
};

export const mobileCategoryModalOptionTitleStyle = ({isActive, theme}) => ({
  color: isActive ? theme.primary : theme.text,
  fontSize: 14,
  fontWeight: '800',
});

export const mobileCategoryModalOptionSubtitleStyle = ({theme}) => ({
  marginTop: 4,
  color: theme.muted,
  fontSize: 12,
  lineHeight: 16,
});

export const mobileCategoryModalOptionCheckStyle = ({theme}) => ({
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: theme.primary,
  alignItems: 'center',
  justifyContent: 'center',
});
