import React from 'react';
import {useRoute} from '@react-navigation/native';
import ShopCatalogPage from '@controleonline/ui-shop/src/react/pages/ShopCatalogPage';

// Deep-linked category pages now reuse the shared `Compras` experience.
export default function CategoryPage() {
  const route = useRoute();
  return (
    <ShopCatalogPage
      categoryId={String(route.params?.id || '')}
      mode="category"
    />
  );
}
