import HomePage from '@controleonline/ui-shop/src/react/pages/home/index';
import ScreenWithToolbar from '@controleonline/ui-layout/src/react/components/ScreenWithToolbar';

const WrappedHomePage = ({navigation}) => (
  <ScreenWithToolbar navigation={navigation}>
    <HomePage navigation={navigation} />
  </ScreenWithToolbar>
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
