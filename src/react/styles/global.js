const {StyleSheet} = require('react-native');
import {getStore} from '@store';

export default css = () => {
  const {getters} = getStore('theme');
  const {colors} = getters;
  const globalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f4f4',
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      padding: 11,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primary: {
      backgroundColor: colors['primary'],
      color: '#000000',
    },
    btnAdd: {
      flex: 1,
      color: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors['primary'],
    },
  });
  return globalStyles;
};
