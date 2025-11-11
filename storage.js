export const Storage = {
  save(project) {
    localStorage.setItem('yvs_project', JSON.stringify(project));
    return true;
  },
  load() {
    const raw = localStorage.getItem('yvs_project');
    return raw ? JSON.parse(raw) : null;
  }
};
