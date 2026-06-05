import {useCallback, useEffect, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';

import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  buildShopCatalogStorageKey,
  getTopLevelShopCategories,
  persistShopCatalogCategoryId,
  resolveShopCatalogCategoryId,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';

const normalizeCollection = payload => (Array.isArray(payload) ? payload.filter(Boolean) : []);
const silentStoreMeta = {__storeMeta: {skipSystemError: true}};

const normalizeId = value =>
  String(value?.id || value?.['@id'] || value || '')
    .replace(/\D+/g, '')
    .trim();

const normalizeProductsByCategoryId = payload => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload).map(([categoryId, products]) => [
      String(categoryId || ''),
      normalizeCollection(products),
    ]),
  );
};

// Manage shared catalog state so every `Compras` route behaves like the same experience.
export default function useShopCatalogState({
  loadCategorySections = false,
  mode = 'default',
  routeCategoryId = '',
  searchQuery = '',
}) {
  const categoriesStore = useStore('categories');
  const productsStore = useStore('products');
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

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isBatchCatalogLoaded, setIsBatchCatalogLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [products, setProducts] = useState([]);
  const [productsByCategoryId, setProductsByCategoryId] = useState({});
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);

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
  const topLevelCategoryIds = useMemo(
    () =>
      topLevelCategories
        .map(category => String(category?.id || category?.['@id'] || ''))
        .filter(Boolean)
        .join('|'),
    [topLevelCategories],
  );
  const activeCategory = useMemo(
    () =>
      topLevelCategories.find(
        category =>
          String(category?.id || category?.['@id'] || '') ===
          String(activeCategoryId || ''),
      ) || topLevelCategories[0] || null,
    [activeCategoryId, topLevelCategories],
  );
  const theme = useMemo(() => pickTheme(defaultCompany), [defaultCompany]);

  // Refresh the shared catalog whenever the user returns to this stack.
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(currentValue => currentValue + 1);
    }, []),
  );

  // Category routes must always honor the route parameter.
  useEffect(() => {
    if (mode !== 'category') {
      return;
    }

    setActiveCategoryId(String(routeCategoryId || ''));
  }, [mode, routeCategoryId]);

  // Clear stale storefront data when a store still needs a sales-company selection.
  useEffect(() => {
    if (!salesCompany?.id || requiresCompanySelection) {
      setIsBatchCatalogLoaded(false);
      setCategories([]);
      setProducts([]);
      setProductsByCategoryId({});
      setSearchProducts([]);
      setSearchCategories([]);
    }
  }, [requiresCompanySelection, salesCompany?.id]);

  // Load the category directory used by the shared sidebar and top navigation.
  useEffect(() => {
    let isMounted = true;

    if (!salesCompany?.id || requiresCompanySelection) {
      return undefined;
    }

    setIsLoadingCategories(true);

    setIsLoadingResults(mode !== 'search');

    (mode === 'search'
      ? Promise.reject(new Error('Skip aggregated catalog in search mode.'))
      : api.fetch('products/shop-catalog', {
          params: {
            company: salesCompany.id,
            context: 'products',
            type: catalogProductTypes,
          },
        }))
      .then(payload => {
        if (!isMounted) {
          return;
        }

        const nextCategories = normalizeCollection(payload?.categories);
        const nextProductsByCategoryId = normalizeProductsByCategoryId(
          payload?.productsByCategoryId,
        );
        const nextCategoryId = resolveShopCatalogCategoryId({
          categories: nextCategories,
          routeCategoryId: mode === 'category' ? routeCategoryId : '',
          preferredCategoryId: mode === 'default' ? activeCategoryId : '',
          storageKey: mode === 'default' ? '' : storageKey,
        });

        setIsBatchCatalogLoaded(true);
        setCategories(nextCategories);
        setProductsByCategoryId(nextProductsByCategoryId);

        if (mode !== 'search') {
          setActiveCategoryId(currentValue =>
            String(currentValue || '') === String(nextCategoryId || '')
              ? currentValue
              : String(nextCategoryId || ''),
          );
        } else if (!activeCategoryId && nextCategoryId) {
          setActiveCategoryId(String(nextCategoryId));
        }
      })
      .catch(() =>
        categoriesStore.actions
          .getItems({
            itemsPerPage: 500,
            exists: {categoryFiles: 'true'},
            categoryFiles: {file: {fileType: 'image'}},
            order: {name: 'ASC'},
            context: 'products',
            company: salesCompany.id,
            ...silentStoreMeta,
          })
          .then(data => {
            if (!isMounted) {
              return;
            }

            const nextCategories = normalizeCollection(data);
            const nextCategoryId = resolveShopCatalogCategoryId({
              categories: nextCategories,
              routeCategoryId: mode === 'category' ? routeCategoryId : '',
              preferredCategoryId: mode === 'default' ? activeCategoryId : '',
              storageKey: mode === 'default' ? '' : storageKey,
            });

            setIsBatchCatalogLoaded(false);
            setCategories(nextCategories);

            if (mode !== 'search') {
              setActiveCategoryId(currentValue =>
                String(currentValue || '') === String(nextCategoryId || '')
                  ? currentValue
                  : String(nextCategoryId || ''),
              );
            } else if (!activeCategoryId && nextCategoryId) {
              setActiveCategoryId(String(nextCategoryId));
            }
          }),
      )
      .catch(() => {
        if (isMounted) {
          setIsBatchCatalogLoaded(false);
          setCategories([]);
          setProductsByCategoryId({});
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCategories(false);
          if (mode !== 'search') {
            setIsLoadingResults(false);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    categoriesStore.actions,
    catalogProductTypesKey,
    mode,
    refreshKey,
    requiresCompanySelection,
    routeCategoryId,
    salesCompany?.id,
    storageKey,
  ]);

  // Mobile and tablet render the catalog as a continuous menu with one section per category.
  useEffect(() => {
    let isMounted = true;

    if (isBatchCatalogLoaded) {
      return undefined;
    }

    if (
      !loadCategorySections ||
      mode === 'search' ||
      !salesCompany?.id ||
      requiresCompanySelection ||
      topLevelCategories.length === 0
    ) {
      setProductsByCategoryId({});
      return undefined;
    }

    setIsLoadingResults(true);
    setProductsByCategoryId({});

    const categoryRecords = topLevelCategories
      .map(category => ({
        key: String(category?.id || category?.['@id'] || ''),
        id: normalizeId(category?.id || category?.['@id']),
      }))
      .filter(category => category.key && category.id);

    Promise.all(
      categoryRecords.map(category =>
        productsStore.actions.getItems({
          'productCategory.category': `/categories/${category.id}`,
          ...productFileFilters,
          active: 1,
          type: catalogProductTypes,
          itemsPerPage: 500,
          'order[product]': 'ASC',
          company: salesCompany.id,
          ...silentStoreMeta,
        }),
      ),
    )
      .then(results => {
        if (!isMounted) {
          return;
        }

        const groupedProducts = Object.fromEntries(
          categoryRecords.map((category, index) => [
            category.key,
            normalizeCollection(results[index]),
          ]),
        );

        setProductsByCategoryId(groupedProducts);
      })
      .catch(() => {
        if (isMounted) {
          setProductsByCategoryId(
            Object.fromEntries(
              topLevelCategories.map(category => [
                String(category?.id || category?.['@id'] || ''),
                [],
              ]),
            ),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    loadCategorySections,
    catalogProductTypesKey,
    isBatchCatalogLoaded,
    mode,
    productFileFilters,
    productsStore.actions,
    refreshKey,
    requiresCompanySelection,
    salesCompany?.id,
    topLevelCategoryIds,
  ]);

  // Persist the latest storefront category for this company pairing.
  useEffect(() => {
    if (mode === 'search' || !activeCategoryId) {
      return;
    }

    persistShopCatalogCategoryId(storageKey, activeCategoryId);
  }, [activeCategoryId, mode, storageKey]);

  // Load the active category products for default and deep-linked category flows.
  useEffect(() => {
    let isMounted = true;

    if (mode === 'search') {
      setProducts([]);
      return undefined;
    }

    if (isBatchCatalogLoaded) {
      setProducts(productsByCategoryId?.[String(activeCategoryId || '')] || []);
      return undefined;
    }

    if (!salesCompany?.id || requiresCompanySelection || !activeCategoryId) {
      setProducts([]);
      return undefined;
    }

    setIsLoadingResults(true);

    productsStore.actions
      .getItems({
        'productCategory.category': `/categories/${activeCategoryId}`,
        ...productFileFilters,
        active: 1,
        type: catalogProductTypes,
        itemsPerPage: 500,
        'order[product]': 'ASC',
        company: salesCompany.id,
        ...silentStoreMeta,
      })
      .then(data => {
        if (isMounted) {
          setProducts(normalizeCollection(data));
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeCategoryId,
    catalogProductTypesKey,
    isBatchCatalogLoaded,
    mode,
    productFileFilters,
    productsByCategoryId,
    productsStore.actions,
    refreshKey,
    requiresCompanySelection,
    salesCompany?.id,
  ]);

  // Load search results without changing the category directory used for navigation.
  useEffect(() => {
    let isMounted = true;

    if (mode !== 'search') {
      setSearchProducts([]);
      setSearchCategories([]);
      return undefined;
    }

    if (!salesCompany?.id || requiresCompanySelection) {
      return undefined;
    }

    setIsLoadingResults(true);

    Promise.all([
      productsStore.actions.getItems({
        itemsPerPage: 48,
        ...productFileFilters,
        company: salesCompany.id,
        active: 1,
        type: catalogProductTypes,
        'order[product]': 'ASC',
        product: normalizedSearchQuery,
        ...silentStoreMeta,
      }),
      categoriesStore.actions.getItems({
        itemsPerPage: 24,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        'order[name]': 'ASC',
        context: 'products',
        company: salesCompany.id,
        name: normalizedSearchQuery,
        ...silentStoreMeta,
      }),
    ])
      .then(([productResults, categoryResults]) => {
        if (!isMounted) {
          return;
        }

        setSearchProducts(normalizeCollection(productResults));
        setSearchCategories(normalizeCollection(categoryResults));
      })
      .catch(() => {
        if (isMounted) {
          setSearchProducts([]);
          setSearchCategories([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingResults(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    categoriesStore.actions,
    catalogProductTypesKey,
    mode,
    normalizedSearchQuery,
    productFileFilters,
    productsStore.actions,
    refreshKey,
    requiresCompanySelection,
    salesCompany?.id,
  ]);

  return {
    activeCategory,
    activeCategoryId,
    cart,
    categories: topLevelCategories,
    defaultCompany,
    franchiseLocatorEnabled,
    isLoadingCatalog: isLoadingCategories || isLoadingResults,
    isLoadingSalesCompanies,
    products,
    productsByCategoryId,
    refreshCart,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    salesPageEnabled,
    searchCategories,
    searchProducts,
    selectSalesCompany,
    setActiveCategoryId,
    theme,
  };
}
