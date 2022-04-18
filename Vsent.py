from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import moviepy.editor as mp
import speech_recognition as sr
import sys
import string
from pathlib import Path, PurePath, PureWindowsPath
## recognize speech using Google Speech Recognition
def speech_to_text(audio_file):
    r = sr.Recognizer()
    # define the audio file
    with sr.AudioFile(audio_file) as source:
        # listen for the data (load audio to memory)
        audio = r.record(source)
    # recognize (convert from speech to text)
    text = r.recognize_sphinx(audio)
    # return the text as string
    return text

def calculate_sentiment(file_path):

    # if the file duration is > 60 the reduce the duration to 60
    p = Path('public'+file_path)
    #replace / with \
    file_paths = str(p).replace('/','\\')
     #replace \ with \\
    finalp = "D:\\college project\\content-streaming-website\\"
    finalp = finalp + file_paths
    video = mp.VideoFileClip(finalp)

    if video.duration > 90:
        video = video.subclip(0, 90)
    # get the audio from the video
    audio = video.audio
    audio.write_audiofile("audio.wav", logger=None)
    # get the text from the audio
    text = speech_to_text("audio.wav")
    # initialize the sentiment analyzer
    analyzer = SentimentIntensityAnalyzer()
    # get the sentiment of the text
    sentiment = analyzer.polarity_scores(text)
    # print(text)
    # return the sentiment
    print(sentiment["compound"])
  

calculate_sentiment(sys.argv[1])