import {useCallback, useEffect, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {
  fetchShopFranchiseDirectory,
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

export default function useShopSalesCompany({loadOptions = true} = {}) {
  const {
    defaultCompany,
    salesPageEnabled,
    visibleFranchiseAddressIds,
    visibleFranchiseCompanyIds,
  } = useShopSettings();
  const defaultCompanyId = normalizeShopEntityId(defaultCompany);
  const hasConfiguredSalesCompanies = visibleFranchiseCompanyIds.length > 0;

  const [directory, setDirectory] = useState([]);
  const [directoryLoadFailed, setDirectoryLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(loadOptions);
  const [storedSelection, setStoredSelection] = useState(() =>
    readStoredShopSalesCompany(defaultCompanyId),
  );

  useEffect(() => {
    cleanupLegacyShopStorage();
  }, []);

  useEffect(() => {
    setStoredSelection(readStoredShopSalesCompany(defaultCompanyId));
  }, [defaultCompanyId]);

  useEffect(
    () =>
      subscribeShopSalesCompany(payload => {
        if (
          normalizeShopEntityId(payload?.defaultCompanyId) !== defaultCompanyId
        ) {
          return;
        }

        setStoredSelection(payload?.company || null);
      }),
    [defaultCompanyId],
  );

  useFocusEffect(
    useCallback(() => {
      if (
        !loadOptions ||
        !salesPageEnabled ||
        !defaultCompanyId ||
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

      loadDirectory(defaultCompanyId)
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
      defaultCompanyId,
      hasConfiguredSalesCompanies,
      loadOptions,
      salesPageEnabled,
    ]),
  );

  const selectionOptions = useMemo(() => {
    if (!hasConfiguredSalesCompanies) {
      return [];
    }

    const visibleCompanyIdSet = new Set(visibleFranchiseCompanyIds);
    const visibleAddressIdSet = new Set(visibleFranchiseAddressIds);

    return directory
      .filter(company =>
        visibleCompanyIdSet.has(normalizeShopEntityId(company)),
      )
      .map(company => {
        const addresses = (company?.shopAddresses || []).filter(address => {
          if (visibleAddressIdSet.size === 0) {
            return true;
          }

          return visibleAddressIdSet.has(normalizeShopEntityId(address));
        });

        return {
          ...company,
          shopAddresses: addresses,
        };
      });
  }, [directory, visibleFranchiseAddressIds, visibleFranchiseCompanyIds]);

  const storedSelectionId = normalizeShopEntityId(storedSelection);
  const matchedSelection = useMemo(
    () =>
      selectionOptions.find(
        company => normalizeShopEntityId(company) === storedSelectionId,
      ) || null,
    [selectionOptions, storedSelectionId],
  );
  const fallbackStoredSelection =
    !loadOptions && hasConfiguredSalesCompanies ? storedSelection : null;
  const salesCompany = !hasConfiguredSalesCompanies
    ? defaultCompany
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
    if (!loadOptions || !defaultCompanyId) {
      return;
    }

    if (!hasConfiguredSalesCompanies) {
      clearStoredShopSalesCompany(defaultCompanyId);
      setStoredSelection(current => (current ? null : current));
      return;
    }

    if (isLoading) {
      return;
    }

    if (selectionOptions.length === 0) {
      clearStoredShopSalesCompany(defaultCompanyId);
      setStoredSelection(current => (current ? null : current));
      return;
    }

    if (selectionOptions.length === 1) {
      const onlyCompany = selectionOptions[0];
      const onlyCompanyId = normalizeShopEntityId(onlyCompany);

      if (storedSelectionId !== onlyCompanyId) {
        persistShopSalesCompany(defaultCompanyId, onlyCompany);
        setStoredSelection(onlyCompany);
      }

      return;
    }

    if (storedSelectionId && !matchedSelection) {
      clearStoredShopSalesCompany(defaultCompanyId);
      setStoredSelection(null);
    }
  }, [
    defaultCompanyId,
    hasConfiguredSalesCompanies,
    isLoading,
    loadOptions,
    matchedSelection,
    selectionOptions,
    storedSelectionId,
  ]);

  const selectSalesCompany = useCallback(
    company => {
      if (!defaultCompanyId) {
        return;
      }

      if (!company) {
        clearStoredShopSalesCompany(defaultCompanyId);
        setStoredSelection(null);
        return;
      }

      persistShopSalesCompany(defaultCompanyId, company);
      setStoredSelection(company);
    },
    [defaultCompanyId],
  );

  const clearSalesCompanySelection = useCallback(() => {
    if (!defaultCompanyId) {
      return;
    }

    clearStoredShopSalesCompany(defaultCompanyId);
    setStoredSelection(null);
  }, [defaultCompanyId]);

  return {
    clearSalesCompanySelection,
    defaultCompany,
    directoryLoadFailed,
    isLoading,
    franchiseDirectoryLoadFailed: directoryLoadFailed,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions: selectionOptions,
    selectSalesCompany,
  };
}
