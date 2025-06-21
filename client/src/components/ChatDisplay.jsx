import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function InterviewChat({ avatarUrl }) {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  React.useEffect(() => {
    if (avatarUrl) {
      axios.post('http://localhost:3001/interview/start', { avatarUrl })
        .then(res => {
          setMessages([{ from: 'gpt', text: res.data.question, audio: res.data.ttsAudioUrl }]);
        });
    }
  }, [avatarUrl]);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(audioBlob));
      sendAnswer(audioBlob);
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  const sendAnswer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.webm');
    formData.append('previousQA', JSON.stringify(messages.map(m => ({
      question: m.from === 'gpt' ? m.text : null,
      answer: m.from === 'user' ? m.text : null
    }))));
    const res = await axios.post('http://localhost:3001/interview/answer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setMessages(prev => [
      ...prev,
      { from: 'user', text: '[Voice Answer]', audio: audioUrl },
      { from: 'gpt', text: res.data.question, audio: res.data.ttsAudioUrl }
    ]);
    setAudioUrl(null);
  };

  const finalizeInterview = async () => {
    setInterviewEnded(true);
    const audioFiles = messages.filter(m => m.audio).map(m => m.audio.replace('/uploads/', ''));
    const res = await axios.post('http://localhost:3001/interview/finalize', { audioFiles });
    setPodcastUrl(res.data.podcastUrl);
  };

  return (
    <div>
      <h3>Interview</h3>
      <div style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '10px 0', textAlign: msg.from === 'gpt' ? 'left' : 'right' }}>
            <b>{msg.from === 'gpt' ? 'Interviewer' : 'You'}:</b>
            <div>{msg.text}</div>
            {msg.audio && <audio src={`http://localhost:3001${msg.audio}`} controls />}
          </div>
        ))}
      </div>
      {!interviewEnded && (
        <div>
          {!recording ? (
            <button onClick={startRecording}>Record Answer</button>
          ) : (
            <button onClick={stopRecording}>Stop Recording</button>
          )}
          <button onClick={finalizeInterview} style={{ marginLeft: 10 }}>End Interview</button>
        </div>
      )}
      {podcastUrl && (
        <div>
          <h4>Your Interview Podcast</h4>
          <audio src={`http://localhost:3001${podcastUrl}`} controls />
          <a href={`http://localhost:3001${podcastUrl}`} download>Download Podcast</a>
        </div>
      )}
    </div>
  );
}
