import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback } from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import LinearGradient from 'react-native-linear-gradient'; // Install if not already
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;
const {width} = Dimensions.get('window');

const HomePage = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const handleNavigate = (sheetId: string) => {
      navigation.navigate('LocationList', {sheet: sheetId});
    };

    // const handleNavigateForCORRECTIVE= () => {
    //   navigation.navigate('Corrective');
    // }
  const handleNavigateCorrective = (sheetId: string) => {
    navigation.navigate('CorrectiveList', {sheet: sheetId});
  };
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

  // Corrective Functions
  const handleCorrectiveHowrah = () => Alert.alert('Corrective - HOWRAH');
  const handleCorrectiveSealdah = () => Alert.alert('Corrective - SEALDAH');
  const handleCorrectiveMetro = () => Alert.alert('Corrective - METRO');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <Text style={styles.header}>Maintenance Dashboard</Text>
      <LinearGradient
        colors={['#b0b0ae', 'transparent']}
        style={styles.imageOverlay_header}
      />
      {/* Image with gradient overlay */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../assets/train.png')}
          style={styles.image}
          resizeMode="stretch"
        />
        <LinearGradient
          colors={['transparent', '#fafafa']}
          style={styles.imageOverlay}
        />
      </View>

      {/* Bottom button section */}
      <View style={styles.bottomContainer}>
        {/* Preventive */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>PREVENTIVE MAINTENANCE</Text>
          <View style={styles.buttonRow}>
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

        {/* Corrective */}
        <View style={styles.group}>
          <Text style={styles.groupTitle1}>CORRECTIVE MAINTENANCE</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleNavigateCorrective('1')}>
              <Text style={styles.buttonText}>HOWRAH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleNavigateCorrective('2')}>
              <Text style={styles.buttonText}>SEALDAH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleNavigateCorrective('3')}>
              <Text style={styles.buttonText}>METRO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 9,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    color: '#fff',
    // color: '#333',
  },
  imageWrapper: {
    // flex: 1,
    width: '100%',
    height: '70%',
    // position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    height: 200,
    width: '100%',
  },
  imageOverlay_header: {
    zIndex: 10,
    position: 'absolute',
    top: 0,
    height: 30,
    width: '100%',
  },
  bottomContainer: {
    flex: 2,
    justifyContent: 'flex-end',
    padding: 20,
  },
  group: {
    marginBottom: 30,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 12,
    color: '#fafafa',
  },
  groupTitle1: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 12,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#fff',
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomePage;


