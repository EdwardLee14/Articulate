import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import ArtieMessage from '../components/ArtieMessage';
import UserMessage from '../components/UserMessage';
import RecordButton from '../components/RecordButton';
import { transcribeAudio, sendMessageToOpenAI } from '../services/openAIServices';
import ScoreButton from '../components/ScoreButton';
import { useNavigation } from '@react-navigation/native';

export default function Chat() {

    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);
    const [transcription, setTranscription] = React.useState([]);
    const [openAIResponse, setResponse] = React.useState([]);
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef();
    const navigation = useNavigation();
    const accuracy = 99;

    useEffect(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }, [messages]);

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
        console.log(audioURI);
    }

    const handleSend = async (transcriptedMessage) => {
        const newMessage = { role: 'user', content: transcriptedMessage };
        const responseContent = await sendMessageToOpenAI([...messages, newMessage]);
        const artieMessage = { role: 'assistant', content: responseContent };
        const system = { role: 'system', content: 'You are a helpful assistant that guides the conversation forward in a friendly manner. You ask questions as necessary. You say everything in about 20 words or less. It is imperative that you keep it short and polite.' }
        setMessages(prevMessages => [...prevMessages, newMessage, artieMessage, system]);
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
    // console.log(messages);
    return (
        <View style={styles.container}>
            {/* {getRecordingLines()} */}
            {/* <Button title={recordings.length > 0 ? '\n\n\nClear Recordings' : ''} onPress={clearRecordings} /> */}
            {messages.length < 8 ? (
                <RecordButton recording={recording} startRecording={startRecording} stopRecording={stopRecording} />
            ) : (
                <ScoreButton navigation={navigation} accuracy={accuracy} messages={messages}></ScoreButton>
            )}
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message, index) => {
                    if (message.role === 'user') {
                        return <UserMessage key={index} message={message.content} />;
                    } else if (message.role === 'assistant') {
                        return <ArtieMessage key={index} message={message.content} />;
                    }
                })}
            </ScrollView>
            {/* <UserMessage message={transcription}></UserMessage>
            <ArtieMessage message={openAIResponse}></ArtieMessage> */}


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
    },
    scrollView: {
        marginTop: 60,
        marginBottom: 130,
    }
});