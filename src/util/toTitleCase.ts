const toTitleCase = (item: string) => {
  return item
    .toLowerCase()
    .replace(/guild/g, 'Server')
    .replace(/_/g, ' ')
    .replace(/\b[a-z]/g, t => t.toUpperCase());
};

export default toTitleCase;
