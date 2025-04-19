import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// CorrectivePage.tsx
import React from 'react';
import { RootStackParamList } from './types';
import { useNavigation } from '@react-navigation/native';

type CorrectiveScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Corrective'
>;
const CorrectivePage = () => {
    const navigation = useNavigation<CorrectiveScreenNavigationProp>();
    const handleNavigate = (sheetId: string) => {
    navigation.navigate('CorrectiveList', {sheet: sheetId});
    };
  return (
    <View style={styles.container}>
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
      {/* Add your form, data display or other UI components here */}
    </View>
  );
};

export default CorrectivePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
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
