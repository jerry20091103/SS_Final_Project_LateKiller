
import React  from 'react';
import{Text} from 'react-native'
import { Container, Header, View, Button, Icon, Fab ,Content} from 'native-base';
export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props)
      }
    render() {
    const {navigate} = this.props.navigation;
    return (
        <Container>
            <Content>
                <Text>
                    HomeScreen
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
  }