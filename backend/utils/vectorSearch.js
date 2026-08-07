export const cosineSimilarity = (a, b) => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
};

export const topKChunks = (queryEmbedding, modules, k = 3) => {
  return modules
    .map((mod, index) => ({
      index,
      module: mod,
      score: mod.embedding?.length ? cosineSimilarity(queryEmbedding, mod.embedding) : -1
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};