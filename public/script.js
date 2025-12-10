let videoUrl = '';

async function load() {
  videoUrl = document.getElementById('url').value.trim();
  if (!videoUrl.includes('youtube') && !videoUrl.includes('youtu.be')) return alert('YouTube link daalo bhai!');

  document.getElementById('input').style.display = 'none';
  document.getElementById('info').style.display = 'block';

  const res = await fetch(`/.netlify/functions/get-formats?url=${encodeURIComponent(videoUrl)}`);
  const data = await res.json();

  document.getElementById('thumb').src = data.thumbnail;
  document.getElementById('title').textContent = data.title;

  const div = document.getElementById('formats');
  div.innerHTML = '';
  data.options.forEach(o => {
    const btn = document.createElement('button');
    btn.textContent = o.quality;
    btn.onclick = () => download(o.type === 'audio' ? 'mp3' : 'mp4');
    div.appendChild(btn);
  });
}

async function download(type) {
  const btns = document.querySelectorAll('#formats button');
  btns.forEach(b => b.disabled = true);

  document.getElementById('result').innerHTML = '<p>Preparing your download...</p>';

  const res = await fetch(`/.netlify/functions/download?url=${encodeURIComponent(videoUrl)}&format=${type}`);
  const json = await res.json();

  if (json.success) {
    document.getElementById('result').innerHTML = `
      <p>Ready! Size: ${json.size}</p>
      <a href="${json.download_url}" class="btn">DOWNLOAD ${type.toUpperCase()}</a>
    `;
  } else {
    document.getElementById('result').innerHTML = '<p>Error ho gaya, dobara try karo</p>';
  }
  btns.forEach(b => b.disabled = false);
}