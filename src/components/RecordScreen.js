import React, { Component } from 'react';
import { Container, Header, Title, Button, Left, Right, Body, Icon, Text, View, Item, Input } from 'native-base';


export default class RecordScreen extends Component {
  constructor(props){
    super(props);
    this.state={

    };
  }
  render(){
    return(
      <Container>
          <Text style={{fontSize: 33}} onPress={() => { this.props.navigation.replace('Home') }}>History and records TBD (click me)</Text>
      </Container>
      
    );
  }
}