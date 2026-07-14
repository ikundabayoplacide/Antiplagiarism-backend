const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const cleanText = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const splitIntoParagraphs = (text) =>
  text
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.split(/\s+/).length >= 10); // keep only paragraphs with 10+ words

const extractText = async (buffer, fileType) => {
  let raw = '';

  if (fileType === 'docx' || fileType === 'doc') {
    const result = await mammoth.extractRawText({ buffer });
    raw = result.value;
  } else if (fileType === 'pdf') {
    const result = await pdfParse(buffer);
    raw = result.text;
  } else if (fileType === 'txt') {
    raw = buffer.toString('utf8');
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const cleaned = cleanText(raw);
  const paragraphs = splitIntoParagraphs(cleaned);

  return { fullText: cleaned, paragraphs };
};

module.exports = { extractText };
