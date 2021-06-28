import React, { Component } from 'react';
import { StyleSheet, Text, Image, FlatList, RefreshControl, SafeAreaView,LogBox } from 'react-native';
import{getRecord} from '../api/Profile'
import { Container, Header, Title, Button, Left, Right, Body, Icon, View, Item, Input } from 'native-base';
import moment from 'moment';


export default class RecordList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            recordData: []// after api done, this would be replace as []
        }
    }
    // renderItem = ({ item }) => (
      //   <EventListItem id={item.id} title={item.title} time={item.time} LateTime={item.LateTime} />
     //);
    componentDidMount(){
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
        this.getRecordsFromAPI();
    }
    renderItem(item) {
        const LateTimeColor = (this.LateTime > 0) ? appColors.textRed : appColors.textGreen;
        return (
            <Button color={appColors.textBlack} style={styles.eventButton}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    {/* title and room number */}
                    <View style={{ flex: 3, margin: 5 }}>
                        <Text style={styles.titleText}>{item.title}</Text>
                        <Text style={styles.smallText}>{'# ' + item.id}</Text>
                    </View>
                    {/* time and LateTime */}
                    <View style={{ flex: 4, margin: 5 }}>
                        <Text style={styles.titleText}>{item.time}</Text>
                        <Text style={/* styles.LateTimeText */{ color: LateTimeColor, fontSize: 18, marginTop: 'auto' }}>
                            {ConvertLateTime(item.LateTime)}
                        </Text>
                    </View>
                </View>
            </Button>
        )
    }
    render() {
        return (
            <SafeAreaView style={{ margin: 10 }}>
                <FlatList
                    data={this.state.recordData}
                    renderItem={({ item }) => this.renderItem(item)}
                    ListHeaderComponent={<Text style={{ fontSize: 25 }}> 活動紀錄</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                        // onRefresh={this.onRefresh}
                        />}
                />
            </SafeAreaView>
        );
    }

    async getRecordsFromAPI()
    {
        let records = [];
        try
        {
            records = await getRecord();


                this.setState(
                    {
                        ...this.state,
                        recordData : records
                    
                    }
                )
          

        }
        catch
        {
            console.log('cannot get attendee from api')
        }
    }
        
}

// const EventListItem = ({ id, title, time, LateTime, LateTimeColor = (LateTime > 0) ? appColors.textRed : appColors.textGreen }) => (
//     <Button color={appColors.textBlack} style={styles.eventButton}>
//         <View style={{ flex: 1, flexDirection: 'row' }}>
//             {/* title and room number */}
//             <View style={{ flex: 3, margin: 5 }}>
//                 <Text style={styles.titleText}>{title}</Text>
//                 <Text style={styles.smallText}>{'# ' + id}</Text>
//             </View>
//             {/* time and LateTime */}
//             <View style={{ flex: 4, margin: 5 }}>
//                 <Text style={styles.titleText}>{time}</Text>
//                 <Text style={/* styles.LateTimeText */{ color: LateTimeColor, fontSize: 18, marginTop: 'auto' }}>
//                     {ConvertLateTime(LateTime)}
//                 </Text>
//             </View>
//         </View>
//     </Button>
// );

function ConvertLateTime(time) {
    var str = (time >= 0) ? ' + ' : '';
    str += (time < 60) ? (time + ' min') : ((time / 60).toFixed(1) + ' hr');
    return str;
}

const styles = StyleSheet.create({
    smallText: {
        color: appColors.textGray,
        fontSize: 14,
        marginTop: 'auto'
    },

    titleText: {
        color: appColors.textBlack,
        fontSize: 16,
        marginBottom: 10
    },

    LateTimeText: {
        color: appColors.textGreen,
        fontSize: 18,
        marginTop: 'auto'
    },

    eventButton: {
        marginVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: appColors.textBlack,
        height: 'auto'
    }
})
const sampleData = [
    {
        id: '000001',
        title: '軟實討論',
        time: moment().calendar(),
        LateTime: 40,
    },
    {
        id: '000102',
        title: '1234',
        time: moment().add(1, 'days').calendar(),
        LateTime: 100,
    },
    {
        id: '000132',
        title: 'An awesome event with a exteremely long title',
        time: moment().add(3, 'days').calendar(),
        LateTime: -33,
    },
    {
        id: '000178',
        title: 'Google IO 2021',
        time: moment.unix(1621270800).calendar(),
        LateTime: -9,
    },
    {
        id: '000187',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '000188',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '000189',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '0001890',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '0001891',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '0001892',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },
    {
        id: '0001893',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        LateTime: 87,
    },

];