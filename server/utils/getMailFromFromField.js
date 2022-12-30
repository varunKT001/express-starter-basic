const getMailFromFromField = (str) => {
  const regex = /\<(.*?)\>/;
  const matches = str.match(regex);
  return matches[0].substring(1, matches[0].length - 1);
};

module.exports = getMailFromFromField;
