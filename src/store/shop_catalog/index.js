import {api} from '@controleonline/ui-common/src/api';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';
import * as types from '@controleonline/ui-default/src/store/default/mutation_types';
import {
  normalizeShopCollectionResponse,
  SHOP_CATALOG_MAX_PAGE_SIZE,
  SHOP_CATALOG_PAGE_SIZE,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';

const normalizeItemsPerPage = value => {
  const requestedItemsPerPage = Number(value);

  return Math.max(
    1,
    Math.min(
      SHOP_CATALOG_MAX_PAGE_SIZE,
      Number.isFinite(requestedItemsPerPage)
        ? requestedItemsPerPage
        : SHOP_CATALOG_PAGE_SIZE,
    ),
  );
};

const buildCollectionParams = params => ({
  ...(params || {}),
  itemsPerPage: normalizeItemsPerPage(params?.itemsPerPage),
});

export const fetchCollectionPage = async ({commit}, {resource, params = {}} = {}) => {
  if (!resource) {
    return {items: [], totalItems: 0};
  }

  commit(types.SET_ISLOADING, true);
  commit(types.SET_ERROR, null);

  try {
    return normalizeShopCollectionResponse(await api.fetch(resource, {
      params: buildCollectionParams(params),
    }));
  } catch (error) {
    commit(types.SET_ERROR, error?.message || error);
    throw error;
  } finally {
    commit(types.SET_ISLOADING, false);
  }
};

export const getCategory = async ({commit}, {categoryId, company} = {}) => {
  const normalizedCategoryId = String(categoryId || '').replace(/\D+/g, '');

  if (!normalizedCategoryId) {
    return null;
  }

  commit(types.SET_ISLOADING, true);
  commit(types.SET_ERROR, null);

  try {
    return await api.fetch(`shop/categories/${normalizedCategoryId}`, {
      params: company ? {company} : {},
    });
  } catch (error) {
    commit(types.SET_ERROR, error?.message || error);
    throw error;
  } finally {
    commit(types.SET_ISLOADING, false);
  }
};

export default {
  namespaced: true,
  state: {
    item: {},
    items: [],
    resourceEndpoint: 'shop/catalog',
    isLoading: false,
    error: '',
    totalItems: 0,
    summary: {},
    messages: [],
    message: {},
    filters: {},
    columns: [],
  },
  actions: {
    fetchCollectionPage,
    getCategory,
  },
  getters,
  mutations,
};
