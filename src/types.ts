export type PracticeMode = "chat" | "voice";

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
  voices: { name: string; label: string; gender: "Male" | "Female" }[];
  scenarios: ScenarioOption[];
  greeting: string;
}

export interface LevelOption {
  code: "Beginner" | "Intermediate" | "Advanced";
  name: string;
  desc: string;
}

export interface ScenarioOption {
  id: string;
  title: string;
  icon: string;
  description: string;
  initialPrompt: string; // Used to seed the first message
  suggestions: string[]; // Standard suggestions to start
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  translation?: string;
  correction?: GrammarCorrection;
  loadingTranslation?: boolean;
  loadingCorrection?: boolean;
}

export interface GrammarCorrection {
  correctedText: string;
  isPerfect: boolean;
  explanation: string;
  suggestions: string[];
}

export interface LiveTranscriptItem {
  id: string;
  speaker: "user" | "model";
  text: string;
  timestamp: Date;
  translation?: string;
  correction?: GrammarCorrection;
  loadingTranslation?: boolean;
  loadingCorrection?: boolean;
}

export interface SessionPerformance {
  overallScore: number;
  metrics: { subject: string; score: number; fullMark: number }[];
  strengths: string[];
  weaknesses: string[];
  coachingFeedback: string;
}

