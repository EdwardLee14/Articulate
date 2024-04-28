import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const Landing = ({ navigation }) => { 
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Let's have a chat!</Text>
            <Image source={require('../assets/bear-logo.png')} />
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Chat')}
            >
                <Text style={styles.buttonText}>Let's Go!</Text>
            </TouchableOpacity>
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
    header: {
        fontWeight: 'bold',
        fontSize: 29,
    },
    button: {
        marginTop: 250,
        backgroundColor: '#F19696',
        paddingVertical: 16,
        paddingHorizontal: 100,
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 1.3,
        shadowColor: "#000",
        shadowOffset: {
            width: 2, 
            height: 2, 
        },
        shadowOpacity: 0.9,
        shadowRadius: 1.7,
    },
    buttonText: {
        fontSize: 17,
        color: 'black',
    },
});

export default Landing;