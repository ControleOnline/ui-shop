import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const productsSectionPanelStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 14,
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
    fontSize: 17,
    fontWeight: '800',
  };
};

export const productsSectionHintStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 4,
    color: theme.muted,
    fontSize: 11,
    lineHeight: 16,
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
    paddingVertical: 6,
  };
};

export const productsSectionGridStyle = ({gap}) => ({
  marginTop: 12,
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'stretch',
  gap,
});

export const productsSectionCardSlotStyle = ({cardWidth}) => ({
  width: cardWidth,
  minWidth: 0,
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
