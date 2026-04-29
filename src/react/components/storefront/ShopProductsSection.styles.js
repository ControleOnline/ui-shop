import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const productsSectionPanelStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 18,
  };
};

export const productsSectionHeaderStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
};

export const productsSectionTitleStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
  };
};

export const productsSectionHintStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 4,
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
  };
};

export const productsSectionCountStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: `${theme.primary}25`,
    backgroundColor: `${theme.primary}10`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  };
};

export const productsSectionGridStyle = ({gap}) => ({
  marginTop: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap,
});

export const productsSectionCardSlotStyle = ({cardWidth}) => ({
  width: cardWidth,
});

export const productsSectionEmptyStateStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: `${theme.primary}06`,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  };
};

export const productsSectionEmptyTitleStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  };
};

export const productsSectionEmptyTextStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 8,
    color: theme.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  };
};

export const productsSectionLoadingStateStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  };
};
