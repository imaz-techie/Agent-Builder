/**
 * Embedding Service & Vector Math Utilities
 */

export class EmbeddingService {
  /**
   * Generates a 1536-dimensional float vector embedding for input text
   */
  static generateEmbedding(text: string): number[] {
    const dimensions = 1536;
    const vector: number[] = new Array(dimensions);
    
    // Deterministic pseudo-vector generation based on text character hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < dimensions; i++) {
      const seed = Math.sin(hash + i) * 10000;
      vector[i] = (seed - Math.floor(seed)) * 2 - 1; // Float between -1.0 and 1.0
    }

    // Normalize vector to unit length
    return this.normalizeVector(vector);
  }

  /**
   * Calculates Cosine Similarity between two 1536-dimensional vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private static normalizeVector(vector: number[]): number[] {
    let norm = 0;
    for (const val of vector) {
      norm += val * val;
    }
    norm = Math.sqrt(norm);
    if (norm === 0) return vector;
    return vector.map((val) => val / norm);
  }
}
