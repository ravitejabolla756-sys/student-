import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function summarizeText(text: string, length: "short" | "medium" | "long"): Promise<string> {
  const lengthInstructions = {
    short: "Create a brief 2-3 sentence summary.",
    medium: "Create a concise summary of about 4-6 sentences.",
    long: "Create a detailed summary covering all main points in about 8-10 sentences."
  };

  const prompt = `You are an expert text summarizer. ${lengthInstructions[length]}

Text to summarize:
${text}

Provide only the summary, no additional commentary.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate summary.";
}

export async function generateEssay(topic: string, type: string, paragraphs: number): Promise<string> {
  const prompt = `You are an expert essay writer. Write a well-structured ${type} essay about "${topic}" with exactly ${paragraphs} paragraphs.

Structure:
- Start with an engaging introduction paragraph
- Include ${paragraphs - 2} body paragraphs with clear topic sentences and supporting evidence
- End with a strong conclusion

Write in a clear, academic style appropriate for students. Use proper paragraph breaks.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate essay.";
}

export async function checkGrammar(text: string): Promise<{ corrected: string; issues: string[] }> {
  const prompt = `You are an expert grammar checker. Analyze the following text for grammar, spelling, and punctuation errors.

Text:
${text}

Respond in this exact JSON format:
{
  "corrected": "The corrected version of the text with all errors fixed",
  "issues": ["List of specific issues found and corrected, e.g., 'Changed \"their\" to \"there\" (wrong word usage)'"]
}

If no errors are found, set issues to ["No grammar issues found. The text is correct."]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse grammar response:", e);
  }

  return {
    corrected: text,
    issues: ["Unable to analyze grammar. Please try again."]
  };
}

export async function generateNotes(text: string, format: "bullet" | "numbered" | "cornell"): Promise<string> {
  const formatInstructions = {
    bullet: "Use bullet points (•) for each key point",
    numbered: "Use numbered list (1., 2., 3., etc.)",
    cornell: "Use Cornell note format with main points on the left and details/explanations on the right, separated by | character"
  };

  const prompt = `You are an expert note-taker. Extract the key points and important information from the following text and create study notes.

${formatInstructions[format]}

Text:
${text}

Create comprehensive, well-organized notes that a student could use for studying. Include all important concepts, definitions, and facts.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate notes.";
}

export async function generateQuestions(text: string, type: string, count: number): Promise<string> {
  const typeInstructions: Record<string, string> = {
    mixed: "Include a variety of question types (what, how, why, and true/false)",
    what: "Focus on 'What' questions testing factual knowledge",
    how: "Focus on 'How' questions testing understanding of processes",
    why: "Focus on 'Why' questions testing deeper comprehension",
    tf: "Create True/False questions"
  };

  const prompt = `You are an expert educator creating practice questions. Based on the following text, generate ${count} study questions.

${typeInstructions[type] || typeInstructions.mixed}

Text:
${text}

Format each question clearly with:
- Question number
- The question
- A line for the answer (for open questions) or [ ] True [ ] False options

Make questions that test genuine understanding of the material.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate questions.";
}

export async function paraphraseText(text: string, style: "standard" | "formal" | "simple"): Promise<string> {
  const styleInstructions = {
    standard: "Rephrase while maintaining the same tone and complexity",
    formal: "Rephrase using formal, academic language",
    simple: "Rephrase using simpler, easier-to-understand language"
  };

  const prompt = `You are an expert paraphraser. Rephrase the following text while preserving its meaning.

Style: ${styleInstructions[style]}

Original text:
${text}

Provide only the paraphrased version, no additional commentary.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to paraphrase text.";
}

export async function generateCheatSheet(topic: string, level: "beginner" | "intermediate" | "advanced"): Promise<string> {
  const prompt = `You are an expert educator. Create a comprehensive cheat sheet/quick reference guide about "${topic}" for a ${level} level student.

Include:
- Key definitions
- Important formulas or rules (if applicable)
- Common examples
- Tips and tricks
- Common mistakes to avoid

Format it clearly with headers and bullet points for easy scanning.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate cheat sheet.";
}

export async function explainTopic(topic: string, level: "beginner" | "intermediate" | "advanced"): Promise<string> {
  const levelInstructions = {
    beginner: "Explain like I'm completely new to this. Use simple language and everyday analogies.",
    intermediate: "Explain with moderate detail, assuming some basic knowledge.",
    advanced: "Provide an in-depth explanation with technical details and nuances."
  };

  const prompt = `You are an expert teacher. Explain the topic: "${topic}"

${levelInstructions[level]}

Structure your explanation with:
1. A clear introduction
2. Main concepts broken down step by step
3. Examples to illustrate key points
4. A brief summary

Make it engaging and easy to understand.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to explain topic.";
}
