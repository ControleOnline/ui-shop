import React from 'react';
import {useRoute} from '@react-navigation/native';
import ShopCatalogPage from '@controleonline/ui-shop/src/react/pages/ShopCatalogPage';

// Search results now render inside the same shared `Compras` catalog shell.
export default function SearchPage() {
  const route = useRoute();
  return (
    <ShopCatalogPage
      mode="search"
      searchQuery={String(route.params?.q || '')}
    />
  );
}
