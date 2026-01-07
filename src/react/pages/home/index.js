import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-animatable';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStores} from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomePage({navigation}) {
  const themeStore = useStores(state => state.theme);
  const getters = themeStore.getters;
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore.getters;
  const device_configStore = useStores(state => state.device_config);
  const deviceConfigGetters = device_configStore.getters;
  const {item: device} = deviceConfigGetters;
  const {colors} = getters;
  const {currentCompany} = peopleGetters;
  const [posType, setPosType] = useState(null);
  const handleTo = to => {
    navigation.navigate(to);
  };

  useFocusEffect(
    useCallback(() => {
      if (device?.configs && Object.keys(device.configs).length > 0)
        setPosType(device.configs['pos-type'] || 'full');
    }, [device]),
  );

  const buttons = [
    {
      id: '1',
      title: 'Pedidos de Venda',
      icon: 'shopping-cart',
      backgroundColor: colors['primary'],
      onPress: () => handleTo('SalesOrderIndex'),
    },
    {
      id: '2',
      title: 'Caixa',
      icon: 'money',
      backgroundColor: '#4682b4',
      onPress: () => handleTo('CashRegisterIndex'),
    },
  ];

  const renderButton = ({item}) => (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: item.backgroundColor}]}
      onPress={item.onPress}>
      <Icon name={item.icon} size={30} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>{item.title}</Text>
    </TouchableOpacity>
  );
  if (
    !device.configs ||
    !currentCompany ||
    Object.entries(currentCompany).length === 0 ||
    !colors ||
    Object.entries(colors).length === 0
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors['primary'] || '#0000ff'}
        />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={buttons}
          renderItem={renderButton}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 60,
  },
  content: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  icon: {
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
