const { sequelize } = require('../config/database');
const { generateEmbeddings, averageEmbeddings } = require('./embeddingService');

const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const findSimilarDocuments = async (docEmbedding, excludeScanId = null) => {
  const vectorStr = `[${docEmbedding.join(',')}]`;

  const query = `
    SELECT id, file_name, user_id,
           1 - (embedding <=> '${vectorStr}'::vector) AS similarity
    FROM scans
    WHERE embedding IS NOT NULL
    ${excludeScanId ? `AND id != '${excludeScanId}'` : ''}
    ORDER BY similarity DESC
    LIMIT 10
  `;

  const results = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  return results.map((r) => ({
    scanId: r.id,
    fileName: r.file_name,
    userId: r.user_id,
    similarity: parseFloat(r.similarity),
  }));
};

const compareParagraphs = async (paragraphs, storedParagraphEmbeddings) => {
  const newEmbeddings = await generateEmbeddings(paragraphs);
  const matched = [];

  for (let i = 0; i < newEmbeddings.length; i++) {
    for (const stored of storedParagraphEmbeddings) {
      const sim = cosineSimilarity(newEmbeddings[i], stored.embedding);
      if (sim >= 0.85) {
        matched.push({
          text: paragraphs[i].slice(0, 200),
          source: stored.fileName,
          similarity: Math.round(sim * 100),
        });
        break; // one match per paragraph is enough
      }
    }
  }

  return matched;
};

const computeOverallScore = (similarDocs, matchedSections) => {
  if (similarDocs.length === 0) return 0;
  const topSimilarity = similarDocs[0].similarity;
  const sectionBoost = Math.min(matchedSections.length * 2, 20);
  return Math.min(Math.round(topSimilarity * 100 + sectionBoost), 100);
};

module.exports = { findSimilarDocuments, compareParagraphs, computeOverallScore, averageEmbeddings };
