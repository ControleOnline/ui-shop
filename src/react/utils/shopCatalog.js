import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';

const SHOP_CATALOG_CATEGORY_STORAGE_PREFIX = 'shop-purchases-active-category';

// Read a persisted category id without breaking native or private browsing.
const readStorageItem = storageKey => {
  if (!storageKey || typeof localStorage === 'undefined') {
    return '';
  }

  try {
    return String(localStorage.getItem(storageKey) || '');
  } catch {
    return '';
  }
};

// Build a stable storage key per default company and active sales company.
export const buildShopCatalogStorageKey = ({
  defaultCompanyId,
  salesCompanyId,
}) => {
  const normalizedDefaultCompanyId = normalizeId(defaultCompanyId);
  const normalizedSalesCompanyId = normalizeId(salesCompanyId);

  if (!normalizedDefaultCompanyId && !normalizedSalesCompanyId) {
    return '';
  }

  return [
    SHOP_CATALOG_CATEGORY_STORAGE_PREFIX,
    normalizedDefaultCompanyId || 'default',
    normalizedSalesCompanyId || 'sales',
  ].join(':');
};

// Persist the active category for the current store context.
export const persistShopCatalogCategoryId = (storageKey, categoryId) => {
  if (!storageKey || !categoryId || typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(storageKey, String(categoryId));
  } catch {}
};

// Keep only top-level categories in the storefront navigation.
export const getTopLevelShopCategories = categories =>
  (Array.isArray(categories) ? categories : []).filter(category => !category?.parent);

// Resolve the category media used in the sidebar and hero.
export const getShopCategoryFile = category =>
  Array.isArray(category?.categoryFiles) ? category.categoryFiles[0]?.file || null : null;

// Normalize a short customer-facing description for each category.
export const getShopCategoryDescription = category => {
  const description = String(
    category?.description ||
      category?.subtitle ||
      category?.productCategory ||
      category?.category ||
      '',
  ).trim();

  if (description) {
    return description;
  }

  return 'Toque para ver os itens desta categoria.';
};

// Choose the best initial category based on route, current selection, storage and available data.
export const resolveShopCatalogCategoryId = ({
  categories,
  routeCategoryId = '',
  preferredCategoryId = '',
  storageKey = '',
}) => {
  const topLevelCategories = getTopLevelShopCategories(categories);
  const availableCategoryIds = new Set(
    topLevelCategories
      .map(category => normalizeId(category?.id || category?.['@id']))
      .filter(Boolean),
  );

  const normalizedRouteCategoryId = normalizeId(routeCategoryId);
  if (normalizedRouteCategoryId && availableCategoryIds.has(normalizedRouteCategoryId)) {
    return normalizedRouteCategoryId;
  }

  const normalizedPreferredCategoryId = normalizeId(preferredCategoryId);
  if (
    normalizedPreferredCategoryId &&
    availableCategoryIds.has(normalizedPreferredCategoryId)
  ) {
    return normalizedPreferredCategoryId;
  }

  const persistedCategoryId = normalizeId(readStorageItem(storageKey));
  if (persistedCategoryId && availableCategoryIds.has(persistedCategoryId)) {
    return persistedCategoryId;
  }

  return normalizeId(topLevelCategories[0]?.id || topLevelCategories[0]?.['@id']);
};
