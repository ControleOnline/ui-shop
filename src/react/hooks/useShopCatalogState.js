import {useCallback, useEffect, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';

import {
  SHOP_PRODUCT_TYPES,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  buildShopCatalogStorageKey,
  getTopLevelShopCategories,
  persistShopCatalogCategoryId,
  resolveShopCatalogCategoryId,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';

const normalizeCollection = payload => (Array.isArray(payload) ? payload.filter(Boolean) : []);

// Manage shared catalog state so every `Compras` route behaves like the same experience.
export default function useShopCatalogState({
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
  const {franchiseLocatorEnabled, salesPageEnabled} = useShopSettings();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [products, setProducts] = useState([]);
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
      setCategories([]);
      setProducts([]);
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

    categoriesStore.actions
      .getItems({
        itemsPerPage: 500,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        order: {name: 'ASC'},
        context: 'products',
        company: salesCompany.id,
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
          storageKey,
        });

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
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    categoriesStore.actions,
    mode,
    refreshKey,
    requiresCompanySelection,
    routeCategoryId,
    salesCompany?.id,
    storageKey,
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

    if (!salesCompany?.id || requiresCompanySelection || !activeCategoryId) {
      setProducts([]);
      return undefined;
    }

    setIsLoadingResults(true);

    productsStore.actions
      .getItems({
        'productCategory.category': `/categories/${activeCategoryId}`,
        exists: {productFiles: 'true'},
        productFiles: {file: {fileType: 'image'}},
        active: 1,
        type: SHOP_PRODUCT_TYPES,
        itemsPerPage: 500,
        'order[product]': 'ASC',
        company: salesCompany.id,
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
    mode,
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
        exists: {productFiles: 'true'},
        productFiles: {file: {fileType: 'image'}},
        company: salesCompany.id,
        active: 1,
        type: SHOP_PRODUCT_TYPES,
        'order[product]': 'ASC',
        product: normalizedSearchQuery,
      }),
      categoriesStore.actions.getItems({
        itemsPerPage: 24,
        exists: {categoryFiles: 'true'},
        categoryFiles: {file: {fileType: 'image'}},
        'order[name]': 'ASC',
        context: 'products',
        company: salesCompany.id,
        name: normalizedSearchQuery,
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
    mode,
    normalizedSearchQuery,
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
