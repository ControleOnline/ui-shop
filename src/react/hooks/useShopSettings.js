import {useMemo} from 'react';

import {useStore} from '@store';

import {
  normalizeShopEntityId,
  resolveShopSettings,
  SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
  SHOP_HOME_OPTION_LOYALTY,
  SHOP_HOME_OPTION_SALES,
} from '@controleonline/ui-common/src/react/utils/shopConfig';

const isConfigMap = value =>
  value && typeof value === 'object' && !Array.isArray(value);

export default function useShopSettings() {
  const peopleStore = useStore('people');
  const configsStore = useStore('configs');
  const {defaultCompany, currentCompany} = peopleStore.getters;
  const {items: runtimeConfigs} = configsStore.getters;

  const defaultCompanyId = normalizeShopEntityId(
    defaultCompany?.id || defaultCompany?.['@id'],
  );
  const currentCompanyId = normalizeShopEntityId(
    currentCompany?.id || currentCompany?.['@id'],
  );

  const companyConfigs = useMemo(() => {
    if (
      defaultCompanyId &&
      currentCompanyId &&
      defaultCompanyId === currentCompanyId &&
      isConfigMap(runtimeConfigs)
    ) {
      return runtimeConfigs;
    }

    if (!defaultCompanyId && isConfigMap(runtimeConfigs)) {
      return runtimeConfigs;
    }

    if (isConfigMap(defaultCompany?.configs)) {
      return defaultCompany.configs;
    }

    return {};
  }, [
    currentCompanyId,
    defaultCompany?.configs,
    defaultCompanyId,
    runtimeConfigs,
  ]);

  const settings = useMemo(
    () => resolveShopSettings(companyConfigs),
    [companyConfigs],
  );

  const homeEntries = useMemo(() => {
    const entries = [];

    if (settings.salesPageEnabled) {
      entries.push({
        key: SHOP_HOME_OPTION_SALES,
        label: 'Compras',
        description: 'Cardapio, categorias e produtos',
        iconName: 'storefront',
        routeName: 'ShopIndex',
      });
    }

    if (settings.franchiseLocatorEnabled) {
      entries.push({
        key: SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
        label: 'Franquias',
        description: 'Mapa e enderecos das unidades',
        iconName: 'place',
        routeName: 'ShopFranchiseLocatorPage',
      });
    }

    if (settings.loyaltyCouponsEnabled) {
      entries.push({
        key: SHOP_HOME_OPTION_LOYALTY,
        label: 'Fidelidade',
        description: 'Cartao fidelidade e brindes',
        iconName: 'loyalty',
        routeName: 'ShopLoyaltyPage',
      });
    }

    return entries;
  }, [
    settings.franchiseLocatorEnabled,
    settings.loyaltyCouponsEnabled,
    settings.salesPageEnabled,
  ]);

  const primaryEntryRouteName =
    homeEntries.find(entry => entry.key === settings.primaryEntry)?.routeName ||
    homeEntries[0]?.routeName ||
    'HomePage';

  return {
    ...settings,
    companyConfigs,
    currentCompany,
    defaultCompany,
    homeEntries,
    hasMultipleHomeOptions: homeEntries.length > 1,
    primaryEntryRouteName,
  };
}
