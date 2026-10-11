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
  const authStore = useStore('auth');
  const peopleStore = useStore('people');
  const configsStore = useStore('configs');
  const {isLogged} = authStore.getters;
  const {mainCompany, currentCompany} = peopleStore.getters;
  const {items: runtimeConfigs} = configsStore.getters;

  const mainCompanyId = normalizeShopEntityId(
    mainCompany?.id || mainCompany?.['@id'],
  );
  const currentCompanyId = normalizeShopEntityId(
    currentCompany?.id || currentCompany?.['@id'],
  );

  const companyConfigs = useMemo(() => {
    const mainCompanyConfigs = isConfigMap(mainCompany?.configs)
      ? mainCompany.configs
      : {};

    if (
      isLogged &&
      mainCompanyId &&
      currentCompanyId &&
      mainCompanyId === currentCompanyId &&
      isConfigMap(runtimeConfigs)
    ) {
      return {
        ...mainCompanyConfigs,
        ...runtimeConfigs,
      };
    }

    if (
      isLogged &&
      isConfigMap(runtimeConfigs) &&
      (!mainCompanyId || hasShopConfigEntries(runtimeConfigs))
    ) {
      return {
        ...mainCompanyConfigs,
        ...runtimeConfigs,
      };
    }

    return mainCompanyConfigs;
  }, [
    currentCompanyId,
    mainCompany?.configs,
    mainCompanyId,
    isLogged,
    runtimeConfigs,
  ]);

  const settings = useMemo(
    () => resolveShopSettings(companyConfigs),
    [companyConfigs],
  );
  const franchiseLocatorEnabled =
    settings.franchiseLocatorEnabled &&
    settings.visibleFranchiseCompanyIds.length > 0;

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

    if (franchiseLocatorEnabled) {
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
    franchiseLocatorEnabled,
    settings.loyaltyCouponsEnabled,
    settings.salesPageEnabled,
  ]);

  const primaryEntryRouteName = homeEntries[0]?.routeName || 'HomePage';

  return {
    ...settings,
    franchiseLocatorEnabled,
    companyConfigs,
    currentCompany,
    mainCompany,
    homeEntries,
    hasMultipleHomeOptions: homeEntries.length > 1,
    primaryEntryRouteName,
  };
}
