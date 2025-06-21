import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function VoiceRecorder({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'user.webm');
      const res = await axios.post('http://localhost:3001/interview/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onTranscribed(res.data.transcript);
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>Record</button>
      ) : (
        <button onClick={stopRecording}>Stop</button>
      )}
    </div>
  );
}
