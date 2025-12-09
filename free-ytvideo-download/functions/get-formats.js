const ytdl = require('ytdl-core');

exports.handler = async (event) => {
  const { url } = event.queryStringParameters;
  if (!url || !ytdl.validateURL(url)) return { statusCode: 400, body: 'Invalid URL' };

  const info = await ytdl.getInfo(url);
  const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
  const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

  const options = [
    ...videoFormats.slice(0, 6).map(f => ({ quality: f.qualityLabel, type: 'video' })),
    { quality: 'Audio Only (MP3)', type: 'audio' }
  ];

  return {
    statusCode: 200,
    body: JSON.stringify({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      options
    })
  };
};