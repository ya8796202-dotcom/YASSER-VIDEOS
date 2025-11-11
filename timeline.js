export function createTimeline({ getProject, onSelectClip, onMoveClip }) {
  let zoom = 1;
  const root = document.createElement('div');

  function pxPerSecond() { return 80 * zoom; }

  function render() {
    root.innerHTML = '';
    const project = getProject();
    const tracks = project.tracks;

    tracks.forEach((track, ti) => {
      const trackEl = document.createElement('div');
      trackEl.className = 'track';

      const title = document.createElement('div');
      title.className = 'track-title';
      title.textContent = track.type.toUpperCase();
      trackEl.appendChild(title);

      track.clips.forEach((clip, ci) => {
        const el = document.createElement('div');
        el.className = `clip clip-${clip.type}`;
        el.style.left = `${clip.start * pxPerSecond()}px`;
        el.style.width = `${clip.duration * pxPerSecond()}px`;
        el.textContent = clip.label || clip.type;

        el.addEventListener('click', () => onSelectClip({ trackIndex: ti, clipIndex: ci }));

        el.draggable = true;
        el.addEventListener('dragend', e => {
          const delta = Math.round((e.clientX / pxPerSecond()) * 100) / 100;
          const ns = Math.max(0, clip.start + delta);
          onMoveClip({ trackIndex: ti, clipIndex: ci, newStart: ns });
          render();
        });

        trackEl.appendChild(el);
      });

      root.appendChild(trackEl);
    });
  }

  render();

  return {
    el: root,
    setZoom: z => { zoom = z; render(); },
    rerender: render
  };
}

