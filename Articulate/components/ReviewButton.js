import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReviewButton = ({ navigation, accuracy, messages }) => {
    // console.log("review button: " + messages)
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Review', { accuracy, messages })}
            >
                <Text style={styles.buttonText}>Proceed to Review!</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 30,
        position: 'absolute',
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

export default ReviewButton;