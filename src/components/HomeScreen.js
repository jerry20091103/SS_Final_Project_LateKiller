import React  from 'react';
import{StyleSheet, Text, Image} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content, Body, Thumbnail} from 'native-base';

import ProfileHeader from './ProfileHeader.js';
import appColors from '../styles/colors.js';
import EventList from './EventList.js';


import firestore from '@react-native-firebase/firestore';
import { rgb } from 'color';


export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: 'test',
          };
      }
    render() {
    const {navigate} = this.props.navigation;
    return (
        <Container>
            
            {/* <Content>
                <Text>
                   {this.state.text}
                </Text>
            </Content> */}
            <View style={{ flex: 1, backgroundColor: appColors.backgroundBlue, borderBottomLeftRadius: 15, borderBottomRightRadius: 15}}>
                <ProfileHeader user={'Username'} image={require('../../assets/test_profile_pic_01.png')} avgTime={-150} level={87} exp={700} expFull={1000}/>
            </View>
            <View style={{ flex: 3, backgroundColor: appColors.backgroundLightBlue, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                <EventList/>
                <Fab
                    active={true}
                    containerStyle={{ }}
                    style={{ backgroundColor: appColors.appBlue }}
                    position="bottomRight"
                    onPress={()=>{}}>
                    <Icon name="add" />
                </Fab>
            </View>
            
        </Container>

    );
    }
    componentDidMount() 
    {
        // Firestore Example (commented to prevent overuse)
        // firestore().collection('testcollection').doc('test').get().then((testdata)=>{
        //      dataset = testdata.data();
           
        //     console.log(dataset["testcolumn"]);
        //     this.setState(
        //         { text: dataset["testcolumn"] }
        //     )
        // })      
    }      

  }