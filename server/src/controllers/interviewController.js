const aiService = require('../services/aiService');
const audioService = require('../services/audioService');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
ffmpeg.setFfmpegPath(ffmpegPath);

exports.startInterview = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const question = await aiService.generateQuestion();
    const ttsAudioPath = await aiService.textToSpeech(question, 'shimmer');
    res.json({
      question,
      ttsAudioUrl: `/uploads/${path.basename(ttsAudioPath)}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.answerInterview = async (req, res) => {
  try {
    const userAudioPath = req.file.path;
    const { previousQA } = req.body;
    const question = await aiService.generateQuestion(
      previousQA ? JSON.parse(previousQA) : []
    );
    const ttsAudioPath = await aiService.textToSpeech(question, 'shimmer');
    res.json({
      question,
      ttsAudioUrl: `/uploads/${path.basename(ttsAudioPath)}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.finalizeInterview = async (req, res) => {
  try {
    const { audioFiles } = req.body;
    const outputPath = await audioService.combineAudio(audioFiles);
    res.json({ podcastUrl: `/uploads/${path.basename(outputPath)}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transcribeAudio = async (req, res) => {
  try {
    const audioPath = req.file.path;
    // Generate a new output path for the converted file
    const wavPath = audioPath + '_' + Date.now() + '.wav';
    // Convert webm to wav for Whisper compatibility
    await new Promise((resolve, reject) => {
      ffmpeg(audioPath)
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(wavPath);
    });
    // Transcribe the new wav file
    const transcript = await aiService.transcribeAudio(wavPath);
    // Remove the temp wav file after processing
    fs.unlinkSync(wavPath);
    res.json({ transcript, audioPath: `/uploads/${path.basename(audioPath)}` });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.gptReply = async (req, res) => {
  try {
    const { userText } = req.body;
    const gptText = await aiService.generateGptReply(userText);
    const ttsPath = await aiService.textToSpeech(gptText, 'shimmer');
    res.json({ gptText, ttsAudioUrl: `/uploads/${path.basename(ttsPath)}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /interview/gpt-reply
// Receives { text } in body, returns MP3 audio as binary stream
exports.getGptReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text in request body' });
    }

    // 1. Get GPT-4 reply using OpenAI v4 SDK
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional interviewer. Respond as an interviewer.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 150,
    });
    const reply = chat.choices[0].message.content;

    // 2. Convert reply to speech using OpenAI TTS v4 SDK
    const speech = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'shimmer',
      input: reply,
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('GPT reply error:', err);
    res.status(500).json({ error: 'Failed to get GPT reply or TTS audio' });
  }
};
