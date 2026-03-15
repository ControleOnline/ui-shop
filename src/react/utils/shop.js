import {env} from '@env';

export const getHost = () =>
  env.DOMAIN || (typeof location !== 'undefined' ? location.host : '');

export const buildFileUrl = fileId => {
  if (!fileId) return '';
  return `${String(env.API_ENTRYPOINT || '').replace(/\/$/, '')}/files/${fileId}/download?app-domain=${encodeURIComponent(getHost())}`;
};

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
  return first?.file?.id ? buildFileUrl(first.file.id) : '';
};

export const pickTheme = company => {
  const companyColors = company?.theme?.colors || {};
  return {
    header: companyColors['header-primary'] || '#073a53',
    primary: companyColors.primary || '#1f95c6',
    background: companyColors.background || '#f4f7fb',
    surface: companyColors.surface || '#ffffff',
    text: companyColors['text-primary'] || '#111827',
    muted: companyColors['text-secondary'] || '#64748b',
    darkCard: '#1f1f1f',
    darkBorder: '#6b7280',
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
