import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import {Text} from 'react-native-animatable';
import {useStore} from '@store';
import AppMenuGrid from '@controleonline/ui-layout/src/react/components/AppMenuGrid';
import styles from './index.styles';

export default function HomePage({navigation}) {
  const themeStore = useStore('theme');
  const getters = themeStore.getters;
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const {colors, menus} = getters;
  const {currentCompany} = peopleGetters;

  if (
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
        <AppMenuGrid menus={menus} navigation={navigation} />
      </View>
    </>
  );
}
