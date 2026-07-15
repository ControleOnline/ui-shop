// TODO(store-first): quando esta tela for mexida, mover a carga para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {api} from '@controleonline/ui-common/src/api';
import {pickTheme, normalizeId} from '@controleonline/ui-shop/src/react/utils/shop';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  buildShopCatalogStorageKey,
  fetchShopCollectionPage,
  getTopLevelShopCategories,
  persistShopCatalogCategoryId,
  resolveShopCatalogCategoryId,
  rememberShopCatalogProduct,
  SHOP_CATEGORIES_RESOURCE,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';

const normalizeCollection = payload =>
  Array.isArray(payload) ? payload.filter(Boolean) : [];

const mergeUniqueById = (current = [], next = []) => {
  const seen = new Set();
  const merged = [];

  const pushItem = item => {
    const itemId = String(item?.id || item?.['@id'] || '').trim();
    if (!itemId || seen.has(itemId)) {
      return;
    }

    seen.add(itemId);
    merged.push(item);
  };

  current.forEach(pushItem);
  next.forEach(pushItem);

  return merged;
};

const normalizeCollectionCount = value => Number(value) || 0;

// Manage shared catalog state so every `Compras` route behaves like the same experience.
export default function useShopCatalogState({
  mode = 'default',
  routeCategoryId = '',
  searchQuery = '',
}) {
  const {
    cart,
    defaultCompany,
    isLoadingSalesCompanies,
    refreshCart,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    selectSalesCompany,
  } = useShopCart({autoRefresh: true});
  const {
    catalogProductTypes,
    franchiseLocatorEnabled,
    salesPageEnabled,
  } = useShopSettings();
  const catalogProductTypesKey = catalogProductTypes.join('|');
  const normalizedCatalogProductTypes = useMemo(
    () => catalogProductTypes.filter(Boolean),
    [catalogProductTypesKey],
  );
  const productFileFilters = useMemo(
    () =>
      catalogProductTypes.includes('service')
        ? {}
        : {
            exists: {productFiles: 'true'},
            productFiles: {file: {fileType: 'image'}},
          },
    [catalogProductTypesKey],
  );

  const mountedRef = useRef(true);
  const hasFocusedRef = useRef(false);
  const categoryRequestTokenRef = useRef(0);
  const productRequestTokenRef = useRef(0);
  const searchRequestTokenRef = useRef(0);
  const activeCategoryRequestTokenRef = useRef(0);
  const categoriesPageRef = useRef(0);
  const productsPageRef = useRef(0);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingMoreCategories, setIsLoadingMoreCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryTotalItems, setCategoryTotalItems] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeCategoryDetails, setActiveCategoryDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [productTotalItems, setProductTotalItems] = useState(0);
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchProductsTotalItems, setSearchProductsTotalItems] = useState(0);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchCategoriesTotalItems, setSearchCategoriesTotalItems] = useState(0);

  const normalizedSearchQuery = String(searchQuery || '').trim();
  const storageKey = useMemo(
    () =>
      buildShopCatalogStorageKey({
        defaultCompanyId: defaultCompany?.id || defaultCompany?.['@id'],
        salesCompanyId: salesCompany?.id || salesCompany?.['@id'],
      }),
    [defaultCompany?.['@id'], defaultCompany?.id, salesCompany?.['@id'], salesCompany?.id],
  );
  const topLevelCategories = useMemo(
    () => getTopLevelShopCategories(categories),
    [categories],
  );
  const activeCategory = useMemo(() => {
    const resolvedActiveCategoryId = String(activeCategoryId || '');
    const loadedCategory =
      topLevelCategories.find(
        category => String(category?.id || category?.['@id'] || '') === resolvedActiveCategoryId,
      ) || null;

    return loadedCategory || activeCategoryDetails || null;
  }, [activeCategoryDetails, activeCategoryId, topLevelCategories]);
  const theme = useMemo(() => pickTheme(defaultCompany), [defaultCompany]);

  const resetPaginationState = useCallback(() => {
    categoryRequestTokenRef.current += 1;
    productRequestTokenRef.current += 1;
    searchRequestTokenRef.current += 1;
    activeCategoryRequestTokenRef.current += 1;
    categoriesPageRef.current = 0;
    productsPageRef.current = 0;
    setIsLoadingCategories(false);
    setIsLoadingMoreCategories(false);
    setIsLoadingProducts(false);
    setIsLoadingMoreProducts(false);
    setIsLoadingSearch(false);
    setCategories([]);
    setCategoryTotalItems(0);
    setProducts([]);
    setProductTotalItems(0);
    setSearchProducts([]);
    setSearchProductsTotalItems(0);
    setSearchCategories([]);
    setSearchCategoriesTotalItems(0);
    setActiveCategoryDetails(null);
  }, []);

  const loadCategoriesPage = useCallback(
    async ({page = 1, replace = false} = {}) => {
      const normalizedCompanyId = normalizeId(
        salesCompany?.id || salesCompany?.['@id'],
      );

      if (!normalizedCompanyId || requiresCompanySelection) {
        if (replace && mountedRef.current) {
          setCategories([]);
          setCategoryTotalItems(0);
        }
        return {items: [], totalItems: 0};
      }

      const normalizedPage = Math.max(Number(page) || 1, 1);
      const requestToken = ++categoryRequestTokenRef.current;

      if (replace) {
        setIsLoadingCategories(true);
      } else {
        setIsLoadingMoreCategories(true);
      }

      try {
        const response = await fetchShopCollectionPage(SHOP_CATEGORIES_RESOURCE, {
          company: normalizedCompanyId,
          context: 'products',
          exists: {categoryFiles: 'true'},
          categoryFiles: {file: {fileType: 'image'}},
          'order[name]': 'ASC',
          page: normalizedPage,
        });

        if (!mountedRef.current || requestToken !== categoryRequestTokenRef.current) {
          return response;
        }

        const nextCategories = normalizeCollection(response.items);
        categoriesPageRef.current = normalizedPage;
        setCategoryTotalItems(normalizeCollectionCount(response.totalItems));
        setCategories(current =>
          replace ? nextCategories : mergeUniqueById(current, nextCategories),
        );

        return response;
      } catch {
        if (mountedRef.current && requestToken === categoryRequestTokenRef.current && replace) {
          setCategories([]);
          setCategoryTotalItems(0);
        }

        return {items: [], totalItems: 0};
      } finally {
        if (mountedRef.current && requestToken === categoryRequestTokenRef.current) {
          setIsLoadingCategories(false);
          setIsLoadingMoreCategories(false);
        }
      }
    },
    [requiresCompanySelection, salesCompany?.['@id'], salesCompany?.id],
  );

  const loadProductsPage = useCallback(
    async ({page = 1, replace = false, categoryId = activeCategoryId} = {}) => {
      const normalizedCompanyId = normalizeId(
        salesCompany?.id || salesCompany?.['@id'],
      );
      const normalizedCategoryId = normalizeId(categoryId);

      if (
        mode === 'search' ||
        !normalizedCompanyId ||
        requiresCompanySelection ||
        !normalizedCategoryId
      ) {
        if (replace && mountedRef.current) {
          setProducts([]);
          setProductTotalItems(0);
        }
        return {items: [], totalItems: 0};
      }

      const normalizedPage = Math.max(Number(page) || 1, 1);
      const requestToken = ++productRequestTokenRef.current;

      if (replace) {
        setIsLoadingProducts(true);
      } else {
        setIsLoadingMoreProducts(true);
      }

      try {
        const response = await fetchShopCollectionPage('products', {
          company: normalizedCompanyId,
          active: 1,
          type: normalizedCatalogProductTypes,
          'productCategory.category': `/categories/${normalizedCategoryId}`,
          'order[product]': 'ASC',
          page: normalizedPage,
          ...productFileFilters,
        });

        if (!mountedRef.current || requestToken !== productRequestTokenRef.current) {
          return response;
        }

        const nextProducts = normalizeCollection(response.items).map(product => {
          if (product) {
            rememberShopCatalogProduct(product);
          }

          return product;
        });

        productsPageRef.current = normalizedPage;
        setProductTotalItems(normalizeCollectionCount(response.totalItems));
        setProducts(current =>
          replace ? nextProducts : mergeUniqueById(current, nextProducts),
        );

        return response;
      } catch {
        if (mountedRef.current && requestToken === productRequestTokenRef.current && replace) {
          setProducts([]);
          setProductTotalItems(0);
        }

        return {items: [], totalItems: 0};
      } finally {
        if (mountedRef.current && requestToken === productRequestTokenRef.current) {
          setIsLoadingProducts(false);
          setIsLoadingMoreProducts(false);
        }
      }
    },
    [
      activeCategoryId,
      mode,
      normalizedCatalogProductTypes,
      productFileFilters,
      requiresCompanySelection,
      salesCompany?.['@id'],
      salesCompany?.id,
    ],
  );

  const loadMoreCategories = useCallback(() => {
    if (
      isLoadingCategories ||
      isLoadingMoreCategories ||
      !categoryTotalItems ||
      categories.length >= categoryTotalItems
    ) {
      return;
    }

    return loadCategoriesPage({
      page: categoriesPageRef.current + 1,
      replace: false,
    });
  }, [
    categories.length,
    categoryTotalItems,
    isLoadingCategories,
    isLoadingMoreCategories,
    loadCategoriesPage,
  ]);

  const loadMoreProducts = useCallback(() => {
    const normalizedCategoryId = normalizeId(activeCategoryId);

    if (
      isLoadingProducts ||
      isLoadingMoreProducts ||
      !normalizedCategoryId ||
      !productTotalItems ||
      products.length >= productTotalItems
    ) {
      return;
    }

    return loadProductsPage({
      categoryId: normalizedCategoryId,
      page: productsPageRef.current + 1,
      replace: false,
    });
  }, [
    activeCategoryId,
    isLoadingMoreProducts,
    isLoadingProducts,
    loadProductsPage,
    productTotalItems,
    products.length,
  ]);

  // Refresh the shared catalog whenever the user returns to this stack.
  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return undefined;
      }

      setRefreshKey(currentValue => currentValue + 1);
      return undefined;
    }, []),
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep the active category aligned with route-driven category pages.
  useEffect(() => {
    if (mode !== 'category') {
      return;
    }

    setActiveCategoryId(String(routeCategoryId || ''));
  }, [mode, routeCategoryId]);

  // Reset and reload the catalog whenever the store context changes.
  useEffect(() => {
    if (!salesCompany?.id || requiresCompanySelection) {
      resetPaginationState();
      setActiveCategoryId('');
      return;
    }

    resetPaginationState();
    setActiveCategoryId('');
    loadCategoriesPage({page: 1, replace: true});
  }, [
    loadCategoriesPage,
    requiresCompanySelection,
    resetPaginationState,
    salesCompany?.id,
    refreshKey,
  ]);

  // Resolve the selected storefront category from the loaded catalog.
  useEffect(() => {
    if (mode === 'search') {
      return;
    }

    if (!salesCompany?.id || requiresCompanySelection || !categories.length) {
      return;
    }

    if (activeCategoryId) {
      return;
    }

    const nextCategoryId = resolveShopCatalogCategoryId({
      categories,
      routeCategoryId: mode === 'category' ? routeCategoryId : '',
      preferredCategoryId: '',
      storageKey,
    });

    if (nextCategoryId) {
      setActiveCategoryId(nextCategoryId);
    }
  }, [
    activeCategoryId,
    categories,
    mode,
    refreshKey,
    requiresCompanySelection,
    routeCategoryId,
    salesCompany?.id,
    storageKey,
  ]);

  // Fetch a direct category payload when the active category has not arrived in the first pages yet.
  useEffect(() => {
    if (mode === 'search') {
      setActiveCategoryDetails(null);
      return;
    }

    const normalizedActiveCategoryId = normalizeId(activeCategoryId);

    if (!normalizedActiveCategoryId || !salesCompany?.id || requiresCompanySelection) {
      setActiveCategoryDetails(null);
      return;
    }

    const alreadyLoadedCategory = topLevelCategories.find(
      category => normalizeId(category?.id || category?.['@id']) === normalizedActiveCategoryId,
    );

    if (alreadyLoadedCategory) {
      setActiveCategoryDetails(null);
      return;
    }

    const requestToken = ++activeCategoryRequestTokenRef.current;

    api
      .fetch(`${SHOP_CATEGORIES_RESOURCE}/${normalizedActiveCategoryId}`, {
        params: {company: salesCompany.id},
      })
      .then(category => {
        if (!mountedRef.current || requestToken !== activeCategoryRequestTokenRef.current) {
          return;
        }

        setActiveCategoryDetails(category || null);

        if (category) {
          setCategories(current => mergeUniqueById(current, [category]));
        }
      })
      .catch(() => {
        if (mountedRef.current && requestToken === activeCategoryRequestTokenRef.current) {
          setActiveCategoryDetails(null);

          const fallbackCategoryId = normalizeId(
            topLevelCategories[0]?.id || topLevelCategories[0]?.['@id'],
          );

          if (
            fallbackCategoryId &&
            fallbackCategoryId !== normalizedActiveCategoryId
          ) {
            setActiveCategoryId(fallbackCategoryId);
          }
        }
      });
  }, [
    activeCategoryId,
    mode,
    requiresCompanySelection,
    salesCompany?.id,
    topLevelCategories,
  ]);

  // Load the currently selected category products using small pages.
  useEffect(() => {
    if (mode === 'search') {
      setProducts([]);
      setProductTotalItems(0);
      setIsLoadingProducts(false);
      setIsLoadingMoreProducts(false);
      return;
    }

    if (!salesCompany?.id || requiresCompanySelection || !activeCategoryId) {
      setProducts([]);
      setProductTotalItems(0);
      setIsLoadingProducts(false);
      setIsLoadingMoreProducts(false);
      return;
    }

    loadProductsPage({
      categoryId: activeCategoryId,
      page: 1,
      replace: true,
    });
  }, [
    activeCategoryId,
    loadProductsPage,
    mode,
    refreshKey,
    requiresCompanySelection,
    salesCompany?.id,
  ]);

  // Persist the latest storefront category for this company pairing.
  useEffect(() => {
    if (mode === 'search' || !activeCategoryId) {
      return;
    }

    persistShopCatalogCategoryId(storageKey, activeCategoryId);
  }, [activeCategoryId, mode, storageKey]);

  // Load search results without changing the category directory used for navigation.
  useEffect(() => {
    if (mode !== 'search') {
      setSearchProducts([]);
      setSearchProductsTotalItems(0);
      setSearchCategories([]);
      setSearchCategoriesTotalItems(0);
      setIsLoadingSearch(false);
      return;
    }

    if (!salesCompany?.id || requiresCompanySelection) {
      return;
    }

    if (normalizedSearchQuery.length < 3) {
      setSearchProducts([]);
      setSearchProductsTotalItems(0);
      setSearchCategories([]);
      setSearchCategoriesTotalItems(0);
      setIsLoadingSearch(false);
      return;
    }

    const requestToken = ++searchRequestTokenRef.current;
    setIsLoadingSearch(true);

    Promise.all([
      fetchShopCollectionPage('products', {
        company: salesCompany.id,
        active: 1,
        type: normalizedCatalogProductTypes,
        'order[product]': 'ASC',
        page: 1,
        product: normalizedSearchQuery,
        ...productFileFilters,
      }),
      fetchShopCollectionPage(SHOP_CATEGORIES_RESOURCE, {
        company: salesCompany.id,
        context: 'products',
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        'order[name]': 'ASC',
        page: 1,
        name: normalizedSearchQuery,
      }),
    ])
      .then(([productResults, categoryResults]) => {
        if (!mountedRef.current || requestToken !== searchRequestTokenRef.current) {
          return;
        }

        setSearchProducts(normalizeCollection(productResults.items));
        setSearchProductsTotalItems(normalizeCollectionCount(productResults.totalItems));
        setSearchCategories(normalizeCollection(categoryResults.items));
        setSearchCategoriesTotalItems(normalizeCollectionCount(categoryResults.totalItems));
      })
      .catch(() => {
        if (mountedRef.current && requestToken === searchRequestTokenRef.current) {
          setSearchProducts([]);
          setSearchProductsTotalItems(0);
          setSearchCategories([]);
          setSearchCategoriesTotalItems(0);
        }
      })
      .finally(() => {
        if (mountedRef.current && requestToken === searchRequestTokenRef.current) {
          setIsLoadingSearch(false);
        }
      });
  }, [
    mode,
    normalizedCatalogProductTypes,
    normalizedSearchQuery,
    productFileFilters,
    requiresCompanySelection,
    salesCompany?.id,
  ]);

  return {
    activeCategory,
    activeCategoryId,
    cart,
    categories: topLevelCategories,
    categoryTotalItems,
    defaultCompany,
    franchiseLocatorEnabled,
    hasMoreCategories:
      Boolean(categoryTotalItems) && categories.length < categoryTotalItems,
    hasMoreProducts:
      Boolean(productTotalItems) && products.length < productTotalItems,
    isLoadingCatalog:
      isLoadingCategories || isLoadingProducts || isLoadingSearch,
    isLoadingMoreCategories,
    isLoadingMoreProducts,
    isLoadingSalesCompanies,
    loadMoreCategories,
    loadMoreProducts,
    productTotalItems,
    products,
    refreshCart,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    salesPageEnabled,
    searchCategories,
    searchCategoriesTotalItems,
    searchProducts,
    searchProductsTotalItems,
    selectSalesCompany,
    setActiveCategoryId,
    theme,
  };
}
