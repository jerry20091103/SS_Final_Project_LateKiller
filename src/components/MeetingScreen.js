import React, { Component } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import appColors from '../styles/colors.js';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View } from 'native-base';
// import Icon  from 'react-native-vector-icons';
export default class MeetingScreen extends Component {
    render() {
        const {navigate} = this.props.navigation;
        return (
            <Container>
                <View style={styles.container}>
                    <View style={styles.Head}>
                        <Header transparent style={{ backgroundColor: appColors.backgroundLightBlue }}>

                            <Left><TouchableHighlight
                                activeOpacity={0.6}
                                underlayColor="#DDDDDD"
                                onPress={() => this.props.navigation.pop()}>
                                <Icon style={{ color: "black" }} name='chevron-back' />
                            </TouchableHighlight></Left>

                            <Body><Title style={styles.title}>這裡是標題</Title></Body>

                            <Right><Button style={styles.SaveButton} rounded hasText onPress={() => alert("Saved!")}>
                                <Title style={styles.SaveText}>儲存</Title>
                            </Button></Right>

                        </Header>
                        <View style={styles.Time}><Text style={{ fontSize: 30 }}>時間:</Text></View>
                        <View style={styles.Time}><Text style={{ fontSize: 30 }}>地點:</Text></View>
                        <View style={styles.Time}><Text style={{ fontSize: 30 }}>已到人數:</Text></View>
                        <View style={styles.Time}><Text style={{ fontSize: 30 }}>房間號碼:</Text></View>
                    </View>

                    <View style={styles.participants}>
                        <Text style={{ fontSize: 40 }}>participants would be here</Text>
                    </View>
                </View>
            </Container>
        );
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
    participants: {
        backgroundColor: "#00bbff",
        flex: 2
    },
    HeaderButton: {
        backgroundColor: appColors.backgroundLightBlue,
        height: 50,
        elevation: 0,
        borderRadius: 10,
    },
    SaveButton: {
        backgroundColor: "#377ee7",
        height: 50,
        width: 60,
        elevation: 0,
        borderRadius: 10,
    },
    title: {
        color: "black",
        fontSize: 30
    },
    SaveText: {
        color: "white",
        fontSize: 25
    },
    Time: {
        flex: 1,
    }
});

