import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight, BackHandler } from 'react-native';
import appColors from '../styles/colors.js';
import PropTypes from 'prop-types';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View } from 'native-base';
import BottomSheet from 'react-native-raw-bottom-sheet';

// import Icon  from 'react-native-vector-icons';

export default class EventScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            modified: false,
            eventId: 0, // get event id from home screen (not used when creating event)
            newEvent: false // if you are creating a new event or not
        };
        this._unsubscribe = undefined;
    }

    componentDidMount() {
        // prevent the OS back control from going back
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => this.backAction());
        this.setState({
            eventId: this.props.navigation.getParam('eventId', undefined),
            newEvent: this.props.navigation.getParam('newEvent', false)
        });
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
            <Container>
                {
                    (this.state.newEvent || this.state.edit) ?
                        /* // editable with forms */
                        (
                            <View style={styles.container}>
                                {/* header area */}
                                <View style={{ backgroundColor: appColors.backgroundBlue, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                                    <Header transparent >
                                        <Left>
                                            <TouchableHighlight
                                                activeOpacity={0.6}
                                                underlayColor="#DDDDDD"
                                                onPress={() => this.handleGoBack()}>
                                                <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
                                            </TouchableHighlight>
                                        </Left>
                                        <Body><Title style={styles.titleText}>這裡是標題</Title></Body>
                                        <Right>
                                            <View style={{padding: 0}}>
                                            <Button style={styles.SaveButton} rounded block onPress={() => this.handleTopButtonPress()}>
                                                <Text style={styles.SaveText}>儲存</Text>
                                            </Button>
                                            </View>
                                        </Right>
                                    </Header>
                                </View>
                                <View style={{ flex: 5, padding: 10, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                                    {/* Event details */}
                                    <View style={{ flex: 1, marginBottom: 30 }}>
                                        <Text style={styles.titleText}>時間:</Text>
                                        <Text style={styles.titleText}>地點:</Text>
                                        <Text style={styles.titleText}>已到人數:</Text>
                                        <Text style={styles.titleText}>房間號碼:</Text>
                                    </View>
                                    {/* participants and notes */}
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.titleText}>participants: TBD</Text>
                                    </View>
                                </View>
                                {/* google map area */}
                                <View style={{ flex: 1, padding: 10, backgroundColor: appColors.btnGreen, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                                    <Text style={styles.titleText}>Google Map: TBD</Text>
                                </View>
                            </View>
                        ) :
                        /* // show details only */
                        (
                            <View>

                            </View>
                        )
                }
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
            </Container>
        );
    }

    handleTopButtonPress() {
        if (this.state.newEvent) {
            // Send new event to firebase!!!
        }
        else if (this.state.modified) {
            // modify event in firebase
        }
        else {
            // nothing was changed
        }

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
        backgroundColor: 'yellow',
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
        fontSize: 25,
        marginVertical: 5
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

