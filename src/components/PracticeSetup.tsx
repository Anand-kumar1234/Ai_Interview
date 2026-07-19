import React from "react";
import { PracticeMode, LanguageOption, LevelOption, ScenarioOption } from "../types";
import { LANGUAGES, LEVELS } from "../data";
import { MessageSquare, Mic, Volume2, Briefcase, GraduationCap, Compass, Sparkles, UserCheck } from "lucide-react";
import DiagnosticsPanel from "./DiagnosticsPanel";

interface PracticeSetupProps {
  onStart: (config: {
    mode: PracticeMode;
    language: LanguageOption;
    level: LevelOption;
    scenario: ScenarioOption;
    voiceName: string;
  }) => void;
}

const getScenarioEmoji = (id: string): string => {
  const lowercaseId = id.toLowerCase();
  if (lowercaseId.includes("coding")) return "💻";
  if (lowercaseId.includes("design")) return "🏗️";
  if (lowercaseId.includes("behavioral")) return "🤝";
  if (lowercaseId.includes("conflict") || lowercaseId.includes("mediation")) return "👥";
  if (lowercaseId.includes("underperformance")) return "📉";
  if (lowercaseId.includes("stakeholder")) return "👔";
  if (lowercaseId.includes("prioritization")) return "🎯";
  if (lowercaseId.includes("metrics") || lowercaseId.includes("ab_") || lowercaseId.includes("experimentation")) return "📊";
  if (lowercaseId.includes("ml_") || lowercaseId.includes("ai")) return "🤖";
  if (lowercaseId.includes("pipeline")) return "⚙️";
  if (lowercaseId.includes("pitch") || lowercaseId.includes("negotiation")) return "💰";
  if (lowercaseId.includes("churn") || lowercaseId.includes("crisis")) return "🚨";
  if (lowercaseId.includes("build_vs_buy")) return "🏢";
  if (lowercaseId.includes("budget") || lowercaseId.includes("cuts")) return "💸";
  if (lowercaseId.includes("recruitment") || lowercaseId.includes("talent")) return "👥";
  return "💼";
};

export default function PracticeSetup({ onStart }: PracticeSetupProps) {
  const [selectedMode, setSelectedMode] = React.useState<PracticeMode>("chat");
  const [selectedLang, setSelectedLang] = React.useState<LanguageOption>(LANGUAGES[0]);
  const [selectedLevel, setSelectedLevel] = React.useState<LevelOption>(LEVELS[1]); // default Mid-Level
  const [selectedScenario, setSelectedScenario] = React.useState<ScenarioOption>(LANGUAGES[0].scenarios[0]);
  const [selectedVoice, setSelectedVoice] = React.useState<string>("Zephyr");

  // Keep scenario synced when job domain changes
  React.useEffect(() => {
    const match = selectedLang.scenarios.find(s => s.id === selectedScenario.id) || selectedLang.scenarios[0];
    setSelectedScenario(match);
  }, [selectedLang]);

  const handleStart = () => {
    onStart({
      mode: selectedMode,
      language: selectedLang,
      level: selectedLevel,
      scenario: selectedScenario,
      voiceName: selectedVoice
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="practice-setup-container">
      {/* Hero Welcome */}
      <div className="text-center mb-10" id="setup-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-teal-400 text-xs font-semibold mb-4 border border-white/10 shadow-lg shadow-teal-500/5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          AI-Powered Live Interview Simulator
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          AuraLingo Interview Coach
        </h1>
        <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Simulate highly realistic job interviews under pressure. Select your industry, customize your seniority level, and receive real-time professional critiques, phrasing alternatives, and structured feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Modes & Core settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Practice Mode */}
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl" id="mode-selection">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
              <Compass className="w-5 h-5 text-teal-400" />
              1. Choose Interview Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chat Mode Card */}
              <button
                type="button"
                id="mode-chat-button"
                onClick={() => setSelectedMode("chat")}
                className={`flex items-start text-left gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedMode === "chat"
                    ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10"
                    : "border-white/5 hover:border-white/10 hover:bg-slate-900/40 bg-slate-900/20"
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedMode === "chat" ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-400"}`}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Interactive Chat Interview</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-light">
                    Text-based simulation with instant professional evaluations, phrasing enhancements, and constructive STAR tips.
                  </p>
                </div>
              </button>

              {/* Voice Mode Card */}
              <button
                type="button"
                id="mode-voice-button"
                onClick={() => setSelectedMode("voice")}
                className={`flex items-start text-left gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedMode === "voice"
                    ? "border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10"
                    : "border-white/5 hover:border-white/10 hover:bg-slate-900/40 bg-slate-900/20"
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedMode === "voice" ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-400"}`}>
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-time Voice Interview</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-light">
                    High-fidelity live voice conversation with the Gemini Live API. Speak naturally, listen, and view automatic speech-to-text corrections.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Job Domain Selection */}
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl" id="language-selection">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
              <Briefcase className="w-5 h-5 text-teal-400" />
              2. Select Job Role & Domain
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  id={`lang-button-${lang.code.toLowerCase()}`}
                  onClick={() => setSelectedLang(lang)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedLang.code === lang.code
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-white"
                      : "border-white/5 hover:border-white/10 bg-slate-900/20 hover:bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <span className="text-2xl bg-slate-900/50 p-2 rounded-lg border border-white/10 block leading-none shrink-0" role="img" aria-label={lang.name}>{lang.flag}</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-sm font-semibold text-white truncate">{lang.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{lang.nativeName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl" id="level-selection">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-4">
              <GraduationCap className="w-5 h-5 text-teal-400" />
              3. Select Candidate Seniority
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVELS.map((level) => (
                <button
                  key={level.code}
                  type="button"
                  id={`level-button-${level.code.toLowerCase()}`}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selectedLevel.code === level.code
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-white/5 hover:border-white/10 bg-slate-900/20 hover:bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <div className="font-semibold text-sm text-white">{level.name}</div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-light flex-1">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Scenario & Voice selection & Actions */}
        <div className="space-y-6">
          
          {/* Scenario Picker */}
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col" id="scenario-selection">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-2">
              <UserCheck className="w-5 h-5 text-teal-400" />
              4. Choose Interview Round
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-light">
              Pick a targeted scenario to evaluate specific skills.
            </p>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" id="scenarios-list">
              {selectedLang.scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  id={`scenario-button-${scenario.id}`}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedScenario.id === scenario.id
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-white/5 hover:border-white/10 bg-slate-900/20 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="mt-0.5 text-lg flex-shrink-0 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                    {getScenarioEmoji(scenario.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{scenario.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-light mt-1 line-clamp-2">{scenario.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice configuration if Voice mode is selected */}
          {selectedMode === "voice" && (
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl" id="voice-selection">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5 mb-3">
                <Volume2 className="w-5 h-5 text-teal-400" />
                5. Interviewer Voice
              </h2>
              <div className="space-y-2">
                {selectedLang.voices.map((voice) => (
                  <button
                    key={voice.name}
                    type="button"
                    id={`voice-button-${voice.name.toLowerCase()}`}
                    onClick={() => setSelectedVoice(voice.name)}
                    className={`w-full flex items-center justify-between p-3 px-4 rounded-xl border transition-all cursor-pointer ${
                      selectedVoice === voice.name
                        ? "border-teal-500 bg-teal-500/10 font-medium text-teal-300"
                        : "border-white/5 hover:border-white/10 text-slate-300 bg-slate-900/20 hover:bg-slate-900/40"
                    }`}
                  >
                    <span className="text-sm font-medium">{voice.label}</span>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-300 bg-slate-800 border border-white/5 rounded-full px-2 py-0.5 uppercase">
                      {voice.gender}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ready Button */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col gap-4 shadow-xl">
            <div className="text-xs text-slate-300 leading-relaxed font-light">
              You will practice <span className="font-semibold text-white">{selectedLang.name}</span> as a <span className="font-semibold text-white">{selectedLevel.name}</span> candidate doing a <span className="font-semibold text-white">"{selectedScenario.title}"</span> simulation.
            </div>

            <button
              type="button"
              id="start-practice-btn"
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer group active:scale-98"
            >
              Start Interview
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </div>

      {/* Diagnostics Studio */}
      <div className="mt-8" id="setup-diagnostics-container">
        <DiagnosticsPanel />
      </div>
    </div>
  );
}
