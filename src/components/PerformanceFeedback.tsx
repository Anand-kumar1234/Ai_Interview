import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { SessionPerformance } from "../types";
import { ArrowLeft, Sparkles, CheckCircle, AlertCircle, RefreshCw, Trophy, Zap, ShieldAlert, Award } from "lucide-react";

interface PerformanceFeedbackProps {
  performance: SessionPerformance;
  onRestart: () => void;
  languageName: string;
  levelName: string;
  scenarioTitle: string;
}

export default function PerformanceFeedback({
  performance,
  onRestart,
  languageName,
  levelName,
  scenarioTitle
}: PerformanceFeedbackProps) {
  // Ensure we have correct subjects mapping for Recharts visualization
  const chartData = React.useMemo(() => {
    return performance.metrics.map(m => ({
      ...m,
      // Capitalize first letter of subject for nicer visual labels
      subject: m.subject.charAt(0).toUpperCase() + m.subject.slice(1)
    }));
  }, [performance.metrics]);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="performance-feedback-view">
      {/* Header Info */}
      <div className="text-center mb-8" id="report-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-teal-400 text-xs font-semibold mb-4 border border-white/10 shadow-lg shadow-teal-500/5">
          <Award className="w-3.5 h-3.5 text-teal-400" />
          AuraLingo Certified Assessment Report
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Your Interview Performance
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto font-light">
          Seniority Target: <span className="text-teal-400 font-semibold">{levelName}</span> • Role: <span className="text-teal-400 font-semibold">{languageName}</span>
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Scenario: {scenarioTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Score and Radar Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden" id="radar-chart-container">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>

            <div className="w-full flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Interviewer Performance Metrics
              </h2>
              <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-0.5 rounded-full font-bold">
                RECHARTS GRAPH
              </span>
            </div>

            {/* Radar Chart Display */}
            <div className="w-full h-[280px] sm:h-[320px] flex items-center justify-center" id="radar-canvas-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Radar
                    name="Candidate"
                    dataKey="score"
                    stroke="#14b8a6"
                    fill="#06b6d4"
                    fillOpacity={0.18}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Score Badges breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 w-full mt-4 border-t border-white/5 pt-5">
              {performance.metrics.map((metric) => (
                <div key={metric.subject} className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{metric.subject}</div>
                  <div className="text-base font-bold text-teal-300 mt-1 font-mono">{metric.score}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Strengths / Weaknesses Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-950/10 border border-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl" id="strengths-box">
              <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2.5 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Key Interview Strengths
              </h3>
              <ul className="space-y-3.5">
                {performance.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed font-light">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-amber-950/10 border border-amber-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl" id="weaknesses-box">
              <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2.5 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Constructive Coaching Opportunities
              </h3>
              <ul className="space-y-3.5">
                {performance.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed font-light">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Right column: Big Overall Score & Coaching Statement */}
        <div className="space-y-6">
          
          {/* Overall score indicator */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden" id="overall-score-panel">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-teal-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
            
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Interview Rating</div>
            
            {/* Pulsing Score Badge */}
            <div className="relative w-36 h-36 rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-teal-500/30 shadow-2xl shadow-teal-500/5 mb-4">
              <div className="absolute inset-0 rounded-full border border-teal-400/20 animate-ping" style={{ animationDuration: "3s" }}></div>
              <div className="text-5xl font-black text-white font-mono leading-none tracking-tight">
                {performance.overallScore}
              </div>
              <div className="text-[10px] text-slate-500 font-bold font-mono uppercase mt-1">out of 100</div>
            </div>

            <div className="text-sm font-bold text-teal-400 mb-1">
              {performance.overallScore >= 90 ? "Elite Candidate Level" : performance.overallScore >= 80 ? "Highly Competent Candidate" : "Progressing Professional"}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Your feedback is measured against high-growth recruitment standards.
            </p>
          </div>

          {/* Coaching Paragraph Card */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl" id="coaching-feedback-card">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
              <Trophy className="w-4.5 h-4.5 text-teal-400" />
              Executive Recruiter Feedback
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light italic">
              "{performance.coachingFeedback}"
            </p>
          </div>

          {/* Done/Restart Actions */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col gap-3 shadow-xl">
            <button
              type="button"
              id="report-restart-btn"
              onClick={onRestart}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer group active:scale-98"
            >
              Start New Practice Round
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
