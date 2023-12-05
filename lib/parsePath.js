export default function parsePath(path) {
  return path.split('.').reduce((acc, part) => {
    const arrayMatch = part.match(/([^\[]+)(\[\d+\])?/);
    if (arrayMatch) {
      acc.push(arrayMatch[1]);
      if (arrayMatch[2]) {
        acc.push(parseInt(arrayMatch[2].replace(/[\[\]]/g, '')));
      }
    }
    return acc;
  }, []);
}