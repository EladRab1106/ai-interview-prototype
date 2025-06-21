import React, { useState } from 'react';
import AvatarSelector from './components/AvatarSelector';
import AvatarPair from './components/AvatarPair';
import VoiceRecorder from './components/VoiceRecorder';
import ChatView from './components/ChatView';
import axios from 'axios';

function App() {
  const [interviewee, setInterviewee] = useState(null);
  const [interviewer, setInterviewer] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleTranscribed = async (userText) => {
    setChatHistory(prev => [...prev, { from: 'user', text: userText }]);
    try {
      // Send to GPT and get TTS audio as binary
      const res = await axios.post(
        'http://localhost:3001/interview/gpt-reply',
        { text: userText },
        { responseType: 'arraybuffer' }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type: 'audio/mp3' }));
      setAudioUrl(url);
      setChatHistory(prev => [
        ...prev,
        { from: 'ai', text: '[AI audio reply]', audio: url }
      ]);
    } catch (err) {
      console.error('Error getting AI audio reply:', err);
      // Optionally show a user-friendly error message in your UI
    }
  };

  if (!interviewee || !interviewer) {
    return (
      <div>
        <h2>Select Your Avatars</h2>
        <AvatarSelector label="Interviewee" onSelect={setInterviewee} />
        <AvatarSelector label="Interviewer" onSelect={setInterviewer} />
      </div>
    );
  }

  return (
    <div>
      <h1>AI Interview Platform</h1>
      <AvatarPair interviewee={interviewee} interviewer={interviewer} />
      <ChatView chatHistory={chatHistory} />
      <VoiceRecorder onTranscribed={handleTranscribed} />
      {audioUrl && <audio src={audioUrl} controls autoPlay />}
    </div>
  );
}

export default App;
