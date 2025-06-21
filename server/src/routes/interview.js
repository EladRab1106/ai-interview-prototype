const express = require('express');
const multer = require('multer');
const interviewController = require('../controllers/interviewController');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/start', interviewController.startInterview);
router.post(
  '/answer',
  upload.single('audio'),
  interviewController.answerInterview
);
router.post('/finalize', interviewController.finalizeInterview);
router.post(
  '/transcribe',
  upload.single('audio'),
  interviewController.transcribeAudio
);
// POST /interview/gpt-reply expects { text } in body
router.post('/gpt-reply', interviewController.getGptReply);

module.exports = router;
