import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const resolveTheme = company => pickTheme(company);

export const categoryHeroCardStyle = ({
  compact,
  hasImage,
  theme: company,
}) => {
  const theme = resolveTheme(company);

  return {
    flexDirection: compact || !hasImage ? 'column' : 'row',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: compact ? 14 : 16,
    overflow: 'hidden',
  };
};

export const categoryHeroImageStyle = ({compact}) => ({
  width: compact ? '100%' : 196,
  height: compact ? 156 : 128,
  borderRadius: 16,
});

export const categoryHeroContentStyle = {
  flex: 1,
  minWidth: 0,
};

export const categoryHeroEyebrowStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  };
};

export const categoryHeroTitleStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 6,
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  };
};

export const categoryHeroDescriptionStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 4,
    color: theme.muted,
    fontSize: 13,
    lineHeight: 18,
  };
};

export const categoryHeroMetaRowStyle = {
  marginTop: 10,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
};

export const categoryHeroMetaChipStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    borderWidth: 1,
    borderColor: `${theme.primary}25`,
    backgroundColor: `${theme.primary}08`,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  };
};

export const categoryHeroMetaTextStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
  };
};
