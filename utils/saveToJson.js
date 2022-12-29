const fs = require('fs/promises');

const saveToJson = async (path, obj) => {
  try {
    const str = JSON.stringify(obj);
    await fs.writeFile(path, str, { encoding: 'utf-8' });
  } catch (error) {
    console.log(error);
  }
};

module.exports = saveToJson;
