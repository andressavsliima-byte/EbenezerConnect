export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(product) {
  const favs = getFavorites();
  const exists = favs.find(f => f._id === product._id);
  let next;
  if (exists) {
    next = favs.filter(f => f._id !== product._id);
  } else {
    next = [...favs, product];
  }
  localStorage.setItem('favorites', JSON.stringify(next));
  // Optional event for UI updates
  window.dispatchEvent(new Event('favoritesUpdated'));
  return next;
}
