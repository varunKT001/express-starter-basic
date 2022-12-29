const fs = require('fs/promises');

const getFromJson = async (path) => {
  try {
    const str = await fs.readFile(path, { encoding: 'utf-8' });
    return JSON.parse(str);
  } catch (error) {
    console.log(error);
  }
};

module.exports = getFromJson;
