const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

exports.combineAudio = (audioFiles) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      __dirname,
      '../../uploads',
      `podcast_${Date.now()}.mp3`
    );
    const command = ffmpeg();
    audioFiles.forEach((file) =>
      command.input(path.join(__dirname, '../../uploads', path.basename(file)))
    );
    command
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .mergeToFile(outputPath);
  });
};
