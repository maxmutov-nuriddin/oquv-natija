const key = (group) => `oquv_comic_${encodeURIComponent(group)}`;

export function loadComics(group) {
  try { return JSON.parse(localStorage.getItem(key(group))) || {}; } catch { return {}; }
}

export function saveComic(group, date, dialog) {
  const comics = loadComics(group);
  comics[date] = { dialog, savedAt: Date.now() };
  localStorage.setItem(key(group), JSON.stringify(comics));
}
