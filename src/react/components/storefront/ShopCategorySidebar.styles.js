import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const sidebarPanelStyle = ({compact, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    backgroundColor: theme.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    padding: compact ? 12 : 16,
    gap: 10,
  };
};

export const sidebarHeaderStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
};

export const sidebarItemContentStyle = {
  flex: 1,
  minWidth: 0,
};

export const sidebarTitleStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.text,
    fontSize: 17,
    fontWeight: '800',
  };
};

export const sidebarHintStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 18,
  };
};

export const sidebarCountBadgeStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${theme.primary}25`,
    backgroundColor: `${theme.primary}08`,
    alignSelf: 'flex-start',
  };
};

export const sidebarToggleButtonStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.surface,
  };
};

export const sidebarListStyle = {
  gap: 10,
};

export const sidebarItemStyle = ({compact, isActive, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    flexDirection: 'row',
    alignItems: compact ? 'center' : 'flex-start',
    gap: compact ? 10 : 12,
    paddingHorizontal: compact ? 12 : 14,
    paddingVertical: compact ? 11 : 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: isActive ? `${theme.primary}55` : theme.cardBorder,
    backgroundColor: isActive ? `${theme.primary}10` : theme.surface,
  };
};

export const sidebarThumbStyle = ({compact}) => ({
  width: compact ? 50 : 52,
  height: compact ? 50 : 52,
  borderRadius: 16,
});

export const sidebarNameStyle = ({isActive, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: isActive ? theme.primary : theme.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  };
};

export const sidebarDescriptionStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 4,
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
  };
};
