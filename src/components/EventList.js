import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, FlatList, RefreshControl } from 'react-native';
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail, TabHeading } from 'native-base';
import appColors from '../styles/colors.js';
import moment from 'moment';
import {listEvent} from '../api/Event.js' 
export default class EventList extends React.Component {
    static propTypes = {
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            testdata : []
        };

        this.onRefresh = this.onRefresh.bind(this);
    }

    renderItem = ({ item }) => (
        <EventListItem id={item.id} title={item.title} time={item.time} goTime={item.goTime} />
    );
    
    // Showcase pull to refresh only
    // Delete this and get real data
    onRefresh() {
        this.setState({
            loading: true
        });
        setTimeout(()=>(this.setState({loading: false})), 2000);
    }
    

    render() {
        return (
            <View style={{ margin: 10 }}>
                <FlatList
                    data={this.state.testdata} // <== put data here, and it will appear like magic (I hope so).
                    renderItem={this.renderItem}
                    ListHeaderComponent={<Text style={styles.smallText}> 活動清單</Text>}
                    refreshControl={
                        <RefreshControl 
                            refreshing={this.state.loading} 
                            onRefresh={this.onRefresh}
                        />}
                />
            </View>
        );
    }

    componentDidMount()
    {
        
       this.getData();
    }

    async getData() {
        const data = await  listEvent();
        this.setState({
            loading : false,
            testdata : data
        })
    }


}

const EventListItem = ({ id, title, time, goTime }) => (
    <Button color={appColors.textBlack} style={styles.eventButton}>
        <View style={{ flex: 1, flexDirection: 'row'}}>
            {/* title and room number */}
            <View style={{ flex: 3, margin: 5 }}>
                <Text style={styles.titleText}>{title}</Text>
                <Text style={styles.smallText}>{'# ' + id}</Text>
            </View>
            {/* time and goTime */}
            <View style={{ flex: 4, margin: 5}}>
                <Text style={styles.titleText}>{time}</Text>
                <Text style={styles.goTimeText}>{convertGoTime(goTime)}</Text>
            </View>
        </View>
    </Button>
);

function convertGoTime(goTime) {
    if (goTime < 60)
        return goTime + ' min ' + ' 抵達';
    else
        return moment().add(goTime, 'minutes').format('hh:mm') + '  出發';
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

    goTimeText: {
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

// this data is only for testing!
// get real data from firebase and DELETE this
const sampleData = [
    {
        id: '000001',               // room id
        title: '軟實討論',
        time: moment().calendar(),  // time of the event
        goTime: 40,                 // time to go, get this from google map
    },
    {
        id: '000102',
        title: '1234',
        time: moment().add(1, 'days').calendar(),
        goTime: 100,
    },
    {
        id: '000132',
        title: 'An awesome event with a exteremely long title',
        time: moment().add(3, 'days').calendar(),
        goTime: 200,
    },
    {
        id: '000178',
        title: 'Google IO 2021',
        time: moment.unix(1621270800).calendar(),
        goTime: 78,
    },
    {
        id: '000187',
        title: 'WWDC 2021',
        time: moment.unix(1622998800).calendar(),
        goTime: 87,
    },

];

