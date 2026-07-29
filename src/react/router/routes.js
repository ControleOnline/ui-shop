import StorefrontHome from '@controleonline/ui-shop/src/react/pages/StorefrontHome';
import ShopFranchiseLocatorPage from '@controleonline/ui-shop/src/react/pages/ShopFranchiseLocatorPage';
import ShopLoyaltyPage from '@controleonline/ui-shop/src/react/pages/ShopLoyaltyPage';
import SearchPage from '@controleonline/ui-shop/src/react/pages/SearchPage';
import CategoryPage from '@controleonline/ui-shop/src/react/pages/CategoryPage';
import ProductPage from '@controleonline/ui-shop/src/react/pages/ProductPage';
import CartPage from '@controleonline/ui-shop/src/react/pages/CartPage';
import CheckoutPage from '@controleonline/ui-shop/src/react/pages/CheckoutPage';
import OrdersPage from '@controleonline/ui-shop/src/react/pages/OrdersPage';
import OrderDetailsPage from '@controleonline/ui-shop/src/react/pages/OrderDetailsPage';
import ProfilePage from '@controleonline/ui-shop/src/react/pages/ProfilePage';
import CardsPage from '@controleonline/ui-shop/src/react/pages/CardsPage';
import ShopDownloadPage from '@controleonline/ui-shop/src/react/pages/ShopDownloadPage';

const shopRoutes = [
  {
    name: 'ShopIndex',
    path: 'shop',
    component: StorefrontHome,
    options: {
      headerShown: false,
      showBottomCart: true,
      title: 'Pedidos de Venda',
    },
    initialParams: {store: 'categories'},
  },
  {
    name: 'ShopFranchiseLocatorPage',
    path: 'shop/franchises',
    component: ShopFranchiseLocatorPage,
    options: {
      headerShown: false,
      showBottomCart: false,
      title: 'Franquias',
    },
  },
  {
    name: 'ShopLoyaltyPage',
    path: 'shop/loyalty',
    component: ShopLoyaltyPage,
    options: {
      headerShown: false,
      showBottomCart: false,
      title: 'Fidelidade',
    },
  },
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
    path: 'shop/product/:id',
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
    path: 'shop/profile',
    component: ProfilePage,
    options: {
      headerShown: false,
      showBottomCart: false,
      title: 'Perfil',
    },
  },
  {
    name: 'ShopProfileLegacyPage',
    path: 'orders/my-profile',
    component: ProfilePage,
    options: {
      headerShown: false,
      showBottomCart: false,
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
  {
    name: 'ShopDownloadPage',
    path: 'download',
    component: ShopDownloadPage,
    options: {
      headerShown: false,
      title: 'Baixar cardapio',
    },
  },
];

export default shopRoutes;
