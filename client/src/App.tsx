import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import { About, Privacy, Terms, Help, Settings } from "@/pages/static-pages";

import {
  BasicCalculator,
  ScientificCalculator,
  PercentageCalculator,
  EMICalculator,
  GPACalculator,
  CGPACalculator,
  AgeCalculator,
  UnitConverter,
  TimeDurationCalculator
} from "@/pages/tools/calculators";

import {
  ImageResizer,
  ImageCropper,
  ImageCompressor,
  JpgToPng,
  PngToJpg,
  ImageGrayscale,
  ImagePreview
} from "@/pages/tools/image-tools";

import {
  PDFMerge,
  PDFSplit,
  PDFReorder,
  ImagesToPDF,
  PDFViewer,
  PDFExtract,
  PDFRotate,
  PDFMetadata
} from "@/pages/tools/pdf-tools";

import {
  NotesManager,
  TodoList,
  PomodoroTimer,
  StudyPlanner,
  HomeworkTracker,
  TimetableGenerator,
  ExamCountdownTimer
} from "@/pages/tools/student-tools";

import {
  EssayGenerator,
  TextSummarizer,
  Paraphraser,
  GrammarChecker,
  NotesGenerator,
  QuestionGenerator,
  CheatSheetGenerator,
  TopicExplainer
} from "@/pages/tools/ai-tools";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/help" component={Help} />
      <Route path="/settings" component={Settings} />

      <Route path="/tools/basic-calculator" component={BasicCalculator} />
      <Route path="/tools/scientific-calculator" component={ScientificCalculator} />
      <Route path="/tools/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tools/emi-calculator" component={EMICalculator} />
      <Route path="/tools/gpa-calculator" component={GPACalculator} />
      <Route path="/tools/cgpa-calculator" component={CGPACalculator} />
      <Route path="/tools/age-calculator" component={AgeCalculator} />
      <Route path="/tools/unit-converter" component={UnitConverter} />
      <Route path="/tools/time-duration" component={TimeDurationCalculator} />

      <Route path="/tools/image-resizer" component={ImageResizer} />
      <Route path="/tools/image-cropper" component={ImageCropper} />
      <Route path="/tools/image-compressor" component={ImageCompressor} />
      <Route path="/tools/jpg-to-png" component={JpgToPng} />
      <Route path="/tools/png-to-jpg" component={PngToJpg} />
      <Route path="/tools/image-grayscale" component={ImageGrayscale} />
      <Route path="/tools/image-preview" component={ImagePreview} />

      <Route path="/tools/pdf-merge" component={PDFMerge} />
      <Route path="/tools/pdf-split" component={PDFSplit} />
      <Route path="/tools/pdf-reorder" component={PDFReorder} />
      <Route path="/tools/images-to-pdf" component={ImagesToPDF} />
      <Route path="/tools/pdf-viewer" component={PDFViewer} />
      <Route path="/tools/pdf-extract" component={PDFExtract} />
      <Route path="/tools/pdf-rotate" component={PDFRotate} />
      <Route path="/tools/pdf-metadata" component={PDFMetadata} />

      <Route path="/tools/notes-manager" component={NotesManager} />
      <Route path="/tools/todo-list" component={TodoList} />
      <Route path="/tools/pomodoro-timer" component={PomodoroTimer} />
      <Route path="/tools/study-planner" component={StudyPlanner} />
      <Route path="/tools/homework-tracker" component={HomeworkTracker} />
      <Route path="/tools/timetable-generator" component={TimetableGenerator} />
      <Route path="/tools/exam-countdown" component={ExamCountdownTimer} />

      <Route path="/tools/essay-generator" component={EssayGenerator} />
      <Route path="/tools/text-summarizer" component={TextSummarizer} />
      <Route path="/tools/paraphraser" component={Paraphraser} />
      <Route path="/tools/grammar-checker" component={GrammarChecker} />
      <Route path="/tools/notes-generator" component={NotesGenerator} />
      <Route path="/tools/question-generator" component={QuestionGenerator} />
      <Route path="/tools/cheatsheet-generator" component={CheatSheetGenerator} />
      <Route path="/tools/topic-explainer" component={TopicExplainer} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
