import HomePage from '@controleonline/ui-shop/src/react/pages/home/index';
import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout';

const WrappedHomePage = ({navigation}) => (
  <DefaultLayout navigation={navigation}>
    <HomePage navigation={navigation} />
  </DefaultLayout>
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
