import CorrectiveDetails from './pages/CorrectiveDetails';
import CorrectiveList from './pages/CorrectiveList';
import CorrectivePage from './pages/CorrectivePage';
import HomePage from './pages/HomePage';
import LocationDetails from './pages/LocationDetails';
import LocationList from './pages/LocationList';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import type {RootStackParamList} from './pages/types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Corrective"
          component={CorrectivePage}
          // options={{headerShown: false}}
        />
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
  );
}
