/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import HomeScreen from './components/HomeScreen';
import EventScreen from './components/EventScreen'
import RecordScreen from './components/RecordScreen'
import SignInScreen from './components/SignInScreen.js'

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Meet: { screen: EventScreen },
    Record: { screen: RecordScreen }
  },
  {
    initialRouteName: 'Home', //設定預設顯示的page

    headerMode: 'none' // don't display page titles
  }
);

const AuthNavigator = createStackNavigator({ SignIn: SignInScreen });

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      //AuthLoading: AuthLoadingScreen,
      App: AppNavigator,
      Auth: AuthNavigator,
    },
    {
      initialRouteName: 'Auth',
      headerMode: 'none'
    }
  )

);

class App extends React.Component {
  render() {
    return (
        <AppContainer />
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;