import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler, Alert, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import BottomSheet from 'react-native-raw-bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { creatEvent, attendEvent, getEventInfo } from '../api/Event.js'
import AttendeeList from './AttendeeList.js'

/* Event Screen
    Event details are stored in this.state .
    Every time the user edits event details, this.state will be up to date,
    Once the "儲存" button is pressed, handleTopButtonPress() will be called, then
    use this.state.newEvent or eventID, and states to communicate with server. 
*/

export default class EventScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            modified: false,
            eventId: "", // get event id from home screen (not used when creating event)
            newEvent: false, // if you are creating a new event or not
            date: null, // the event date
            time: null, // the event time
            title: "", // the event title
            placeCoord: null, // coordinate of the place {lat: ..., lng: ...} (object)
            placeName: "", // the event place name (it may be a name or a address) (string)
            nameIsAddress: "false", // whether the stored name is a address (use string since AsyncStorge only take strings...)
            showPickDate: false, // control popup date picker
            showPickTime: false, // control popup time picker
        };
    }

    componentDidMount() {
        // prevent the OS back control from going back
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => this.backAction());
        // get data from home screen
        this.setState({
            eventId: this.props.navigation.getParam('eventId', undefined),
            newEvent: this.props.navigation.getParam('newEvent', false),
            edit: this.props.navigation.getParam('edit', false),
        }, () => { this.getEventInfoFromAPI() })

    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    // things to do when press back in OS
    backAction() {
        this.handleGoBack();
        return true;
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}><Container>
                <View style={styles.container}>
                    {/* header area */}
                    <View style={{ backgroundColor: appColors.backgroundBlue, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                        <Header transparent >
                            <Left>
                                <TouchableHighlight
                                    activeOpacity={0.6}
                                    underlayColor="#EEEEEE"
                                    onPress={() => this.handleGoBack()}>
                                    <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
                                </TouchableHighlight>
                            </Left>
                            <Body style={{ flex: 3 }}>
                                {this.state.edit || this.state.newEvent ? (
                                    <Item underline style={{ marginBottom: 5 }}>
                                        <TextInput /* autoFocus={this.state.modified} */
                                            allowFontScaling={true} maxFontSizeMultiplier={0}
                                            placeholder='新增標題'
                                            placeholderTextColor={appColors.textGray}
                                            style={styles.titleInput}
                                            onChangeText={this.onChangeTitle} />
                                    </Item>

                                ) : (
                                    <Title style={styles.titleText}>{this.state.title}</Title>
                                )
                                }
                            </Body>
                            <Right style={{ paddingLeft: 0, flex: 1 }}>
                                <View style={{ padding: 0 }}>

                                    <Button style={styles.SaveButton} rounded block onPress={() => this.handleTopButtonPress()}>
                                        <Text style={styles.SaveText}>{this.state.edit || this.state.newEvent ? "儲存" : "編輯"}</Text>
                                    </Button>
                                </View>
                            </Right>
                        </Header>
                    </View>
                    <View style={{ flex: 5, padding: 15, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                        {/* Event details */}
                        <View style={{ flex: 1, marginBottom: 10, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailText}>日期: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // pick date button
                                    <Text style={styles.detailTextGray} onPress={() => this.handlePickDate()}>
                                        {this.state.date == null ? '新增日期' : moment(this.state.date).format('YYYY/MM/DD')}
                                    </Text>
                                ) : (
                                    // show data from server
                                    <Text>
                                        {this.state.date}
                                    </Text>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailText}>時間: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // pick time button
                                    <Text style={styles.detailTextGray} onPress={() => this.handlePickTime()}>
                                        {this.state.time == null ? '新增時間' : moment(this.state.time).format('hh:mm')}
                                    </Text>
                                ) : (
                                    // show data from server
                                    <Text>
                                        {this.state.time}
                                    </Text>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailText}>地點: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // location picker
                                    <Text style={styles.detailTextGray} onPress={() => navigate("PlaceSelect", {coord: this.state.placeCoord, onGoBack: () => this.onChangePlace(), name: this.state.placeName, nameIsAddress: this.state.nameIsAddress})}>{this.state.placeName || "新增地點"}</Text>
                                ) : (
                                    // show data from server
                                    <Text>
                                        {this.state.placeName}
                                    </Text>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailText}>房間號碼: </Text>
                                {/* 新房間的號碼也直接由firebase提供? */}
                                <Text style={styles.detailTextGray}>{this.state.eventId}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailText}>已到人數: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    <Text style={styles.detailTextGray}>4 (just a fix number so far)</Text>
                                ) : (
                                    // show data from server
                                    <Text style={styles.detailTextGray}>{'Insert data from firease!'}</Text>
                                )}
                            </View>

                        </View>
                        {/* participants and notes */}

                        <View style={{ flex: 2 }}>
                             <AttendeeList navigation={this.props.navigation} roomID = {this.state.eventId}/>
                        </View>

                    </View>
                    {/* google map area */}
                    <View style={{ flex: 1, padding: 10, backgroundColor: appColors.btnGreen, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                        <Text style={styles.titleText}>Google Map: TBD</Text>
                    </View>
                </View>

                {/* bottom sheet pop up for discard warning */}
                <BottomSheet
                    ref={ref => {
                        this.BottomSheet = ref;
                    }}
                    height={150}
                    closeOnDragDown={true}
                    closeDuration={200}
                    openDuration={200}
                    customStyles={{
                        container: {
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                            backgroundColor: appColors.backgroundBlue
                        }
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: appColors.backgroundBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                        <Text
                            style={styles.bottomSheetText}
                            onPress={() => { this.BottomSheet.close() }}>繼續編輯</Text>
                        <Text
                            style={styles.bottomSheetRedText}
                            onPress={() => { this.props.navigation.replace('Home') }}>捨棄</Text>
                    </View>

                </BottomSheet>
                {/* date picker */}
                {this.state.showPickDate && (
                    <DateTimePicker
                        value={this.state.date}
                        mode={'date'}
                        is24Hour={true}
                        display="default"
                        onChange={this.onChnageDate}
                    />
                )}
                {/* time picker */}
                {this.state.showPickTime && (
                    <DateTimePicker
                        value={this.state.time}
                        mode={'time'}
                        is24Hour={true}
                        display="default"
                        onChange={this.onChnageTime}
                    />
                )}

            </Container></TouchableWithoutFeedback>
        );
    }

    async handleTopButtonPress() {
        Keyboard.dismiss();
        if (!this.state.edit) {
            this.setState({
                edit: true,
            });
            return;
        }
        if (this.state.newEvent) {
            // Send new event to firebase!!!
            if (this.state.title === "") Alert.alert("標題不能為空");
            else if (this.state.date === null) Alert.alert("日期不能為空");
            else if (this.state.time === null) Alert.alert("時間不能為空");
            // else if (this.state.placeCoord === "") Alert.alert("地點不能為空");
            else {
                creatEvent({ 'title': this.state.title, 'time': this.state.time, 'location': this.state.location });//測試用
                this.setState({ edit: false, });
            }

        }
        else if (this.state.modified) {
            if (this.state.title === "") Alert.alert("標題不能為空");
            else if (this.state.date === null) Alert.alert("日期不能為空");
            else if (this.state.time === null) Alert.alert("時間不能為空");
            else if (this.state.placeCoord === "") Alert.alert("地點不能為空");
            else {
                console.log("saved!");
                this.setState({ edit: false, });
            };// modify event in firebase
        }
        else {
            this.setState({ edit: false, });
            // nothing was changed
        }
    }

    async getEventInfoFromAPI() {
        try {
            if (!this.state.newEvent) {


                let info = await getEventInfo(this.state.eventId);

                //console.log(info);

                this.setState({
                    ...this.state,
                    title: info.title,
                    date: info.date,
                    time: info.time,
                    location: info.location
                })
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    handlePickDate() {
        this.setState({
            date: new Date(),
            showPickDate: true
        });
    }

    onChnageDate = (event, selectedDate) => {
        this.setState({
            modified: true,
            showPickDate: false,
            date: selectedDate || this.state.date
        });
    }

    handlePickTime() {
        this.setState({
            time: new Date(),
            showPickTime: true
        });
    }

    onChnageTime = (event, selectedTime) => {
        this.setState({
            modified: true,
            showPickTime: false,
            time: selectedTime || this.state.time
        });
    }

    onChangeTitle = (newTitle) => {
        this.setState({
            modified: true,
            title: newTitle
        });
        console.log(newTitle);
    }
    async onChangePlace() {
        let coordTemp = await AsyncStorage.getItem('coord');
        let nameTemp = await AsyncStorage.getItem('name');
        let isAddressTemp = await AsyncStorage.getItem('nameIsAddress');
        coordTemp = JSON.parse(coordTemp);
        console.log(isAddressTemp);
        this.setState({
            modified: true,
            placeCoord: coordTemp,
            placeName: nameTemp,
            nameIsAddress: isAddressTemp
        });
    }
    handleGoBack() {
        if (!this.state.modified && !this.state.newEvent) {
            this.props.navigation.replace('Home');
            return;
        }
        // show discard warning
        this.BottomSheet.open();
    }

}

const styles = StyleSheet.create({
    Head: {
        // backgroundColor: 'yellow',
        flex: 1
    },
    container: {
        flex: 1
    },

    SaveButton: {
        backgroundColor: appColors.appBlue,
        height: 40,
        width: 75,
    },
    titleText: {
        color: appColors.textBlack,
        fontSize: 23,
        marginVertical: 5
    },
    detailText: {
        color: appColors.textBlack,
        fontSize: 20,
        marginVertical: 5,
        fontWeight: 'bold'
    },
    detailTextGray: {
        color: appColors.textGray,
        fontSize: 20,
        marginVertical: 5
    },
    titleInput: {
        paddingBottom: 5,
        fontSize: 23,
        color: appColors.textBlack,
    },
    SaveText: {
        color: "white",
        fontSize: 18,
    },
    bottomSheetText: {
        color: appColors.textBlack,
        fontSize: 22,
        marginHorizontal: 15,
        marginVertical: 10
    },
    bottomSheetRedText: {
        color: appColors.textRed,
        fontSize: 22,
        marginHorizontal: 15,
        marginVertical: 10
    },
});

