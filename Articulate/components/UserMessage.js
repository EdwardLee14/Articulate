import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const UserMessage = ({message}) => {
    return (
        <View style={styles.container}>
            
            <Text style={styles.message}>{message}</Text>
            <Image style={styles.userImage} source={require('../assets/user.png')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 280,
        marginBottom: 10,
        marginLeft: 44,
    },
    message: {
        fontSize: 21,
    },
    userImage: {
        marginLeft: 10,
        width: 33,
        height: 33,
    }
});

export default UserMessage;