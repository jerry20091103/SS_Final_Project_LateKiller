import React from 'react';
<<<<<<< HEAD
import { StyleSheet, Text, Image,ImageBackground,Dimensions } from 'react-native'
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail } from 'native-base';
import GoogleSignInButton from './GoogleSignInButton';
import appColors from '../styles/colors.js';
//api有問題
=======
import{StyleSheet, Text, Image} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content, Body, Thumbnail} from 'native-base';
import GoogleSignInButton from './GoogleSignInButton'; 

>>>>>>> 159bcb346e04a17a51604e006f6a261f0a704dfa
export default class SignInScreen extends React.Component {

    render() {
      const windowWidth = Dimensions.get('window').width;
        return (
          <Container>
          <View  style={{paddingTop: 120,flex:1,backgroundColor: appColors.backgroundBlue,alignItems: 'center'}}>

               {/* <Text style={{fontSize: 30,fontFamily:'normal'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'notoserif'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'sans-serif'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'sans-serif-light'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'sans-serif-thin'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'sans-serif-condensed'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'sans-serif-medium'}}>LateKiller</Text> */}
               <Text style={{color:appColors.textGray ,fontSize: 50,fontFamily:'serif'}}>LateKiller</Text>
               {/* <Text style={{fontSize: 30,fontFamily:'Roboto'}}>LateKiller</Text>
               <Text style={{fontSize: 30,fontFamily:'monospace'}}>LateKiller</Text> */}
               

                <ImageBackground style={{
                    resizeMethod: "auto",
                    width:windowWidth,
                    height:400,}}

                    source={require('../../assets/CoverImage.png')}>

                </ImageBackground>

                    <GoogleSignInButton navigate={this._signInDone.bind(this)} />
                
            </View>
            </Container>
        );
  } 

    _signInDone() {
        this.props.navigation.navigate('App');
<<<<<<< HEAD
      };
=======
        
    };
>>>>>>> 159bcb346e04a17a51604e006f6a261f0a704dfa
  }


  //signInScreen範例