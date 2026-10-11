import {useCallback, useEffect, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {
  fetchShopFranchiseDirectory,
  filterShopFranchiseDirectory,
  SHOP_FRANCHISE_PAGE_SIZE,
} from '@controleonline/ui-common/src/react/utils/shopFranchises';
import {normalizeShopEntityId} from '@controleonline/ui-common/src/react/utils/shopConfig';

import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  clearStoredShopSalesCompany,
  cleanupLegacyShopStorage,
  persistShopSalesCompany,
  readStoredShopSalesCompany,
  subscribeShopSalesCompany,
} from '@controleonline/ui-shop/src/react/utils/shopSalesCompany';

const directoryCache = new Map();
const directoryRequestCache = new Map();

const loadDirectory = async companyId => {
  const normalizedCompanyId = normalizeShopEntityId(companyId);

  if (!normalizedCompanyId) {
    return [];
  }

  if (directoryCache.has(normalizedCompanyId)) {
    return directoryCache.get(normalizedCompanyId) || [];
  }

  if (directoryRequestCache.has(normalizedCompanyId)) {
    return directoryRequestCache.get(normalizedCompanyId);
  }

  const request = fetchShopFranchiseDirectory({
    companyId: normalizedCompanyId,
    publicDirectory: true,
    itemsPerPage: SHOP_FRANCHISE_PAGE_SIZE,
  })
    .then(items => {
      const nextItems = Array.isArray(items) ? items.filter(Boolean) : [];
      directoryCache.set(normalizedCompanyId, nextItems);
      directoryRequestCache.delete(normalizedCompanyId);
      return nextItems;
    })
    .catch(error => {
      directoryRequestCache.delete(normalizedCompanyId);
      throw error;
    });

  directoryRequestCache.set(normalizedCompanyId, request);
  return request;
};

export default function useShopSalesCompany({
  loadOptions = true,
  preferredCompanyId = '',
} = {}) {
  const {
    mainCompany,
    franchiseAddressCategoryIds,
    salesPageEnabled,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  } = useShopSettings();
  const mainCompanyId = normalizeShopEntityId(mainCompany);
  const preferredSelectionId = normalizeShopEntityId(preferredCompanyId);
  const hasConfiguredSalesCompanies = visibleFranchiseCompanyIds.length > 0;

  const [directory, setDirectory] = useState([]);
  const [directoryLoadFailed, setDirectoryLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(loadOptions);
  const [storedSelection, setStoredSelection] = useState(() =>
    readStoredShopSalesCompany(mainCompanyId),
  );

  useEffect(() => {
    cleanupLegacyShopStorage();
  }, []);

  useEffect(() => {
    setStoredSelection(readStoredShopSalesCompany(mainCompanyId));
  }, [mainCompanyId]);

  useEffect(
    () =>
      subscribeShopSalesCompany(payload => {
        if (
          normalizeShopEntityId(payload?.mainCompanyId) !== mainCompanyId
        ) {
          return;
        }

        setStoredSelection(payload?.company || null);
      }),
    [mainCompanyId],
  );

  useFocusEffect(
    useCallback(() => {
      if (
        !loadOptions ||
        !salesPageEnabled ||
        !mainCompanyId ||
        !hasConfiguredSalesCompanies
      ) {
        setDirectory([]);
        setDirectoryLoadFailed(false);
        setIsLoading(false);
        return undefined;
      }

      let isMounted = true;
      setIsLoading(true);
      setDirectoryLoadFailed(false);

      loadDirectory(mainCompanyId)
        .then(items => {
          if (isMounted) {
            setDirectory(Array.isArray(items) ? items : []);
          }
        })
        .catch(() => {
          if (isMounted) {
            setDirectory([]);
            setDirectoryLoadFailed(true);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [
      mainCompanyId,
      hasConfiguredSalesCompanies,
      loadOptions,
      salesPageEnabled,
    ]),
  );

  const selectionOptions = useMemo(() => {
    if (!hasConfiguredSalesCompanies) {
      return [];
    }

    return filterShopFranchiseDirectory({
      directory,
      visibleCompanyIds: visibleFranchiseCompanyIds,
      addressCategoryIds: franchiseAddressCategoryIds,
      legacyVisibleAddressIds: visibleFranchiseAddressIds,
    });
  }, [
    directory,
    franchiseAddressCategoryIds,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  ]);

  const storedSelectionId = normalizeShopEntityId(storedSelection);
  const matchedSelection = useMemo(
    () =>
      selectionOptions.find(
        company => {
          const companyId = normalizeShopEntityId(company);
          return (
            companyId === storedSelectionId ||
            (preferredSelectionId && companyId === preferredSelectionId)
          );
        },
      ) || null,
    [preferredSelectionId, selectionOptions, storedSelectionId],
  );
  const fallbackStoredSelection =
    !loadOptions && hasConfiguredSalesCompanies ? storedSelection : null;
  const salesCompany = !hasConfiguredSalesCompanies
    ? mainCompany
    : matchedSelection ||
      (selectionOptions.length === 1 ? selectionOptions[0] : null) ||
      fallbackStoredSelection ||
      null;
  const requiresCompanySelection =
    loadOptions &&
    hasConfiguredSalesCompanies &&
    (isLoading ||
      directoryLoadFailed ||
      (!matchedSelection && selectionOptions.length !== 1));

  useEffect(() => {
    if (!loadOptions || !mainCompanyId) {
      return;
    }

    if (!hasConfiguredSalesCompanies) {
      clearStoredShopSalesCompany(mainCompanyId);
      setStoredSelection(current => (current ? null : current));
      return;
    }

    if (isLoading) {
      return;
    }

    if (selectionOptions.length === 0) {
      clearStoredShopSalesCompany(mainCompanyId);
      setStoredSelection(current => (current ? null : current));
      return;
    }

    if (selectionOptions.length === 1) {
      const onlyCompany = selectionOptions[0];
      const onlyCompanyId = normalizeShopEntityId(onlyCompany);

      if (storedSelectionId !== onlyCompanyId) {
        persistShopSalesCompany(mainCompanyId, onlyCompany);
        setStoredSelection(onlyCompany);
      }

      return;
    }

    if (
      preferredSelectionId &&
      matchedSelection &&
      storedSelectionId !== preferredSelectionId
    ) {
      persistShopSalesCompany(mainCompanyId, matchedSelection);
      setStoredSelection(matchedSelection);
      return;
    }

    if (storedSelectionId && !matchedSelection) {
      clearStoredShopSalesCompany(mainCompanyId);
      setStoredSelection(null);
    }
  }, [
    mainCompanyId,
    hasConfiguredSalesCompanies,
    isLoading,
    loadOptions,
    matchedSelection,
    preferredSelectionId,
    selectionOptions,
    storedSelectionId,
  ]);

  const selectSalesCompany = useCallback(
    company => {
      if (!mainCompanyId) {
        return;
      }

      if (!company) {
        clearStoredShopSalesCompany(mainCompanyId);
        setStoredSelection(null);
        return;
      }

      persistShopSalesCompany(mainCompanyId, company);
      setStoredSelection(company);
    },
    [mainCompanyId],
  );

  const clearSalesCompanySelection = useCallback(() => {
    if (!mainCompanyId) {
      return;
    }

    clearStoredShopSalesCompany(mainCompanyId);
    setStoredSelection(null);
  }, [mainCompanyId]);

  return {
    clearSalesCompanySelection,
    mainCompany,
    directoryLoadFailed,
    isLoading,
    franchiseDirectoryLoadFailed: directoryLoadFailed,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions: selectionOptions,
    selectSalesCompany,
  };
}
