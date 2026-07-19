import React from "react";
import { PracticeMode, LanguageOption, LevelOption, ScenarioOption, ChatMessage, GrammarCorrection, SessionPerformance } from "../types";
import { ArrowLeft, Send, Sparkles, Languages, CheckCircle2, AlertCircle, HelpCircle, RefreshCw, MessageSquare, Lightbulb } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import PerformanceFeedback from "./PerformanceFeedback";
import RoleTipsSidebar from "./RoleTipsSidebar";
import { getMockInterviewQuestion, getMockGrammarCorrection, getMockSessionPerformance, getMockSuggestions } from "../lib/mockSimulator";

interface ChatPracticeProps {
  language: LanguageOption;
  level: LevelOption;
  scenario: ScenarioOption;
  onBack: () => void;
}

export default function ChatPractice({ language, level, scenario, onBack }: ChatPracticeProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [activeFeedback, setActiveFeedback] = React.useState<GrammarCorrection | null>(null);
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [performance, setPerformance] = React.useState<SessionPerformance | null>(null);
  const [showTipsSidebar, setShowTipsSidebar] = React.useState(true);

  const handleEndSession = async () => {
    setIsAnalyzing(true);
    
    // Check if we are in local offline mode
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const data = getMockSessionPerformance(messages, language.name, level.name, scenario.title);
      setPerformance(data);
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch("/api/analyze-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: messages,
          language: language.name,
          level: level.name,
          scenario: scenario.title
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err) {
      console.warn("Error analyzing chat session. Falling back to local offline performance evaluator.", err);
      const data = getMockSessionPerformance(messages, language.name, level.name, scenario.title);
      setPerformance(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Find the last model message to trigger timer auto-restart on each new question
  const lastModelMessageId = React.useMemo(() => {
    const modelMsgs = messages.filter((m) => m.role === "model");
    return modelMsgs.length > 0 ? modelMsgs[modelMsgs.length - 1].id : null;
  }, [messages]);

  // Initialize with scenario's greeting / first message
  React.useEffect(() => {
    const initialGreeting = language.greeting + " " + scenario.initialPrompt;
    setMessages([
      {
        id: "welcome-msg",
        role: "model",
        content: initialGreeting,
        timestamp: new Date()
      }
    ]);
    setSuggestions(scenario.suggestions);
  }, [language, scenario]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
      loadingCorrection: true
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    // Prepare full conversation messages for the backend model context
    // We send up to the last 10 messages for historical memory
    const recentMessagesForAI = [...messages, userMsg].slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Trigger AI evaluation on user's message asynchronously in background
    triggerGrammarCorrection(userMsgId, textToSend);

    // Check if we are using local mock/offline mode
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const turnIndex = messages.filter(m => m.role === "user").length + 1;
      const nextQuestion = getMockInterviewQuestion(language.name, level.name, scenario.id, turnIndex, textToSend);
      
      const modelMsgId = `model-${Date.now()}`;
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content: nextQuestion,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, modelMsg]);
      setSuggestions(getMockSuggestions(nextQuestion));
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recentMessagesForAI,
          language: language.name,
          level: level.name,
          scenario: scenario.title
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get chat response");
      }

      const data = await response.json();
      
      const modelMsgId = `model-${Date.now()}`;
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content: data.text || "...",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Dynamically generate new talking points based on AI response
      generateNextSuggestions(data.text);

    } catch (error) {
      console.warn("Error in chat send. Switched to offline local simulator fallback.", error);
      
      // Automatic fallback for quota limits
      const turnIndex = messages.filter(m => m.role === "user").length + 1;
      const nextQuestion = getMockInterviewQuestion(language.name, level.name, scenario.id, turnIndex, textToSend);
      
      const modelMsgId = `model-${Date.now()}`;
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: "model",
        content: nextQuestion + " (Offline Simulator Mode)",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, modelMsg]);
      setSuggestions(getMockSuggestions(nextQuestion));
    } finally {
      setIsSending(false);
    }
  };

  const triggerGrammarCorrection = async (msgId: string, text: string) => {
    // Check if we are in local offline mode
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const correction = getMockGrammarCorrection(text, language.name, level.name);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, correction, loadingCorrection: false }
            : m
        )
      );
      return;
    }

    try {
      const response = await fetch("/api/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: language.name,
          level: level.name
        })
      });

      if (response.ok) {
        const data: GrammarCorrection = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, correction: data, loadingCorrection: false }
              : m
          )
        );
      } else {
        throw new Error("Failed to evaluate answer");
      }
    } catch (err) {
      console.warn("Error generating answer evaluation. Falling back to offline client-side corrector.", err);
      const correction = getMockGrammarCorrection(text, language.name, level.name);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, correction, loadingCorrection: false }
            : m
        )
      );
    }
  };

  const generateNextSuggestions = async (aiText: string) => {
    // Check if we are in local offline mode
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      setSuggestions(getMockSuggestions(aiText));
      return;
    }

    try {
      const prompt = `Based on this question or statement from a job interviewer in the field of ${language.name}:
"${aiText}"

Generate a short JSON array of 3 distinct, highly appropriate, professional talking points or starting statements (in English) that a candidate with seniority level ${level.name} could use to respond.
Keep them highly relevant, professional, and helpful. Respond ONLY with the JSON array of strings, e.g. ["talking point 1", "talking point 2", "talking point 3"]. Do not include markdown formatting or backticks.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          language: language.name,
          level: level.name,
          scenario: "Dynamic Suggestions Helper"
        })
      });

      if (response.ok) {
        const data = await response.json();
        const cleaned = data.text?.replace(/```json/g, "").replace(/```/g, "").trim();
        const list = JSON.parse(cleaned || "[]");
        if (Array.isArray(list) && list.length > 0) {
          setSuggestions(list);
        }
      }
    } catch (e) {
      console.warn("Failed to generate dynamic suggestions:", e);
    }
  };

  const translateMessage = async (msgId: string, text: string) => {
    // Toggle translation if already fetched
    const msg = messages.find((m) => m.id === msgId);
    if (msg?.translation) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, translation: undefined } : m
        )
      );
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, loadingTranslation: true } : m
      )
    );

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: "English"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, translation: data.translatedText, loadingTranslation: false }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Translation error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, loadingTranslation: false } : m
        )
      );
    }
  };

  const handleSuggestionClick = (phrase: string) => {
    setInputValue(phrase);
  };

  const handleShowFeedback = (msgId: string, correction: GrammarCorrection) => {
    if (activeFeedbackMsgId === msgId) {
      setActiveFeedback(null);
      setActiveFeedbackMsgId(null);
    } else {
      setActiveFeedback(correction);
      setActiveFeedbackMsgId(msgId);
      // Close the Cheatsheet to prevent overlap and squishing
      setShowTipsSidebar(false);
    }
  };

  if (performance) {
    return (
      <PerformanceFeedback
        performance={performance}
        onRestart={() => {
          setPerformance(null);
          onBack();
        }}
        languageName={language.name}
        levelName={level.name}
        scenarioTitle={scenario.title}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-100px)] min-h-[500px]" id="chat-practice-container">
      {/* Practice Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 flex-shrink-0" id="chat-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="back-to-setup-chat"
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Back to Setup"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl bg-slate-900/60 p-1 rounded-md" role="img" aria-label={language.name}>{language.flag}</span>
              <h1 className="font-bold text-white">{language.name} Interview</h1>
              <span className="text-[10px] px-2.5 py-0.5 font-bold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                {level.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Round: <span className="text-teal-400 font-semibold">{scenario.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-400 font-mono hidden lg:block">
            Interactive Chat Simulator
          </div>
          
          {/* Integrated Cheatsheet Sidebar Toggle */}
          <button
            type="button"
            id="chat-tips-toggle-btn"
            onClick={() => {
              const nextVal = !showTipsSidebar;
              setShowTipsSidebar(nextVal);
              if (nextVal) {
                // If opening cheatsheet, close the evaluation sidebar to prevent overlapping
                setActiveFeedback(null);
                setActiveFeedbackMsgId(null);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
              showTipsSidebar
                ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                : "bg-slate-800/40 border-white/5 text-slate-300 hover:text-white hover:border-white/10"
            }`}
            title="Toggle Interview Cheatsheet"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Cheatsheet</span>
          </button>

          <button
            type="button"
            id="chat-end-analyze-btn"
            onClick={handleEndSession}
            disabled={isAnalyzing}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                End & Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Work Area: Chat on left, evaluation pane on right (if open) */}
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden relative">
        
        {/* Messages Stream */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/10 backdrop-blur-xl rounded-2xl border border-white/5 p-4">
          {/* Response Countdown Timer */}
          <CountdownTimer
            resetTrigger={lastModelMessageId}
            className="mb-4 shrink-0"
            label="Response Countdown Timer"
          />

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 flex flex-col" id="messages-scroll-area">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  id={`chat-bubble-container-${msg.id}`}
                  className={`flex flex-col max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1 px-1">
                    <span>{isUser ? "You" : `Interviewer (${language.name})`}</span>
                    <span>•</span>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Bubble Body */}
                  <div
                    id={`chat-bubble-body-${msg.id}`}
                    className={`relative p-3.5 rounded-2xl text-sm leading-relaxed border transition-all ${
                      isUser
                        ? "bg-gradient-to-tr from-indigo-600/90 to-blue-700/90 text-slate-100 border-white/5 rounded-tr-none shadow-md shadow-indigo-500/5"
                        : "bg-slate-900/60 text-slate-200 border-white/5 rounded-tl-none shadow-md"
                    }`}
                  >
                    <div>{msg.content}</div>

                    {/* Translation Overlay */}
                    {msg.translation && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-xs text-teal-300 italic font-medium leading-relaxed">
                        🇬🇧 {msg.translation}
                      </div>
                    )}

                    {/* Bubble Action Controls */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {/* Translate button */}
                      <button
                        type="button"
                        id={`btn-translate-${msg.id}`}
                        onClick={() => translateMessage(msg.id, msg.content)}
                        className={`text-[10px] flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                          isUser 
                            ? "bg-white/10 hover:bg-white/20 text-slate-200" 
                            : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                        }`}
                      >
                        {msg.loadingTranslation ? (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Languages className="w-2.5 h-2.5" />
                        )}
                        {msg.translation ? "Hide Translation" : "Translate"}
                      </button>

                      {/* Answer Evaluation button (Only for user messages) */}
                      {isUser && (
                        <>
                          {msg.loadingCorrection && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 py-0.5 px-1 font-mono">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-teal-400" />
                              Evaluating response...
                            </span>
                          )}

                          {!msg.loadingCorrection && msg.correction && (
                            <button
                              type="button"
                              id={`btn-feedback-${msg.id}`}
                              onClick={() => handleShowFeedback(msg.id, msg.correction!)}
                              className={`text-[10px] flex items-center gap-1.5 py-1 px-2.5 rounded-lg font-semibold border cursor-pointer transition-all ${
                                activeFeedbackMsgId === msg.id
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : msg.correction.isPerfect
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                              }`}
                            >
                              {msg.correction.isPerfect ? (
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                              )}
                              {msg.correction.isPerfect ? "Response: Strong" : "Response: Coach Tips"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isSending && (
              <div className="flex flex-col max-w-[80%] self-start items-start" id="ai-typing-indicator">
                <div className="text-[10px] text-slate-400 font-mono mb-1">
                  Interviewer is preparing follow-up...
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Quick Talking Points */}
          {suggestions.length > 0 && (
            <div className="mb-3" id="quick-replies-panel">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                Interviewer Tips: Suggested Talking Points
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`suggestion-pill-${idx}`}
                    onClick={() => handleSuggestionClick(phrase)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-slate-300 hover:text-white rounded-xl py-2 px-4 transition-all text-left max-w-full truncate cursor-pointer shadow-sm"
                    title="Click to place in answer box"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <form
            id="chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex gap-2 items-center flex-shrink-0"
          >
            <input
              type="text"
              id="chat-message-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-md"
              disabled={isSending}
            />
            <button
              type="submit"
              id="chat-send-btn"
              disabled={!inputValue.trim() || isSending}
              className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:from-white/5 disabled:to-white/5 disabled:hover:from-white/5 disabled:text-slate-500 text-white p-3.5 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-teal-500/10"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

        {/* Right Sidebar Panel: Answer Assessment Detail */}
        {activeFeedback && (
          <>
            {/* Mobile Backdrop overlay to prevent confusion and click-through */}
            <div
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30"
              onClick={() => {
                setActiveFeedback(null);
                setActiveFeedbackMsgId(null);
              }}
            />
            <div
              id="grammar-analysis-sidebar"
              className="w-[290px] sm:w-[320px] bg-[#0c1017] text-slate-100 rounded-l-2xl md:rounded-2xl border-l md:border border-white/10 p-5 flex flex-col overflow-y-auto shadow-2xl transition-all duration-300 fixed md:relative inset-y-0 right-0 z-40 h-full max-h-full"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 flex-shrink-0">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  AI Interview Evaluation
                </h3>
                <button
                  type="button"
                  id="close-feedback-sidebar"
                  onClick={() => {
                    setActiveFeedback(null);
                    setActiveFeedbackMsgId(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs flex-1">
                {/* Corrected Text Block */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Refined & Polished Response
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-teal-300 font-medium leading-relaxed">
                    "{activeFeedback.correctedText}"
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Answer Assessment:
                  </span>
                  <span className={`font-semibold px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider ${activeFeedback.isPerfect ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {activeFeedback.isPerfect ? "Strong & Structured" : "Polishing Advised"}
                  </span>
                </div>

                {/* Correction Explanation */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Coaching Feedback
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/30 border border-white/5 p-3.5 rounded-xl font-light">
                    {activeFeedback.explanation}
                  </p>
                </div>

                {/* Alternative Suggestions */}
                {activeFeedback.suggestions && activeFeedback.suggestions.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Alternative Phrasings
                    </div>
                    <ul className="space-y-2">
                      {activeFeedback.suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/20 hover:bg-slate-900/40 text-slate-300 border border-white/5 hover:border-white/10 transition-all flex items-start gap-2 cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                          title="Click to copy to input box"
                        >
                          <span className="text-teal-400 font-bold mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <RoleTipsSidebar
          language={language}
          level={level}
          isOpen={showTipsSidebar}
          onToggle={() => setShowTipsSidebar(!showTipsSidebar)}
        />

      </div>
    </div>
  );
}
