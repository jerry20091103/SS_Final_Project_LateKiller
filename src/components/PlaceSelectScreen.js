import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler, Alert, TouchableWithoutFeedback, Keyboard, TextInput   } from 'react-native';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { browserApiKey } from '../api/google-web-api-key.json';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default class PlaceSelectScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultCoord: null,
            resultAddress: null,
            resultName: null
        };
    }
    render() {
        return (
            <Container><SafeAreaView style={{flex:1}} forceInset="top">
                {/* search bar */}
                <View style={{flex: 1}}>
                    <GooglePlacesAutocomplete
                        placeholder= '搜尋地點'
                        onPress={(data, details = null) => {
                            this.setState({
                                resultCoord: details.geometry.location,
                                resultAddress: details.formatted_address,
                                resultName: details.name
                            })
                        }}
                        query={{
                            key: browserApiKey,
                            language: 'zh-TW'
                        }}
                        fetchDetails= {true}
                        styles= {{
                            textInput: {
                                color: appColors.textBlack,
                                backgroundColor: appColors.backgroundBlue,
                                placeholderTextColor: appColors.textGray,
                                fontSize: 20,
                                height: 60,
                                borderBottomLeftRadius: 15, 
                                borderBottomRightRadius: 15,
                            },
                
                        }}
                        onFail={(data) => {
                            console.log(data)
                        }}
                    />
                </View>
                {/* map view */}
                <View>

                </View>
                {/* results */}
                <View style={{flex: 1}}>
                    {(this.state.resultName == null) ? (
                        <Text>請選擇地點</Text>) : (
                        <View>
                            <Text>{this.state.resultName}</Text>
                            <Text>{this.state.resultAddress}</Text>
                        </View>)
                    }
                    
                </View>
            </SafeAreaView></Container>

        );
    }
}