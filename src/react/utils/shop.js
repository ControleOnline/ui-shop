import {env} from '@env';
import {
  resolveAppDomain,
  resolveCompanyDomain,
} from '@controleonline/ui-common/src/utils/appDomain';
import { resolveFileImageUrl } from '@controleonline/ui-common/src/react/utils/fileUrl';

export const SHOP_PRODUCT_TYPES = ['product', 'manufactured', 'custom', 'service'];

export const getHost = company =>
  resolveCompanyDomain(company, resolveAppDomain(env.DOMAIN));

export const buildFileUrl = (file, company = null) =>
  resolveFileImageUrl(file, {company});

export const formatMoney = value => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const normalizeId = value => String(value || '').replace(/\D/g, '');

export const getImageFromRelations = relations => {
  const first = Array.isArray(relations)
    ? relations.find(item => item?.file?.id)
    : null;
  return first?.file ? buildFileUrl(first.file) : '';
};

const CSS_VAR_FALLBACK_HEX_REGEX =
  /^var\([^,]+,\s*(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})\s*\)$/;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const resolveThemeColors = source => {
  if (source?.theme?.colors && typeof source.theme.colors === 'object') {
    return source.theme.colors;
  }

  if (source?.colors && typeof source.colors === 'object') {
    return source.colors;
  }

  return source && typeof source === 'object' ? source : {};
};

const pickColor = (...candidates) =>
  candidates.find(
    candidate => typeof candidate === 'string' && candidate.trim().length > 0,
  );

const normalizeHexColor = value => {
  if (typeof value !== 'string') return null;

  const raw = value.trim().replace(/;$/, '');
  const fallbackMatch = raw.match(CSS_VAR_FALLBACK_HEX_REGEX);
  const color = fallbackMatch?.[1] || raw;

  if (!HEX_COLOR_REGEX.test(color)) return null;

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return color;
};

const getRelativeLuminance = value => {
  const normalized = normalizeHexColor(value);
  if (!normalized) return null;

  const intValue = parseInt(normalized.slice(1), 16);
  const channels = [
    (intValue >> 16) & 255,
    (intValue >> 8) & 255,
    intValue & 255,
  ].map(channel => {
    const srgb = channel / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const getContrastRatio = (foreground, background) => {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null;
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const resolveReadableColor = ({
  backgrounds,
  candidates,
  fallback,
  minimumRatio,
  preferred,
}) => {
  const validBackgrounds = backgrounds.filter(Boolean);
  const isReadable = color =>
    validBackgrounds.every(background => {
      const ratio = getContrastRatio(color, background);
      return ratio === null || ratio >= minimumRatio;
    });

  if (preferred && isReadable(preferred)) {
    return preferred;
  }

  const readableCandidate = candidates.find(
    candidate => candidate && isReadable(candidate),
  );

  return readableCandidate || preferred || fallback;
};

export const pickTheme = source => {
  const themeColors = resolveThemeColors(source);
  const pageBackground = pickColor(
    themeColors.pageBackground,
    themeColors.background,
    '#F3F7FB',
  );
  const cardBackground = pickColor(
    themeColors.cardBackground,
    themeColors.surface,
    '#FFFFFF',
  );
  const headerBackground = pickColor(
    themeColors.headerBackground,
    themeColors['header-primary'],
    themeColors.primary,
    '#0B3A53',
  );
  const headerBorder = pickColor(
    themeColors.headerBorder,
    themeColors.cardBorder,
    themeColors.border,
    '#D7E1EC',
  );
  const buttonBackground = pickColor(
    themeColors.buttonBackground,
    themeColors.primary,
    '#0E7490',
  );
  const chipSelectedBackground = pickColor(
    themeColors.chipSelectedBackground,
    themeColors.accent,
    themeColors.secondary,
    '#E67E22',
  );
  const chipSelectedBorder = pickColor(
    themeColors.chipSelectedBorder,
    themeColors.buttonBorder,
    buttonBackground,
  );
  const chipSelectedText = pickColor(
    themeColors.chipSelectedText,
    themeColors.accent,
    themeColors.secondary,
    '#E67E22',
  );
  const dividerBorder = pickColor(
    themeColors.dividerBorder,
    themeColors.headerBorder,
    themeColors.border,
    '#D7E1EC',
  );
  const modalBackground = pickColor(
    themeColors.modalBackground,
    cardBackground,
    '#FFFFFF',
  );
  const modalHeaderText = pickColor(
    themeColors.modalHeaderText,
    themeColors.textPrimary,
    themeColors['text-primary'],
    '#1A1A1A',
  );
  const modalText = pickColor(
    themeColors.modalText,
    themeColors.textPrimary,
    themeColors['text-primary'],
    '#1A1A1A',
  );
  const modalOverlay = pickColor(
    themeColors.modalOverlay,
    'rgba(0,0,0,0.22)',
  );
  const modalShadow = pickColor(
    themeColors.modalShadow,
    '#000000',
  );
  const textBackgrounds = [cardBackground, pageBackground];
  const textPrimary = resolveReadableColor({
    backgrounds: textBackgrounds,
    candidates: [
      themeColors.textPrimary,
      themeColors['text-primary'],
      '#111827',
      '#F8FAFC',
    ],
    fallback: pickColor(
      themeColors.textPrimary,
      themeColors['text-primary'],
      '#111827',
    ),
    minimumRatio: 4.5,
    preferred: pickColor(themeColors.textPrimary, themeColors['text-primary']),
  });
  const textMuted = resolveReadableColor({
    backgrounds: textBackgrounds,
    candidates: [
      themeColors.textMuted,
      themeColors.textSecondary,
      themeColors['text-secondary'],
      '#475569',
      '#CBD5E1',
      '#64748B',
    ],
    fallback: pickColor(
      themeColors.textMuted,
      themeColors.textSecondary,
      themeColors['text-secondary'],
      '#64748B',
    ),
    minimumRatio: 3,
    preferred: pickColor(
      themeColors.textMuted,
      themeColors.textSecondary,
      themeColors['text-secondary'],
    ),
  });
  const buttonText = resolveReadableColor({
    backgrounds: [buttonBackground],
    candidates: [
      themeColors.buttonText,
      themeColors['text-on-primary'],
      '#FFFFFF',
      '#111827',
    ],
    fallback: pickColor(
      themeColors.buttonText,
      themeColors['text-on-primary'],
      '#FFFFFF',
    ),
    minimumRatio: 4.5,
    preferred: pickColor(
      themeColors.buttonText,
      themeColors['text-on-primary'],
    ),
  });
  const palette = {
    pageBackground,
    cardBackground,
    headerBackground,
    headerBorder,
    buttonBackground,
    buttonText,
    chipSelectedBackground,
    chipSelectedBorder,
    chipSelectedText,
    dividerBorder,
    modalBackground,
    modalHeaderText,
    modalText,
    modalOverlay,
    modalShadow,
    textPrimary,
    textMuted,
    textSecondary: pickColor(themeColors.textSecondary, textMuted),
    textSuccess: pickColor(
      themeColors.textSuccess,
      themeColors.success,
      '#10B981',
    ),
    textDanger: pickColor(
      themeColors.textDanger,
      themeColors.danger,
      '#C10015',
    ),
  };

  return {
    ...palette,
    header: palette.headerBackground,
    primary: palette.buttonBackground,
    accent: palette.chipSelectedText,
    background: palette.pageBackground,
    surface: palette.cardBackground,
    text: palette.textPrimary,
    muted: palette.textMuted,
    cardBorder: palette.headerBorder,
    onPrimary: palette.buttonText,
    success: palette.textSuccess,
    danger: palette.textDanger,
    darkCard: palette.buttonBackground,
    darkBorder: palette.chipSelectedBorder,
  };
};

export const getInitials = value =>
  String(value || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(chunk => chunk[0] || '')
    .join('')
    .toUpperCase();
