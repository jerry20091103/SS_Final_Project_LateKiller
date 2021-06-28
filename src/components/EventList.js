import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, FlatList, RefreshControl, Alert } from 'react-native';
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail, TabHeading } from 'native-base';
import appColors from '../styles/colors.js';
import moment from 'moment';
import { EventApiInit, listEvent} from '../api/Event.js'
export default class EventList extends React.Component {
    static propTypes = {
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: []//測試用
        };

        this.onRefresh = this.onRefresh.bind(this);
    }
    componentWillReceiveProps(props){
        const refresh=this.props;
        this.onRefresh();
    }
    renderItem(item) {

        return (
            <Button color={appColors.textBlack} style={styles.eventButton} onPress={() => { this.props.navigation.navigate('Meet', { newEvent: false , eventId: item.id}) }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    {/* title and room number */}
                    <View style={{ flex: 3, margin: 5 }}>
                        <Text style={styles.titleText}>{item.title}</Text>
                        <Text style={styles.smallText}>{'# ' + item.id}</Text>
                    </View>
                    {/* time and goTime */}
                    <View style={{ flex: 4, margin: 5 }}>
                        <Text style={styles.titleText}>{item.time}</Text>
                        <Text style={styles.goTimeText}>{convertGoTime(item.goTime)}</Text>
                    </View>
                </View>
            </Button>
        )
    }

    // Showcase pull to refresh only
    // Delete this and get real data
    onRefresh() {
        this.setState({
            loading: true
        });
       this.getData();
    }


    render() {
        return (
            <View style={{ margin: 10 }}>
                <FlatList
                    data={this.state.data} // <== put data here, and it will appear like magic (I hope so).
                    renderItem={({ item }) => this.renderItem(item)}
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

    componentDidMount() {

        this.getData();
    }

    getData = async () => {
        await EventApiInit();
        const data = await listEvent();
        this.setState({
            loading: false,
            data: data
        })//測試用
    }


}

const EventListItem = ({ id, title, time, goTime }) => (
    <Button color={appColors.textBlack} style={styles.eventButton} onPress={() => { this.props.navigation.navigate('Meet', { newEvent: false }) }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* title and room number */}
            <View style={{ flex: 3, margin: 5 }}>
                <Text style={styles.titleText}>{title}</Text>
                <Text style={styles.smallText}>{'# ' + id}</Text>
            </View>
            {/* time and goTime */}
            <View style={{ flex: 4, margin: 5 }}>
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
        borderColor: appColors.textGray,
        height: 'auto'
    }
})



