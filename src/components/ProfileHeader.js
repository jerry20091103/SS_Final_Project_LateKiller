import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, Image, TouchableHighlight } from 'react-native'
import { Container, Header, View, Button, Icon, Fab, Content, Body, Thumbnail, TabHeading } from 'native-base';
import * as Progress from 'react-native-progress';
import appColors from '../styles/colors.js'

export default class ProfileHeader extends React.Component {
    static propTypes = {
        user: PropTypes.string, // username
        image: PropTypes.any, // link to profile pic
        avgLateTime: PropTypes.number, // average late time (min)
        level: PropTypes.number,
        expFull: PropTypes.number, // Max exp of this level
        exp: PropTypes.number, // current exp
        enableNavigation: PropTypes.bool, //The ProfileHeader in eventScreen don't need navigatiton
    };

    render() {
        const TextColor = (this.props.avgLateTime > 0 ? appColors.textRed : appColors.textGreen);
        const BtnColor = (this.props.avgLateTime > 0 ? appColors.btnRed : appColors.btnGreen);
        const DefaultImage = require('../../assets/test_profile_pic_01.png');
        return (
            <View style={{ flex: 1, flexDirection: "row", alignItems: 'center',position:'absolute' }}>
                {/* Left side (photo and Button) */}
                <View style={{ flex: 1,paddingLeft: 20 }}>
                    <Image source={this.props.image ? {uri: this.props.image} : DefaultImage} style={styles.profilePic} />

                    <Button rounded block style={{ backgroundColor: BtnColor,width: 90,margin: 10 }} onPress={() => { (this.props.enableNavigation)?this.props.navigation.navigate('Record'):{} }}>
                        <Text style={{ color: TextColor }}>{this.getLateTime(this.props.avgLateTime)}</Text>
                    </Button>
                </View>
                {/* Right side (name, lv, exp, bar) */}
                <View style={{ flex: 2 }}>
                    <Text style={styles.username} >{this.props.user}</Text>
                    <Text style={styles.levelText}>{'LV. ' + this.props.level}</Text>
                    <Text style={styles.expText}>{'exp. ' + this.props.exp + ' / ' + this.props.expFull} </Text>
                    <Progress.Bar progress={this.props.exp / this.props.expFull} width={200} borderWidth={2} color={appColors.appBlue} style={{ marginVertical: 10 }} />
                </View>
            </View>
        );
    }
    getLateTime(time) {
        var postive = (time >= 0);
        var str = '';
        if (postive)
            str += ' + ';
        else
            str += ' - ';
        time = Math.abs(time);
        if (time < 60)
            str += (time + ' min');
        else
            str += ((time / 60).toFixed(1) + ' hr');
        return str;
    }
}

const styles = StyleSheet.create({
    profilePic: {
        margin: 10,
        borderRadius: 50,
        borderWidth: 5,
        borderColor: '#F0FFFF',
        height: 90,
        width: 90,
        marginBottom: 5
    },

    // Button: {
    //     // backgroundColor: '{COLOR}',
    //     width: 90,
    //     margin: 10
    // },


    avgLateTimeStyle: {
        margin: 'auto'
    },

    username: {
        fontSize: 25,
        marginVertical: 10,
        marginLeft: 0,
        marginRight: 'auto',
        color: appColors.textBlack
    },

    levelText: {
        fontSize: 14
    },

    expText: {
        fontSize: 14
    }
});