import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToolLayout, LoadingSpinner, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Copy, Check, Sparkles } from "lucide-react";

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 1500 + Math.random() * 1000);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button variant="outline" size="sm" onClick={copy} data-testid="button-copy">
      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function AIBadge() {
  return (
    <Badge variant="secondary" className="gap-1" data-testid="badge-ai-version">
      <Sparkles className="w-3 h-3" />
      Basic AI Engine - V1
    </Badge>
  );
}

export function EssayGenerator() {
  const tool = getToolById("essay-generator")!;
  const [topic, setTopic] = useState("");
  const [essayType, setEssayType] = useState("argumentative");
  const [paragraphs, setParagraphs] = useState("5");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const numParagraphs = parseInt(paragraphs) || 5;
      const intro = `Introduction:\n\nThe topic of "${topic}" has become increasingly relevant in today's world. This essay will explore the key aspects of this subject, examining various perspectives and providing a comprehensive analysis. Understanding ${topic.toLowerCase()} is essential for anyone seeking to grasp the complexities of modern discourse.\n\n`;
      
      const bodyParagraphs = [];
      const bodyPoints = [
        `One of the most significant aspects of ${topic.toLowerCase()} is its fundamental impact on society. Research has shown that this topic affects various demographics differently, creating a nuanced landscape that requires careful examination.`,
        `Furthermore, historical context provides valuable insights into ${topic.toLowerCase()}. By examining how this subject has evolved over time, we can better understand its current state and potential future developments.`,
        `Additionally, experts in the field have offered diverse opinions on ${topic.toLowerCase()}. These perspectives range from optimistic to cautionary, reflecting the complexity inherent in this topic.`,
        `The practical implications of ${topic.toLowerCase()} cannot be overlooked. In everyday life, this subject manifests in numerous ways that affect individuals, communities, and institutions alike.`,
        `Moreover, the global dimension of ${topic.toLowerCase()} adds another layer of complexity. Different cultures and regions approach this topic with varying priorities and methodologies.`
      ];
      
      for (let i = 0; i < Math.min(numParagraphs - 2, bodyPoints.length); i++) {
        bodyParagraphs.push(`Body Paragraph ${i + 1}:\n\n${bodyPoints[i]}\n\n`);
      }
      
      const conclusion = `Conclusion:\n\nIn conclusion, ${topic.toLowerCase()} remains a multifaceted topic that warrants continued attention and study. The various aspects discussed in this essay demonstrate the importance of approaching this subject with an open mind and critical thinking. As society continues to evolve, our understanding of ${topic.toLowerCase()} will undoubtedly deepen, leading to new insights and developments.`;
      
      setResult(intro + bodyParagraphs.join("") + conclusion);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Essay Topic</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Impact of Social Media on Education"
              data-testid="input-topic"
            />
          </div>
          <div className="space-y-2">
            <Label>Essay Type</Label>
            <Select value={essayType} onValueChange={setEssayType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="argumentative">Argumentative</SelectItem>
                <SelectItem value="expository">Expository</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Number of Paragraphs</Label>
          <Select value={paragraphs} onValueChange={setParagraphs}>
            <SelectTrigger className="w-32" data-testid="select-paragraphs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["3", "4", "5", "6", "7"].map(n => (
                <SelectItem key={n} value={n}>{n} paragraphs</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !topic.trim()} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Essay"}
        </Button>

        {loading && <LoadingSpinner text="Generating essay outline..." />}

        {result && !loading && (
          <ResultDisplay title="Generated Essay">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg max-h-96 overflow-auto" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TextSummarizer() {
  const tool = getToolById("text-summarizer")!;
  const [text, setText] = useState("");
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const summarize = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).length;
      
      let targetSentences: number;
      switch (length) {
        case "short": targetSentences = Math.max(1, Math.floor(sentences.length * 0.2)); break;
        case "medium": targetSentences = Math.max(2, Math.floor(sentences.length * 0.4)); break;
        case "long": targetSentences = Math.max(3, Math.floor(sentences.length * 0.6)); break;
        default: targetSentences = 3;
      }
      
      const importantSentences = sentences
        .map((s, i) => ({ text: s.trim(), index: i, score: s.length + (i === 0 ? 50 : 0) + (i === sentences.length - 1 ? 30 : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, targetSentences)
        .sort((a, b) => a.index - b.index)
        .map(s => s.text);
      
      const summary = importantSentences.join(". ") + ".";
      const summaryWords = summary.split(/\s+/).length;
      
      setResult(`Summary:\n\n${summary}\n\n---\nOriginal: ${words} words | Summary: ${summaryWords} words (${Math.round((summaryWords / words) * 100)}% of original)`);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Text to Summarize</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text you want to summarize here..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Summary Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger className="w-40" data-testid="select-length">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (20%)</SelectItem>
              <SelectItem value="medium">Medium (40%)</SelectItem>
              <SelectItem value="long">Long (60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={summarize} disabled={loading || !text.trim()} data-testid="button-summarize">
          {loading ? "Summarizing..." : "Summarize Text"}
        </Button>

        {loading && <LoadingSpinner text="Summarizing text..." />}

        {result && !loading && (
          <ResultDisplay title="Summary">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function Paraphraser() {
  const tool = getToolById("paraphraser")!;
  const [text, setText] = useState("");
  const [style, setStyle] = useState("standard");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const synonyms: Record<string, string[]> = {
    "good": ["excellent", "great", "wonderful", "fantastic"],
    "bad": ["poor", "terrible", "awful", "dreadful"],
    "important": ["crucial", "essential", "vital", "significant"],
    "big": ["large", "enormous", "substantial", "considerable"],
    "small": ["tiny", "little", "minor", "compact"],
    "show": ["demonstrate", "illustrate", "display", "reveal"],
    "make": ["create", "produce", "generate", "develop"],
    "use": ["utilize", "employ", "apply", "implement"],
    "help": ["assist", "aid", "support", "facilitate"],
    "give": ["provide", "offer", "supply", "deliver"],
  };

  const paraphrase = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      let paraphrased = text;
      
      Object.entries(synonyms).forEach(([word, replacements]) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        paraphrased = paraphrased.replace(regex, () => {
          const replacement = replacements[Math.floor(Math.random() * replacements.length)];
          return replacement;
        });
      });
      
      if (style === "formal") {
        paraphrased = paraphrased
          .replace(/\bI think\b/gi, "It is believed that")
          .replace(/\bvery\b/gi, "highly")
          .replace(/\ba lot\b/gi, "significantly")
          .replace(/\bget\b/gi, "obtain");
      } else if (style === "simple") {
        paraphrased = paraphrased
          .replace(/\bfurthermore\b/gi, "also")
          .replace(/\bnevertheless\b/gi, "but")
          .replace(/\bconsequently\b/gi, "so")
          .replace(/\butilize\b/gi, "use");
      }
      
      setResult(`Paraphrased Text:\n\n${paraphrased}\n\n---\nNote: This is a basic paraphrase using synonym replacement. For academic work, please review and refine the output.`);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Original Text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to paraphrase..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="w-40" data-testid="select-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={paraphrase} disabled={loading || !text.trim()} data-testid="button-paraphrase">
          {loading ? "Paraphrasing..." : "Paraphrase Text"}
        </Button>

        {loading && <LoadingSpinner text="Paraphrasing text..." />}

        {result && !loading && (
          <ResultDisplay title="Paraphrased Result">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function GrammarChecker() {
  const tool = getToolById("grammar-checker")!;
  const [text, setText] = useState("");
  const [result, setResult] = useState<{corrected: string; issues: string[]} | null>(null);
  const [loading, setLoading] = useState(false);

  const commonErrors: [RegExp, string, string][] = [
    [/\bi\b/g, "I", "Capitalize 'I'"],
    [/\s+,/g, ",", "No space before comma"],
    [/,([^\s])/g, ", $1", "Add space after comma"],
    [/\.\s*\./g, ".", "Double period"],
    [/\bteh\b/gi, "the", "Typo: 'teh' should be 'the'"],
    [/\brecieve\b/gi, "receive", "Spelling: 'recieve' should be 'receive'"],
    [/\boccured\b/gi, "occurred", "Spelling: 'occured' should be 'occurred'"],
    [/\bseperate\b/gi, "separate", "Spelling: 'seperate' should be 'separate'"],
    [/\bdefinate\b/gi, "definite", "Spelling: 'definate' should be 'definite'"],
    [/\byour\s+welcome\b/gi, "you're welcome", "'Your' should be 'you're'"],
    [/\bits\s+a\s+pleasure\b/gi, "it's a pleasure", "'Its' should be 'it's'"],
    [/\bthier\b/gi, "their", "Spelling: 'thier' should be 'their'"],
    [/\balot\b/gi, "a lot", "'Alot' should be 'a lot'"],
    [/\bcould of\b/gi, "could have", "'Could of' should be 'could have'"],
    [/\bshould of\b/gi, "should have", "'Should of' should be 'should have'"],
  ];

  const check = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      let corrected = text;
      const issues: string[] = [];
      
      commonErrors.forEach(([pattern, replacement, message]) => {
        if (pattern.test(corrected)) {
          issues.push(message);
          corrected = corrected.replace(pattern, replacement);
        }
      });
      
      const sentences = corrected.split(/([.!?]+\s*)/);
      corrected = sentences.map((part, i) => {
        if (i % 2 === 0 && part.length > 0) {
          const trimmed = part.trim();
          if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
            if (!issues.includes("Capitalize first letter of sentences")) {
              issues.push("Capitalize first letter of sentences");
            }
            return trimmed[0].toUpperCase() + trimmed.slice(1);
          }
        }
        return part;
      }).join("");
      
      if (issues.length === 0) {
        issues.push("No obvious grammar issues found!");
      }
      
      setResult({ corrected, issues });
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Text to Check</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to check for grammar errors..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <Button onClick={check} disabled={loading || !text.trim()} data-testid="button-check">
          {loading ? "Checking..." : "Check Grammar"}
        </Button>

        {loading && <LoadingSpinner text="Checking grammar..." />}

        {result && !loading && (
          <>
            <ResultDisplay title={`Issues Found (${result.issues.length})`}>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.issues.map((issue, i) => (
                  <li key={i} className={issue.includes("No obvious") ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                    {issue}
                  </li>
                ))}
              </ul>
            </ResultDisplay>
            
            <ResultDisplay title="Corrected Text">
              <div className="flex justify-end mb-2">
                <CopyButton text={result.corrected} />
              </div>
              <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg" data-testid="text-result">
                {result.corrected}
              </div>
            </ResultDisplay>
          </>
        )}
      </div>
    </ToolLayout>
  );
}

export function NotesGenerator() {
  const tool = getToolById("notes-generator")!;
  const [text, setText] = useState("");
  const [format, setFormat] = useState("bullet");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const keyPoints = sentences.slice(0, Math.min(10, sentences.length));
      
      let notes = "";
      if (format === "bullet") {
        notes = "Key Points:\n\n" + keyPoints.map(s => `• ${s.trim()}`).join("\n\n");
      } else if (format === "numbered") {
        notes = "Key Points:\n\n" + keyPoints.map((s, i) => `${i + 1}. ${s.trim()}`).join("\n\n");
      } else {
        notes = "Study Notes:\n\n" + keyPoints.map(s => `→ ${s.trim()}\n   [Add your notes here]`).join("\n\n");
      }
      
      setResult(notes);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Source Text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text you want to create notes from..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-48" data-testid="select-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullet">Bullet Points</SelectItem>
              <SelectItem value="numbered">Numbered List</SelectItem>
              <SelectItem value="cornell">Cornell Style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !text.trim()} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Notes"}
        </Button>

        {loading && <LoadingSpinner text="Generating study notes..." />}

        {result && !loading && (
          <ResultDisplay title="Generated Notes">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg font-mono" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function QuestionGenerator() {
  const tool = getToolById("question-generator")!;
  const [text, setText] = useState("");
  const [questionType, setQuestionType] = useState("mixed");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
      const numQuestions = Math.min(parseInt(count), sentences.length);
      
      const templates = {
        what: ["What is the main idea of", "What does the text say about", "What are the key aspects of"],
        how: ["How does the text describe", "How is this concept related to", "How would you explain"],
        why: ["Why is this important according to", "Why does the author mention", "Why should we consider"],
        tf: ["True or False:", "Is it accurate that", "According to the text,"],
      };
      
      const questions: string[] = [];
      const usedSentences = new Set<number>();
      
      for (let i = 0; i < numQuestions; i++) {
        let sentenceIdx: number;
        do {
          sentenceIdx = Math.floor(Math.random() * sentences.length);
        } while (usedSentences.has(sentenceIdx) && usedSentences.size < sentences.length);
        usedSentences.add(sentenceIdx);
        
        const sentence = sentences[sentenceIdx].trim();
        const words = sentence.split(/\s+/).slice(0, 5).join(" ");
        
        let type: keyof typeof templates;
        if (questionType === "mixed") {
          const types: (keyof typeof templates)[] = ["what", "how", "why", "tf"];
          type = types[Math.floor(Math.random() * types.length)];
        } else {
          type = questionType as keyof typeof templates;
        }
        
        const template = templates[type][Math.floor(Math.random() * templates[type].length)];
        
        if (type === "tf") {
          questions.push(`Q${i + 1}. ${template} "${sentence}"?\n    [ ] True  [ ] False`);
        } else {
          questions.push(`Q${i + 1}. ${template} "${words}..."?\n    Answer: _______________`);
        }
      }
      
      setResult(`Generated Questions:\n\n${questions.join("\n\n")}`);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Source Text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the text to generate questions from..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger className="w-40" data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="what">What Questions</SelectItem>
                <SelectItem value="how">How Questions</SelectItem>
                <SelectItem value="why">Why Questions</SelectItem>
                <SelectItem value="tf">True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-32" data-testid="select-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["3", "5", "7", "10"].map(n => (
                  <SelectItem key={n} value={n}>{n} questions</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generate} disabled={loading || !text.trim()} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Questions"}
        </Button>

        {loading && <LoadingSpinner text="Generating questions..." />}

        {result && !loading && (
          <ResultDisplay title="Generated Questions">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg font-mono" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function CheatSheetGenerator() {
  const tool = getToolById("cheatsheet-generator")!;
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!topic.trim() || !text.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keyTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
      const uniqueTerms = [...new Set(keyTerms)].slice(0, 8);
      
      let cheatSheet = `╔════════════════════════════════════════╗
║  CHEAT SHEET: ${topic.toUpperCase().slice(0, 20).padEnd(20)}  ║
╚════════════════════════════════════════╝\n\n`;

      cheatSheet += "📌 KEY TERMS:\n";
      cheatSheet += "─".repeat(40) + "\n";
      uniqueTerms.forEach(term => {
        cheatSheet += `• ${term}\n`;
      });
      
      cheatSheet += "\n📝 MAIN POINTS:\n";
      cheatSheet += "─".repeat(40) + "\n";
      sentences.slice(0, 5).forEach((s, i) => {
        cheatSheet += `${i + 1}. ${s.trim().slice(0, 80)}...\n`;
      });
      
      cheatSheet += "\n💡 QUICK TIPS:\n";
      cheatSheet += "─".repeat(40) + "\n";
      cheatSheet += "• Review key terms before the exam\n";
      cheatSheet += "• Practice explaining concepts out loud\n";
      cheatSheet += "• Create connections between topics\n";
      
      cheatSheet += "\n📅 Generated: " + new Date().toLocaleDateString();
      
      setResult(cheatSheet);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Topic/Subject</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., World War II, Organic Chemistry"
            data-testid="input-topic"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Source Content</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes or textbook content here..."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <Button onClick={generate} disabled={loading || !topic.trim() || !text.trim()} data-testid="button-generate">
          {loading ? "Generating..." : "Generate Cheat Sheet"}
        </Button>

        {loading && <LoadingSpinner text="Creating cheat sheet..." />}

        {result && !loading && (
          <ResultDisplay title="Your Cheat Sheet">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg font-mono" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}

export function TopicExplainer() {
  const tool = getToolById("topic-explainer")!;
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("student");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const explanations: Record<string, Record<string, string>> = {
    student: {
      default: `Let me explain ${"{topic}"} in simple terms.\n\n${"{topic}"} is an important concept that you'll encounter in your studies. Here's what you need to know:\n\n1. **Basic Definition**: ${"{topic}"} refers to a fundamental idea or principle in this field.\n\n2. **Why It Matters**: Understanding ${"{topic}"} helps you connect different concepts and see the bigger picture.\n\n3. **Key Points to Remember**:\n   • This concept is often tested on exams\n   • Practice applying it to real-world examples\n   • Try to explain it in your own words\n\n4. **Common Mistakes to Avoid**:\n   • Don't confuse it with similar concepts\n   • Remember the context in which it applies\n\n5. **Study Tips**:\n   • Create flashcards for key terms\n   • Draw diagrams to visualize the concept\n   • Discuss it with classmates`
    },
    beginner: {
      default: `Here's a super simple explanation of ${"{topic}"}!\n\nImagine ${"{topic}"} like this: It's basically a way to describe or understand something important.\n\n🎯 **What is it?**\n${"{topic}"} is something you'll learn about that helps explain how things work.\n\n🤔 **Why should you care?**\nKnowing about ${"{topic}"} will help you understand bigger ideas later!\n\n📝 **Remember this:**\n• It's not as complicated as it sounds\n• Take it step by step\n• Ask questions if you're confused\n\n✨ **Fun fact:**\nOnce you understand ${"{topic}"}, you'll start seeing it everywhere!`
    },
    advanced: {
      default: `${"{topic}"}: A Comprehensive Analysis\n\n**Introduction**\n${"{topic}"} represents a sophisticated concept with far-reaching implications across multiple disciplines.\n\n**Theoretical Framework**\nThe study of ${"{topic}"} encompasses various theoretical approaches:\n• Historical development and evolution\n• Contemporary interpretations\n• Cross-disciplinary applications\n\n**Critical Analysis**\n1. Primary considerations in understanding ${"{topic}"}\n2. Secondary factors and variables\n3. Tertiary implications and extensions\n\n**Practical Applications**\n${"{topic}"} finds applications in:\n• Academic research\n• Professional practice\n• Real-world problem solving\n\n**Areas for Further Study**\n• Advanced theoretical frameworks\n• Empirical research directions\n• Interdisciplinary connections\n\n**Conclusion**\nMastery of ${"{topic}"} requires both theoretical understanding and practical application.`
    }
  };

  const explain = () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const template = explanations[level]?.default || explanations.student.default;
      const explanation = template.replace(/\{topic\}/g, topic);
      setResult(explanation);
      setLoading(false);
    });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <AIBadge />
        
        <div className="space-y-2">
          <Label>Topic to Explain</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, The French Revolution, Calculus"
            data-testid="input-topic"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Explanation Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-48" data-testid="select-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (ELI5)</SelectItem>
              <SelectItem value="student">Student Level</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={explain} disabled={loading || !topic.trim()} data-testid="button-explain">
          {loading ? "Explaining..." : "Explain Topic"}
        </Button>

        {loading && <LoadingSpinner text="Generating explanation..." />}

        {result && !loading && (
          <ResultDisplay title="Explanation">
            <div className="flex justify-end mb-2">
              <CopyButton text={result} />
            </div>
            <div className="whitespace-pre-wrap text-sm bg-background p-4 rounded-lg prose prose-sm dark:prose-invert max-w-none" data-testid="text-result">
              {result}
            </div>
          </ResultDisplay>
        )}
      </div>
    </ToolLayout>
  );
}
