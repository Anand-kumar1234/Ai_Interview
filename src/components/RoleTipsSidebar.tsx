import React from "react";
import { LanguageOption, LevelOption } from "../types";
import { BookOpen, HelpCircle, Key, Award, ChevronRight, ChevronLeft, Lightbulb, Sparkles } from "lucide-react";

interface RoleTipsSidebarProps {
  language: LanguageOption;
  level: LevelOption;
  isOpen: boolean;
  onToggle: () => void;
}

interface TipData {
  starAdvices: string[];
  commonQuestions: string[];
  industryKeywords: string[];
  roleStrategy: string;
}

const ROLE_TIPS: Record<string, TipData> = {
  Software_Engineering: {
    roleStrategy: "Focus heavily on system scaling, algorithmic efficiency (Big O), and write clear, self-documenting code. Frame achievements with concrete systems throughput, uptime percentages, and architectural trade-offs.",
    starAdvices: [
      "S: 'We faced a 300ms bottleneck in our checkout database under high-concurrency event loads.'",
      "T: 'My task was to optimize the query execution paths and database schema to bring latency under 50ms.'",
      "A: 'I implemented a Redis sliding-window cache layer and optimized indexes on PostgreSQL.'",
      "R: 'Successfully reduced load-time to 42ms and boosted concurrent transaction limits by 40%.'"
    ],
    commonQuestions: [
      "How do you design a scalable rate-limiter for high-throughput public APIs?",
      "Can you describe a challenging bug you debugged in production, and how you prevented it permanently?",
      "How do you handle architectural disagreements when a teammate insists on using a suboptimal design?"
    ],
    industryKeywords: ["Caching & Redis", "System Design", "Microservices", "Concurrency", "Big O Complexity", "Kubernetes", "PostgreSQL", "Database Sharding", "CI/CD Pipeline", "Idempotency"]
  },
  Management_Leadership: {
    roleStrategy: "Interviews center on delegation, culture, alignment, and delivering complex business goals through teams. Keep explanations human-centric but outcomes data-driven.",
    starAdvices: [
      "S: 'Friction between design and development led to two missed product delivery deadlines.'",
      "T: 'I needed to realign the engineering and product team goals to hit our upcoming major launch.'",
      "A: 'Established weekly cross-functional workshops and created shared project deliverables.'",
      "R: 'Delivered the subsequent launch 4 days ahead of schedule, with team cohesion metrics rising by 30%.'"
    ],
    commonQuestions: [
      "How do you approach managing and coaching an underperforming employee?",
      "Can you describe your management philosophy for maintaining psychological safety under pressure?",
      "How do you handle delivering constructive criticism to a senior developer who is resistant to feedback?"
    ],
    industryKeywords: ["OKR Alignment", "Psychological Safety", "Performance PIP", "Direct Delegation", "Sprint Velocity", "Conflict Resolution", "Strategic Vision", "Stakeholder Alignment", "Active Mentorship"]
  },
  Product_Management: {
    roleStrategy: "Emphasize user empathy, metric-driven validation, product backlog prioritization (using frameworks like RICE/Kano), and alignment with company core objectives.",
    starAdvices: [
      "S: 'Our mobile user activation dropped by 18% following an updated onboarding screen release.'",
      "T: 'I had to diagnose the root cause and coordinate a rapid MVP fix within the sprint.'",
      "A: 'Analyzed telemetry, segmented dropping users, and prioritized a streamlined 1-tap Google Sign-in alternative.'",
      "R: 'Activation rebounded by 22%, with the overall registration flow dropping from 4 minutes to under 45 seconds.'"
    ],
    commonQuestions: [
      "How would you design a smart, physical product for children learning personal finance?",
      "How do you make difficult trade-offs between critical engineering tech debt and executive-requested features?",
      "What metrics would you track to evaluate the success of a new recommendations feed?"
    ],
    industryKeywords: ["RICE Prioritization", "User Personas", "Metric Drops (WAU)", "A/B Testing", "MVP Scope", "Kano Model", "Telemetry & Funnels", "Product Market Fit", "User Empathy"]
  },
  Data_Science_AI: {
    roleStrategy: "Focus on statistical rigor, robust end-to-end ML pipelining, performance metrics (F1, AUC, Recall), and translating complex algorithms into tangible business value.",
    starAdvices: [
      "S: 'The standard fraud prediction pipeline suffered from severe false-positive alerts, delaying 8% of legitimate users.'",
      "T: 'I was assigned to improve precision without degrading model recall bounds.'",
      "A: 'Engineered session-based behavioral features and retrained an XGBoost model using custom loss-functions.'",
      "R: 'Reduced false positives by 35% which saved the client operations team $120k/month in manual reviews.'"
    ],
    commonQuestions: [
      "How do you handle severe class imbalance in highly sensitive classification models (e.g., fraud)?",
      "Explain the trade-off between bias and variance and how you address overfitting in production models.",
      "How do you structure an A/B testing framework when the control and variant groups have high covariance?"
    ],
    industryKeywords: ["Precision vs Recall", "Feature Engineering", "A/B Testing Rigor", "Data Lakes & ETL", "Model Drift", "XGBoost & PyTorch", "Overfitting Mitigation", "Vector DBs", "F1-Score"]
  },
  Sales_Customer_Success: {
    roleStrategy: "Interviews center on establishing quick authentic rapport, understanding deep customer pain points, handling price/value objections, and securing recurring contract retention.",
    starAdvices: [
      "S: 'An enterprise healthcare client threatened cancellation due to repeated performance complaints.'",
      "T: 'My task was to de-escalate the VP of Technology and renew a $150k annual license contract.'",
      "A: 'Facilitated immediate custom engineering calls, delivered weekly status checks, and offered proactive SLA credits.'",
      "R: 'Not only successfully renewed the contract, but secured a $45k expansion upsell for the succeeding term.'"
    ],
    commonQuestions: [
      "How do you handle a pitch when an executive states your price is double your competitor's?",
      "Can you describe a strategy you used to rescue a high-risk enterprise account from churning?",
      "How do you establish early rapport with non-technical stakeholders who hold purchasing authority?"
    ],
    industryKeywords: ["Value-Based Selling", "Annual Contract Value", "SLA Credits", "Upsell Discovery", "Churn Mitigation", "Enterprise Pilots", "Strategic Partnership", "Customer Retention", "Sales Funnel"]
  },
  Finance_Strategy: {
    roleStrategy: "Focus on capital efficiency, risk modeling, NPV/IRR calculations, structured corporate valuation, and clean quantitative trade-off arguments.",
    starAdvices: [
      "S: 'The board was split on whether to invest $15M into in-house expansion or acquire a $45M competitor.'",
      "T: 'I had to analyze and model the NPV/IRR of both directions over a 5-year timeline.'",
      "A: 'Conducted rigorous financial valuations, modeled potential customer synergies, and audited engineering resource overheads.'",
      "R: 'Presented an objective risk analysis that recommended the acquisition, which yielded a 28% IRR in Year 2.'"
    ],
    commonQuestions: [
      "How would you model and analyze a complex build vs buy scenario for entering a new market?",
      "How do you prioritize cutting operational costs (OpEx) by 15% without compromising delivery speed?",
      "What metrics do you analyze to determine if a corporate division is utilizing capital efficiently?"
    ],
    industryKeywords: ["NPV & IRR Models", "OpEx Optimization", "Zero-Based Budgeting", "Synergy Valuation", "M&A Strategy", "Capital Allocation", "P&L Management", "Free Cash Flow", "Leverage Ratios"]
  },
  HR_Operations: {
    roleStrategy: "Focus on organizational design, scaling recruitment pipelines, workplace conflict resolution, high offer-acceptance ratios, and fostering data-driven talent operations.",
    starAdvices: [
      "S: 'The offer-acceptance ratio for our highly specialized tech roles fell below 40% last quarter.'",
      "T: 'I needed to diagnose pipeline bottlenecks and raise the conversion threshold back to 70%.'",
      "A: 'Audited recruiter outreach copy, structured candidate culture interviews, and updated compensation benchmarks.'",
      "R: 'Offer acceptance rate increased to 72% within 60 days, reducing average time-to-hire from 45 to 28 days.'"
    ],
    commonQuestions: [
      "How do you mediate a workplace conflict when an engineer feels isolated and their manager complains of performance?",
      "How do you design a competitive hiring and sourcing strategy for highly scarce technical roles?",
      "What metrics do you monitor to evaluate the efficacy of a comprehensive workplace inclusion program?"
    ],
    industryKeywords: ["Organizational Design", "Conflict Mediation", "Sourcing Pipelines", "Offer Acceptance Rate", "SLA Recruitment", "Candidate Experience", "Comp Benchmarking", "Talent Retention", "PIP Reviews"]
  }
};

export default function RoleTipsSidebar({ language, level, isOpen, onToggle }: RoleTipsSidebarProps) {
  const tips = ROLE_TIPS[language.code] || {
    roleStrategy: "Deliver structured, professional, and clear verbal and written answers. Use the STAR framework to keep statements concise, impactful, and performance-focused.",
    starAdvices: [
      "S (Situation): Detail the specific context, project, or problem.",
      "T (Task): Explain the target objective or responsibility.",
      "A (Action): Detail your precise personal inputs, strategies, and steps.",
      "R (Result): State the quantifiable metrics, outcomes, and business growth."
    ],
    commonQuestions: [
      "Can you describe your professional background and some of your favorite projects?",
      "How do you prioritize your daily task load when facing conflicting deadlines?",
      "Tell me about a challenging situation at work and how you navigated it successfully."
    ],
    industryKeywords: ["STAR Framework", "Professional Tone", "Quantitative Metrics", "Active Problem Solving", "Impact Focus"]
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop overlay to prevent confusion */}
      <div
        className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30"
        onClick={onToggle}
      />

      <div
        className="w-[290px] sm:w-[320px] bg-[#0c1017] text-slate-100 rounded-l-2xl md:rounded-2xl border-l md:border border-white/10 p-5 flex flex-col overflow-y-auto shadow-2xl transition-all duration-300 fixed md:relative inset-y-0 right-0 z-40 h-full max-h-full"
        id="role-tips-sidebar"
      >
        {/* Top Title Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4 flex-shrink-0">
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Interviewer Cheatsheet</span>
          </h3>
          <button
            type="button"
            id="toggle-tips-sidebar-close"
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="space-y-4 text-xs flex-1">
          {/* Core role strategy advice */}
          <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl">
            <h4 className="font-bold text-teal-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
              Domain Strategy ({language.name})
            </h4>
            <p className="text-slate-300 leading-relaxed font-light text-[11px]">
              {tips.roleStrategy}
            </p>
          </div>

          {/* STAR Method advice customized for this role */}
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Recommended STAR Structuring
            </h4>
            <div className="space-y-1.5">
              {tips.starAdvices.map((advice, idx) => {
                const letter = advice.charAt(0);
                const remainder = advice.substring(1);
                return (
                  <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-white/5 leading-relaxed font-light">
                    <span className="font-black text-teal-400 font-mono mr-1">{letter}</span>
                    <span className="text-slate-300 text-[11px]">{remainder}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Common practice questions */}
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Common Practice Questions
            </h4>
            <ul className="space-y-2">
              {tips.commonQuestions.map((q, idx) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 text-slate-300 font-light leading-relaxed text-[11px]">
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Industry Keywords */}
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              High-Scoring Buzzwords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tips.industryKeywords.map((word, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
