import React from "react";
import { PracticeMode, LanguageOption, LevelOption, ScenarioOption } from "./types";
import PracticeSetup from "./components/PracticeSetup";
import ChatPractice from "./components/ChatPractice";
import VoicePractice from "./components/VoicePractice";
import { Sparkles, Briefcase, Heart } from "lucide-react";

interface ActiveSession {
  mode: PracticeMode;
  language: LanguageOption;
  level: LevelOption;
  scenario: ScenarioOption;
  voiceName: string;
}

export default function App() {
  const [activeSession, setActiveSession] = React.useState<ActiveSession | null>(null);

  const handleStartSession = (config: ActiveSession) => {
    setActiveSession(config);
  };

  const handleBackToSetup = () => {
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans antialiased flex flex-col relative overflow-hidden" id="app-root-wrapper">
      {/* Background Atmosphere Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* App Header */}
      <header className="bg-slate-950/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shrink-0" id="app-global-header">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToSetup}>
            <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/15 border border-white/10">
              <span className="font-extrabold text-white text-xl">I</span>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white text-lg">AuraLingo Coach</span>
              <span className="text-[10px] block text-slate-400 font-mono -mt-0.5 uppercase tracking-widest font-bold">AI Interview Prep</span>
            </div>
          </div>

          {/* Secondary Header stats or shortcuts */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/5 text-xs font-semibold text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-teal-400" />
              7 Career Domains
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative z-10" id="app-main-content">
        {!activeSession ? (
          <div className="py-6 flex-1 flex items-center">
            <PracticeSetup onStart={handleStartSession} />
          </div>
        ) : activeSession.mode === "chat" ? (
          <div className="flex-1">
            <ChatPractice
              language={activeSession.language}
              level={activeSession.level}
              scenario={activeSession.scenario}
              onBack={handleBackToSetup}
            />
          </div>
        ) : (
          <div className="flex-1">
            <VoicePractice
              language={activeSession.language}
              level={activeSession.level}
              scenario={activeSession.scenario}
              voiceName={activeSession.voiceName}
              onBack={handleBackToSetup}
            />
          </div>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="bg-slate-950/20 border-t border-white/5 py-4 shrink-0 relative z-10" id="app-global-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 font-mono">
          <div>
            &copy; 2026 AuraLingo Coach. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for live mock interview simulation.
          </div>
        </div>
      </footer>
    </div>
  );
}
