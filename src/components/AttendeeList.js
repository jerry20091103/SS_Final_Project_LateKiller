import React, { Component } from 'react';
import { StyleSheet, Text, Image, FlatList, RefreshControl } from 'react-native';
import { Container, Header, Title, Button, Left, Right, Body, Icon, View, Item, Input } from 'native-base';
import moment from 'moment';

export default class AttendeeList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            testdata: sampleData,// after api done, this would be replace as []
            myID: '12345',//API好了以後，在componentwillmount裡面把自己的uuid寫設好，有功能會用到
        }
    }

    renderItem(item) {
        const TimebtnColor = (item.TimebeforeArrive <= 0) ? appColors.btnRed : appColors.btnGreen;
        const TimetextColor = (item.TimebeforeArrive <= 0) ? appColors.textRed : appColors.textGreen;
        const ArriveText=(this.state.myID===item.userID) ?'離開':'已到達';
        return (
            <Button color={appColors.textBlack} style={styles.UserButton}>
                <View style={{ flex: 1, flexDirection: 'row' }}>

                    <View style={{ flex: 2, margin: 5 }}>
                        {/* api做好後，要記得把item.picture直接寫成load好的圖片，不是一段url而已 */}
                        <Image source={item.picture} style={styles.profilePic} />
                    </View>

                    <View style={{ flex: 4, margin: 5}}>
                        <View style={{flex:1}}><Text style={styles.infoText}>{item.name}</Text></View>
                        <View style={{flex:1}}><Text style={styles.lvText}> LV.{item.level}</Text></View>
                        
                    </View>

                    <View style={{ flex: 3 ,justifyContent:'center'}}>
                        <Button style={[styles.arriveButton,{backgroundColor:TimebtnColor}]} >
                            <Text style={{color:TimetextColor, fontSize:25}}>
                                {item.TimebeforeArrive<=0?ArriveText:ConvertLateTime(item.TimebeforeArrive)}
                            </Text>
                        </Button>
                    </View>

                </View>
            </Button>
        )
    }

    render() {
        return (
            <View style={{ margin: 10 }}>
                <FlatList
                    data={this.state.testdata}
                    renderItem={({ item }) => this.renderItem(item)}
                    // ListHeaderComponent={<Text style={{ fontSize: 25 }}> 活動紀錄</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                        // onRefresh={this.onRefresh}
                        />}
                />
            </View>
        );
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
        borderRadius: 40,
        borderWidth: 5,
        borderColor: appColors.backgroundBlue,
        height: 70,
        width: 70,
        // marginBottom: 5
    },
    smallText: {
        color: appColors.textGray,
        fontSize: 14,
        marginTop: 'auto'
    },

    infoText: {
        color: appColors.textBlack,
        fontSize: 22,
        // justifyContent: 'flex-end'
    },
    lvText:{
        color: appColors.textBlack,
        fontSize:15,
    },
    arriveButton:{
        justifyContent: 'center',
        borderRadius: 20,
        width: 90
        // marginTop: 'auto',
    },
    UserButton: {
        marginVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: appColors.textBlack,
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
    },
    {
        userID: '67890',
        name: 'The very black guy',
        picture: require('../../assets/test_profile_pic_02.png'),
        level: 87,
        TimebeforeArrive: 0,
    },
    {
        userID: '24680',
        name: 'Moon',
        picture: require('../../assets/test_profile_pic_03.png'),
        level: 78,
        TimebeforeArrive: 10,
    },
    {
        userID: '13579',
        name: 'earth',
        picture: require('../../assets/test_profile_pic_04.png'),
        level: 999,
        TimebeforeArrive: 69,
    }


];