import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MessagesDisplay = ({ route }) => {
    const messages = route.params.messages;
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Filter out only user messages
    const userMessages = messages.filter(message => message.role === 'user');

    // Function to advance to the next user message
    const handleNext = () => {
        if (currentIndex < userMessages.length - 1) {
            setCurrentIndex(currentIndex + 1); // Advance to next user message
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.message}>
                User: {userMessages[currentIndex].content}
            </Text>
            {/* Button to move to the next message, only show if not the last message */}
            {currentIndex < userMessages.length - 1 && (
                <Button title="Next" onPress={handleNext} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        backgroundColor: '#ffd',
        padding: 10,
    }
});

export default MessagesDisplay;
