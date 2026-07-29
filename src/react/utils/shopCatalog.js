// TODO(store-first): quando este helper for mexido, trocar chamadas diretas de api.fetch por stores e evitar passar dados em objetos quando o store ja resolver isso.
import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';
import {api} from '@controleonline/ui-common/src/api';

const SHOP_CATALOG_CATEGORY_STORAGE_PREFIX = 'shop-purchases-active-category';
export const SHOP_CATEGORIES_RESOURCE = 'shop/categories';
export const SHOP_CATALOG_PAGE_SIZE = 30;
export const SHOP_CATALOG_MAX_PAGE_SIZE = 50;
const shopCatalogProductCache = new Map();
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

export const normalizeShopCollectionResponse = payload => {
  const items = Array.isArray(payload)
    ? payload.filter(Boolean)
    : Array.isArray(payload?.member)
      ? payload.member.filter(Boolean)
      : Array.isArray(payload?.['hydra:member'])
        ? payload['hydra:member'].filter(Boolean)
        : [];

  return {
    items,
    totalItems: Number(
      payload?.totalItems || payload?.['hydra:totalItems'] || items.length || 0,
    ),
  };
};

export const hasShopProductCustomizationGroups = product =>
  product?.type === 'custom' ||
  product?.hasCustomizationGroups === true ||
  (Array.isArray(product?.productGroups) && product.productGroups.length > 0);

export const rememberShopCatalogProduct = product => {
  const productId = normalizeId(product?.id || product?.['@id']);

  if (productId) {
    shopCatalogProductCache.set(productId, product);
  }

  return productId;
};

export const getRememberedShopCatalogProduct = productId =>
  shopCatalogProductCache.get(normalizeId(productId)) || null;

export const fetchShopCatalogProduct = async ({productId} = {}) => {
  const normalizedProductId = normalizeId(productId);

  if (!normalizedProductId) {
    return null;
  }

  const cachedProduct = getRememberedShopCatalogProduct(normalizedProductId);
  if (cachedProduct) {
    return cachedProduct;
  }

  const catalogProduct = await api
    .fetch(`products/${normalizedProductId}`)
    .catch(() => null);

  if (catalogProduct) {
    rememberShopCatalogProduct(catalogProduct);
  }

  return catalogProduct;
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
  (Array.isArray(categories) ? categories : [])
    .filter(category => !category?.parent)
    .sort((left, right) => {
      const leftOrder = getShopCategorySortOrder(left);
      const rightOrder = getShopCategorySortOrder(right);

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return getShopCategoryRawName(left).localeCompare(
        getShopCategoryRawName(right),
        'pt-BR',
      );
    });

// Resolve the category media used in the sidebar and hero.
export const getShopCategoryFile = category =>
  Array.isArray(category?.categoryFiles) ? category.categoryFiles[0]?.file || null : null;

// Normalize a short customer-facing description from API data.
export const getShopCategoryDescription = category => {
  return String(
    category?.description ||
      category?.subtitle ||
      '',
  ).trim();
};

const getShopCategoryRawName = category =>
  String(
    category?.name || category?.category || category?.productCategory || '',
  ).trim();

const getShopCategorySortOrder = category => {
  const name = getShopCategoryRawName(category);
  const match = name.match(/^(\d+)\s*[.)-]?\s*/u);

  if (match?.[1]) {
    return Number(match[1]);
  }

  return Number.MAX_SAFE_INTEGER;
};

// Choose the best initial category based on route, current selection and persisted storefront state.
export const resolveShopCatalogCategoryId = ({
  categories,
  routeCategoryId = '',
  preferredCategoryId = '',
  storageKey = '',
}) => {
  const normalizedRouteCategoryId = normalizeId(routeCategoryId);
  if (normalizedRouteCategoryId) {
    return normalizedRouteCategoryId;
  }

  const normalizedPreferredCategoryId = normalizeId(preferredCategoryId);
  if (normalizedPreferredCategoryId) {
    return normalizedPreferredCategoryId;
  }

  const persistedCategoryId = normalizeId(readStorageItem(storageKey));
  if (persistedCategoryId) {
    return persistedCategoryId;
  }

  const topLevelCategories = getTopLevelShopCategories(categories);
  return normalizeId(topLevelCategories[0]?.id || topLevelCategories[0]?.['@id']);
};
