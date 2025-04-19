import {Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, { useCallback } from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;
const HomePage = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleNavigate = (sheetId: string) => {
    navigation.navigate('LocationList', {sheet: sheetId});
  };

  const handleNavigateForCORRECTIVE= () => {
    navigation.navigate('Corrective');
  }

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          {cancelable: false},
        );
        return true; // prevent default back behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MEGA DESIGNS PVT LTD</Text>
      </View>
      <View style={styles.main}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigateForCORRECTIVE()}>
          <Text style={styles.buttonText}>CORRECTIVE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate('2')}>
          <Text style={styles.buttonText}>HOWRAH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate('1')}>
          <Text style={styles.buttonText}>SEALDAH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate('3')}>
          <Text style={styles.buttonText}>METRO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20, // if using React Native >= 0.71, otherwise use margin
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomePage;
