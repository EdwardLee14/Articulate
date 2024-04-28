import os
import pandas as pd
import librosa
import librosa.display
import soundfile as sf
import numpy as np
from sklearn.preprocessing import LabelEncoder
from keras.utils import to_categorical
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation
from keras.optimizers import Adam
import nltk
from nltk.tokenize import word_tokenize
from nltk.parse import CoreNLPParser
from nltk.corpus import wordnet
import speech_recognition as sr
from flask import Flask, request, jsonify

# Data Preparation
df = pd.read_csv("data/validated.tsv", sep='\t')
print(df.columns)
df = df[["path", "sentence"]]
df = df.sample(frac=1).reset_index(drop=True)

audio_path = "data/clips/"  

def extract_features(file_path):
    y, sr = librosa.load(file_path, sr=None)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs_scaled = np.mean(mfccs.T,axis=0)
    return mfccs_scaled

def build_dataset(audio_path, df):
    X = []
    y = []
    
    for i, row in df.iterrows():
        file_path = audio_path + row["path"]
        
        try:
            feature = extract_features(file_path)
            X.append(feature)
            y.append(row["sentence"])
        except Exception as e:
            print(f"Error processing file {file_path}: {str(e)}")
            
    return np.array(X), np.array(y)

X_train, y_train = build_dataset(audio_path, df)

# Train model
le = LabelEncoder()
y_train_encoded = le.fit_transform(y_train)
y_train_categorical = to_categorical(y_train_encoded)

model = Sequential()
model.add(Dense(512, input_shape=(X_train.shape[1],)))
model.add(Activation("relu"))
model.add(Dropout(0.5))
model.add(Dense(256))
model.add(Activation("relu"))
model.add(Dropout(0.5))
model.add(Dense(len(le.classes_)))
model.add(Activation("softmax"))

adam = Adam()
adam.learning_rate = 0.0001
model.compile(loss="categorical_crossentropy", optimizer=adam, metrics=["accuracy"])

model.fit(X_train, y_train_categorical, batch_size=32, epochs=100, validation_split=0.1)
test_loss, test_accuracy = model.evaluate(X_train, y_train_categorical) 
print("Test Accuracy:", test_accuracy)


# Pronunciation Correction
nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")

def recognize_errors(text):
    tokens = word_tokenize(text)
    pos_tags = nltk.pos_tag(tokens)
    
    for i in range(len(pos_tags) - 1):
        current_tag = pos_tags[i][1]
        next_tag = pos_tags[i + 1][1]
        
        if current_tag.startswith("NN") and next_tag.startswith("V"):
            error_word = pos_tags[i][0]
            correction = le.classes_[model.predict_classes(extract_features(audio_path + error_word + ".mp3")).item()]
            text = text.replace(error_word, correction)
            
    return text

# Grammar Correction
nltk.download("corenlp")

parser = CoreNLPParser(url="http://localhost:9000")

def recognize_grammar_errors(text):
    sentences = list(parser.tokenize(text))
    corrected_sentences = []
    
    for sentence in sentences:
        parse_tree = list(parser.parse(sentence))[0]
        for subtree in parse_tree.subtrees():
            if subtree.label() == "VP":
                verb = subtree.leaves()[0]
                if verb.lower() not in ["is", "am", "are", "was", "were", "be", "been"]:
                    error_word = verb
                    correction = le.classes_[model.predict_classes(extract_features(audio_path + error_word + ".mp3")).item()]
                    subtree[0] = correction
                    corrected_sentences.append(" ".join(subtree.leaves()))
                    break
            else:
                corrected_sentences.append(" ".join(subtree.leaves()))
                
    corrected_text = " ".join(corrected_sentences)
    return corrected_text

nltk.download("wordnet")

def generate_vocabulary_quiz():
    words = []
    definitions = []
    
    for synset in wordnet.all_synsets():
        if synset.pos() == "n":
            words.append(synset.name().split(".")[0])
            definitions.append(synset.definition())
            
    quiz_words = np.random.choice(words, size=4, replace=False)
    correct_word = np.random.choice(quiz_words)
    
    print("What is the definition of the following word?")
    print(correct_word)
    
    for i in range(len(quiz_words)):
        print(f"{i + 1}. {definitions[words.index(quiz_words[i])]}")
        
    answer = int(input("Enter the correct option number: "))
    
    if answer == np.where(quiz_words == correct_word)[0][0] + 1:
        print("Congratulations! Your answer is correct.")
    else:
        print(f"Sorry, your answer is incorrect. The correct answer is {np.where(quiz_words == correct_word)[0][0] + 1}.")
        

r = sr.Recognizer()

def recognize_speech():
    with sr.Microphone() as source:
        print("Speak now...")
        audio = r.listen(source)
        try:
            text = r.recognize_google(audio)
            print("You said: " + text)
            return text
        except sr.UnknownValueError:
            print("Sorry, I could not understand what you said.")
            return ""
        except sr.RequestError as e:
            print("Could not request results from Google Speech Recognition service; {0}".format(e))
            return ""

def start_voice_assistant():
    print("Welcome to the language learning voice assistant.")
    while True:
        print("What would you like to do?")
        print("1. Recognize pronunciation errors and suggest corrections")
        print("2. Teach grammar rules")
        print("3. Practice vocabulary")
        print("4. Exit")
        choice = input("Enter your choice: ")
        
        if choice == "1":
            text = recognize_speech()
            if text:
                corrected_text = recognize_errors(text)
                print(f"Corrected text: {corrected_text}")
        elif choice == "2":
            text = recognize_speech()
            if text:
                corrected_text = recognize_grammar_errors(text)
                print(f"Corrected text: {corrected_text}")
        elif choice == "3":
            generate_vocabulary_quiz()
        elif choice == "4":
            print("Thank you for using the language learning voice assistant.")
            break
        else:
            print("Invalid choice. Please try again.")



app = Flask(__name__)

# Store audio files temporarily 
UPLOAD_FOLDER = 'temp_audio' 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/analyze-speech', methods=['POST'])
def analyze_speech():
    # print(request.files)
    print("lol")
    if 'audio' not in request.files:  
        return jsonify({'error': 'No audio file provided!!!!!'}) 


    audio_file = request.files['audio']
    audio_filename = audio_file.filename
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
    audio_file.save(save_path) 

    audio_file = request.files['audio']
    
    if audio_file is not None:
        filename = audio_file.filename
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(save_path) 
        
    r = sr.Recognizer()
    with sr.AudioFile(save_path) as source:
        audio_data = r.record(source)  
        text = r.recognize_google(audio_data)
        
    # Call your language analysis functions
    corrected_text = recognize_errors(text)
    grammar_analysis = recognize_grammar_errors(text)
    vocab_results = generate_vocabulary_quiz()  

    # Assuming vocab_results includes questions, answers, etc.

    # Clean up temp audio file
    os.remove(save_path) 

    return jsonify({
        'corrected_text': corrected_text,
        'grammar_analysis': grammar_analysis,
        'vocab_results': vocab_results
    })


if __name__ == '__main__':
    app.run(debug=True) 