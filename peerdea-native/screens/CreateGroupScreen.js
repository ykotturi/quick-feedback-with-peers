import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { WebBrowser } from 'expo';
import { Button } from 'react-native-elements';
import {AsyncStorage} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


// first, should check to make sure valid group name (numbers and letters only, longer than 5 characters)
// then, there should be some check as to whether the group name is already taken
// if not already taken, submit API post request to create a new group
// if it is taken, catch error and say group name already taken

export default class CreateGroupScreen extends React.Component {
  state = {
    groupName: '',
    memberName: '',
    groupID: ''
  };

  async onCreate() {
    try {
      //check if the group exists first
      const checkRes = await fetch('http://104.40.20.156/api/getGroupByName?name=' + this.state.groupName, {method: 'GET'});
      const checkResJson = await checkRes.json();
      console.log("print " + JSON.stringify(checkResJson.data));
      console.log(checkResJson.data.length);

      //if the group exists, notify the user to create a new group name
      if (checkResJson.data.length > 0) {
        Alert.alert(
          'Group name ' + this.state.groupName + ' already exists',
          'Please try again with a different group name',
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable: false},
        );
      } 
      //if the group does not exist, create a new group with the name
      //and redirect the screen to the create concept screen
      else {
        // var groupID;
        var data = {
          method: 'POST',
          credentials: 'same-origin',
          mode: 'same-origin',
          body: JSON.stringify({
            name: this.state.groupName
          }),
          headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
          }
        }
        try {
          const createRes = await fetch('http://104.40.20.156/api/putGroup', data);
          const getIDRes = await fetch('http://104.40.20.156/api/getGroupByName?name=' + this.state.groupName, {method: 'GET'});
          const getIDResJson = await getIDRes.json();
          console.log("print " + JSON.stringify(getIDResJson));
          this.setState({groupID: getIDResJson.data[0]._id});
          await AsyncStorage.multiSet([
            ["groupName", this.state.groupName],
            ["name", this.state.memberName],
            ["groupID", this.state.groupID]
          ]);
        }
        catch(err) {
          console.log(err);
        }

        this.props.navigation.navigate('ShareConcept');
      }
    }
    catch(err) {
      console.log(err);
    }
    
    
  }

  render() {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.container}
      >
        <Image
            style={{width: 300, height: 50}}
            source={require('../assets/images/peerdea-logo-draft.png')}
          />
        <Text style={styles.getStartedText}>Create a new group below:</Text>
        <View style={{flexDirection: 'row'}}> 
          <TextInput
            style={{height: 40, flex: 0.5, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.setState({groupName: text})}
            placeholder="Enter your group name here"
          />
        </View>
        <View style={{flexDirection: 'row'}}> 
          <TextInput
            style={{height: 40, flex: 0.5, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.setState({memberName: text})}
            placeholder="Enter your screen name here"
          />
        </View>
        <Button raised 
          onPress={() => this.onCreate()}
          title="Create"
          color="#841584"
          accessibilityLabel="Create"
        />
       </KeyboardAwareScrollView>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 30, 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
