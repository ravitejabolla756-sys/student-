import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  isGeminiConfigured,
  summarizeText,
  generateEssay,
  checkGrammar,
  generateNotes,
  generateQuestions,
  paraphraseText,
  generateCheatSheet,
  explainTopic
} from "./gemini";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/ai/status", (req, res) => {
    res.json({ configured: isGeminiConfigured() });
  });

  app.post("/api/ai/summarize", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { text, length } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (text.length > 10000) {
        return res.status(400).json({ error: "Text exceeds 10,000 character limit" });
      }
      const result = await summarizeText(text, length || "medium");
      res.json({ result });
    } catch (error) {
      console.error("Summarize error:", error);
      res.status(500).json({ error: "Failed to summarize text" });
    }
  });

  app.post("/api/ai/essay", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { topic, type, paragraphs } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" });
      }
      if (topic.length > 500) {
        return res.status(400).json({ error: "Topic exceeds 500 character limit" });
      }
      const result = await generateEssay(topic, type || "argumentative", paragraphs || 5);
      res.json({ result });
    } catch (error) {
      console.error("Essay error:", error);
      res.status(500).json({ error: "Failed to generate essay" });
    }
  });

  app.post("/api/ai/grammar", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (text.length > 5000) {
        return res.status(400).json({ error: "Text exceeds 5,000 character limit" });
      }
      const result = await checkGrammar(text);
      res.json(result);
    } catch (error) {
      console.error("Grammar error:", error);
      res.status(500).json({ error: "Failed to check grammar" });
    }
  });

  app.post("/api/ai/notes", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { text, format } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (text.length > 10000) {
        return res.status(400).json({ error: "Text exceeds 10,000 character limit" });
      }
      const result = await generateNotes(text, format || "bullet");
      res.json({ result });
    } catch (error) {
      console.error("Notes error:", error);
      res.status(500).json({ error: "Failed to generate notes" });
    }
  });

  app.post("/api/ai/questions", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { text, type, count } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (text.length > 10000) {
        return res.status(400).json({ error: "Text exceeds 10,000 character limit" });
      }
      const result = await generateQuestions(text, type || "mixed", count || 5);
      res.json({ result });
    } catch (error) {
      console.error("Questions error:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  app.post("/api/ai/paraphrase", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { text, style } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }
      if (text.length > 5000) {
        return res.status(400).json({ error: "Text exceeds 5,000 character limit" });
      }
      const result = await paraphraseText(text, style || "standard");
      res.json({ result });
    } catch (error) {
      console.error("Paraphrase error:", error);
      res.status(500).json({ error: "Failed to paraphrase text" });
    }
  });

  app.post("/api/ai/cheatsheet", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { topic, level } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" });
      }
      if (topic.length > 200) {
        return res.status(400).json({ error: "Topic exceeds 200 character limit" });
      }
      const result = await generateCheatSheet(topic, level || "intermediate");
      res.json({ result });
    } catch (error) {
      console.error("Cheatsheet error:", error);
      res.status(500).json({ error: "Failed to generate cheat sheet" });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
      }
      const { topic, level } = req.body;
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" });
      }
      if (topic.length > 200) {
        return res.status(400).json({ error: "Topic exceeds 200 character limit" });
      }
      const result = await explainTopic(topic, level || "beginner");
      res.json({ result });
    } catch (error) {
      console.error("Explain error:", error);
      res.status(500).json({ error: "Failed to explain topic" });
    }
  });

  return httpServer;
}
