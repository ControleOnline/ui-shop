import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const sidebarPanelStyle = ({compact, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    overflow: 'hidden',
    padding: compact ? 10 : 12,
    gap: 8,
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
    fontSize: 16,
    fontWeight: '800',
  };
};

export const sidebarHintStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
  };
};

export const sidebarCountBadgeStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.surface,
  };
};

export const sidebarListStyle = {
  gap: 8,
};

export const sidebarItemStyle = ({compact, isActive, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    flexDirection: 'row',
    alignItems: compact ? 'center' : 'flex-start',
    gap: compact ? 9 : 10,
    paddingHorizontal: compact ? 10 : 12,
    paddingVertical: compact ? 9 : 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: isActive ? `${theme.primary}60` : theme.cardBorder,
    backgroundColor: isActive ? `${theme.primary}12` : `${theme.primary}03`,
  };
};

export const sidebarThumbStyle = ({compact}) => ({
  width: compact ? 44 : 46,
  height: compact ? 44 : 46,
  borderRadius: 12,
});

export const sidebarNameStyle = ({isActive, theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: isActive ? theme.primary : theme.text,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  };
};

export const sidebarDescriptionStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 4,
    color: theme.muted,
    fontSize: 11,
    lineHeight: 15,
  };
};
