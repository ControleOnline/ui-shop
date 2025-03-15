import React from 'react';
import {StyleSheet, TouchableOpacity, View, FlatList} from 'react-native';
import {Text} from 'react-native-animatable';
import {getStore} from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomePage({navigation}) {
  const {getters} = getStore('theme');
  const {colors} = getters;
  
  const handleTo = to => {
    navigation.navigate(to);
  };

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
      title: 'Clientes',
      icon: 'users',
      backgroundColor: '#4682b4',
      onPress: () => handleTo('ClientsIndex'),
    },
    {
      id: '3',
      title: 'Produtos',
      icon: 'home',
      backgroundColor: '#32cd32',
      onPress: () => handleTo('ProductsIndex'),
    },
    {
      id: '4',
      title: 'CRM',
      icon: 'address-book',
      backgroundColor: '#20b2aa',
      onPress: () => handleTo('CRMIndex'),
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

  return (
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
});
