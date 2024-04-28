import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ReviewButton from '../components/ReviewButton';
import { useNavigation } from '@react-navigation/native';

const Score = ({ route }) => {
    const accuracy = route.params.accuracy;
    const messages = route.params.messages;
    const navigate = useNavigation();

    console.log("score: " + messages)
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Your Accuracy: </Text>
            <Text style={styles.accuracy}>{accuracy}%</Text>
            <Image source={require('../assets/bear-logo.png')} />
            <ReviewButton navigation={navigate} accuracy={accuracy} messages={messages}></ReviewButton>
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    accuracy: {
        fontSize: 50,
        color: 'green',
        fontWeight: 'bold',
    }   
});

export default Score;