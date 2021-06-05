import React from 'react';
import { View, Text } from 'react-native';
export default class HomeScreen extends React.Component {
    render() {
    const {navigate} = this.props.navigation;
    return (
      <Text>HomeScreen</Text>
    );
    }
  }