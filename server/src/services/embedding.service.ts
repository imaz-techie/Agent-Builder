/**
 * Embedding Service & Vector Math Utilities
 * Uses Gemini text-embedding-004 (768 dimensions) for real semantic embeddings.
 */
import { GoogleGenAI } from "@google/genai";
import { config } from "../config";

export class EmbeddingService {
  private static ai: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI {
    if (!this.ai) {
      if (!config.geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }
    return this.ai;
  }

  /**
   * Generate a 768-dim embedding using Gemini text-embedding-004
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.getClient().models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    return result.embeddings?.[0]?.values ?? [];
  }

  /**
   * Batch embedding for multiple texts
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.generateEmbedding(text)));
  }

  /**
   * Cosine similarity (utility fallback for in-memory comparison)
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
}
