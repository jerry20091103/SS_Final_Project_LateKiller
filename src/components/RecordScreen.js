import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';
import { StyleSheet, TouchableHighlight } from 'react-native';
import appColors from '../styles/colors.js';
import RecordList from './RecordList.js'
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { container } from 'react-native-parallax-scroll-view/src/styles';
export default class RecordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avgLateTime: 5
    };
  }
  render() {
    const BtnColor = (this.state.avgLateTime >= 0 ? appColors.btnRed : appColors.btnGreen);
    const TextColor = (this.state.avgLateTime >= 0 ? appColors.textRed : appColors.textGreen);
    const LateMins = ((this.state.avgLateTime > 0 ? '+ ' : '') + this.state.avgLateTime + ' Min');
    return (
      <Container>
        <ParallaxScrollView
          parallaxHeaderHeight={250}
          fadeOutForeground={true}
          backgroundColor={BtnColor}
          renderFixedHeader={() =>
            <Header transparent style={{ backgroundColor: BtnColor }}>
              <Left>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor={BtnColor}
                  onPress={() => this.props.navigation.pop()}>
                  <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
                </TouchableHighlight>
              </Left>
              <Body style={{ flex: 3 }}>
                <Text style={{ fontSize: 25 }}>平均抵達時間</Text>
              </Body>
            </Header>
          }
          renderForeground={() =>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 50, margin: 35, color: TextColor }}>{LateMins}</Text>
            </View>
          }
          renderContentBackground={() =>
            <View style={{ flex: 1, backgroundColor: BtnColor, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
              <View style={{ flex: 4 }}>
                <RecordList />
              </View>

            </View>
          }
        >
        </ParallaxScrollView>
      </Container>
    );
  }
}
const styles = StyleSheet.create({

});