import React  from 'react';
import{Text} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content} from 'native-base';


import firebase from 'firebase';
import config from '../config';
const firebaseApp = firebase.initializeApp(config);
const rootRef = firebaseApp.database().ref();
const itemsRef = rootRef.child('/test');

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
            <Content>
                <Text>
                   {this.state.text}
                </Text>
        </Content>
            <View style={{ flex: 1 }}>    
             <Fab
                active={true}
                containerStyle={{ }}
                style={{ backgroundColor: '#5067FF' }}
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
        itemsRef.on(('value'), (data)=>{this.setState({text : data.val()})});
    }
 
  }