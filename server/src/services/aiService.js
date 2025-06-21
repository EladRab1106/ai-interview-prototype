const OpenAI = require('openai');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a single GPT-4 question.
 * @param {Array} previousQA - Array of previous Q&A objects (optional)
 * @returns {Promise<string>} - The generated question
 */
async function generateQuestion(previousQA = []) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a professional interviewer. Ask one interview question at a time.',
    },
    ...previousQA
      .map((qa) => [
        qa.question ? { role: 'user', content: qa.question } : null,
        qa.answer ? { role: 'assistant', content: qa.answer } : null,
      ])
      .flat()
      .filter(Boolean),
  ];
  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    max_tokens: 100,
  });
  return chat.choices[0].message.content;
}

async function transcribeAudio(audioPath) {
  const audioStream = fs.createReadStream(audioPath);
  const transcription = await openai.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-1',
    response_format: 'text',
  });
  return transcription;
}

async function generateGptReply(userText) {
  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional interviewer. Respond as an interviewer.',
      },
      { role: 'user', content: userText },
    ],
    max_tokens: 150,
  });
  return chat.choices[0].message.content;
}

/**
 * Generate TTS audio from text and save as MP3.
 * @param {string} text - The text to synthesize
 * @param {string} [voice='shimmer'] - The OpenAI TTS voice
 * @returns {Promise<string>} - The saved file path
 */
async function textToSpeech(text, voice = 'shimmer') {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice,
    }),
  });
  if (!response.ok) throw new Error('TTS failed');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `tts_${Date.now()}.mp3`;
  const filePath = path.join(__dirname, '../../uploads', filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  generateQuestion,
  transcribeAudio,
  generateGptReply,
  textToSpeech,
};
