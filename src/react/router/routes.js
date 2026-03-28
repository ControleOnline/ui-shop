import Profile from '@controleonline/ui-people/src/react/pages/Profile';
import StorefrontHome from '@controleonline/ui-shop/src/react/pages/StorefrontHome';
import SearchPage from '@controleonline/ui-shop/src/react/pages/SearchPage';
import CategoryPage from '@controleonline/ui-shop/src/react/pages/CategoryPage';
import ProductPage from '@controleonline/ui-shop/src/react/pages/ProductPage';
import CartPage from '@controleonline/ui-shop/src/react/pages/CartPage';
import OrdersPage from '@controleonline/ui-shop/src/react/pages/OrdersPage';
import OrderDetailsPage from '@controleonline/ui-shop/src/react/pages/OrderDetailsPage';

const shopRoutes = [
  {
    name: 'ShopSearchPage',
    path: 'shop/search/:q',
    component: SearchPage,
    options: {
      headerShown: false,
      title: 'Busca',
    },
  },
  {
    name: 'ShopCategoryPage',
    path: 'shop/category/:id',
    component: CategoryPage,
    options: {
      headerShown: false,
      title: 'Categoria',
    },
  },
  {
    name: 'ShopProductPage',
    path: 'product/:id/details',
    component: ProductPage,
    options: {
      headerShown: false,
      title: 'Produto',
    },
  },
  {
    name: 'ShopCartPage',
    path: 'cart',
    component: CartPage,
    options: {
      headerShown: false,
      title: 'Carrinho',
    },
  },
  {
    name: 'ShopOrdersPage',
    path: 'orders/my',
    component: OrdersPage,
    options: {
      headerShown: false,
      title: 'Meus pedidos',
    },
  },
  {
    name: 'ShopOrderDetailsPage',
    path: 'orders/my/id/:id',
    component: OrderDetailsPage,
    options: {
      headerShown: false,
      title: 'Pedido',
    },
  },
  {
    name: 'ShopProfilePage',
    path: 'orders/my-profile',
    component: Profile,
    options: {
      headerShown: true,
      title: 'Perfil',
    },
  },
];

export const menuStorefrontRoute = {
  name: 'ShopIndex',
  path: 'shop',
  component: StorefrontHome,
  options: {
    headerShown: false,
    title: 'Pedidos de Venda',
  },
  initialParams: {store: 'categories'},
};

export default shopRoutes;
