import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler, Alert, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { browserApiKey } from '../api/google-web-api-key.json';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';

export default class PlaceSelectScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultCoord: null,
            resultAddress: null,
            resultName: null
        };
    }

    componentDidMount() {
        // prevent the OS back control from going back
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => this.backAction());
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    backAction() {
        this.handleConfirm();
        return true;
    }

    render() {
        return (
            <Container><SafeAreaView style={{ flex: 1 }} forceInset="top">
                {/* map view (absolute position!!) */}
                <View style={{ position: 'absolute', marginTop: 84, height: '75%', width: '100%', borderRadius: 15 }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: 24.79602428409072,
                            longitude: 120.99213309502275,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
                        }}
                    >
                        <Marker coordinate={{ latitude: 24.79602428409072, longitude: 120.99213309502275 }} />
                    </MapView>
                </View>
                {/* search bar */}
                <View style={{ flex: 5 }}>
                    <GooglePlacesAutocomplete
                        placeholder='搜尋地點'
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
                        fetchDetails={true}
                        styles={{
                            textInput: {
                                color: appColors.textBlack,
                                backgroundColor: appColors.backgroundBlue,
                                fontSize: 20,
                                height: 60,
                            },

                        }}
                        onFail={(data) => {
                            console.log(data)
                        }}
                    />
                </View>
                {/* results */}
                <View style={{ flex: 1, backgroundColor: appColors.backgroundLightBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{margin: 10}}>
                        {(this.state.resultName == null) ? (
                            <Text>請選擇地點(NOT done yet)</Text>) : (
                            <View>
                                <Text>{this.state.resultName}</Text>
                                <Text>{this.state.resultAddress}</Text>
                            </View>)
                        }
                    </View>
                    <View style={{margin: 10}}>
                        <Button style={styles.SaveButton} rounded block onPress={() => this.handleConfirm()}>
                            <Text style={styles.SaveText}>確定</Text>
                        </Button>
                    </View>
                </View>
            </SafeAreaView></Container>
        );
    }
    handleConfirm() {
        this.props.navigation.pop();
    }
}

const styles = StyleSheet.create({
    SaveButton: {
        backgroundColor: appColors.appBlue,
        height: 40,
        width: 75,
    },
    SaveText: {
        color: "white",
        fontSize: 18,
    },
});