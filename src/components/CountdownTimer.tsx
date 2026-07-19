import React from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, AlertCircle } from "lucide-react";

interface CountdownTimerProps {
  onTimeUp?: () => void;
  // Passing a resetTrigger will optionally restart the timer when it changes (e.g. on new question)
  resetTrigger?: any;
  className?: string;
  label?: string;
}

const PRESETS = [30, 60, 90, 120, 180];

export default function CountdownTimer({ onTimeUp, resetTrigger, className = "", label = "Response Timer" }: CountdownTimerProps) {
  const [duration, setDuration] = React.useState<number>(90); // default 90 seconds
  const [timeLeft, setTimeLeft] = React.useState<number>(90);
  const [isRunning, setIsRunning] = React.useState<boolean>(true);
  const [autoRestart, setAutoRestart] = React.useState<boolean>(true);
  const [enableChime, setEnableChime] = React.useState<boolean>(true);
  const [isTimeUp, setIsTimeUp] = React.useState<boolean>(false);

  // Synchronize with presets / duration changes
  React.useEffect(() => {
    setTimeLeft(duration);
    setIsTimeUp(false);
    // Auto-play when duration changes or resets
    setIsRunning(true);
  }, [duration]);

  // Handle the external reset trigger (e.g. a new question from interviewer)
  React.useEffect(() => {
    if (resetTrigger && autoRestart) {
      setTimeLeft(duration);
      setIsTimeUp(false);
      setIsRunning(true);
    }
  }, [resetTrigger]);

  // Main countdown interval loop
  React.useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsTimeUp(true);
          if (enableChime) {
            playSyntheticChime();
          }
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, enableChime, onTimeUp]);

  // Synthesize a high-quality double-beep using Web Audio API (completely client-side, zero assets needed!)
  const playSyntheticChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playBeep = (timeOffset: number, freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + timeOffset + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + dur);
        
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + dur);
      };

      // Play elegant double alert chime
      playBeep(0, 587.33, 0.4); // D5
      playBeep(0.2, 587.33, 0.4); // D5
    } catch (e) {
      console.warn("Could not play timer chime:", e);
    }
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
    if (isTimeUp) {
      // If time was already up, restarting resets to full duration
      setTimeLeft(duration);
      setIsTimeUp(false);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsTimeUp(false);
    setIsRunning(true);
  };

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Visual status calculations
  const percentRemaining = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isCritical = timeLeft <= 10;

  // Circular stroke details
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentRemaining / 100) * circumference;

  let timerColorClass = "text-teal-400";
  let timerProgressClass = "stroke-teal-500";
  let pulseClass = "";

  if (isCritical) {
    timerColorClass = "text-rose-500 font-bold";
    timerProgressClass = "stroke-rose-500";
    pulseClass = "animate-pulse scale-105 duration-300";
  } else if (isWarning) {
    timerColorClass = "text-amber-400 font-semibold";
    timerProgressClass = "stroke-amber-400";
  }

  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 flex flex-col gap-3 shadow-xl ${className}`}
      id="countdown-timer-widget"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
        </div>
        
        {/* Play/Pause, Reset actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id="timer-play-btn"
            onClick={togglePlay}
            className={`p-1.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer ${
              isRunning ? "text-teal-400" : ""
            }`}
            title={isRunning ? "Pause Timer" : "Start Timer"}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            id="timer-reset-btn"
            onClick={handleReset}
            className="p-1.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main visual display & control row */}
      <div className="flex items-center gap-4 justify-between">
        
        {/* Countdown Ring & Text */}
        <div className={`flex items-center gap-2.5 transition-all duration-300 ${pulseClass}`}>
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              {/* Progress Circle */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                className={`transition-all duration-300 ${timerProgressClass}`}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-[11px] font-mono tracking-tight font-bold ${timerColorClass}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="flex flex-col">
            <span className={`text-base font-bold font-mono tracking-tight text-white`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {isTimeUp ? "Time's up! Speak up" : isCritical ? "Time is running out!" : "Keep answers concise"}
            </span>
          </div>
        </div>

        {/* Presets pills */}
        <div className="flex flex-wrap gap-1 justify-end max-w-[140px]" id="timer-presets-row">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              id={`preset-btn-${p}`}
              onClick={() => setDuration(p)}
              className={`text-[9px] px-2 py-1 rounded-md font-mono transition-all cursor-pointer ${
                duration === p
                  ? "bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-white/5 hover:text-slate-300"
              }`}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>

      {/* Warning banner when time is up */}
      {isTimeUp && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/20 text-[10px] text-rose-300 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Wrap up your response! Simulators prefer under 2 minutes.</span>
        </div>
      )}

      {/* Advanced Settings Checkboxes */}
      <div className="border-t border-white/5 pt-2 mt-1 flex items-center justify-between text-[9px] text-slate-400 flex-wrap gap-2 font-medium">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input
            type="checkbox"
            checked={autoRestart}
            onChange={(e) => setAutoRestart(e.target.checked)}
            className="rounded bg-slate-950 border-white/10 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 w-3 h-3 cursor-pointer"
          />
          <span>Auto-restart on question</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input
            type="checkbox"
            checked={enableChime}
            onChange={(e) => setEnableChime(e.target.checked)}
            className="rounded bg-slate-950 border-white/10 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 w-3 h-3 cursor-pointer"
          />
          <span className="flex items-center gap-0.5">
            {enableChime ? <Volume2 className="w-2.5 h-2.5 text-teal-400" /> : <VolumeX className="w-2.5 h-2.5 text-slate-500" />}
            Audio Chime
          </span>
        </label>
      </div>
    </div>
  );
}
