// Simple plagiarism simulation engine
// In production, replace this with a real plagiarism detection service

const SAMPLE_SOURCES = [
  { source: 'Wikipedia - Computer Science', text: 'computer science is the study of computation' },
  { source: 'Academic Journal - AI Research', text: 'artificial intelligence machine learning deep learning' },
  { source: 'Wikipedia - Software Engineering', text: 'software engineering is the systematic application' },
  { source: 'Online Article - Data Structures', text: 'arrays linked lists trees graphs hash tables' },
  { source: 'Research Paper - Algorithms', text: 'sorting searching dynamic programming greedy algorithms' },
];

const detectPlagiarism = (text) => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const matchedSections = [];

  for (const source of SAMPLE_SOURCES) {
    const sourceWords = source.text.split(/\s+/);
    const matchingWords = sourceWords.filter((w) => words.includes(w));
    const similarity = Math.round((matchingWords.length / Math.max(sourceWords.length, 1)) * 100);

    if (similarity > 10) {
      // Find a snippet from the text that contains matching words
      const snippetWords = words.slice(0, 30);
      const snippet = snippetWords.join(' ');
      matchedSections.push({
        text: snippet,
        source: source.source,
        similarity,
      });
    }
  }

  // Calculate overall plagiarism percent based on matched sections
  const plagiarismPercent =
    matchedSections.length > 0
      ? Math.min(Math.round(matchedSections.reduce((sum, s) => sum + s.similarity, 0) / matchedSections.length), 95)
      : Math.floor(Math.random() * 10); // 0-10% random noise for truly original content

  const originalPercent = 100 - plagiarismPercent;
  const status = plagiarismPercent >= 30 ? 'flagged' : 'original';

  return { plagiarismPercent, originalPercent, wordCount, status, matchedSections };
};

module.exports = { detectPlagiarism };
