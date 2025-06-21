import React, { useState } from 'react';
// Use Ready Player Me iframe or static images for avatars
const READY_PLAYER_ME_URL = 'https://readyplayer.me/avatar';

export default function AvatarSelector({ onSelect, label }) {
  const [customUrl, setCustomUrl] = useState('');
  const [iframeUrl] = useState(READY_PLAYER_ME_URL);

  // Listen for Ready Player Me avatar export
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source === 'readyplayerme') {
        if (event.data.eventName === 'v1.avatar.exported') {
          onSelect(event.data.data.url);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelect]);

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>{label}</h4>
      {/* Ready Player Me iframe */}
      <iframe
        title="Ready Player Me"
        src={iframeUrl}
        style={{ width: 300, height: 400, border: '1px solid #ccc', marginBottom: 10 }}
        allow="camera *; microphone *"
      />
      <div style={{ margin: '10px 0' }}>
        <button onClick={() => onSelect('https://ui-avatars.com/api/?name=Avatar&background=random')}>Use Default Avatar</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Paste avatar image URL"
          value={customUrl}
          onChange={e => setCustomUrl(e.target.value)}
          style={{ width: 200 }}
        />
        <button onClick={() => onSelect(customUrl)} disabled={!customUrl}>Use URL</button>
      </div>
    </div>
  );
}
