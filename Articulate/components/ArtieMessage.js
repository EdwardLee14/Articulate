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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 30,
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    artieImage: {
        width: 35,
        height: 35
    }
});

export default ArtieMessage;