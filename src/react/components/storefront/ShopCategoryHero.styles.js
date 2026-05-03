import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const categoryHeroCardStyle = ({
  compact,
  hasImage,
  theme: company,
}) => {
  const theme = resolveTheme(company);

  return {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: compact || !hasImage ? 'column' : 'row',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: compact ? 12 : 12,
    overflow: 'hidden',
  };
};

export const categoryHeroImageStyle = ({compact}) => ({
  width: compact ? '100%' : 168,
  height: compact ? 136 : 108,
  borderRadius: 14,
});

export const categoryHeroContentStyle = {
  flex: 1,
  minWidth: 0,
};

export const categoryHeroEyebrowStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  };
};

export const categoryHeroTitleStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 5,
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  };
};

export const categoryHeroDescriptionStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 3,
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
  };
};

export const categoryHeroMetaRowStyle = {
  marginTop: 8,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 7,
};

export const categoryHeroMetaChipStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    borderWidth: 1,
    borderColor: `${theme.primary}25`,
    backgroundColor: `${theme.primary}08`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  };
};

export const categoryHeroMetaTextStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '700',
  };
};
