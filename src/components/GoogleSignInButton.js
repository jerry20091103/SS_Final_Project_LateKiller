/*
This file provides GoogleSignInButton component.
UserInfo returned by googleSignIn function is stored in state.
*/


import React  from 'react';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
    
} from '@react-native-google-signin/google-signin';
import { signInWithGoogle, prepareSignInWithGoogle,signInFireBase } from '../utilities/User.js';
import{StyleSheet, Text, Image} from 'react-native'
import appColors from '../styles/colors.js';


export default class GoogleSignInButton extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            userInfo: [],
            isSigninInProgress: false,
        };
        //this.googleSignIn.bind(this);
    }



    render() {
        return (
            <GoogleSigninButton
            style={{ width: 210, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}  // change this to Light to apply a grey background.
            onPress={this.googleSignIn.bind(this)}
            disabled={this.state.isSigninInProgress} />
        );
      }    


    async googleSignIn() {
        prepareSignInWithGoogle();
        
        if(!this.state.isSigninInProgress) {
            this.setState({
                isSigninInProgress: true,
            });
            var user = await signInWithGoogle();
            await signInFireBase();

            this.setState({
                isSigninInProgress: false,
                userInfo: user,
            });
            this.props.navigate();
        }
    } 
};

