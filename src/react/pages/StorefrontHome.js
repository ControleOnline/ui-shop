import React from 'react';
import ShopCatalogPage from '@controleonline/ui-shop/src/react/pages/ShopCatalogPage';

// The storefront landing page now reuses the shared `Compras` catalog shell.
export default function StorefrontHome() {
  return <ShopCatalogPage mode="default" />;
}
