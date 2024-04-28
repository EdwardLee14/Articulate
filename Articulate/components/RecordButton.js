import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

const RecordButton = ({recording, startRecording, stopRecording}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
                <Image
                    style={styles.buttonImage}
                    source={recording ? require('../assets/stop-button.png') : require('../assets/start-button.png')}
                />
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
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonImage: {
        width: 70,
        height: 70
    }
});

export default RecordButton;