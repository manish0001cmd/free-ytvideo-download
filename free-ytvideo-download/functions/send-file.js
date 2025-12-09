const fs = require('fs');
const path = require('path');
const os = require('os');

exports.handler = async (event) => {
  const { file, name = 'video' } = event.queryStringParameters;
  const filePath = path.join(os.tmpdir(), file);

  if (!fs.existsSync(filePath)) {
    return { statusCode: 404, body: 'File expired' };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': file.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4',
      'Content-Disposition': `attachment; filename="${name}.${file.endsWith('.mp3') ? 'mp3' : 'mp4'}"`
    },
    body: fs.createReadStream(filePath),
    isBase64Encoded: false
  };
};