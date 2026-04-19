import {
  formatPhoneDisplay,
  resolveAddressDisplayParts,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {normalizeShopEntityId} from '@controleonline/ui-common/src/react/utils/shopConfig';

const SHOP_SALES_COMPANY_STORAGE_PREFIX = 'shop-sales-company';

const getStorageKey = defaultCompanyId => {
  const normalizedDefaultCompanyId = normalizeShopEntityId(defaultCompanyId);

  if (!normalizedDefaultCompanyId) {
    return '';
  }

  return `${SHOP_SALES_COMPANY_STORAGE_PREFIX}:${normalizedDefaultCompanyId}`;
};

const getPrimaryAddress = company =>
  (Array.isArray(company?.shopAddresses) ? company.shopAddresses : []).find(
    Boolean,
  ) || null;

const buildSnapshot = company => {
  if (!company) {
    return null;
  }

  const normalizedCompanyId = normalizeShopEntityId(company);

  if (!normalizedCompanyId) {
    return null;
  }

  return {
    id: normalizedCompanyId,
    alias: company?.alias || '',
    name: company?.name || '',
  };
};

export const readStoredShopSalesCompany = defaultCompanyId => {
  const storageKey = getStorageKey(defaultCompanyId);

  if (!storageKey) {
    return null;
  }

  try {
    const storedValue = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return storedValue && typeof storedValue === 'object' ? storedValue : null;
  } catch {
    return null;
  }
};

export const readStoredShopSalesCompanyId = defaultCompanyId =>
  normalizeShopEntityId(readStoredShopSalesCompany(defaultCompanyId));

export const persistShopSalesCompany = (defaultCompanyId, company) => {
  const storageKey = getStorageKey(defaultCompanyId);

  if (!storageKey) {
    return;
  }

  const snapshot = buildSnapshot(company);

  if (!snapshot) {
    localStorage.removeItem(storageKey);
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(snapshot));
};

export const clearStoredShopSalesCompany = defaultCompanyId => {
  const storageKey = getStorageKey(defaultCompanyId);

  if (!storageKey) {
    return;
  }

  localStorage.removeItem(storageKey);
};

export const resolveShopSalesCompanyPhone = company => {
  const candidates = [company?.phone, company?.mobile, company?.whatsapp];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const phone = candidate.map(formatPhoneDisplay).find(Boolean);
      if (phone) {
        return phone;
      }

      continue;
    }

    const phone = formatPhoneDisplay(candidate);
    if (phone) {
      return phone;
    }
  }

  return '';
};

export const resolveShopSalesCompanyAddress = company => {
  const address = getPrimaryAddress(company);

  if (!address) {
    return {
      address: null,
      primary: '',
      secondary: '',
    };
  }

  const addressParts = resolveAddressDisplayParts(address);
  const secondaryLine = [
    addressParts.district,
    addressParts.cityStateLine,
    addressParts.postalCode,
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    address,
    primary:
      addressParts.primary || addressParts.streetLine || address?.nickname || '',
    secondary: secondaryLine,
  };
};
