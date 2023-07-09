export const classNames = (obj) => {
  return Object.entries(obj)
    .filter(([_, v]) => v)
    .map(([k, _]) => k)
    .join(' ')
}
