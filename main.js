import { renderTimeline } from './timeline.js';
import { saveProject, loadProject } from './storage.js';

let project = { tracks:[{type:"video",clips:[]},{type:"audio",clips:[]},{type:"text",clips:[]}] };

const timeline = document.getElementById('timeline');
const filePicker = document.getElementById('filePicker');
const mediaList = document.getElementById('mediaList');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

function addMedia(file) {
  const url = URL.createObjectURL(file);
  const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'video';
  project.tracks.find(t=>t.type===type).clips.push({type,path:url,label:file.name});
  const li=document.createElement('li'); li.textContent=file.name; mediaList.appendChild(li);
  renderTimeline(project,timeline);
}

filePicker.onchange = e => [...e.target.files].forEach(addMedia);

document.getElementById('saveProject').onclick = () => saveProject(project);
document.getElementById('loadProject').onclick = () => { project=loadProject(); renderTimeline(project,timeline); };
document.getElementById('newProject').onclick = () => { project={tracks:[{type:"video",clips:[]},{type:"audio",clips:[]},{type:"text",clips:[]}]}; renderTimeline(project,timeline); };

// تصدير فيديو تجريبي باستخدام Canvas (صور فقط)
document.getElementById('exportVideo').onclick = async () => {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks,{type:'video/webm'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='output.webm'; a.click();
  };
  recorder.start();
  let i=0;
  const imgs=project.tracks[0].clips.filter(c=>c.type==='image');
  const interval=setInterval(()=>{
    if(i>=imgs.length){clearInterval(interval); recorder.stop(); return;}
    const img=new Image(); img.src=imgs[i].path;
    img.onload=()=>{ctx.drawImage(img,0,0,canvas.width,canvas.height);}
    i++;
  },1000);
};
