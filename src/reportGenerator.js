const { extractText } = require('./textExtractor');
const { generateEmbeddings, averageEmbeddings } = require('./embeddingService');
const { findSimilarDocuments, compareParagraphs, computeOverallScore } = require('./similarityService');
const { sequelize } = require('../config/database');

const generateReport = async (buffer, fileType, excludeScanId = null) => {
  // Step 1: Extract and clean text
  const { fullText, paragraphs } = await extractText(buffer, fileType);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  // Step 2: Generate embeddings for all paragraphs
  const paragraphEmbeddings = await generateEmbeddings(paragraphs);

  // Step 3: Average into one document-level embedding
  const docEmbedding = averageEmbeddings(paragraphEmbeddings);

  // Step 4: Find similar documents from DB
  const similarDocs = await findSimilarDocuments(docEmbedding, excludeScanId);

  // Step 5: Paragraph-level comparison against top matched docs
  let matchedSections = [];
  if (similarDocs.length > 0) {
    // Fetch stored paragraph embeddings for top 3 similar docs
    const topIds = similarDocs.slice(0, 3).map((d) => `'${d.scanId}'`).join(',');
    const storedScans = await sequelize.query(
      `SELECT id, file_name, matched_sections FROM scans WHERE id IN (${topIds})`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Build flat list of stored paragraph embeddings with source name
    const storedParagraphEmbeddings = [];
    for (const scan of storedScans) {
      const sections = scan.matched_sections || [];
      for (const section of sections) {
        if (section.embedding) {
          storedParagraphEmbeddings.push({
            embedding: section.embedding,
            fileName: scan.file_name,
          });
        }
      }
    }

    if (storedParagraphEmbeddings.length > 0) {
      matchedSections = await compareParagraphs(paragraphs, storedParagraphEmbeddings);
    }

    // Fallback: use top similar docs as matched sections if no paragraph matches
    if (matchedSections.length === 0) {
      matchedSections = similarDocs.slice(0, 3).map((d) => ({
        text: '',
        source: d.fileName,
        similarity: Math.round(d.similarity * 100),
      }));
    }
  }

  // Step 6: Compute final plagiarism score
  const plagiarismPercent = computeOverallScore(similarDocs, matchedSections);
  const originalPercent = 100 - plagiarismPercent;
  const status = plagiarismPercent >= 30 ? 'flagged' : 'original';

  return {
    fullText,
    paragraphs,
    docEmbedding,
    wordCount,
    plagiarismPercent,
    originalPercent,
    status,
    matchedSections,
    similarDocs,
  };
};

module.exports = { generateReport };
