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

export const pickTheme = company => {
  const companyColors = company?.theme?.colors || {};
  const background = companyColors.background || '#F3F7FB';
  const surface = companyColors.surface || '#ffffff';
  const textBackgrounds = [surface, background];
  const primary = companyColors.primary || '#0E7490';

  return {
    header: companyColors['header-primary'] || companyColors.primary || '#0B3A53',
    primary,
    accent: companyColors.accent || companyColors.secondary || '#e67e22',
    background,
    surface,
    text: resolveReadableColor({
      backgrounds: textBackgrounds,
      candidates: ['#111827', '#F8FAFC'],
      fallback: '#111827',
      minimumRatio: 4.5,
      preferred: companyColors['text-primary'] || '#111827',
    }),
    muted: resolveReadableColor({
      backgrounds: textBackgrounds,
      candidates: ['#475569', '#CBD5E1', '#64748b'],
      fallback: '#64748b',
      minimumRatio: 3,
      preferred: companyColors['text-secondary'] || '#64748b',
    }),
    cardBorder: companyColors.border || '#D7E1EC',
    onPrimary: resolveReadableColor({
      backgrounds: [primary],
      candidates: ['#ffffff', '#111827'],
      fallback: '#ffffff',
      minimumRatio: 4.5,
      preferred: companyColors['text-on-primary'] || '#ffffff',
    }),
    success: companyColors.success || '#10b981',
    danger: companyColors.danger || '#c10015',
    darkCard: companyColors['card-dark'] || '#163042',
    darkBorder: companyColors['card-dark-border'] || '#406179',
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
