export function renderTimeline(project, container) {
  container.innerHTML = '';
  project.tracks.forEach(track => {
    track.clips.forEach(clip => {
      const el = document.createElement('div');
      el.className = `clip clip-${clip.type}`;
      el.textContent = clip.label || clip.type;
      container.appendChild(el);
    });
  });
}
