import React from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { Text } from 'react-native-animatable';
import { useTheme } from '@controleonline/ui-layout/src/react/components/ThemeProvider';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importa os ícones

export default function HomePage({ navigation }) {
  const { menus } = useTheme();
  console.log(menus);

  const handleOrders = () => {
    navigation.navigate('SalesOrderIndex');
  };

  // Dados dos botões com ícones
  const buttons = [
    { id: '1', title: 'Pedidos de Venda', icon: 'shopping-cart', onPress: handleOrders },
    { id: '2', title: 'Clientes', icon: 'users', onPress: () => console.log('Clientes') },
    { id: '3', title: 'Produtos', icon: 'home', onPress: () => console.log('Produtos') },
    { id: '4', title: 'CRM', icon: 'address-book', onPress: () => console.log('CRM') },
  ];

  const renderButton = ({ item }) => (
    <TouchableOpacity style={styles.button} onPress={item.onPress}>
      <Icon name={item.icon} size={30} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={buttons}
        renderItem={renderButton}
        keyExtractor={(item) => item.id}
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
    backgroundColor: '#88b04b',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  icon: {
    marginBottom: 5, // Espaço entre o ícone e o texto
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});