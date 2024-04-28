import axios from 'axios';

const API_URL = 'https://api.openai.com/v1';
const AUTHORIZATION_HEADER = {
    headers: {
        'Authorization': 'Bearer ${process.env.OPENAI_API_KEY}'
    }
};

export const transcribeAudio = async (audioURI) => {
    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', {
        uri: audioURI,
        type: 'audio/mp4',
        name: 'recording.m4a',
    });
    formData.append('language', 'en');

    try {
        const response = await axios.post(`${API_URL}/audio/transcriptions`, formData, AUTHORIZATION_HEADER);
        return response.data.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return '';
    }
};

export const sendMessageToOpenAI = async (messages) => {
    try {
        const response = await axios.post(`${API_URL}/chat/completions`, {
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 28,
        }, AUTHORIZATION_HEADER);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error sending message to OpenAI:', error);
        return 'Error processing your message';
    }
};
