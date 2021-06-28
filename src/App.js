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
import PlaceSelectScreen from './components/PlaceSelectScreen.js'
import MessageScreen from './components/MessageScreen';

import {Root, StyleProvider} from 'native-base';
import getTheme from '../native-base-theme/components';
import commonColor from '../native-base-theme/variables/commonColor.js';

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Meet: { screen: EventScreen },
    Record: { screen: RecordScreen },
    PlaceSelect: { screen: PlaceSelectScreen },
    Message: {screen: MessageScreen}
  },
  {
    initialRouteName: 'Home', //設定預設顯示的page

    headerMode: 'none' // don't display page titles
  }
);

const AuthNavigator = createStackNavigator(
  { 
    SignIn:{ 
    screen:SignInScreen ,
    }
  },
  {
    headerMode: 'none'
  });

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
      <StyleProvider style={getTheme(commonColor)}>
        <Root>
          <AppContainer />
        </Root>
      </StyleProvider>
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