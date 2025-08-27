export const singularize = (word: string): string => {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
};
