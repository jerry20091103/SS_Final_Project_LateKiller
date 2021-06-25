import React from 'react';
import{StyleSheet, Text, Image} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content, Body, Thumbnail} from 'native-base';
import GoogleSignInButton from './GoogleSignInButton'; 

export default class SignInScreen extends React.Component {
  
    render() {
      return (
        <View>

         <GoogleSignInButton navigate = {this._signInDone.bind(this)}/>
        </View>
      );
    }
  
    _signInDone() {
        this.props.navigation.navigate('App');
        
    };
  }
  

  //signInScreen範例