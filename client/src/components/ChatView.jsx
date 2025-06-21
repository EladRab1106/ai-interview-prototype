import React from 'react';
import AudioPlayer from './AudioPlayer';

export default function ChatView({ chatHistory }) {
  return (
    <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
      {chatHistory.map((msg, idx) => (
        <div key={idx} style={{ margin: '10px 0', textAlign: msg.from === 'user' ? 'right' : 'left' }}>
          <b>{msg.from === 'user' ? 'You' : 'Interviewer'}:</b>
          <div>{msg.text}</div>
          {msg.audio && <AudioPlayer src={msg.audio} />}
        </div>
      ))}
    </div>
  );
} 