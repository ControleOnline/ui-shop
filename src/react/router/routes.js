import HomePage from '@controleonline/ui-shop/src/react/pages/home/index';
import ShopLayout from '@controleonline/ui-layout/src/react/layouts/ShopLayout';

const WrappedHomePage = ({navigation}) => (
  <ShopLayout navigation={navigation}>
    <HomePage navigation={navigation} />
  </ShopLayout>
);

const shopRoutes = [
  {
    name: 'HomePage',
    component: WrappedHomePage,
    options: {
      headerShown: false,
      title: 'Menu',
    },
  },
];

export default shopRoutes;
