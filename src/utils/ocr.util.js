'use strict';

const tesseract = require('node-tesseract-ocr');
const logger = require('./logger');

const defaultConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3
};

exports.extractText = async (filePath, options = {}) => {
  const config = Object.assign({}, defaultConfig, options);
  try {
    const text = await tesseract.recognize(filePath, config);
    return typeof text === 'string' ? text.trim() : '';
  } catch (err) {
    logger.error('OCR extraction error', err);
    return '';
  }
};
