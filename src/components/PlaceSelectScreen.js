import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler, Alert, TouchableWithoutFeedback, Keyboard, TextInput, Image } from 'react-native';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { browserApiKey } from '../api/google-web-api-key.json';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-community/async-storage';

export default class PlaceSelectScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultCoord: null,      // coordinate for the place {lat: ..., lng: ...} (object)
            resultRegion: null,     // used to move mapview camera (no need to save)
            resultAddress: null,    // address of the place (string)
            resultName: null        // name of the place (string)
        };
    }

    componentDidMount() {
        // prevent the OS back control from going back
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => this.backAction());
        // get data from EventScreen
        if (this.props.navigation.getParam('coord', null) != null) {
            this.setState({
                resultCoord: this.props.navigation.getParam('coord', null),
                resultRegion: {
                    latitude: this.props.navigation.getParam('coord', null).lat,
                    longitude: this.props.navigation.getParam('coord', null).lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                },
                resultName: this.props.navigation.state.params.nameIsAddress === "true" ? null : this.props.navigation.getParam('name', null)
            }, () => this.coordToAddress());
        }
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Container><SafeAreaView style={{ flex: 1 }} forceInset="top">
                    {/* map view (absolute position!!) */}
                    <View style={{ position: 'absolute', marginTop: 84, height: '75%', width: '100%', borderRadius: 15 }}>
                        <MapView
                            ref={ref => { this.MapView = ref }}
                            style={{ flex: 1 }}
                            initialRegion={this.state.resultRegion || {
                                latitude: 24.79602428409072,
                                longitude: 120.99213309502275,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1
                            }}
                            onPress={data => {
                                this.setState({
                                    resultCoord: { lat: data.nativeEvent.coordinate.latitude, lng: data.nativeEvent.coordinate.longitude },
                                    resultName: null,
                                },
                                    () => {
                                        this.coordToAddress();
                                    });
                            }}
                            onRegionChange={Region => this.setState({
                                resultRegion: Region
                            })
                            }
                        >
                            <Marker coordinate={{ latitude: this.getCoord().lat, longitude: this.getCoord().lng }} />
                        </MapView>
                    </View>
                    {/* search bar */}
                    <View style={{ flex: 5 }}>
                        <GooglePlacesAutocomplete
                            ref={ref => this.textInput = ref}
                            renderRightButton={() => {
                                return (
                                    <Icon type='MaterialIcons' name='cancel' style={{ backgroundColor: appColors.backgroundBlue, color: appColors.textGray, height: 60, alignItems: 'center', fontSize: 26, padding: 10, paddingVertical: 18 }}
                                        onPress={() => this.textInput.clear()} />
                                )
                            }}
                            placeholder='搜尋地點'
                            onPress={(data, details = null) => {
                                this.setState({
                                    resultCoord: details.geometry.location,
                                    resultAddress: details.formatted_address,
                                    resultName: details.name,
                                    resultRegion: {
                                        latitude: details.geometry.location.lat,
                                        longitude: details.geometry.location.lng,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01
                                    }
                                }, () => this.MapView.animateToRegion(this.state.resultRegion, 1500));                                
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
                                    borderRadius: 0
                                },

                            }}
                            onFail={(data) => {
                                console.log(data)
                            }}
                        />
                    </View>
                    {/* results */}
                    <View style={{ flex: 1, backgroundColor: appColors.backgroundLightBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ margin: 10, maxWidth: '70%' }}>
                            {(this.state.resultAddress == null) ? (
                                <Text style={styles.DetailText}>請選擇地點</Text>) : (
                                <View>
                                    {(this.state.resultName && <Text style={styles.DetailText}>{this.state.resultName}</Text>)}
                                    <Text style={styles.DetailTextSmall}>{this.state.resultAddress}</Text>
                                </View>)
                            }
                        </View>
                        <View style={{ margin: 10 }}>
                            <Button style={styles.SaveButton} rounded block onPress={() => this.handleConfirm()}>
                                <Text style={styles.SaveText}>確定</Text>
                            </Button>
                        </View>
                    </View>
                </SafeAreaView></Container>
            </TouchableWithoutFeedback>
        );
    }
    // go back to EventScreen and send data back (if resultName is null, will use resultAddress instead.)
    // if no place was choosen, will go back without any consequences
    async handleConfirm() {
        if (this.state.resultCoord != null) {
            await AsyncStorage.setItem('coord', JSON.stringify(this.state.resultCoord))
            await AsyncStorage.setItem('name', this.state.resultName || this.state.resultAddress)
            await AsyncStorage.setItem('nameIsAddress', this.state.resultName ? "false" : "true")
            this.props.navigation.state.params.onGoBack();
        }
        this.props.navigation.pop();
    }
    getCoord() {
        // return default region
        if (this.state.resultCoord == null)
            return {
                lat: 24.79602428409072,
                lng: 120.99213309502275,
            }
        else
            return this.state.resultCoord
    }
    getRegion() {
        if (this.state.resultRegion == null)
            return {
                latitude: 24.79602428409072,
                longitude: 120.99213309502275,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
            }
        else
            return this.state.resultRegion;
    }
    // reverse geocoding with google map
    async coordToAddress() {
        let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.resultCoord.lat + ',' + this.state.resultCoord.lng + '&key=' + browserApiKey + '&language=zh-TW';
        await fetch(url, { method: 'GET' }).then(
            (res) => res.json()
        ).then((data) => {
            this.setState({
                resultAddress: data.results[0].formatted_address
            });
        });
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
    DetailText: {
        color: appColors.textBlack,
        fontSize: 20,
        marginVertical: 5,
    },
    DetailTextSmall: {
        color: appColors.textBlack,
        fontSize: 16,
        marginVertical: 5,
    },
    backButton: {
        backgroundColor: appColors.backgroundBlue,
        justifyContent: 'center',
        // padding: 10,
    }
});