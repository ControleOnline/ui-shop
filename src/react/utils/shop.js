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

export const pickTheme = company => {
  const companyColors = company?.theme?.colors || {};
  return {
    header: companyColors['header-primary'] || companyColors.primary || '#0B3A53',
    primary: companyColors.primary || '#0E7490',
    accent: companyColors.accent || companyColors.secondary || '#F59E0B',
    background: companyColors.background || '#F3F7FB',
    surface: companyColors.surface || '#ffffff',
    text: companyColors['text-primary'] || '#111827',
    muted: companyColors['text-secondary'] || '#64748b',
    cardBorder: companyColors.border || '#D7E1EC',
    onPrimary: companyColors['text-on-primary'] || '#ffffff',
    success: companyColors.success || '#22C55E',
    danger: companyColors.danger || '#EF4444',
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
