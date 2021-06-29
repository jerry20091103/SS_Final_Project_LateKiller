import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, FlatList, RefreshControl, Alert, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback,SafeAreaView, LogBox  } from 'react-native';
import { Container, Header, Title, Button, Left, Right, Body, Icon, View, Item, Input, Fab } from 'native-base';
import ViewOverflow from 'react-native-view-overflow';
import  {getEventAttendeeInfo,leaveEvent} from '../api/Event';
import { getUid } from '../utilities/User';
import ProfileHeader from './ProfileHeader.js';
import {getProfileByUidList, displayProfileImage} from'../api/Profile';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';

export default class AttendeeList extends Component {

    static propTypes = {
        roomID : PropTypes.string //需要提供event的ID
    };
    constructor(props) {
        super(props);
        
       

        this.state = {
            loading: false,
            attendeeData: [] ,// after api done, this would be replace as []
            myID: '',//API好了以後，在componentwillmount裡面把自己的uuid寫設好，有功能會用到
            showUserInfo: false,

        }
        this.onRefresh = this.onRefresh.bind(this);
    }
    showOthersInfo(item/* name,level,picture,avgLateTime */) {
        this.setState({
            ...this.state,
            OnpressName: item.username,
            OnpressLevel: item.level,
            OnpressPicture: item.img,
            OnpressAvgLateTime: item.avgLateTime,
            OnpressExp: item.exp,
            OnpressExpFull: item.expFull,
            showUserInfo: !this.state.showUserInfo,
        });
    }
    renderItem(item) {
        

        const TimebtnColor = (item.TimebeforeArrive > 0) ? appColors.btnRed : appColors.btnGreen;
        const TimetextColor = (item.TimebeforeArrive > 0) ? appColors.textRed : appColors.textGreen;
        //const ArriveText = (this.state.myID === item.Uid) ? '離開' : '已到達';
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Button color={appColors.textBlack} style={styles.UserButton} onPress={() => this.showOthersInfo(item)}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>

                        <View style={{ flex: 2, margin: 5 }}>
                            {/* api做好後，要記得把item.picture直接寫成load好的圖片，不是一段url而已 */}
                            <Image source={{uri: item.img}} style={styles.profilePic} />
                        </View>

                        <View style={{ flex: 4, margin: 5 }}>
                            <View style={{ flex: 1 }}><Text style={styles.infoText}>{item.username}</Text></View>
                            <View style={{ flex: 1 }}><Text style={styles.lvText}> LV.{item.level}</Text></View>

                        </View>

                        <View style={{ flex: 3, justifyContent: 'center' }}>
                        <Button rounded style={[styles.arriveButton, { backgroundColor: TimebtnColor }]} onPress={() => this.handleLeaveEvent(item.Uid)}>
                                <Text style={{ color: TimetextColor, fontSize: 20 }}>
                                    {(item.status)?'已到達':ConvertLateTime(item.TimebeforeArrive)}
                                </Text>
                            </Button>
                        </View>

                    </View>
                </Button>
            </SafeAreaView>
        )
    }

    render() {
        const windowWidth = Dimensions.get('window').width;

        return (
            <SafeAreaView style={{ margin: 10 }}>
                <FlatList
                    // horizontal={true}
                    data={this.state.attendeeData}
                    renderItem={({item}) => this.renderItem(item)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this.onRefresh}
                        />}
                />
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.showUserInfo}
                >
                    <TouchableWithoutFeedback style={{flex:1}} onPress={()=>{this.setState({ showUserInfo: false })/* , console.log('show:', this.state.showUserInfo) */}}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <View style={{
                                width: windowWidth - 50 ,
                                height:180,
                            }}>
                                <ViewOverflow style={[styles.profileHeader, { width: windowWidth - 50 }]}>
                                    <ProfileHeader
                                        enableNavigation={false}
                                        user={this.state.OnpressName} image={this.state.OnpressPicture}
                                        avgLateTime={this.state.OnpressAvgLateTime}
                                        level={this.state.OnpressLevel}
                                        exp={this.state.OnpressExp} expFull={this.state.OnpressExpFull}
                                    />
                                </ViewOverflow>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                </Modal>
            </SafeAreaView>
        );
    }

    componentDidMount() 
    {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
        //this.getUidFromAPI();
        //this.getAttendeeFromAPI();
    }

    componentDidUpdate(prevProps, prevState)
    {
        if(this.props.roomID!==prevProps.roomID)
        {
           this.getAttendeeFromAPI();
        }

    }

    onRefresh() {
        this.getAttendeeFromAPI();
        console.log('update');
    }


    async getAttendeeFromAPI()
    {
        let attendeeProfiles = [];
        try
        {
           let attendeeProfiles = await getEventAttendeeInfo(this.props.roomID);



                this.setState(
                    {
                        ...this.state,
                        attendeeData : attendeeProfiles
                        // attendeeData: sampleData
                    }
                )
          

        }
        catch
        {
            console.log('cannot get attendee from api')
        }
        

    }

    async handleLeaveEvent(itemUid){
        if(itemUid == this.state.myID){
            Alert.alert(
                "確定要離開嗎?","",
                [{
                    text: "取消",
                    onPress: () => {return},
                  },
                  { text: "確定", onPress: () => {this.props.navigation.pop(); leaveEvent(this.props.roomID);}}
                ]
              );
            
        }
        return;
    }
}

function ConvertLateTime(time) {
    var str = '';
    str += (time < 60) ? (time + ' min') : ((time / 60).toFixed(1) + ' hr');
    return str;
}

const styles = StyleSheet.create({
    profilePic: {
        // margin: 10,
        borderRadius: 60,
        height: 60,
        width: 60,
        // marginBottom: 5
    },
    profileHeader: {
        borderRadius: 30,
        position: 'absolute',
        height: 180,
        backgroundColor: appColors.backgroundBlue
    },
    smallText: {
        color: appColors.textGray,
        fontSize: 14,
        marginTop: 'auto'
    },

    infoText: {
        color: appColors.textBlack,
        fontSize: 20,
        // justifyContent: 'flex-end'
    },
    lvText: {
        color: appColors.textBlack,
        fontSize: 15,
    },
    arriveButton: {
        justifyContent: 'center',
        width: 90
        // marginTop: 'auto',
    },
    UserButton: {
        marginVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: appColors.textGray,
        height: 'auto'
    }
})
const sampleData = [
    {
        userID: '12345',
        name: 'Me',
        picture: require('../../assets/test_profile_pic_01.png'),
        level: 3,
        TimebeforeArrive: 0,
        avgLateTime: 10,
        exp: 100,
    },
    {
        userID: '67890',
        name: 'The very very very long nameeeeeeeeeeeeeeeeeeeee',
        picture: require('../../assets/test_profile_pic_02.png'),
        level: 87,
        TimebeforeArrive: 0,
        avgLateTime: 11,
        exp: 200,
    },
    {
        userID: '24680',
        name: 'Moon',
        picture: require('../../assets/test_profile_pic_03.png'),
        level: 78,
        TimebeforeArrive: 10,
        avgLateTime: 12,
        exp: 300,
    },
    {
        userID: '13579',
        name: 'earth',
        picture: require('../../assets/test_profile_pic_04.png'),
        level: 999,
        TimebeforeArrive: 69,
        avgLateTime: 13,
        exp: 400,
    },
    {
        userID: '11111',
        name: 'earth',
        picture: require('../../assets/test_profile_pic_04.png'),
        level: 999,
        TimebeforeArrive: 69,
        avgLateTime: 13,
        exp: 400,
    },
    {
        userID: '22222',
        name: 'earth',
        picture: require('../../assets/test_profile_pic_04.png'),
        level: 999,
        TimebeforeArrive: 69,
        avgLateTime: 13,
        exp: 400,
    },


];