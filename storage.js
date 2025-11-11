export function saveProject(project) {
  localStorage.setItem('videoProject', JSON.stringify(project));
}
export function loadProject() {
  return JSON.parse(localStorage.getItem('videoProject') || '{}');
}
