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
    const BackgroundLightColor = (this.state.avgLateTime >= 0 ? appColors.backgroundLightRed : appColors.backgroundLightGreen)
    const TextColor = (this.state.avgLateTime >= 0 ? appColors.textRed : appColors.textGreen);
    const LateMins = ((this.state.avgLateTime > 0 ? '+ ' : '') + this.state.avgLateTime + ' Min');
    return (
      <Container>
        <ParallaxScrollView
          parallaxHeaderHeight={210}
          fadeOutForeground={true}
          backgroundColor={BtnColor}
          borderRadius={15}
          renderFixedHeader={() =>
            <View style={{ backgroundColor: BtnColor}}>
            <Header transparent >
              <Left>
                <TouchableHighlight
                  activeOpacity={0.6}
                  underlayColor={BtnColor}
                  onPress={() => this.props.navigation.pop()}>
                  <Icon style={{ color: appColors.textBlack }} name='arrow-back' />
                </TouchableHighlight>
              </Left>
              <Body style={{ flex: 3 }}>
                <Text style={styles.titleText}>平均抵達時間</Text>
              </Body>
            </Header>
            </View>
          }
          renderForeground={() =>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40}}>
              <Text style={{ fontSize: 40, margin: 10, color: TextColor }}>{LateMins}</Text>
            </View>
          }
          renderContentBackground={() =>
            <View style={{ flex: 1, backgroundColor: BackgroundLightColor}}>
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
  titleText: {
    color: appColors.textBlack,
    fontSize: 23,
    marginVertical: 5
},
});