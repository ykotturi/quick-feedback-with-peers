import React, { Component } from 'react';
import { Button, Image, View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
// because we're using mangaged apps version of expo (and not bare version):
import { ImagePicker, Permissions, Camera } from 'expo';
import { ConceptDescription } from '../components/ConceptDescription'; 
import { ConceptAuthor } from '../components/ConceptAuthor'; 
import { Buffer } from 'buffer';


// PICK UP HERE
//TODO: change infrastructure of this file to make state hold multple values of what a concet is 

export default class GiveFeedback extends React.Component {
  state = {
    author: null,
    group_id: null,
    concepts: []
  };


  async componentDidMount() {
    const {navigation} = this.props;
    const screenName = navigation.getParam('name', 'NO NAME');
    console.log(screenName);
    const groupID = navigation.getParam('groupID', '5cb7d06d5de2e75344837340');
    console.log(groupID);
    this.setState({author: screenName, group_id: groupID});
    const res = await fetch('http://104.40.20.156/api/getConceptsByGroup?groupID=' + groupID, {method: 'GET'});
    const resJson = await res.json();
    this.setState({concepts: resJson.data});

  }


  render() {
    var conceptViews = [];
    console.log("here");
	for (i = 0; i < this.state.concepts.length; i++) {
        var concept = this.state.concepts[i];
        let buff = new Buffer(concept.media.data);
        const base64data = buff.toString('base64');
        const uriString = `data:image/gif;base64,${base64data}`;
		conceptViews.push(
			<View key = {i} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				{uriString &&
                <Image source={{ uri: uriString }} style={{ width: 200, height: 200 }} />}
                <Text> {concept.name} </Text>
                <Text> {concept.description} </Text>
			</View>
		)
	}
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.getStartedText}>Review Group Concepts</Text>
        { conceptViews }
      </View>
      </ScrollView>
    );
  }



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