import React, { useState } from 'react'
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import * as Speech from 'expo-speech';


export default function Record() {

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
        // handleTranscription('articulate-test/University of Washington.m4a');
        const transcription = await handleTranscription(recording.getURI());
        console.log(transcription);
        setRecordings(allRecordings);
        handleSend(transcription);

        if (openAIResponse) { 
            await Speech.speak(openAIResponse);
        } 
    }

    const handleTranscription = async (audioURI) => {
        // console.log('Transcription');

        const form = new FormData();
        form.append('model', 'whisper-1');
        form.append('file', {
            uri: audioURI, 
            type: 'audio/mp4',
            name: 'recording.m4a',
        });
        form.append('language', 'en');

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
            headers: {
                'Authorization': 'Bearer ${apiKey}'
            }
        })

        setResponse(response.data.text);
        return response.data.text;
    };

    const handleSend = async (transcriptedMessage) => {
        const newMessage = { role: 'user', content: transcriptedMessage };
        setMessages([...messages, newMessage]);

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [...messages, newMessage]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        setResponse(response.data.choices[0].message.content);
        setMessages([...messages, newMessage, response.data.choices[0].message]);
        console.log(response.data.choices[0].message.content);
    };

    function getDurationFormatted(milliseconds) {
        const minutes = milliseconds / 1000 / 60;
        const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
        return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
    }

    function getRecordingLines() {
        return recordings.map((recordingLine, index) => {
            return (
                <View key={index} style={styles.row}>
                    <Text style={styles.fill}>
                        Recording #{index + 1} | {recordingLine.duration}
                    </Text>
                    <Button onPress={() => recordingLine.sound.replayAsync()} title="Play"></Button>
                </View>
            );
        });
    }

    function clearRecordings() {
        setRecordings([])
    }

    return (
        <View style={styles.container}>
            <Button title={recording ? 'Stop Recording' : 'Start Recording\n\n\n'} onPress={recording ? stopRecording : startRecording} />
            {getRecordingLines()}
            <Button title={recordings.length > 0 ? '\n\n\nClear Recordings' : ''} onPress={clearRecordings} />
            <Button 
                title="Speak Response" 
                onPress={() => Speech.speak(openAIResponse)} 
                disabled={!openAIResponse} 
            /> 
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
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