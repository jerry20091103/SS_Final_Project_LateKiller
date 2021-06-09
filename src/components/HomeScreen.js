import React  from 'react';
import{Text} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content} from 'native-base';


import firestore from '@react-native-firebase/firestore';


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

        firestore().collection('testcollection').doc('test').get().then((testdata)=>{
             dataset = testdata.data();
           
            console.log(dataset["testcolumn"]);
            this.setState(
                { text: dataset["testcolumn"] }
            )
        })

      
    }
      
 
  }