import React, { Component } from 'react';
import { Button, Image, View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
// because we're using mangaged apps version of expo (and not bare version):
import { ImagePicker, Permissions, Camera } from 'expo';
import { Buffer } from 'buffer';
import ImageCarousel from 'react-native-image-carousel';
import {AsyncStorage} from 'react-native';


// PICK UP HERE
//TODO: change infrastructure of this file to make state hold multple values of what a concet is

export default class ShareConcept extends React.Component {
  static navigationOptions = {
    title: 'Share a Concept',

  };

  state = {
    author: '',
    images: [],
    imagesBase64: [],
    story: '',
    group_id: ''
  };

  renderImage = (idx: number) => (
    <Image
      style={StyleSheet.absoluteFill}
      resizeMode="contain"
      source={{uri: this.state.images[idx]}}
    />
  );

  askPermissionsAsync = async() => {
      await Permissions.askAsync(Permissions.CAMERA_ROLL);
      await Permissions.askAsync(Permissions.CAMERA);
      // probably need to do something to verify that permissions
      // were actually granted
  };

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => { this.setData() },
    );
  };

  componentWillUnmount() {
    this.didFocusListener.remove();
  }

  async setData() {
    let values
    try {
      values = await AsyncStorage.multiGet(['groupName', 'name', 'groupID']);
      this.setState({groupName: values[0][1], author: values[1][1], group_id: values[2][1]})
    } catch (err) {
      console.log(err);
    }
    // console.log(values);
  }


  render() {
    let image = this.state.image;
    // uncomment for testing encoding and decoding
    // let author2 = this.state.author2;
    // let image1 = this.state.image1;
    // let image2 = this.state.image2;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          style={{width: 300, height: 50}}
          source={require('../assets/images/peerdea-logo-draft.png')}
        />
        <Text>Welcome to {this.state.groupName}, {this.state.author}</Text>
      <Button
        title="Pick an image from camera roll"
        onPress={this._pickImage}
      />
      <Button
        title="Take a picture"
        onPress={this._takePicture}
      />
      <View style={{flex: 1}}>
          <ImageCarousel
                renderContent={this.renderImage}>
                {this.state.images.map(url => (
                  <Image
                    style={{ width: 200, height: 200 }}
                    key={url}
                    source={{uri: url}}
                    resizeMode="contain"
                  />
                ))}
         </ImageCarousel>
      </View>
      <Button
        onPress={() => { this.setState({images: [], imagesBase64: []});}}
        title="Clear Images"
        color="#841584"
        accessibilityLabel="Clear Images"
      />
      <View style={{flexDirection: 'row'}}> 
          <TextInput
            multiline= {true}
            style={{height: 100, maxHeight: 100, flex: 0.75, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.setState({story: text})}
            placeholder="This is my concepts story!"
          />
        </View>
      <Button
        onPress={() => { this._sendConcept();}}
        title="Share concept with my group"
        color="#841584"
        accessibilityLabel="Share concept with my group"
      />
      
      </View>
      </ScrollView>

    );
  }

  _sendConcept = () => {

      // get requests to get users group keyword
      const {navigation} = this.props;
      var temp = []
      for (i = 0; i < this.state.imagesBase64.length; i++){
          const buff = new Buffer(this.state.imagesBase64[i], 'base64');
          const elem = {
            data: buff,
            contentType: 'image/png'};
          temp.push(elem);
      }

      console.log(this.state.author);
      let data = {
        method: 'POST',
        credentials: 'same-origin',
        mode: 'same-origin',
        body: JSON.stringify({
          group_id: this.state.group_id,
    		  name: this.state.author,
    		  media: temp,
    	      description: this.state.story,
        }),
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          // 'X-CSRFToken':  cookie.load('csrftoken')
          }
       }
        
        return fetch('http://104.40.20.156/api/putConcept', data)
        .then(function(response){
          return response.json();
        })
        .then(function(json){
          console.log('suuccess');
          Alert.alert(
          'Thanks for sharing!'
        );
        })
        .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
         // ADD THIS THROW error
          throw error;
        });

   }


  //underscore before function name to distinguish internal methods from the lifecycle methods of react
  _pickImage = async () => {
    await this.askPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    // probably need some express api post call to add "result" variable to database

    if (!result.cancelled) {
      var temp = this.state.images;
      temp.push(result.uri);
      var temp2 = this.state.imagesBase64;
      temp2.push(result.base64);
      this.setState({ images: temp, imagesBase64: temp2 });
    }
  };

  _takePicture = async () => {
    await this.askPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });


    if (!result.cancelled) {
      var temp = this.state.images;
      temp.push(result.uri);
      var temp2 = this.state.imagesBase64;
      temp2.push(result.base64);
      this.setState({ images: temp, imagesBase64: temp2 });
    }
  };

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
});