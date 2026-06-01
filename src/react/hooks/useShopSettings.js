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

const hasShopConfigEntries = configs =>
  isConfigMap(configs) &&
  Object.keys(configs).some(key => String(key).startsWith('shop-'));

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
    const defaultCompanyConfigs = isConfigMap(defaultCompany?.configs)
      ? defaultCompany.configs
      : {};

    if (
      defaultCompanyId &&
      currentCompanyId &&
      defaultCompanyId === currentCompanyId &&
      isConfigMap(runtimeConfigs)
    ) {
      return {
        ...defaultCompanyConfigs,
        ...runtimeConfigs,
      };
    }

    if (
      isConfigMap(runtimeConfigs) &&
      (!defaultCompanyId || hasShopConfigEntries(runtimeConfigs))
    ) {
      return {
        ...defaultCompanyConfigs,
        ...runtimeConfigs,
      };
    }

    return defaultCompanyConfigs;
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
        description: 'Cardápio, categorias e produtos',
        iconName: 'storefront',
        routeName: 'ShopIndex',
      });
    }

    if (settings.franchiseLocatorEnabled) {
      entries.push({
        key: SHOP_HOME_OPTION_FRANCHISE_LOCATOR,
        label: 'Franquias',
        description: 'Mapa e endereços das unidades',
        iconName: 'place',
        routeName: 'ShopFranchiseLocatorPage',
      });
    }

    if (settings.loyaltyCouponsEnabled) {
      entries.push({
        key: SHOP_HOME_OPTION_LOYALTY,
        label: 'Fidelidade',
        description: 'Cartão fidelidade e brindes',
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

  const primaryEntryRouteName = homeEntries[0]?.routeName || 'HomePage';

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
