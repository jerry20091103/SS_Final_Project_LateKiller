import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, FlatList, RefreshControl, Alert, TextInput } from 'react-native';
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail, TabHeading } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import appColors from '../styles/colors.js';
import { getEventAttendeeInfo, getEventInfo } from '../api/Event.js';
import { getProfile, profileApiInit } from '../api/Profile.js';
import { getUid, getUsername } from '../utilities/User.js';

// Unfinished yet.
// TODO: screen navigation and test
export default class MessageBoard extends React.Component {
    static propTypes = {
        eventId: PropTypes.string,
    };

    constructor(props) {
        super(props);
        
        this.state = {
            edit: false,
            modified: false,
            loading: false,
            userUid: '',
            message: '新增留言',
            data: []
        };


    }


    renderItem(item) {
        return (
            <View style = {{flex: 1}}>
                {(this.state.edit && (item.userUid === this.state.userUid)) ? (
                    <TextInput
                        multiline = {true}
                        allowFontScaling={true} maxFontSizeMultiplier={0}
                        placeholder='新增留言'
                        placeholderTextColor={appColors.textGray}
                        style={styles.messageInput}
                        onChangeText={this.onChangeText} 
                        onEndEditing={this.onEndEditing}/>
                ) : (
                    <Text style={styles.messageText}>{item.username + ": " + item.message}</Text>
                )}
            </View>
        );
    }

    render() {
        return (
            // UI is not tested yet.
            <FlatList
                    data={this.state.data}
                    renderItem={({ item }) => this.renderItem(item)}
                    ListHeaderComponent={<Text style={styles.largeText}> 留言區</Text>}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            // onRefresh={this.onRefresh}
                        />}
            />
        );
    }

    componentDidMount() {
        this.getData();
    }

    onChangeText = (text) => {
        // change message.
        this.setState({
            ...this.state,
            modified: true,
            message: text,
        })
        console.log(text);
    }

    onEndEditing = () => {
        // push message to database.
        try {
            firestore().collection('event').doc(this.props.eventId).set({
                "attendeeMessage": {
                    [this.state.userUid]: this.state.message
        
                }
            }, { merge: true });
        } catch(error) {
            console.log(error);
            throw new Error("Error at onEndEditing when pushing message to database.");
        }
    }

    onRefresh = () => {
        // on refresh.
    }

    async getData() {
        // get and process data to meet render's need.
        let eventInfo = await getEventInfo(this.props.eventId);
        let attendeeMessage = eventInfo.attendeeMessage;

        let attendeeInfo = await getEventAttendeeInfo(this.props.eventId);
    
        let attendeeData = [];
        attendeeInfo.forEach((attendee) => {
            let filtedAttendeeMessage = attendeeMessage.filter((element) => {
                return element.userUid === attendee.Uid;
            });

            attendeeData.push({       
                userUid: attendee.Uid,
                username: attendee.username,
                message: filtedAttendeeMessage.message
            });
        });

        let profile = await getProfile();

        this.setState({
            ...this.state,
            userUid: profile.Uid,
            data: attendeeData,
        });
    }
}


const styles = StyleSheet.create({
    largeText: {
        color: appColors.textBlack,
        fontSize: 24,
        marginTop: 'auto'
    },

    messageText: {
        color: appColors.textBlack,
        fontSize: 16,
        marginBottom: 10
    },

    messageInput: {
        paddingBottom: 5,
        fontSize: 16,
        color: appColors.textBlack,
    }
})



