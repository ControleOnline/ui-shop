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
    gap: 16,
    backgroundColor: theme.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: 16,
    overflow: 'hidden',
  };
};

export const categoryHeroImageStyle = ({compact}) => ({
  width: compact ? '100%' : 240,
  height: compact ? 180 : 164,
  borderRadius: 18,
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
    marginTop: 8,
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  };
};

export const categoryHeroDescriptionStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    marginTop: 8,
    color: theme.muted,
    fontSize: 14,
    lineHeight: 20,
  };
};

export const categoryHeroMetaRowStyle = {
  marginTop: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
};

export const categoryHeroMetaChipStyle = ({theme: company}) => {
  const theme = resolveTheme(company);

  return {
    borderWidth: 1,
    borderColor: `${theme.primary}25`,
    backgroundColor: `${theme.primary}10`,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
