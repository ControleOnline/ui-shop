import {normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';

const SHOP_CATALOG_CATEGORY_STORAGE_PREFIX = 'shop-purchases-active-category';
const SHOP_CATEGORY_DESCRIPTION_BY_NAME = {
  'lanches gyros':
    'Assinaturas e itens principais do Gyros, com organizacao clara de cardapio e preco canonico.',
  combos:
    'Combos comerciais organizados na ordem de venda, com base visual padronizada e dados canonicos de custo e preco.',
  'batatas fritas':
    'Batatas fritas e porcoes correlatas, mantendo a vitrine do cardapio com rastreio no nucleo.',
  gratinados:
    'Linhas gratinadas separadas para operacao, preco e composicao.',
  'almoco executivo':
    'Executivos e pratos do almoco com a mesma hierarquia visual do cardapio principal.',
  'molhos e extras':
    'Molhos, vinagretes, saches e extras de apoio para complementar o pedido.',
  sobremesas:
    'Sobremesas organizadas como fechamento de compra e incremento de ticket medio.',
  bebidas:
    'Bebidas para acompanhamento, com leitura rapida e composicao simples no pedido.',
};

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

// Normalize a short customer-facing description for each category.
export const getShopCategoryDescription = category => {
  const mappedDescription =
    SHOP_CATEGORY_DESCRIPTION_BY_NAME[getShopCategoryLookupKey(category)];

  if (mappedDescription) {
    return mappedDescription;
  }

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

const getShopCategoryRawName = category =>
  String(
    category?.name || category?.category || category?.productCategory || '',
  ).trim();

const getShopCategoryLookupKey = category =>
  getShopCategoryRawName(category)
    .replace(/^\d+\s*[.)-]?\s*/u, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const getShopCategorySortOrder = category => {
  const name = getShopCategoryRawName(category);
  const match = name.match(/^(\d+)\s*[.)-]?\s*/u);

  if (match?.[1]) {
    return Number(match[1]);
  }

  return Number.MAX_SAFE_INTEGER;
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
