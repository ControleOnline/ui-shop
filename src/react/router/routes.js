import StorefrontHome from '@controleonline/ui-shop/src/react/pages/StorefrontHome';
import SearchPage from '@controleonline/ui-shop/src/react/pages/SearchPage';
import CategoryPage from '@controleonline/ui-shop/src/react/pages/CategoryPage';
import ProductPage from '@controleonline/ui-shop/src/react/pages/ProductPage';
import CartPage from '@controleonline/ui-shop/src/react/pages/CartPage';
import CheckoutPage from '@controleonline/ui-shop/src/react/pages/CheckoutPage';
import OrdersPage from '@controleonline/ui-shop/src/react/pages/OrdersPage';
import OrderDetailsPage from '@controleonline/ui-shop/src/react/pages/OrderDetailsPage';
import ProfilePage from '@controleonline/ui-shop/src/react/pages/ProfilePage';
import CardsPage from '@controleonline/ui-shop/src/react/pages/CardsPage';

const shopRoutes = [
  {
    name: 'ShopSearchPage',
    path: 'shop/search/:q',
    component: SearchPage,
    options: {
      headerShown: false,
      showBottomCart: true,
      title: 'Busca',
    },
  },
  {
    name: 'ShopCategoryPage',
    path: 'shop/category/:id',
    component: CategoryPage,
    options: {
      headerShown: false,
      showBottomCart: true,
      title: 'Categoria',
    },
  },
  {
    name: 'ShopProductPage',
    path: 'product/:id/details',
    component: ProductPage,
    options: {
      headerShown: false,
      showBottomCart: true,
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
    component: ProfilePage,
    options: {
      headerShown: false,
      title: 'Perfil',
    },
  },
  {
    name: 'ShopCheckoutPage',
    path: 'shop/checkout',
    component: CheckoutPage,
    options: {
      headerShown: false,
      title: 'Pagamento',
    },
  },
  {
    name: 'ShopCardsPage',
    path: 'shop/cards',
    component: CardsPage,
    options: {
      headerShown: false,
      title: 'Cartões',
    },
  },
];

export const menuStorefrontRoute = {
  name: 'ShopIndex',
  path: 'shop',
  component: StorefrontHome,
  options: {
    headerShown: false,
    showBottomCart: true,
    title: 'Pedidos de Venda',
  },
  initialParams: {store: 'categories'},
};

export default shopRoutes;
