const ytdl = require('ytdl-core');
const { builder } = require('@netlify/functions');
const fs = require('fs');
const os = require('os');
const path = require('path');

exports.handler = builder(async (event) => {
  const { url, format = 'mp4' } = event.queryStringParameters;
  if (!url || !ytdl.validateURL(url)) return { statusCode: 400, body: 'Invalid URL' };

  try {
    const info = await ytdl.getInfo(url);
    const safeTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '').slice(0, 80);
    const tempFile = path.join(os.tmpdir(), `${Date.now()}-${Math.random().toString(36)}.${format === 'mp3' ? 'mp3' : 'mp4'}`);

    const formatOption = format === 'mp3'
      ? ytdl.filterFormats(info.formats, 'audioonly')[0]
      : ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

    await new Promise((resolve, reject) => {
      ytdl.downloadFromInfo(info, { format: formatOption })
        .pipe(fs.createWriteStream(tempFile))
        .on('finish', resolve)
        .on('error', reject);
    });

    const size = (fs.statSync(tempFile).size / (1024*1024)).toFixed(2);
    const fileUrl = `https://${process.env.URL}/.netlify/functions/send-file?file=${path.basename(tempFile)}&name=${encodeURIComponent(safeTitle)}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, title: safeTitle, size: size + ' MB', download_url: fileUrl })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
});