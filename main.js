import { createTimeline } from './timeline.js';
import { Storage } from './storage.js';

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let project = {
  title: 'مشروع جديد',
  settings: { width: 1920, height: 1080, fps: 30, bgColor: '#000000' },
  tracks: [
    { type: 'video', clips: [] },
    { type: 'audio', clips: [] },
    { type: 'text',  clips: [] }
  ]
};

function getProject() { return project; }
function setStatus(s) { statusEl.textContent = s; }

const timelineContainer = document.getElementById('timeline');
const timeline = createTimeline({
  getProject,
  onSelectClip: ref => renderClipProps(ref),
  onMoveClip: ({ trackIndex, clipIndex, newStart }) => {
    project.tracks[trackIndex].clips[clipIndex].start = newStart;
  }
});
timelineContainer.appendChild(timeline.el);

// Zoom controls
let zoom = 1;
document.getElementById('zoomIn').onclick = () => { zoom = Math.min(3, zoom + 0.25); document.getElementById('zoomLabel').textContent = Math.round(zoom*100)+'%'; timeline.setZoom(zoom); };
document.getElementById('zoomOut').onclick = () => { zoom = Math.max(0.5, zoom - 0.25); document.getElementById('zoomLabel').textContent = Math.round(zoom*100)+'%'; timeline.setZoom(zoom); };

// Media upload
const filePicker = document.getElementById('filePicker');
const mediaList = document.getElementById('mediaList');
filePicker.onchange = e => {
  const files = Array.from(e.target.files || []);
  files.forEach(addMedia);
};

function addMedia(file) {
  const url = URL.createObjectURL(file);
  const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'video';
  const clip = { type, path: url, start: 0, duration: type === 'audio' ? 10 : 3, label: file.name };

  const trackIndex = type === 'audio' ? 1 : (type === 'text' ? 2 : 0);
  project.tracks[trackIndex].clips.push(clip);

  const li = document.createElement('li');
  li.textContent = file.name;
  const addBtn = document.createElement('button'); addBtn.className = 'btn-sm'; addBtn.textContent = 'إضافة للتايملاين';
  addBtn.onclick = () => { /* بالفعل مضاف */ };
  li.appendChild(addBtn);
  mediaList.appendChild(li);

  timeline.rerender();
}

// Templates
const templatesList = document.getElementById('templatesList');
const templates = [
  { id: 'photo_story', name: 'Photo Story', apply: () => {
    // ضبط مدد الصور وانتقال بسيط لاحقًا في الرندر
    project.tracks[0].clips.filter(c => c.type === 'image').forEach(c => c.duration = 2.5);
    alert('تم تطبيق قالب Photo Story'); timeline.rerender();
  }},
  { id: 'intro_bold', name: 'Intro Bold', apply: () => {
    project.tracks[2].clips.push({ type: 'text', value: 'مرحبًا يا ياسر!', start: 0.4, duration: 2.0, label: 'Title' });
    alert('تمت إضافة المقدمة النصية'); timeline.rerender();
  }}
];
templates.forEach(t => { const li = document.createElement('li'); li.textContent = t.name; li.onclick = t.apply; templatesList.appendChild(li); });

// Project controls
document.getElementById('newProject').onclick = () => {
  project = {
    title: 'مشروع جديد',
    settings: { width: 1920, height: 1080, fps: 30, bgColor: '#000000' },
    tracks: [{ type:'video', clips:[] }, { type:'audio', clips:[] }, { type:'text', clips:[] }]
  };
  mediaList.innerHTML = '';
  timeline.rerender();
  setStatus('بدأ مشروع جديد');
};

document.getElementById('saveProject').onclick = () => {
  Storage.save(project);
  setStatus('تم حفظ المشروع محليًا');
  alert('تم الحفظ!');
};

document.getElementById('loadProject').onclick = () => {
  const p = Storage.load();
  if (!p) return alert('لا يوجد مشروع محفوظ');
  project = p;
  timeline.rerender();
  setStatus('تم تحميل المشروع');
};

// Project settings
document.getElementById('projW').onchange = e => project.settings.width  = parseInt(e.target.value, 10);
document.getElementById('projH').onchange = e => project.settings.height = parseInt(e.target.value, 10);
document.getElementById('projFps').onchange = e => project.settings.fps   = parseInt(e.target.value, 10);
document.getElementById('projBg').onchange = e => project.settings.bgColor = e.target.value;

// Clip props
const clipProps = document.getElementById('clipProps');
function renderClipProps(ref) {
  clipProps.innerHTML = '';
  if (!ref) { clipProps.textContent = 'لا يوجد مقطع محدد'; return; }
  const clip = project.tracks[ref.trackIndex].clips[ref.clipIndex];

  const fields = [
    { k: 'label', v: clip.label || '' },
    { k: 'start', v: clip.start },
    { k: 'duration', v: clip.duration },
    ...(clip.type === 'text' ? [{ k: 'value', v: clip.value || '' }] : [])
  ];

  fields.forEach(f => {
    const row = document.createElement('label');
    row.innerHTML = `${f.k}: <input data-key="${f.k}" value="${f.v}">`;
    clipProps.appendChild(row);
  });

  clipProps.querySelectorAll('input').forEach(inp => {
    inp.onchange = e => {
      const key = e.target.dataset.key;
      const val = key === 'start' || key === 'duration' ? parseFloat(e.target.value) : e.target.value;
      clip[key] = val;
      timeline.rerender();
    };
  });

  // حذف المقطع
  const del = document.createElement('button');
  del.className = 'btn btn-sm';
  del.textContent = 'حذف المقطع';
  del.onclick = () => {
    project.tracks[ref.trackIndex].clips.splice(ref.clipIndex, 1);
    clipProps.textContent = 'تم حذف المقطع';
    timeline.rerender();
  };
  clipProps.appendChild(del);
}

// Preview simple slideshow draw
function drawBackground() {
  ctx.fillStyle = project.settings.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Export via MediaRecorder (images + simple text overlay)
document.getElementById('exportVideo').onclick = async () => {
  const fps = project.settings.fps || 30;
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.title || 'output'}.webm`;
    a.click();
    setStatus('تم تصدير الفيديو');
  };

  const images = project.tracks[0].clips.filter(c => c.type === 'image');
  const texts  = project.tracks[2].clips.filter(c => c.type === 'text');

  if (images.length === 0) { alert('أضف صورًا أولًا'); return; }

  recorder.start();

  let idx = 0;
  const next = () => {
    if (idx >= images.length) { recorder.stop(); return; }
    const imgClip = images[idx];
    const img = new Image(); img.src = imgClip.path;

    img.onload = () => {
      const durationMs = Math.max(500, (imgClip.duration || 2.5) * 1000);
      const tStart = performance.now();
      const fadeMs = Math.min(500, durationMs / 3);

      const drawFrame = () => {
        const t = performance.now() - tStart;
        drawBackground();
        // Simple fade-in/out
        let alpha = 1.0;
        if (t < fadeMs) alpha = t / fadeMs;
        else if (t > durationMs - fadeMs) alpha = Math.max(0, (durationMs - t) / fadeMs);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw text overlays active in this time window
        texts.forEach(tx => {
          const active = t >= (tx.start || 0) * 1000 && t <= ((tx.start || 0) + (tx.duration || 2)) * 1000;
          if (active) {
            ctx.save();
            ctx.font = 'bold 48px Cairo';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.textAlign = 'center';
            ctx.fillText(tx.value || tx.label || '', canvas.width / 2, canvas.height / 2);
            ctx.restore();
          }
        });

        if (t < durationMs) requestAnimationFrame(drawFrame);
        else { idx++; next(); }
      };
      requestAnimationFrame(drawFrame);
    };
  };
  next();
};

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Initial paint
drawBackground();
