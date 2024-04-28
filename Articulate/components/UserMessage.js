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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginHorizontal: 30,
    },
    message: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userImage: {
        width: 24,
        height: 24
    }
});

export default UserMessage;