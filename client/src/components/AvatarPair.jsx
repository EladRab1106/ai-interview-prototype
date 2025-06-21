import React, { useState } from 'react';

const fallbackAvatar = 'https://ui-avatars.com/api/?name=Avatar&background=random';

function AvatarImg({ src, alt }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? fallbackAvatar : src}
      alt={alt}
      width={120}
      onError={() => setError(true)}
      style={{ background: '#eee', borderRadius: '50%' }}
    />
  );
}

export default function AvatarPair({ interviewee, interviewer }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
      <div>
        <AvatarImg src={interviewee} alt="Interviewee" />
        <div>You</div>
      </div>
      <div>
        <AvatarImg src={interviewer} alt="Interviewer" />
        <div>Interviewer</div>
      </div>
    </div>
  );
} 