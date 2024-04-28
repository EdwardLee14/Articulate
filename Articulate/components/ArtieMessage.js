import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ArtieMessage = ({message}) => {
    return (
        <View style={styles.container}>
            <Image style={styles.artieImage} source={require('../assets/artie.png')} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 280,
        marginBottom: 15,
        marginRight: 64,
    },
    message: {
        fontSize: 21,
        fontWeight: 'bold',
    },
    artieImage: {
        width: 45,
        height: 45,
        marginLeft: 10,
    }
});

export default ArtieMessage;