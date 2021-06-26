import React from 'react';
import { StyleSheet, Text, Image, Alert, Button, TouchableHighlight } from 'react-native'
import { Container, Header, View, Icon, Fab, Content, Body, Thumbnail, Input } from 'native-base';
import BottomSheet from 'react-native-raw-bottom-sheet';
import ProfileHeader from './ProfileHeader.js';
import appColors from '../styles/colors.js';
import EventList from './EventList.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileApiInit, getProfile } from '../api/Profile.js'
import firestore from '@react-native-firebase/firestore';
import { rgb } from 'color';
import { attendEvent } from '../api/Event.js';


export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: 'unknown',
            avgLateTime: 0,
            level: 0,
            exp: 1,
            expFull: 1,
            roomID: ''
        };
    }
    onChangeInput = (inputText) => {
        this.setState({
            roomID: inputText
        });
        console.log(this.state.roomID);
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <Container><SafeAreaView style={{ flex: 1 }} forceInset="top">

                <View style={{ flex: 1, backgroundColor: appColors.backgroundBlue, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                    <ProfileHeader enableNavigation={true} navigation={this.props.navigation} user={this.state.username} image={require('../../assets/test_profile_pic_01.png')} avgLateTime={this.state.avgLateTime} level={this.state.level} exp={this.state.exp} expFull={this.state.expFull} />
                </View>
                <View style={{ flex: 3, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                    {/* show list of upcoming events */}
                    <EventList navigation={this.props.navigation} />
                    {/* bottom sheet that pop up when fab is pressed */}
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
                                onPress={() => { navigate('Meet', { newEvent: true,edit: true }) }}>新增活動</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.bottomSheetText}>輸入房間號碼:</Text>
                                <Input style={{ fontSize: 22 }} placeholder="room ID" onChangeText={this.onChangeRoomID} />

                                <TouchableHighlight
                                    activeOpacity={0.6}
                                    style={{}}
                                    underlayColor="#DDDDDD"
                                    onPress={() => this.handleSubmitRoomID()}>
                                    <Text style={styles.sureButton}>確定</Text>
                                </TouchableHighlight>
                            </View>
                        </View>

                    </BottomSheet>
                    <Fab
                        active={true}
                        containerStyle={{}}
                        style={{ backgroundColor: appColors.appBlue }}
                        position="bottomRight"
                        onPress={() => { this.BottomSheet.open() }}>
                        <Icon name="add" />
                    </Fab>
                </View>

            </SafeAreaView></Container>

        );
    }
    onChangeRoomID = (newRoomID) => {
        this.setState({
            ...this.state,
            roomID: newRoomID
        });
        console.log(newRoomID);
    }
    async handleSubmitRoomID() {
        if (this.state.roomID === '')
            alert('roomID is empty!');
        else {
            this.props.navigation.navigate('Meet', { newEvent: false });
            try {
                await attendEvent(this.state.roomID);
            }
            catch (err) {
                alert(err);
            }
        }

        return;
    }
    componentDidMount() {
        // Firestore Example (commented to prevent overuse)
        // firestore().collection('testcollection').doc('test').get().then((testdata)=>{
        //      dataset = testdata.data();
        this.getProfileData();
        //     console.log(dataset["testcolumn"]);
        //     this.setState(
        //         { text: dataset["testcolumn"] }
        //     )
        // })      
    }
    async getProfileData() {
        await ProfileApiInit();
        let profile = await getProfile();

        this.setState(
            {
                username: profile.username,
                avgLateTime: profile.avgLateTime,
                level: profile.level,
                exp: profile.exp,
                expFull: profile.expFull,
            }
        )

    }
}

const styles = StyleSheet.create({
    bottomSheetText: {
        color: appColors.textBlack,
        fontSize: 22,
        marginHorizontal: 15,
        marginVertical: 10
    },
    sureButton: {
        color: appColors.textGreen,
        fontSize: 22,
        marginHorizontal: 5,
        marginVertical: 10,
        // marginTop:3,
        paddingLeft: 3,
        borderWidth: 2,
        borderRadius: 5,
        borderColor: appColors.textGreen
    }
});