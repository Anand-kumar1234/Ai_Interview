import React from "react";
import { LanguageOption, LevelOption, ScenarioOption, LiveTranscriptItem, GrammarCorrection, SessionPerformance } from "../types";
import { ArrowLeft, Mic, MicOff, Volume2, Sparkles, RefreshCw, AlertCircle, Play, Square, Settings, CheckCircle2, Languages, MessageSquare, HelpCircle, Lightbulb } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import PerformanceFeedback from "./PerformanceFeedback";
import RoleTipsSidebar from "./RoleTipsSidebar";
import { getMockInterviewQuestion, getMockGrammarCorrection, getMockSessionPerformance } from "../lib/mockSimulator";

interface VoicePracticeProps {
  language: LanguageOption;
  level: LevelOption;
  scenario: ScenarioOption;
  voiceName: string;
  onBack: () => void;
}

export default function VoicePractice({ language, level, scenario, voiceName, onBack }: VoicePracticeProps) {
  const [status, setStatus] = React.useState<"idle" | "connecting" | "connected" | "session_closed" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isMuted, setIsMuted] = React.useState(false);
  const [transcripts, setTranscripts] = React.useState<LiveTranscriptItem[]>([]);
  const [aiIsSpeaking, setAiIsSpeaking] = React.useState(false);
  const [userIsSpeaking, setUserIsSpeaking] = React.useState(false);
  const [activeFeedback, setActiveFeedback] = React.useState<GrammarCorrection | null>(null);
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [performance, setPerformance] = React.useState<SessionPerformance | null>(null);
  const [showTipsSidebar, setShowTipsSidebar] = React.useState(true);
  const [usingOfflineFallback, setUsingOfflineFallback] = React.useState(false);

  const handleEndSession = async () => {
    // 1. Clean up resources immediately to stop voice streaming & release mic
    cleanupAudioAndWS();
    setStatus("session_closed");

    // 2. Perform AI analysis
    setIsAnalyzing(true);
    
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const data = getMockSessionPerformance(transcripts, language.name, level.name, scenario.title);
      setPerformance(data);
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch("/api/analyze-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: transcripts,
          language: language.name,
          level: level.code,
          scenario: scenario.title
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPerformance(data);
      } else {
        throw new Error("Voice analysis failed");
      }
    } catch (err) {
      console.warn("Voice analysis failed. Falling back to local offline performance evaluator.", err);
      const data = getMockSessionPerformance(transcripts, language.name, level.name, scenario.title);
      setPerformance(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Memoize the last model transcript ID to auto-restart the countdown timer on a new question
  const lastModelTranscriptId = React.useMemo(() => {
    const modelTranscripts = transcripts.filter((t) => t.speaker === "model");
    return modelTranscripts.length > 0 ? modelTranscripts[modelTranscripts.length - 1].id : null;
  }, [transcripts]);

  // References to keep track of Audio & WebSocket state across renders
  const wsRef = React.useRef<WebSocket | null>(null);
  const inputAudioCtxRef = React.useRef<AudioContext | null>(null);
  const outputAudioCtxRef = React.useRef<AudioContext | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);
  
  // Track start times for gapless chunk scheduling
  const nextStartTimeRef = React.useRef<number>(0);
  // List of active audio sources for interruption handling
  const activeSourcesRef = React.useRef<AudioBufferSourceNode[]>([]);
  
  // Track active correction timeout to debounce automatic grammar checks
  const correctionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Keep tracks of mutable states inside callbacks using refs to prevent stale closure bugs
  const isMutedRef = React.useRef(false);
  React.useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Handle cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupAudioAndWS();
    };
  }, []);

  const cleanupAudioAndWS = () => {
    console.log("Cleaning up voice audio and websocket resources");
    
    shouldBeListeningRef.current = false;
    isListeningRef.current = false;

    // Stop playing audio
    stopAllAudioPlayback();

    // Stop speech synthesis & recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.error("Error closing WebSocket on cleanup:", e);
      }
      wsRef.current = null;
    }

    // Stop mic input stream
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }
  };

  const stopAllAudioPlayback = () => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // already stopped
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setAiIsSpeaking(false);
  };

  const floatTo16BitPCM = (floatSamples: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(floatSamples.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < floatSamples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, floatSamples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const pcmToBase64 = (floatSamples: Float32Array): string => {
    const pcmBuffer = floatTo16BitPCM(floatSamples);
    const bytes = new Uint8Array(pcmBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToFloat32PCM = (base64: string): Float32Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  };

  const playAudioChunk = (audioCtx: AudioContext, base64: string) => {
    const float32Data = base64ToFloat32PCM(base64);
    if (float32Data.length === 0) return;

    // Output sample rate is 24000 Hz for Gemini Live model audio
    const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    // Precise scheduling for gapless audio
    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.08; // slightly offset from current to prevent initial overlap
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    // Track active sources so we can stop them immediately on interruptions
    activeSourcesRef.current.push(source);
    setAiIsSpeaking(true);

    // Cleanup reference after audio finishes playing
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setAiIsSpeaking(false);
      }
    };
  };

  const startVoiceConnection = async () => {
    cleanupAudioAndWS();
    setStatus("connecting");
    setErrorMessage("");
    setTranscripts([]);
    setUsingOfflineFallback(false);

    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      startMockVoiceSession();
      return;
    }

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. Setup audio contexts
      // Input capture rate is 16000 Hz
      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;

      // Playback rate is 24000 Hz
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;

      // 3. Setup WebSocket connection
      const isSecure = location.protocol === "https:";
      const wsUrl = `${isSecure ? "wss:" : "ws:"}//${location.host}/ws/live?language=${encodeURIComponent(language.name)}&level=${encodeURIComponent(level.code)}&scenario=${encodeURIComponent(scenario.title)}&voice=${encodeURIComponent(voiceName)}`;
      console.log("Connecting to WS:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to backend voice bridge");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "status" && msg.status === "connected") {
            setStatus("connected");
            
            // 4. Connect microphone processor only after WebSocket and session is ready
            const source = inputAudioCtx.createMediaStreamSource(stream);
            const processor = inputAudioCtx.createScriptProcessor(2048, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(inputAudioCtx.destination);

            processor.onaudioprocess = (e) => {
              if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) {
                setUserIsSpeaking(false);
                return;
              }

              const inputChannel = e.inputBuffer.getChannelData(0);
              
              // Measure volume amplitude to update speaker animation wave
              let sum = 0;
              for (let i = 0; i < inputChannel.length; i++) {
                sum += inputChannel[i] * inputChannel[i];
              }
              const rms = Math.sqrt(sum / inputChannel.length);
              setUserIsSpeaking(rms > 0.015); // threshold for speaking

              // Send audio PCM chunk as base64 to WebSocket
              const base64Audio = pcmToBase64(inputChannel);
              ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
            };
          }

          if (msg.type === "audio" && msg.audio) {
            playAudioChunk(outputAudioCtx, msg.audio);
          }

          if (msg.type === "interrupted") {
            console.log("AI was interrupted. Stopping voice response.");
            stopAllAudioPlayback();
          }

          // Handle real-time speech translation/transcriptions
          if (msg.type === "userText" && msg.text) {
            appendTranscript("user", msg.text);
          }

          if (msg.type === "modelText" && msg.text) {
            appendTranscript("model", msg.text);
          }

          if (msg.type === "status" && msg.status === "session_closed") {
            setStatus("session_closed");
          }

          if (msg.type === "error") {
            console.warn("Speech bridge error from server. Falling back to native offline voice mode:", msg.message);
            cleanupAudioAndWS();
            setUsingOfflineFallback(true);
            startMockVoiceSession();
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (e) => {
        console.warn("WebSocket connection error. Gracefully falling back to native offline voice mode:", e);
        cleanupAudioAndWS();
        setUsingOfflineFallback(true);
        startMockVoiceSession();
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setStatus((prev) => (prev === "connecting" || prev === "connected" ? "session_closed" : prev));
      };

    } catch (err: any) {
      console.warn("WebSocket or Live API connection error. Switched to offline simulation fallback.", err);
      setUsingOfflineFallback(true);
      // Auto fallback to mock voice session on connection errors!
      startMockVoiceSession();
    }
  };

  const recognitionRef = React.useRef<any>(null);
  const shouldBeListeningRef = React.useRef<boolean>(false);
  const isListeningRef = React.useRef<boolean>(false);

  const startMockVoiceSession = async () => {
    setStatus("connected");
    shouldBeListeningRef.current = true;
    
    // Initial greeting
    const initialText = language.greeting + " " + scenario.initialPrompt;
    setTranscripts([
      {
        id: "welcome-voice-msg",
        speaker: "model",
        text: initialText,
        timestamp: new Date()
      }
    ]);

    // Speak initial greeting
    speakMockText(initialText);

    // Setup speech recognition
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false; // Turn off continuous for segmented single-turn processing
    rec.interimResults = true;
    rec.lang = "en-US";
    recognitionRef.current = rec;

    rec.onstart = () => {
      isListeningRef.current = true;
      console.log("Mock speech recognition engine ready & listening...");
    };

    rec.onresult = (event: any) => {
      if (isMutedRef.current) return;
      
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const trans = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += trans;
        } else {
          interim += trans;
        }
      }

      setUserIsSpeaking(interim.length > 0);

      if (final) {
        // Speech is complete
        appendTranscript("user", final);
        setUserIsSpeaking(false);
        
        // Pause speech recognition while AI is generating and speaking
        shouldBeListeningRef.current = false;
        try {
          rec.stop();
        } catch (e) {}
        
        // Respond as AI after a short thinking delay
        setTimeout(async () => {
          setTranscripts((prev) => {
            const userMsgs = prev.filter(t => t.speaker === "user");
            const turnIndex = userMsgs.length;
            const nextQuestion = getMockInterviewQuestion(language.name, level.name, scenario.id, turnIndex, final);
            
            appendTranscript("model", nextQuestion);
            speakMockText(nextQuestion);
            return prev;
          });
        }, 1200);
      }
    };

    rec.onerror = (e: any) => {
      console.log("Mock speech recognition error:", e.error);
      if (e.error === "aborted") {
        // Ignorable manual/automatic shutdown
        return;
      }
      if (e.error === "not-allowed") {
        setErrorMessage("Microphone access is restricted or not allowed in this window context.");
        setStatus("error");
      }
    };

    rec.onend = () => {
      isListeningRef.current = false;
      console.log("Mock speech recognition turn complete.");
      if (shouldBeListeningRef.current && !isMutedRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.log("Failed to restart speech recognition:", err);
        }
      }
    };

    try {
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const speakMockText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    
    // Attempt to match selected interviewer voice with an available browser voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      if (voiceName === "Charon" || voiceName === "Puck" || voiceName === "Fenrir") {
        return name.includes("male") || name.includes("david") || name.includes("microsoft") || name.includes("google us english");
      } else {
        return name.includes("female") || name.includes("zira") || name.includes("google uk english");
      }
    }) || voices[0];
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setAiIsSpeaking(true);
      shouldBeListeningRef.current = false;
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };

    utterance.onend = () => {
      setAiIsSpeaking(false);
      // Resume listening
      shouldBeListeningRef.current = true;
      if (recognitionRef.current && !isListeningRef.current && !isMutedRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const appendTranscript = (speaker: "user" | "model", text: string) => {
    setTranscripts((prev) => {
      // If the last item is from the same speaker and was added in the last 15 seconds, let's append to it or update
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker && Date.now() - last.timestamp.getTime() < 12000) {
        // Only append if it doesn't already contain this new segment
        // In Live API, transcripts sometimes arrive in fragments. If we just append, let's merge or create new depending on the match.
        // For simplicity, we can append new fragments if they represent progress.
        // Usually, the Live API updates the current phrase or sends completed ones.
        // Let's replace the last message if the text looks like an extension or append with space if it's different.
        if (text.startsWith(last.text)) {
          return [...prev.slice(0, -1), { ...last, text, timestamp: new Date() }];
        } else {
          return [...prev.slice(0, -1), { ...last, text: last.text + " " + text, timestamp: new Date() }];
        }
      } else {
        return [
          ...prev,
          {
            id: `${speaker}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            speaker,
            text,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const triggerTranscriptCorrection = async (id: string, text: string) => {
    // Check if we are already correcting or have corrected
    let alreadyChecked = false;
    setTranscripts((prev) => {
      const item = prev.find((t) => t.id === id);
      if (item && (item.loadingCorrection || item.correction)) {
        alreadyChecked = true;
        return prev;
      }
      return prev.map((t) => t.id === id ? { ...t, loadingCorrection: true } : t);
    });

    if (alreadyChecked) return;

    // Check if we are in local offline mode
    const isLocalMockMode = localStorage.getItem("auraLingo_mockMode") === "true";
    if (isLocalMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const correction = getMockGrammarCorrection(text, language.name, level.name);
      setTranscripts((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, correction, loadingCorrection: false }
            : t
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
          level: level.code
        })
      });

      if (response.ok) {
        const data: GrammarCorrection = await response.json();
        setTranscripts((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, correction: data, loadingCorrection: false }
              : t
          )
        );
      } else {
        throw new Error("Failed to correct grammar");
      }
    } catch (err) {
      console.warn("Error correcting voice transcript grammar. Falling back to offline client-side corrector.", err);
      const correction = getMockGrammarCorrection(text, language.name, level.name);
      setTranscripts((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, correction, loadingCorrection: false }
            : t
        )
      );
    }
  };

  const translateTranscript = async (id: string, text: string) => {
    // Toggle translation if already fetched
    const item = transcripts.find((t) => t.id === id);
    if (item?.translation) {
      setTranscripts((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, translation: undefined } : t
        )
      );
      return;
    }

    setTranscripts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, loadingTranslation: true } : t
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
        setTranscripts((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, translation: data.translatedText, loadingTranslation: false }
              : t
          )
        );
      } else {
        throw new Error("Failed to translate transcript");
      }
    } catch (err) {
      console.error("Translation error for transcript:", err);
      setTranscripts((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, loadingTranslation: false } : t
        )
      );
    }
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

  // Automatically trigger grammar correction for user transcripts after a period of silence (2.5s)
  React.useEffect(() => {
    if (correctionTimeoutRef.current) {
      clearTimeout(correctionTimeoutRef.current);
    }

    const lastItem = transcripts[transcripts.length - 1];
    if (lastItem && lastItem.speaker === "user" && !lastItem.correction && !lastItem.loadingCorrection) {
      correctionTimeoutRef.current = setTimeout(() => {
        triggerTranscriptCorrection(lastItem.id, lastItem.text);
      }, 2500);
    }

    return () => {
      if (correctionTimeoutRef.current) {
        clearTimeout(correctionTimeoutRef.current);
      }
    };
  }, [transcripts]);

  // Immediately trigger grammar check if user finishes speaking and AI partner starts responding
  React.useEffect(() => {
    const lastItem = transcripts[transcripts.length - 1];
    if (aiIsSpeaking && lastItem && lastItem.speaker === "user" && !lastItem.correction && !lastItem.loadingCorrection) {
      if (correctionTimeoutRef.current) {
        clearTimeout(correctionTimeoutRef.current);
      }
      triggerTranscriptCorrection(lastItem.id, lastItem.text);
    }
  }, [aiIsSpeaking]);

  // Scroll transcripts container automatically to the bottom
  const transcriptEndRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, aiIsSpeaking, userIsSpeaking]);

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
    <div className="w-full max-w-5xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-100px)] min-h-[500px]" id="voice-practice-container">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 flex-shrink-0" id="voice-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="back-to-setup-voice"
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Back to Setup"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label={language.name}>{language.flag}</span>
              <h1 className="font-bold text-white">{language.name} Conversation</h1>
              <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                {level.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Scenario: <span className="text-teal-400 font-semibold">{scenario.title}</span> • Voice: <span className="text-teal-400 font-semibold">{voiceName}</span>
            </p>
          </div>
        </div>

        {/* Live Status indicator badge and actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xs:flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-white/5 px-3.5 py-1.5 rounded-full font-mono text-[10px]">
            {status === "idle" && <span className="w-2 h-2 rounded-full bg-slate-500"></span>}
            {status === "connecting" && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
            {status === "connected" && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>}
            {status === "session_closed" && <span className="w-2 h-2 rounded-full bg-slate-600"></span>}
            {status === "error" && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}

            <span className="capitalize font-bold text-slate-300">
              {status === "idle" && "Ready to Start"}
              {status === "connecting" && "Connecting..."}
              {status === "connected" && "Partner Live"}
              {status === "session_closed" && "Session Closed"}
              {status === "error" && "Error"}
            </span>
          </div>

          {/* Integrated Cheatsheet Sidebar Toggle */}
          <button
            type="button"
            id="voice-tips-toggle-btn"
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
            <span className="hidden sm:inline">Cheatsheet</span>
          </button>

          {(status === "connected" || status === "session_closed") && (
            <button
              type="button"
              id="voice-end-analyze-btn"
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
          )}
        </div>
      </div>

      {/* Flex container wrapper to isolate grid from sidebar panel */}
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden relative">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Voice controls, waves & Mic button */}
        <div className="md:col-span-1 bg-slate-900/30 backdrop-blur-xl text-white rounded-3xl p-6 flex flex-col justify-between items-center relative overflow-hidden border border-white/5 shadow-2xl" id="voice-control-side">
          <div className="w-full text-center flex-shrink-0 relative z-10">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Live Conversation Stage
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 font-light">Speak into your mic. Your partner replies in real-time.</p>

            {status === "connected" && (
              <CountdownTimer
                resetTrigger={lastModelTranscriptId}
                className="w-full mt-4 text-left border border-white/5 bg-slate-950/60"
                label="Live Speaking Timer"
              />
            )}
          </div>

          {/* Central Waveform visualizer indicator */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 w-full relative z-1" id="waveform-area">
            {status === "connected" ? (
              <div className="flex flex-col items-center gap-8">
                
                {/* Visualizer Circle */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-56 h-56 border border-teal-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute w-64 h-64 border border-blue-500/10 rounded-full"></div>
                  
                  <div className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl border transition-all duration-300 ${
                    aiIsSpeaking 
                      ? "border-teal-500/40 bg-slate-950 shadow-teal-500/30" 
                      : userIsSpeaking 
                      ? "border-indigo-500/40 bg-slate-950 shadow-indigo-500/30" 
                      : "border-white/10 bg-slate-900/60"
                  }`}>
                    <Volume2 className={`w-10 h-10 transition-all ${
                      aiIsSpeaking 
                        ? "text-teal-400 scale-110 animate-pulse" 
                        : userIsSpeaking 
                        ? "text-indigo-400 scale-110" 
                        : "text-slate-400"
                    }`} />
                  </div>
                </div>

                {/* Animated Bars */}
                <div className="flex items-end gap-1.5 h-12 w-48 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                    let height = "h-1";
                    if (aiIsSpeaking) {
                      height = bar % 2 === 0 ? "h-6 animate-pulse" : "h-10 animate-pulse";
                    } else if (userIsSpeaking) {
                      height = bar % 3 === 0 ? "h-5" : "h-9";
                    }
                    return (
                      <div
                        key={bar}
                        className={`w-1.5 rounded-full bg-teal-400 transition-all duration-150 ${height}`}
                        style={{
                          animationDelay: `${bar * 80}ms`,
                          backgroundColor: aiIsSpeaking ? "#2dd4bf" : userIsSpeaking ? "#818cf8" : "#334155"
                        }}
                      ></div>
                    );
                  })}
                </div>

                <div className="text-xs text-center font-mono">
                  {aiIsSpeaking ? (
                    <span className="text-teal-400 font-bold animate-pulse">Partner is speaking...</span>
                  ) : userIsSpeaking ? (
                    <span className="text-indigo-400 font-bold">You are speaking...</span>
                  ) : (
                    <span className="text-slate-400">Listening to you...</span>
                  )}
                </div>

                {usingOfflineFallback && (
                  <div className="text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-full px-3 py-1.5 font-mono font-semibold flex items-center gap-1.5 animate-pulse mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Native Offline Engine Active
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center space-y-5 px-4">
                <div className="w-18 h-18 rounded-full bg-slate-950 flex items-center justify-center mx-auto border border-white/5 shadow-xl">
                  <Mic className="w-6 h-6 text-slate-400" />
                </div>

                {status === "idle" && (
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-light">
                    Connecting requests microphone permission to start a direct vocal stream with your AI Interviewer.
                  </p>
                )}

                {status === "connecting" && (
                  <div className="flex flex-col items-center gap-2.5">
                    <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                    <span className="text-xs text-teal-300 font-mono font-medium">Initializing audio bridge...</span>
                  </div>
                )}

                {status === "session_closed" && (
                  <p className="text-xs text-slate-400 font-light">
                    Voice practice session has ended. Click Start to re-establish.
                  </p>
                )}

                {status === "error" && (
                  <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-2xl text-left max-w-xs mx-auto">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-rose-300 font-medium leading-relaxed">{errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Core Voice Controls bottom row */}
          <div className="w-full space-y-3 flex-shrink-0 relative z-10" id="voice-bottom-controls">
            {status === "connected" && (
              <div className="flex gap-2.5">
                {/* Mute Mic button */}
                <button
                  type="button"
                  id="mute-mic-btn"
                  onClick={toggleMute}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isMuted
                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                      : "bg-slate-950 hover:bg-slate-900 text-slate-200 border border-white/5"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isMuted ? "Mic Unmute" : "Mic Mute"}
                </button>

                {/* Stop button */}
                <button
                  type="button"
                  id="stop-voice-btn"
                  onClick={cleanupAudioAndWS}
                  className="flex-shrink-0 bg-slate-950 hover:bg-rose-950 hover:text-rose-400 text-slate-300 p-3.5 rounded-xl border border-white/5 hover:border-rose-900/50 transition-all cursor-pointer"
                  title="End Session"
                >
                  <Square className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {status !== "connected" && status !== "connecting" && (
              <button
                type="button"
                id="initiate-voice-btn"
                onClick={startVoiceConnection}
                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-white" />
                Connect & Speak
              </button>
            )}

            {status === "connecting" && (
              <button
                type="button"
                id="cancel-voice-btn"
                disabled
                className="w-full bg-slate-950 text-slate-400 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              >
                Connecting...
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Real-time transcript display */}
        <div className="md:col-span-2 bg-slate-900/10 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col min-h-0 overflow-hidden shadow-2xl relative" id="voice-transcript-side">
          <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              Real-time Transcripts
            </h3>
            <span className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full font-bold px-2.5 py-0.5">
              Live Captions
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" id="voice-transcripts-list">
            {transcripts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Volume2 className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-slate-400">No spoken text captured yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-relaxed font-light">
                  Start the connection and speak naturally. Transcripts will show up here as the live conversational engine processes them.
                </p>
              </div>
            ) : (
              transcripts.map((item) => {
                const isUser = item.speaker === "user";
                return (
                  <div
                    key={item.id}
                    id={`transcript-item-${item.id}`}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] ${
                      isUser ? "self-end" : "self-start"
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center gap-1 px-1">
                      <span>{isUser ? "You" : `Interviewer (${language.name})`}</span>
                      <span>•</span>
                      <span>{item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>

                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? "bg-gradient-to-tr from-indigo-600/90 to-blue-700/90 text-slate-100 border-white/5 rounded-tr-none shadow-sm" 
                        : "bg-slate-900/60 text-slate-200 rounded-tl-none border border-white/5"
                    }`}>
                      <div>{item.text}</div>
                      
                      {/* Translation Overlay */}
                      {item.translation && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-teal-300 italic font-medium leading-relaxed">
                          🇬🇧 {item.translation}
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 mt-1.5 px-1 flex-wrap">
                      {/* Translate button */}
                      <button
                        type="button"
                        id={`btn-translate-voice-${item.id}`}
                        onClick={() => translateTranscript(item.id, item.text)}
                        className={`text-[10px] flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                          isUser 
                            ? "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white" 
                            : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                        }`}
                      >
                        {item.loadingTranslation ? (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin text-teal-400" />
                        ) : (
                          <Languages className="w-2.5 h-2.5 text-teal-400" />
                        )}
                        {item.translation ? "Hide Translation" : "Translate"}
                      </button>

                      {/* Grammar feedback triggers */}
                      {isUser && (
                        <>
                          {item.loadingCorrection && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 py-1 px-2 font-mono">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin text-teal-400" />
                              Evaluating response...
                            </span>
                          )}
                          {!item.loadingCorrection && item.correction && (
                            <button
                              type="button"
                              id={`btn-feedback-voice-${item.id}`}
                              onClick={() => handleShowFeedback(item.id, item.correction!)}
                              className={`text-[10px] flex items-center gap-1.5 py-1 px-2.5 rounded-lg font-semibold border cursor-pointer transition-all ${
                                activeFeedbackMsgId === item.id
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : item.correction.isPerfect
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                              }`}
                            >
                              {item.correction.isPerfect ? (
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              ) : (
                                <HelpCircle className="w-2.5 h-2.5" />
                              )}
                              {item.correction.isPerfect ? "Response: Strong" : "Coaching Feedback"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* In-progress dynamic transcript indicators */}
            {aiIsSpeaking && transcripts[transcripts.length - 1]?.speaker !== "model" && (
              <div className="flex flex-col items-start max-w-[85%] self-start" id="ai-speaking-dynamic-trans">
                <div className="text-[10px] text-slate-400 font-mono mb-1">
                  Interviewer is speaking...
                </div>
                <div className="bg-teal-500/10 border border-teal-500/20 text-teal-300 p-3.5 rounded-2xl rounded-tl-none text-sm animate-pulse flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-teal-400 animate-bounce" />
                  <span>Synthesizing voice response...</span>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Interview Coaching Feedback Drawer Overlay */}
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
                id="voice-grammar-feedback-drawer"
                className="fixed md:absolute inset-y-0 right-0 w-[290px] sm:w-80 bg-slate-950 border-l border-white/10 p-5 flex flex-col overflow-y-auto shadow-2xl z-40 backdrop-blur-md h-full max-h-full"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-shrink-0">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Interview Coaching Feedback
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFeedback(null);
                      setActiveFeedbackMsgId(null);
                    }}
                    className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>

                {/* Correction details */}
                <div className="space-y-4 flex-1">
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">Your response:</span>
                    <p className="text-xs text-rose-300 font-medium leading-relaxed italic">
                      "{transcripts.find(t => t.id === activeFeedbackMsgId)?.text}"
                    </p>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl">
                    <span className="text-[10px] text-emerald-400 font-mono block mb-1">Refined / More Professional:</span>
                    <p className="text-xs text-emerald-300 font-semibold leading-relaxed">
                      {activeFeedback.correctedText}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Coaching Feedback & Tips:</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-3.5 rounded-xl border border-white/5">
                      {activeFeedback.explanation}
                    </p>
                  </div>

                  {activeFeedback.suggestions && activeFeedback.suggestions.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-2">Alternative Phrasings:</span>
                      <div className="space-y-2">
                        {activeFeedback.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-indigo-200 bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded-xl font-medium"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Quick instructions bar */}
          <div className="p-3 border-t border-white/5 bg-slate-950/20 text-center text-[10px] text-slate-500 leading-relaxed font-mono flex-shrink-0">
            💡 Tap "Mic Mute" to pause. If the interviewer speaks too long, simply speak to interrupt and begin your response.
          </div>
        </div>

        <RoleTipsSidebar
          language={language}
          level={level}
          isOpen={showTipsSidebar}
          onToggle={() => setShowTipsSidebar(!showTipsSidebar)}
        />

      </div>
    </div>
    </div>
  );
}
