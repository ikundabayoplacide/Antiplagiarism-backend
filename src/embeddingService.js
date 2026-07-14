const { pipeline } = require('@xenova/transformers');

let embedder = null;

const loadModel = async () => {
  if (!embedder) {
    console.log('Loading embedding model (first time may take a moment)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded successfully');
  }
  return embedder;
};

const generateEmbedding = async (text) => {
  const model = await loadModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

const generateEmbeddings = async (paragraphs) => {
  const model = await loadModel();
  const embeddings = [];

  for (const paragraph of paragraphs) {
    const output = await model(paragraph, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  return embeddings;
};

// Average multiple paragraph embeddings into one document-level embedding
const averageEmbeddings = (embeddings) => {
  if (embeddings.length === 0) return null;
  const size = embeddings[0].length;
  const avg = new Array(size).fill(0);

  for (const emb of embeddings) {
    for (let i = 0; i < size; i++) avg[i] += emb[i];
  }

  return avg.map((v) => v / embeddings.length);
};

module.exports = { generateEmbedding, generateEmbeddings, averageEmbeddings, loadModel };
