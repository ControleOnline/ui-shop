import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import Icon from 'react-native-vector-icons/Feather';
import {useNavigationState} from '@react-navigation/native';
import {useStores} from '@store';

const BottomToolbar = ({navigation}) => {
  const state = useNavigationState(state => state);
  const activeTab = state.routes[state.index]?.name || 'HomePage';
  const currentPageName =
    navigation.getState().routes[navigation.getState().index].name;
  const device_configStore = useStores(state => state.device_config);
  const deviceConfigGetters = device_configStore.getters;
  const {item: device} = deviceConfigGetters;
  const authStore = useStores(state => state.auth);
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const peopleStore = useStores(state => state.people);
  const peopleGetters = peopleStore.getters;
  const themeStore = useStores(state => state.theme);
  const getters = themeStore.getters;
  const {isLogged} = authGetters;
  const {colors} = getters;
  const {currentCompany} = peopleGetters;
  const [posType, setPosType] = useState(null);
  const deviceStore = useStores(state => state.device);
  const deviceGetters = deviceStore.getters;
  const {item: storagedDevice} = deviceGetters;

  useFocusEffect(
    useCallback(() => {
      if (storagedDevice && isLogged && currentPageName != 'SettingsPage') {
        if (
          device &&
          device?.configs &&
          Object.entries(device.configs).length > 0 &&
          device.configs['config-version'] == storagedDevice.buildNumber
        ) {
          setPosType(device.configs['pos-type'] || 'full');
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'SettingsPage'}],
          });
        }
      }
    }, [device, storagedDevice, isLogged]),
  );

  useFocusEffect(
    useCallback(() => {
      if (
        device &&
        device?.configs &&
        Object.entries(device.configs).length > 0 &&
        (device.configs['cash-wallet-closed-id'] == undefined ||
          device.configs['cash-wallet-closed-id'] > 0) &&
        isLogged &&
        currentPageName != 'CloseCashRegister' &&
        currentPageName != 'SettingsPage'
      ) {
        navigation.reset({
          index: 0,
          routes: [{name: 'CloseCashRegister'}],
        });
      }
    }, [device, storagedDevice, isLogged]),
  );

  const styles = StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 60,
      backgroundColor: '#f8f8f8',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 12,
      color: '#666',
      marginTop: 6,
    },
    activeText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.toolbar}>
      {device?.configs && Object.entries(device.configs).length > 0 && (
        <TouchableOpacity
          style={styles.button}
          disabled={
            !currentCompany || Object.entries(currentCompany).length === 0
          }
          onPress={() => {
            navigation.navigate('HomePage');
          }}>
          <Icon
            name="home"
            size={15}
            color={activeTab === 'HomePage' ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.buttonText,
              activeTab === 'HomePage' && styles.activeText,
            ]}>
            Home
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate('SalesOrderIndex');
        }}
        disabled={
          !currentCompany || Object.entries(currentCompany).length === 0
        }>
        <Icon
          name="shopping-bag"
          size={15}
          color={activeTab === 'SalesOrderIndex' ? '#007AFF' : '#666'}
        />
        <Text
          style={[
            styles.buttonText,
            activeTab === 'SalesOrderIndex' && styles.activeText,
          ]}>
          Pedidos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate('ProfilePage');
        }}
        disabled={
          !currentCompany || Object.entries(currentCompany).length === 0
        }>
        <Icon
          name="user"
          size={15}
          color={activeTab === 'ProfilePage' ? '#007AFF' : '#666'}
        />
        <Text
          style={[
            styles.buttonText,
            activeTab === 'ProfilePage' && styles.activeText,
          ]}>
          Perfil
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate('SettingsPage');
        }}
        disabled={
          !currentCompany || Object.entries(currentCompany).length === 0
        }>
        <Icon
          name="settings"
          size={15}
          color={activeTab === 'SettingsPage' ? '#007AFF' : '#666'}
        />
        <Text
          style={[
            styles.buttonText,
            activeTab === 'SettingsPage' && styles.activeText,
          ]}>
          Configurações
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default BottomToolbar;
