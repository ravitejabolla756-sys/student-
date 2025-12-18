import { 
  Calculator, 
  Percent, 
  Wallet, 
  GraduationCap, 
  Calendar,
  Clock,
  Ruler,
  Image,
  Crop,
  Minimize2,
  FileImage,
  Palette,
  Eye,
  FileText,
  FilePlus,
  Scissors,
  ArrowUpDown,
  FileOutput,
  RotateCw,
  Info,
  StickyNote,
  CheckSquare,
  Timer,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Hourglass,
  Sparkles,
  FileEdit,
  AlignLeft,
  Wand2,
  SpellCheck,
  FileQuestion,
  ListChecks,
  Lightbulb,
  LucideIcon,
  Music,
  Video,
  Mic,
  Play,
  Volume2,
  Film,
  FileArchive,
  Settings2
} from "lucide-react";

export type ToolCategory = "calculators" | "image" | "pdf" | "student" | "ai" | "media";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
  path: string;
}

export const categoryInfo: Record<ToolCategory, { name: string; icon: LucideIcon; color: string }> = {
  calculators: { name: "Calculators", icon: Calculator, color: "bg-blue-500" },
  image: { name: "Image Tools", icon: Image, color: "bg-purple-500" },
  pdf: { name: "PDF Tools", icon: FileText, color: "bg-red-500" },
  student: { name: "Student Tools", icon: GraduationCap, color: "bg-green-500" },
  ai: { name: "AI Tools", icon: Sparkles, color: "bg-amber-500" },
  media: { name: "Media Tools", icon: Film, color: "bg-pink-500" },
};

export const tools: Tool[] = [
  // CALCULATORS (9)
  { id: "basic-calculator", name: "Basic Calculator", description: "Perform basic arithmetic operations", category: "calculators", icon: Calculator, keywords: ["math", "add", "subtract", "multiply", "divide"], path: "/tools/basic-calculator" },
  { id: "scientific-calculator", name: "Scientific Calculator", description: "Advanced mathematical calculations", category: "calculators", icon: Calculator, keywords: ["math", "sin", "cos", "tan", "log", "power", "scientific"], path: "/tools/scientific-calculator" },
  { id: "percentage-calculator", name: "Percentage Calculator", description: "Calculate percentages easily", category: "calculators", icon: Percent, keywords: ["percent", "ratio", "discount"], path: "/tools/percentage-calculator" },
  { id: "emi-calculator", name: "EMI Calculator", description: "Calculate loan EMI payments", category: "calculators", icon: Wallet, keywords: ["loan", "interest", "monthly", "payment", "finance"], path: "/tools/emi-calculator" },
  { id: "gpa-calculator", name: "GPA Calculator", description: "Calculate your Grade Point Average", category: "calculators", icon: GraduationCap, keywords: ["grades", "score", "academic", "semester"], path: "/tools/gpa-calculator" },
  { id: "cgpa-calculator", name: "CGPA Calculator", description: "Calculate Cumulative GPA", category: "calculators", icon: GraduationCap, keywords: ["grades", "cumulative", "overall", "academic"], path: "/tools/cgpa-calculator" },
  { id: "age-calculator", name: "Age Calculator", description: "Calculate age from date of birth", category: "calculators", icon: Calendar, keywords: ["birthday", "years", "months", "days"], path: "/tools/age-calculator" },
  { id: "unit-converter", name: "Unit Converter", description: "Convert between different units", category: "calculators", icon: Ruler, keywords: ["length", "weight", "temperature", "convert"], path: "/tools/unit-converter" },
  { id: "time-duration", name: "Time Duration Calculator", description: "Calculate time between dates", category: "calculators", icon: Clock, keywords: ["hours", "minutes", "difference", "duration"], path: "/tools/time-duration" },

  // IMAGE TOOLS (9)
  { id: "image-resizer", name: "Image Resizer", description: "Resize images to any dimension", category: "image", icon: Image, keywords: ["resize", "scale", "dimension", "photo"], path: "/tools/image-resizer" },
  { id: "image-cropper", name: "Image Cropper", description: "Crop images to your needs", category: "image", icon: Crop, keywords: ["crop", "trim", "cut", "photo"], path: "/tools/image-cropper" },
  { id: "image-compressor", name: "Image Compressor", description: "Compress images to reduce size", category: "image", icon: Minimize2, keywords: ["compress", "optimize", "reduce", "size"], path: "/tools/image-compressor" },
  { id: "advanced-compressor", name: "Advanced Image Compressor", description: "Compress to exact target size in KB", category: "image", icon: FileArchive, keywords: ["compress", "target", "kb", "size", "optimize"], path: "/tools/advanced-compressor" },
  { id: "image-quality", name: "Image Quality Controller", description: "Adjust image quality with precision", category: "image", icon: Settings2, keywords: ["quality", "adjust", "slider", "control"], path: "/tools/image-quality" },
  { id: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG images to PNG format", category: "image", icon: FileImage, keywords: ["convert", "format", "transparent"], path: "/tools/jpg-to-png" },
  { id: "png-to-jpg", name: "PNG to JPG", description: "Convert PNG images to JPG format", category: "image", icon: FileImage, keywords: ["convert", "format", "jpeg"], path: "/tools/png-to-jpg" },
  { id: "image-grayscale", name: "Image Grayscale", description: "Convert images to black and white", category: "image", icon: Palette, keywords: ["black", "white", "monochrome", "filter"], path: "/tools/image-grayscale" },
  { id: "image-preview", name: "Image Preview Tool", description: "Preview and analyze images", category: "image", icon: Eye, keywords: ["view", "analyze", "info", "metadata"], path: "/tools/image-preview" },

  // PDF TOOLS (11)
  { id: "pdf-merge", name: "PDF Merge", description: "Combine multiple PDFs into one", category: "pdf", icon: FilePlus, keywords: ["combine", "join", "merge", "document"], path: "/tools/pdf-merge" },
  { id: "pdf-split", name: "PDF Split", description: "Split PDF into multiple files", category: "pdf", icon: Scissors, keywords: ["separate", "divide", "extract"], path: "/tools/pdf-split" },
  { id: "pdf-reorder", name: "PDF Page Reorder", description: "Rearrange pages in a PDF", category: "pdf", icon: ArrowUpDown, keywords: ["arrange", "order", "pages", "sort"], path: "/tools/pdf-reorder" },
  { id: "images-to-pdf", name: "Images to PDF", description: "Convert images to PDF document", category: "pdf", icon: FileImage, keywords: ["convert", "create", "photos"], path: "/tools/images-to-pdf" },
  { id: "pdf-viewer", name: "PDF Viewer", description: "View PDF documents online", category: "pdf", icon: Eye, keywords: ["view", "read", "open"], path: "/tools/pdf-viewer" },
  { id: "pdf-extract", name: "PDF Page Extract", description: "Extract specific pages from PDF", category: "pdf", icon: FileOutput, keywords: ["extract", "pages", "select"], path: "/tools/pdf-extract" },
  { id: "pdf-rotate", name: "PDF Rotate", description: "Rotate PDF pages", category: "pdf", icon: RotateCw, keywords: ["rotate", "orientation", "turn"], path: "/tools/pdf-rotate" },
  { id: "pdf-metadata", name: "PDF Metadata Viewer", description: "View PDF document information", category: "pdf", icon: Info, keywords: ["info", "properties", "details"], path: "/tools/pdf-metadata" },
  { id: "pdf-compressor", name: "PDF Compressor", description: "Reduce PDF file size", category: "pdf", icon: Minimize2, keywords: ["compress", "reduce", "size", "optimize"], path: "/tools/pdf-compressor" },
  { id: "pdf-page-extractor", name: "PDF Page Extractor", description: "Extract specific page ranges from PDF", category: "pdf", icon: FileOutput, keywords: ["extract", "pages", "range", "select"], path: "/tools/pdf-page-extractor" },
  { id: "pdf-page-reorder", name: "PDF Page Reorder Tool", description: "Drag and drop to reorder PDF pages", category: "pdf", icon: ArrowUpDown, keywords: ["reorder", "arrange", "drag", "drop", "sort"], path: "/tools/pdf-page-reorder" },

  // MEDIA TOOLS (7)
  { id: "audio-compressor", name: "Audio Compressor", description: "Compress audio files to reduce size", category: "media", icon: Volume2, keywords: ["audio", "compress", "mp3", "reduce", "size"], path: "/tools/audio-compressor" },
  { id: "audio-trim", name: "Audio Trimmer", description: "Trim audio files to specific duration", category: "media", icon: Music, keywords: ["audio", "trim", "cut", "clip"], path: "/tools/audio-trim" },
  { id: "audio-speed", name: "Audio Speed Changer", description: "Change audio playback speed", category: "media", icon: Play, keywords: ["audio", "speed", "tempo", "fast", "slow"], path: "/tools/audio-speed" },
  { id: "audio-converter", name: "Audio Converter", description: "Convert between audio formats", category: "media", icon: Mic, keywords: ["audio", "convert", "mp3", "wav", "aac"], path: "/tools/audio-converter" },
  { id: "video-compressor", name: "Video Compressor", description: "Compress video files to reduce size", category: "media", icon: Film, keywords: ["video", "compress", "reduce", "size"], path: "/tools/video-compressor" },
  { id: "video-trim", name: "Video Trimmer", description: "Trim video files to specific duration", category: "media", icon: Video, keywords: ["video", "trim", "cut", "clip"], path: "/tools/video-trim" },
  { id: "video-to-audio", name: "Video to Audio Extractor", description: "Extract audio from video files", category: "media", icon: Music, keywords: ["video", "audio", "extract", "mp3"], path: "/tools/video-to-audio" },

  // STUDENT TOOLS (7)
  { id: "notes-manager", name: "Notes Manager", description: "Create and organize your notes", category: "student", icon: StickyNote, keywords: ["notes", "write", "organize", "study"], path: "/tools/notes-manager" },
  { id: "todo-list", name: "To-Do List", description: "Manage your tasks and to-dos", category: "student", icon: CheckSquare, keywords: ["tasks", "checklist", "organize", "productivity"], path: "/tools/todo-list" },
  { id: "pomodoro-timer", name: "Pomodoro Timer", description: "Focus with timed work sessions", category: "student", icon: Timer, keywords: ["focus", "productivity", "break", "study"], path: "/tools/pomodoro-timer" },
  { id: "study-planner", name: "Study Planner", description: "Plan your study schedule", category: "student", icon: BookOpen, keywords: ["schedule", "plan", "organize", "calendar"], path: "/tools/study-planner" },
  { id: "homework-tracker", name: "Homework Tracker", description: "Track assignments and deadlines", category: "student", icon: ClipboardList, keywords: ["assignments", "deadline", "track", "homework"], path: "/tools/homework-tracker" },
  { id: "timetable-generator", name: "Timetable Generator", description: "Create your class timetable", category: "student", icon: CalendarDays, keywords: ["schedule", "classes", "weekly", "timetable"], path: "/tools/timetable-generator" },
  { id: "exam-countdown", name: "Exam Countdown Timer", description: "Count down to your exams", category: "student", icon: Hourglass, keywords: ["exam", "countdown", "deadline", "timer"], path: "/tools/exam-countdown" },

  // AI-STYLE TOOLS (8)
  { id: "essay-generator", name: "Essay Generator", description: "Generate essay outlines and content", category: "ai", icon: FileEdit, keywords: ["write", "essay", "content", "generate"], path: "/tools/essay-generator" },
  { id: "text-summarizer", name: "Text Summarizer", description: "Summarize long texts quickly", category: "ai", icon: AlignLeft, keywords: ["summary", "shorten", "condense", "brief"], path: "/tools/text-summarizer" },
  { id: "paraphraser", name: "Paraphraser", description: "Rephrase text in different ways", category: "ai", icon: Wand2, keywords: ["rewrite", "rephrase", "paraphrase"], path: "/tools/paraphraser" },
  { id: "grammar-checker", name: "Grammar Checker", description: "Check and fix grammar errors", category: "ai", icon: SpellCheck, keywords: ["grammar", "spelling", "correct", "proofread"], path: "/tools/grammar-checker" },
  { id: "notes-generator", name: "Notes Generator", description: "Generate study notes from text", category: "ai", icon: StickyNote, keywords: ["notes", "study", "generate", "key points"], path: "/tools/notes-generator" },
  { id: "question-generator", name: "Question Generator", description: "Generate questions from content", category: "ai", icon: FileQuestion, keywords: ["questions", "quiz", "test", "practice"], path: "/tools/question-generator" },
  { id: "cheatsheet-generator", name: "Cheat Sheet Generator", description: "Create quick reference sheets", category: "ai", icon: ListChecks, keywords: ["cheatsheet", "reference", "summary", "quick"], path: "/tools/cheatsheet-generator" },
  { id: "topic-explainer", name: "Topic Explainer", description: "Get simple explanations of topics", category: "ai", icon: Lightbulb, keywords: ["explain", "understand", "learn", "topic"], path: "/tools/topic-explainer" },
];

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter(tool => tool.category === category);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return tools;
  
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id);
}
