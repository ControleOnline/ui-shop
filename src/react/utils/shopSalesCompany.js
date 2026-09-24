import {
  formatPhoneDisplay,
  resolveAddressDisplayParts,
} from '@controleonline/ui-common/src/react/utils/entityDisplay';
import {normalizeShopEntityId} from '@controleonline/ui-common/src/react/utils/shopConfig';

const shopSalesCompanyListeners = new Set();
const shopSalesCompanySelections = new Map();

const getSelectionKey = defaultCompanyId => {
  const normalizedDefaultCompanyId = normalizeShopEntityId(defaultCompanyId);

  if (!normalizedDefaultCompanyId) {
    return '';
  }

  return normalizedDefaultCompanyId;
};

let legacyShopStorageCleaned = false;

export const cleanupLegacyShopStorage = () => {
  if (legacyShopStorageCleaned || typeof localStorage === 'undefined') {
    return;
  }

  legacyShopStorageCleaned = true;

  try {
    const legacyPrefixes = [
      'shop-purchases-active-category:',
      'shop-sales-company:',
    ];
    const keysToRemove = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (legacyPrefixes.some(prefix => key?.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {}
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

const notifyShopSalesCompanyListeners = payload => {
  shopSalesCompanyListeners.forEach(listener => {
    try {
      listener(payload);
    } catch {}
  });
};

export const readStoredShopSalesCompany = defaultCompanyId => {
  const selectionKey = getSelectionKey(defaultCompanyId);

  if (!selectionKey) {
    return null;
  }

  return shopSalesCompanySelections.get(selectionKey) || null;
};

export const readStoredShopSalesCompanyId = defaultCompanyId =>
  normalizeShopEntityId(readStoredShopSalesCompany(defaultCompanyId));

export const persistShopSalesCompany = (defaultCompanyId, company) => {
  const selectionKey = getSelectionKey(defaultCompanyId);

  if (!selectionKey) {
    return;
  }

  const snapshot = buildSnapshot(company);

  if (!snapshot) {
    shopSalesCompanySelections.delete(selectionKey);
    notifyShopSalesCompanyListeners({
      company: null,
      defaultCompanyId: normalizeShopEntityId(defaultCompanyId),
    });
    return;
  }

  shopSalesCompanySelections.set(selectionKey, snapshot);
  notifyShopSalesCompanyListeners({
    company: snapshot,
    defaultCompanyId: normalizeShopEntityId(defaultCompanyId),
  });
};

export const clearStoredShopSalesCompany = defaultCompanyId => {
  const selectionKey = getSelectionKey(defaultCompanyId);

  if (!selectionKey) {
    return;
  }

  shopSalesCompanySelections.delete(selectionKey);
  notifyShopSalesCompanyListeners({
    company: null,
    defaultCompanyId: normalizeShopEntityId(defaultCompanyId),
  });
};

export const subscribeShopSalesCompany = listener => {
  if (typeof listener !== 'function') {
    return () => {};
  }

  shopSalesCompanyListeners.add(listener);

  return () => {
    shopSalesCompanyListeners.delete(listener);
  };
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
