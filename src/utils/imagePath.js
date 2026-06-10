export const getImagePath = (path) => {
  if (!path) return path;
  if (path.startsWith('/')) {
    return import.meta.env.BASE_URL + path.slice(1);
  }
  return path;
};
