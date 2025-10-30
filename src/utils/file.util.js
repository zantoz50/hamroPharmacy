'use strict';

const fs = require('fs').promises;

exports.removeFolderRecursive = async (dirPath) => {
  if (!dirPath) return;
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    // rethrow for caller to handle or log
    throw err;
  }
};
