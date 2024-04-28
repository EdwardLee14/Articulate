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
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonImage: {
        width: 65,
        height: 65
    }
});

export default RecordButton;