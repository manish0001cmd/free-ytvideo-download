let videoUrl = '';

// Jab user link paste karega aur focus hataayega → automatic load
document.getElementById('url').addEventListener('blur', loadVideo);

async function loadVideo() {
  videoUrl = document.getElementById('url').value.trim();
  if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) return;

  document.getElementById('input').style.display = 'none';
  document.getElementById('info').style.display = 'block';

  try {
    const res = await fetch(`/.netlify/functions/get-formats?url=${encodeURIComponent(videoUrl)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('thumb').src = data.thumbnail;
    document.getElementById('title').textContent = data.title;

    // Saare qualities automatic dikhao
    const formatsDiv = document.getElementById('formats');
    formatsDiv.style.display = 'block';
    formatsDiv.innerHTML = '';
    document.getElementById('quality-label').style.display = 'block';

    data.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.quality;
      btn.onclick = () => startProcess(opt.type === 'audio' ? 'mp3' : 'mp4');
      formatsDiv.appendChild(btn);
    });

  } catch (e) {
    alert('Link galat hai bhai! Dobara daal.');
    location.reload();
  }
}

function startProcess(format) {
  document.querySelectorAll('#formats button').forEach(b => b.disabled = true);
  document.getElementById('formats').style.display = 'none';
  document.getElementById('quality-label').style.display = 'none';

  // Monetag Rewarded Interstitial (tumhara exact SDK)
  show_10309318()  // ← yeh naam Monetag ne diya hai, change mat karna
    .then(() => {
      // User ne ad poora dekha → 10 sec timer + video
      runTimerAndShowVideo(format);
    })
    .catch(() => {
      // User ne skip kiya → direct video dikha do (user friendly)
      runTimerAndShowVideo(format);
    });
}

function runTimerAndShowVideo(format) {
  document.getElementById('timer').style.display = 'block';
  let sec = 10;
  document.getElementById('countdown').textContent = sec;

  const timer = setInterval(() => {
    sec--;
    document.getElementById('countdown').textContent = sec;
    if (sec <= 0) {
      clearInterval(timer);
      document.getElementById('timer').style.display = 'none';
      downloadAndPlayVideo(format);
    }
  }, 1000);
}

async function downloadAndPlayVideo(format) {
  document.getElementById('result').innerHTML = '<p>Video taiyar ho raha hai...</p>';

  try {
    const res = await fetch(`/.netlify/functions/download?url=${encodeURIComponent(videoUrl)}&format=${format}`);
    const json = await res.json();
    if (!json.success) throw new Error('Download failed');

    // Video site pe dikhao
    document.getElementById('video-player').style.display = 'block';
    document.getElementById('video').src = json.download_url;

    // Download button
    const btn = document.getElementById('download-btn');
    btn.href = json.download_url;
    btn.download = json.title + '.' + (format === 'mp3' ? 'mp3' : 'mp4');

    document.getElementById('result').innerHTML = `<p>Ready! Size: ${json.size}</p>`;
  } catch (e) {
    document.getElementById('result').innerHTML = '<p>Error ho gaya, dobara try karo.</p>';
  }
}
