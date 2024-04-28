import React, { useState } from 'react'
import { StyleSheet, Image, TouchableOpacity, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import ArtieMessage from '../components/ArtieMessage';
import UserMessage from '../components/UserMessage';
import RecordButton from '../components/RecordButton';
import { transcribeAudio, sendMessageToOpenAI } from '../services/openAIServices';

export default function Chat() {

    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);
    const [transcription, setTranscription] = React.useState([]);
    const [openAIResponse, setResponse] = React.useState([]);
    const [messages, setMessages] = useState([]);

    async function startRecording() {
        console.log("START");
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
                setRecording(recording);
            }
        } catch (err) { }
    }

    async function stopRecording() {
        console.log("STOPPED");
        setRecording(undefined);

        await recording.stopAndUnloadAsync();
        let allRecordings = [...recordings];
        const { sound, status } = await recording.createNewLoadedSoundAsync();
        allRecordings.push({
            sound: sound,
            duration: getDurationFormatted(status.durationMillis),
            file: recording.getURI()
        });
        setRecordings(allRecordings);

        // Transcribe audio and handle response
        const audioURI = recording.getURI();
        const transcription = await transcribeAudio(audioURI);
        setTranscription(transcription);
        await handleSend(transcription);
        console.log(transcription);
        console.log(messages);
    }

    const handleSend = async (transcriptedMessage) => {
        const newMessage = { role: 'user', content: transcriptedMessage };
        const responseContent = await sendMessageToOpenAI([...messages, newMessage]);
        const artieMessage = { role: 'assistant', content: responseContent };
        setMessages(prevMessages => [...prevMessages, newMessage, artieMessage]);
        setResponse(responseContent);
        console.log(responseContent);
        Speech.speak(responseContent);

    };

    async function analyzeSpeech() {
        const recordedAudio = recording;

        const formData = new FormData();
        formData.append('audio', recordedAudio);

        try {
            const response = await fetch('http://your-api-address/analyze-speech', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
        } catch (error) {
        }
    }

    function getDurationFormatted(milliseconds) {
        const minutes = milliseconds / 1000 / 60;
        const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
        return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
    }

    // function getRecordingLines() {
    //     return recordings.map((recordingLine, index) => {
    //         return (
    //             <View key={index} style={styles.row}>
    //                 <Text style={styles.fill}>
    //                     Recording #{index + 1} | {recordingLine.duration}
    //                 </Text>
    //                 <Button onPress={() => recordingLine.sound.replayAsync()} title="Play"></Button>
    //             </View>
    //         );
    //     });
    // }

    // function clearRecordings() {
    //     setRecordings([])
    // }

    return (
        <View style={styles.container}>
            {/* {getRecordingLines()} */}
            {/* <Button title={recordings.length > 0 ? '\n\n\nClear Recordings' : ''} onPress={clearRecordings} /> */}
            {messages.map((message, index) => {
                if (message.role === 'user') {
                    return <UserMessage key={index} message={message.content} />;
                } else if (message.role === 'assistant') {
                    return <ArtieMessage key={index} message={message.content} />;
                }
            })}
            {/* <UserMessage message={transcription}></UserMessage>
            <ArtieMessage message={openAIResponse}></ArtieMessage> */}
            <RecordButton recording={recording} startRecording={startRecording} stopRecording={stopRecording}></RecordButton>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 40
    },
    fill: {
        flex: 1,
        margin: 15
    }
});