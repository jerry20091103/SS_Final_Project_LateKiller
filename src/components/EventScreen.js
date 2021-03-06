import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler, Alert, TouchableWithoutFeedback, Keyboard, TextInput, Animated, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input, Toast } from 'native-base';
import BottomSheet from 'react-native-raw-bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import moment from 'moment';
import { creatEvent, editEvent, getEventInfo, setArrivalTime } from '../api/Event.js'
import AttendeeList from './AttendeeList.js'
import {getAdviseTime, getPredictTime} from '../utilities/GetPredictTime';
import Clipboard from '@react-native-community/clipboard';
import { createKeyboardAwareNavigator } from 'react-navigation';


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
            dateTimestamp: null,
            timeTimestamp: null,
            title: "", // the event title
            placeCoord: null, // coordinate of the place {lat: ..., lng: ...} (object)
            placeName: "", // the event place name (it may be a name or a address) (string)
            nameIsAddress: "false", // whether the stored name is a address (use string since AsyncStorge only take strings...)
            showPickDate: false, // control popup date picker
            showPickTime: false, // control popup time picker
            arriveNum: 0,
            transitMode: "driving",// (string) "driving" / "walking" / "bicycling" / "transit"
            goTime: '', 
            active: false,
            willBeLate: false,
            fadeAnim: new Animated.Value(0)
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
        }, () => { this.props.newEvent || this.handleUpdate();    this.timer = setInterval(()=>{ if(!this.state.newEvent){this.handleUpdate(); console.log('test')}},60000);/*60 sec update */})


     



    }

    componentWillUnmount() {
        this.backHandler.remove();
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    // things to do when press back in OS
    backAction() {
        this.handleGoBack();
        return true;
    }
    

    render() {
        const { navigate } = this.props.navigation;
        const addressSize = this.state.placeName.length > 16 ? 15 : 20;
        const mapTextColor = this.state.willBeLate ? appColors.textRed : appColors.textGreen;
        const mapBackgroundColor = this.state.willBeLate ? appColors.btnRed : appColors.btnGreen;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}><Container>
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
                                    <Item underline style={{ marginBottom: 4 }}>
                                        <TextInput /* autoFocus={this.state.modified} */
                                            allowFontScaling={true} maxFontSizeMultiplier={0}
                                            placeholder='新增標題'
                                            defaultValue={this.getDefaultTitle()}
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
                <ScrollView style={{flex:1}}>
                <View style={styles.container}>
                    {/* <View style={{flex:2.5}}></View> */}
                    <View style={{ flex: 1, padding: 15, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                        {/* Event details */}
                        <View style={{ flex: 1, marginBottom: 10, marginLeft: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailTextBold}>日期: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // pick date button
                                    <Text style={[styles.detailTextGray, {textDecorationLine: 'underline'}]} onPress={() => this.handlePickDate()}>
                                        {this.state.date == null ? '新增日期' : this.state.date}
                                    </Text>
                                ) : (
                                        // show data from server
                                        <Text style={styles.detailText}>
                                            {this.state.date}
                                        </Text>
                                    )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailTextBold}>時間: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // pick time button
                                    <Text style={[styles.detailTextGray, {textDecorationLine: 'underline'}]} onPress={() => this.handlePickTime()}>
                                        {this.state.time == null ? '新增時間' : this.state.time}
                                    </Text>
                                ) : (
                                        // show data from server
                                        <Text style={styles.detailText}>
                                            {this.state.time}
                                        </Text>
                                    )}
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailTextBold}>地點: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    // location picker
                                    <Text style={[styles.detailTextGray, {fontSize: addressSize, maxWidth: 305, textDecorationLine: 'underline'}]} onPress={() => navigate("PlaceSelect", { coord: this.state.placeCoord, onGoBack: () => this.onChangePlace(), name: this.state.placeName, nameIsAddress: this.state.nameIsAddress })}>{this.state.placeName || "新增地點"}</Text>
                                ) : (
                                        // show data from server
                                        <Text style={[styles.detailText, {fontSize: addressSize}]}>
                                            {this.state.placeName}
                                        </Text>
                                    )}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailTextBold}>房間號碼: </Text>
                                {/* 新房間的號碼也直接由firebase提供? */}
                                <Text style={styles.detailText}>{this.state.eventId}</Text>
                                <Icon type="MaterialCommunityIcons" name='content-copy' style={{fontSize: 22, backgroundColor: 'transparent', marginHorizontal: 10, color: appColors.textBlack}} onPress={() => this.onCopyRoomId()} />
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailTextBold}>已到人數: </Text>
                                {this.state.edit || this.state.newEvent ? (
                                    <Text style={styles.detailText}>{this.state.arriveNum}</Text>
                                ) : (
                                        // show data from server
                                        <Text style={styles.detailText}>{this.state.arriveNum}</Text>
                                    )}
                            </View>

                        </View>
                        <View style={{ flex: 2 }}>
                            { !this.state.newEvent &&
                                <Button block style={[styles.messageButton, {}]} onPress={() => { navigate('Message', { eventId: this.state.eventId }) }}>
                                    <Text style={[styles.detailTextGray, { margin: 10, color: appColors.textBlack}]}>留言區 . . . . .</Text>
                                </Button>
                            }
                            <AttendeeList navigation={this.props.navigation} roomID={this.state.eventId} />
                        </View>
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
                            onPress={() => { this.props.navigation.pop() }}>捨棄</Text>
                    </View>

                </BottomSheet>
                {/* date picker */}
                {this.state.showPickDate && (
                    <DateTimePicker
                        value={this.state.dateTimestamp}
                        mode={'date'}
                        is24Hour={true}
                        display="default"
                        onChange={this.onChangeDate}
                        minimumDate={new Date()}
                    />
                )}
                {/* time picker */}
                {this.state.showPickTime && (
                    <DateTimePicker
                        value={this.state.timeTimestamp}
                        mode={'time'}
                        is24Hour={true}
                        display="default"
                        onChange={this.onChangeTime}
                    />
                )}
                </ScrollView>
                {/* google map area */}
                <Animated.View style={{ flex: 0.15, padding: 10, opacity: this.state.fadeAnim, backgroundColor: mapBackgroundColor, borderTopLeftRadius: 15, borderTopRightRadius: 15, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                        <Icon type='MaterialCommunityIcons' name={this.getTransitIcon()} style={styles.bottomIcon} onPress={() => this.TransitPicker.open()} />
                        <Text style={{ color: mapTextColor, fontSize: 23, marginVertical: 15 }}>{this.state.goTime}</Text>
                        <Icon type='MaterialCommunityIcons' name='google-maps' style={styles.bottomIcon} onPress={() => this.handleOpenMaps()}/>
                    </View>
                </Animated.View>
                {/* bottomSheet to select transit mode */}
                <BottomSheet
                    ref={ref => {
                        this.TransitPicker = ref;
                    }}
                    height={150}
                    closeOnDragDown={true}
                    closeDuration={100}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
                            <TouchableWithoutFeedback onPress={() => this.handleSelectTransitMode('driving')}>
                                <View style={{ flexDirection: 'row', marginHorizontal: 15 }} >
                                    <Icon type='MaterialCommunityIcons' name='car' style={styles.transitSelectIcon} />
                                    <Text style={styles.transitSelectText}>開車</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleSelectTransitMode('walking')}>
                                <View style={{ flexDirection: 'row', marginHorizontal: 15, marginRight: 35 }} >
                                    <Icon type='MaterialCommunityIcons' name='walk' style={styles.transitSelectIcon} />
                                    <Text style={styles.transitSelectText}>步行</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
                            <TouchableWithoutFeedback onPress={() => this.handleSelectTransitMode('transit')}>
                                <View style={{ flexDirection: 'row', marginHorizontal: 15 }} >
                                    <Icon type='MaterialCommunityIcons' name='subway-variant' style={styles.transitSelectIcon} />
                                    <Text style={styles.transitSelectText}>大眾運輸</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleSelectTransitMode('bicycling')}>
                                <View style={{ flexDirection: 'row', marginHorizontal: 15 }} >
                                    <Icon type='MaterialCommunityIcons' name='bike' style={styles.transitSelectIcon} />
                                    <Text style={styles.transitSelectText}>腳踏車</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>

                </BottomSheet>
                
            </Container></TouchableWithoutFeedback>
        );
    }
    getDefaultTitle() {
        if (this.state.newEvent) return "";
        else return this.state.title;
    }
    async handleTopButtonPress() {
        Keyboard.dismiss();
        // console.log('place:',this.state.placeCoord);
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
            else if (this.state.placeCoord === null) Alert.alert("地點不能為空");
            else {
                creatEvent({ 'title': this.state.title, 'date': this.state.date, 'time': this.state.time, 'placeName': this.state.placeName, 'placeCoord': this.state.placeCoord, 'nameIsAddress': this.state.nameIsAddress });
                this.setState({ edit: false, });
                Alert.alert("已儲存!");
                this.props.navigation.pop();
            }

        }
        else if (this.state.modified) {
            if (this.state.title === "") Alert.alert("標題不能為空");
            else if (this.state.date === null) Alert.alert("日期不能為空");
            else if (this.state.time === null) Alert.alert("時間不能為空");
            else if (this.state.placeCoord === null) Alert.alert("地點不能為空");
            else {
                editEvent({ 'title': this.state.title, 'date': this.state.date, 'time': this.state.time, 'placeName': this.state.placeName, 'placeCoord': this.state.placeCoord, 'nameIsAddress': this.state.nameIsAddress }, this.state.eventId);
                this.setState({ edit: false, });
                Alert.alert("已儲存!");
                this.props.navigation.pop();
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

                return await getEventInfo(this.state.eventId);
               // this.setArrivalTimeFromAPI(info.placeCoord, this.state.eventId, this.state.transitMode);
                //console.log('here33333');
                //console.log(info.active);
               /* this.setState({
                    ...this.state,
                    active: info.active,
                    title: info.title,
                    date: info.date,
                    time: info.time,
                    placeName: info.placeName,
                    placeCoord: info.placeCoord,
                    nameIsAddress: info.nameIsAddress,
                    transitMode: info.transpotation,
                    arriveNum: this.getArrivedAttendeeNumber(info.attendeeStatus)
                })*/
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    async getGoTimeFromAPI(placeCoord, mode)
    {
        // console.log(mode);
        try 
        {
            let timeNeed = 0 ; 
           // console.log('here333');
            //console.log(this.state.active);
            if(!this.state.active)
                timeNeed =  await getAdviseTime(placeCoord, mode);
            else
                timeNeed = await getPredictTime(placeCoord, mode);

          
            // console.log('herwe2');
            console.log(timeNeed);
            let ret = convertGoTime(this.state.date+'T'+this.state.time, timeNeed, this.state.active);
            this.setState({
                goTime: ret.text,
                willBeLate: ret.late,
            });
            // console.log(ret);
            Animated.timing(this.state.fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
              }).start();
            return;
         
        }
        catch
        {
            Alert.alert('無法取得交通資料');
            console.log('error when getting goTime');
        }
       
    }


    async setArrivalTimeFromAPI(placeCoord, code, mode){
        try
        {
           await setArrivalTime(placeCoord, code, mode);
        }
        catch
        {
            console.log('error when setting arrival time')
        }

    }

    getArrivedAttendeeNumber(attendeeStatus) {
        let arriveNumber = 0;
        try {
            attendeeStatus.forEach((attendee) => {
                if (attendee.arrival) {
                    arriveNumber += 1;
                }
            });
        } catch (error) {
            console.log(error);
            throw new Error("Unknown error at getArrivedAttendeeNumber.");
        }

        // console.log("Arrive Num: " + arriveNumber);
        return arriveNumber;
    }

    async handleUpdate(IsdefaultMode = true){

        if(!IsdefaultMode)
        {
            await this.setArrivalTimeFromAPI(this.state.placeCoord,this.state.eventId, this.state.transitMode);
        }
       
        const info = await this.getEventInfoFromAPI();
        // console.log(info);
         this.setState({
                    ...this.state,
                    active: info.active,
                    title: info.title,
                    date: info.date,
                    time: info.time,
                    placeName: info.placeName,
                    placeCoord: info.placeCoord,
                    nameIsAddress: info.nameIsAddress,
                    transitMode: info.transpotation,
                    arriveNum: this.getArrivedAttendeeNumber(info.attendeeStatus)
                },()=>this.getGoTimeFromAPI(this.state.placeCoord, this.state.transitMode));

    }

    handlePickDate() {
        this.setState({
            dateTimestamp: this.state.date ? new Date(moment(this.state.date)) : new Date(),
            showPickDate: true
        });
    }

    onChangeDate = (event, selectedDate) => {
        this.setState({
            modified: true,
            showPickDate: false,
            dateTimestamp: selectedDate || this.state.dateTimestamp,
            date: moment(selectedDate || this.state.dateTimestamp).format('YYYY-MM-DD')
        });
    }

    handlePickTime() {
        console.log(new Date());
        this.setState({
            timeTimestamp: this.state.time ? new Date(moment(this.state.time, 'HH:mm')) : new Date(),
            showPickTime: true
        });
    }

    onChangeTime = (event, selectedTime) => {
        this.setState({
            modified: true,
            showPickTime: false,
            timeTimestamp: selectedTime || this.state.timeTimestamp,
            time: moment(selectedTime || this.state.timeTimestamp).format('HH:mm')
        });
    }

    onChangeTitle = (newTitle) => {
        this.setState({
            modified: true,
            title: newTitle
        });
        // console.log(newTitle);
    }
    async onChangePlace() {
        let coordTemp = await AsyncStorage.getItem('coord');
        let nameTemp = await AsyncStorage.getItem('name');
        let isAddressTemp = await AsyncStorage.getItem('nameIsAddress');
        coordTemp = JSON.parse(coordTemp);
        this.setState({
            modified: true,
            placeCoord: coordTemp,
            placeName: nameTemp,
            nameIsAddress: isAddressTemp
        });
    }
    handleGoBack() {
        if ((!this.state.modified && !this.state.newEvent) || !this.state.edit) {
            this.props.navigation.pop();
            return;
        }
        // show discard warning
        this.BottomSheet.open();
    }
    onCopyRoomId() {
        Toast.show({
            text: "已複製到剪貼簿",
            duration: 1800
        });
        Clipboard.setString(this.state.eventId);
    }
    handleOpenMaps() {
        Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + this.state.placeCoord.lat + ',' + this.state.placeCoord.lng + '&travelmode=' + this.state.transitMode);
    }
    getTransitIcon() {
        switch (this.state.transitMode) {
            case 'driving':
                return 'car';
            case "walking":
                return 'walk';
            case "bicycling":
                return 'bike';
            case "transit":
                return 'subway-variant';
        }
    }
    // this function is called after a mode change
    // mode: (string) "driving" / "walking" / "bicycling" / "transit"
   async handleSelectTransitMode(mode) {
        this.TransitPicker.close()
        this.setState({
            transitMode: mode,
        },()=>{this.handleUpdate(false)});
       

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

    messageButton: {
        // width:350,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: appColors.backgroundBlue,
        borderColor: appColors.textGray,
        height: 'auto',
        margin: 10,
        justifyContent: 'flex-start'


    },

    titleText: {
        color: appColors.textBlack,
        fontSize: 23,
        marginVertical: 5,
        paddingLeft: 8,
    },
    detailText: {
        color: appColors.textBlack,
        fontSize: 20,
        marginVertical: 5,
    },
    detailTextBold: {
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
    bottomIcon: {
        color: appColors.textBlack,
        fontSize: 50,
        backgroundColor: 'transparent',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: appColors.textGray,
        padding: 5,
        paddingLeft: 7,
        paddingBottom: 7
    },
    transitSelectIcon: {
        color: appColors.textBlack,
        fontSize: 40,
        backgroundColor: 'transparent',
        padding: 5,
    },
    transitSelectText: {
        color: appColors.textBlack,
        fontSize: 22,
        marginHorizontal: 15,
        marginLeft: 5,
        marginVertical: 10
    },
});

function convertGoTime(wantedTime, timeNeed, active) {
    let timeText = "";
    let isLate = false;
    if (!active)
       timeText = moment(wantedTime).subtract(timeNeed, 'minutes').format('MM-DD HH:mm') + ' 出發';
    else
        timeText = moment().add(timeNeed, 'minutes').format('HH:mm') + ' 抵達'
    if (moment(wantedTime).subtract(timeNeed, 'minutes') < moment())
        isLate = true;
    return {
        text: timeText,
        late: isLate
    };
}