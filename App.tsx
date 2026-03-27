import {Alert, PermissionsAndroid, Platform} from 'react-native';
import React, { useEffect } from 'react';

import CorrectiveDetails from './pages/CorrectiveDetails';
import CorrectiveList from './pages/CorrectiveList';
import DeviceInfo from 'react-native-device-info';
// import CorrectivePage from './pages/CorrectivePage';
import HomePage from './pages/HomePage';
import LocationDetails from './pages/LocationDetails';
import LocationList from './pages/LocationList';
import {NavigationContainer} from '@react-navigation/native';
import NetworkStatusBar from './pages/NetworkStatusBar';
import NewDocketScreen from './pages/NewDocketScreen';
import type {RootStackParamList} from './pages/types';
import axios from 'axios';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator<RootStackParamList>();





export default function App() {
  //
  useEffect(() => {
    // 1. Request Permission (Required for Android 13+)
    const requestUserPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      const authStatus = await messaging().requestPermission();
      console.log('Notification permission status:', authStatus);
    };

    // 2. Get the FCM Device Token
    // const getFcmToken = async () => {
    //   try {
    //     const token = await messaging().getToken();
    //     console.log('🔥 THIS IS YOUR FCM TOKEN:', token);
    //     // Save this token to your console for now. Later we will send it to Google Sheets!
    //   } catch (error) {
    //     console.error('Failed to get FCM token:', error);
    //   }
    // };
    const sheetId = '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q';
    const getFcmToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('🔥 THIS IS YOUR FCM TOKEN:', token);

        // Grab the phone's name
        const deviceName = await DeviceInfo.getDeviceName();

        // Send it to your Google Sheet
        await axios.post(
          'https://script.google.com/macros/s/AKfycbw6bwgkmty9wed_gDThv2C7uw9H2YKe7TvOoP6tMcbozmrZhqwUau3OvthvhlOh35mQOw/exec',
          JSON.stringify({deviceName: deviceName, token: token}),
          {
            params: {sheetId: sheetId, action: 'saveToken'},
            headers: {'Content-Type': 'application/json'},
          },
        );
        console.log('✅ Token successfully sent to Google Sheets!');
      } catch (error) {
        console.error('❌ Failed to get or send FCM token:', error);
      }
    };

    requestUserPermission();
    getFcmToken();

    // 3. Listen for notifications WHEN THE APP IS OPEN (Foreground)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Standard push notifications don't drop down from the top when the app is open.
      // We manually show an Alert here.
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have a new message!',
      );
    });

    // Cleanup the listener when the app closes
    return unsubscribe;
  }, []);
  //

  return (
    <>
      <NetworkStatusBar />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomePage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="NewDocket"
            component={NewDocketScreen}
            options={{
              title: 'New Docket', // or whatever you want as header title
              headerTitleAlign: 'center', // centers the title
              headerStyle: {
                backgroundColor: '#4a90e2', // 🎨 change header background color
              },
              headerTintColor: '#fff', // changes the back button and title color
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          {/* <Stack.Screen
            name="Corrective"
            component={CorrectivePage}
            // options={{headerShown: false}}
          /> */}
          <Stack.Screen
            name="CorrectiveList"
            component={CorrectiveList}
            options={{
              title: 'Corrective List', // or whatever you want as header title
              headerTitleAlign: 'center', // centers the title
              headerStyle: {
                backgroundColor: '#4a90e2', // 🎨 change header background color
              },
              headerTintColor: '#fff', // changes the back button and title color
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="CorrectiveDetails"
            component={CorrectiveDetails}
            options={{
              title: 'Location Details', // or whatever you want as header title
              headerTitleAlign: 'center', // centers the title
              headerStyle: {
                backgroundColor: '#4a90e2', // 🎨 change header background color
              },
              headerTintColor: '#fff', // changes the back button and title color
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="LocationList"
            component={LocationList}
            options={{
              title: 'Location List', // or whatever you want as header title
              headerTitleAlign: 'center', // centers the title
              headerStyle: {
                backgroundColor: '#4a90e2', // 🎨 change header background color
              },
              headerTintColor: '#fff', // changes the back button and title color
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="LocationDetails"
            component={LocationDetails}
            options={{
              title: 'Location Details', // or whatever you want as header title
              headerTitleAlign: 'center', // centers the title
              headerStyle: {
                backgroundColor: '#4a90e2', // 🎨 change header background color
              },
              headerTintColor: '#fff', // changes the back button and title color
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
