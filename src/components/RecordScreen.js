import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import { StyleSheet, TouchableHighlight } from 'react-native';
import appColors from '../styles/colors.js';
import RecordList from './RecordList.js'
export default class RecordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avgLateTime: 5
    };
  }
  render() {
    const BtnColor=(this.state.avgLateTime>=0?appColors.btnRed :appColors.btnGreen);
    const TextColor=(this.state.avgLateTime>=0?appColors.textRed :appColors.textGreen);
    const LateMins=((this.state.avgLateTime>0?'+ ':'')+this.state.avgLateTime+' Min');
    return (
      <Container>
        {/* <View style={{flex:1}}> */}
        <View style={{ flex: 1, backgroundColor: BtnColor, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
          <Header transparent style={{backgroundColor: BtnColor}}>
            <Left>
              <TouchableHighlight
                activeOpacity={0.6}
                underlayColor={BtnColor}
                onPress={() => this.props.navigation.replace('Home')}>
                <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
              </TouchableHighlight>
            </Left>
            <Body style={{ flex: 3 }}>
              <Text style={{fontSize: 25}}>平均抵達時間</Text>
            </Body>
          </Header>
          
          <View style={{flex: 1,alignItems: 'center',}}>
            <Text style={{fontSize: 50, margin: 35,color:TextColor}}>{LateMins}</Text>
          </View>

          <View style={{flex: 4}}>
            <RecordList/>{/* 待完成 */}
          </View>
          
        </View>

      </Container>

    );
  }
}
const styles = StyleSheet.create({

});