import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, FlatList, RefreshControl, Alert, TextInput, TouchableHighlight } from 'react-native';
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail, TabHeading, Left } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import appColors from '../styles/colors.js';
import { getEventAttendeeInfo, getEventInfo } from '../api/Event.js';
import { getProfile, profileApiInit } from '../api/Profile.js';
import { getUid, getUsername } from '../utilities/User.js';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unfinished yet.
// TODO: screen navigation and test
export default class MessageScreen extends React.Component {
    static propTypes = {

    };

    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            modified: false,
            loading: true,
            eventId: this.props.navigation.getParam('eventId', undefined),
            userUid: '',
            message: '新增留言',
            data: []
        };


    }


    renderItem(item) {
        // console.log(item);
        return (
            <View style={{ flex: 1 }}>
                {(this.state.edit && (item.userUid === this.state.userUid)) ? (
                    <View>
                        <Text style={styles.nameText}>
                            {item.username + ": "}
                        </Text>
                        <TextInput
                            multiline={true}
                            allowFontScaling={true} maxFontSizeMultiplier={0}
                            placeholder={'新增留言'}
                            placeholderTextColor={appColors.textGray}
                            style={styles.messageInput}
                            onChangeText={this.onChangeText}
                            onEndEditing={this.onEndEditing} />
                        <Button style={styles.finishButton} onPress={() => { this.onEndEditing }}>
                            <Text style={styles.nameText}>
                                完成
                            </Text>
                        </Button>
                    </View>
                ) : (
                    <Text style={styles.messageText} onPress={() => {
                        this.setState({
                            edit: true,
                        })
                    }}>{item.username + ":\n" + item.message + "\n"}</Text>
                )}
            </View>
        );
    }

    render() {
        return (
            <Container>

                <View style={{ backgroundColor: appColors.backgroundBlue, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, paddingTop: 0 }}>
                    <Header transparent>
                        <Left>
                            <TouchableHighlight
                                activeOpacity={0.6}
                                underlayColor="#EEEEEE"
                                onPress={() => this.props.navigation.pop()}>
                                <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
                            </TouchableHighlight>
                        </Left>
                        <Body style={{ flex: 3 }}>
                            <View style={{ backgroundColor: appColors.backgroundBlue }}>
                                <Text style={styles.titleText}>留言區</Text>
                            </View>
                        </Body>

                    </Header>
                </View>
                {/* // UI is not tested yet. */}
                <View style={{ flex: 1, padding: 10, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                    <FlatList
                        data={this.state.data}
                        renderItem={({ item }) => this.renderItem(item)}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this.onRefresh}
                            />}
                    />
                </View>

            </Container>
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
            firestore().collection('event').doc(this.state.eventId).set({
                "attendeeMessage": {
                    [this.state.userUid]: this.state.message

                }
            }, { merge: true });
        } catch (error) {
            console.log(error);
            throw new Error("Error at onEndEditing when pushing message to database.");
        }
        this.setState({
            edit: false,
            modified: false,
        });
        this.onRefresh();
    }

    onRefresh = () => {
        // on refresh.
        this.setState({
            loading: true,
        });
        this.getData();
    }

    async getData() {
        // get and process data to meet render's need.

        console.log(this.state.eventId);
        let eventInfo = await getEventInfo(this.state.eventId);
        let attendeeMessage = eventInfo.attendeeMessage;
        // console.log(attendeeMessage);

        let attendeeInfo = await getEventAttendeeInfo(this.state.eventId);

        let attendeeData = [];
        attendeeInfo.forEach((attendee) => {
            let filtedAttendeeMessage = attendeeMessage.filter((element) => {
                return element.userUid === attendee.Uid;
            });

            attendeeData.push({
                userUid: attendee.Uid,
                username: attendee.username,
                message: filtedAttendeeMessage[0].message
            });
        });

        let profile = await getProfile();

        this.setState({
            ...this.state,
            userUid: profile.Uid,
            data: attendeeData,
            loading: false,
        });
    }
}


const styles = StyleSheet.create({
    titleText: {
        color: appColors.textBlack,
        fontSize: 23,
        marginVertical: 5
    },

    nameText: {
        color: appColors.textBlack,
        fontSize: 24,
        paddingLeft: 5
    },

    messageText: {
        color: appColors.textBlack,
        fontSize: 20,
        paddingLeft: 5
    },

    messageInput: {
        fontSize: 20,
        color: appColors.textBlack,
        paddingLeft: 5
    },

    finishButton: {
        backgroundColor: appColors.appBlue,
        height: 40,
        width: 100,
        marginLeft: 5
    }
})



