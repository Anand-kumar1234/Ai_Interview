import { GrammarCorrection, SessionPerformance } from "../types";

// Deep conversational tree for offline practice & local testing
export function getMockInterviewQuestion(
  languageName: string,
  levelName: string,
  scenarioId: string,
  turnIndex: number,
  userMessageText?: string
): string {
  const normText = (userMessageText || "").trim().toLowerCase();

  // Dynamic keyword extraction to create context-aware follow-up questions
  if (normText.length > 0) {
    if (normText.includes("redis") || normText.includes("cache") || normText.includes("memcached")) {
      const cacheQuestions = [
        "Redis caching is an excellent choice. How do you handle cache invalidation and cache stampede protection under peak load?",
        "When using distributed caching, how do you handle cache synchronization when multiple microservices write to the underlying database simultaneously?",
        "What key-eviction strategy (e.g., LRU vs LFU) would you configure for this cache cluster and why?"
      ];
      return cacheQuestions[(turnIndex + normText.length) % cacheQuestions.length];
    }

    if (normText.includes("database") || normText.includes("sql") || normText.includes("postgres") || normText.includes("mongo") || normText.includes("db")) {
      const dbQuestions = [
        "Database performance is critical here. How would you design your indexing strategy and query optimization to keep latency under 10ms for complex joins?",
        "When scaling your data layer, would you prefer vertical scaling, read-replicas, or sharding? What are the trade-offs?",
        "How do you guarantee ACID compliance or eventual consistency across distributed microservice boundaries?"
      ];
      return dbQuestions[(turnIndex + normText.length) % dbQuestions.length];
    }

    if (normText.includes("team") || normText.includes("conflict") || normText.includes("disagree") || normText.includes("manager") || normText.includes("engineer")) {
      const teamQuestions = [
        "Navigating interpersonal dynamics effectively is crucial. How do you ensure psychological safety while holding team members accountable for high engineering standards?",
        "When senior stakeholders disagree on technical direction, what frameworks do you use to evaluate trade-offs and build consensus?",
        "How do you mentor junior team members without micromanaging or blocking your own high-priority deliverables?"
      ];
      return teamQuestions[(turnIndex + normText.length) % teamQuestions.length];
    }

    if (normText.includes("test") || normText.includes("ci") || normText.includes("cd") || normText.includes("deploy") || normText.includes("pipeline")) {
      const pipelineQuestions = [
        "Robust deployment pipelines build confidence. How do you balance fast build times with comprehensive integration and end-to-end test suites?",
        "What rollback or feature-flag strategies do you deploy to safeguard production if a critical regression slips past CI?",
        "How do you manage secret keys, environment variables, and zero-downtime database migrations in your CD pipeline?"
      ];
      return pipelineQuestions[(turnIndex + normText.length) % pipelineQuestions.length];
    }

    if (normText.includes("user") || normText.includes("product") || normText.includes("metric") || normText.includes("kpi") || normText.includes("customer")) {
      const productQuestions = [
        "Aligning technical decisions with business impact is vital. What leading indicators or product usage telemetry do you track to measure success?",
        "How do you prioritize fixing technical debt versus shipping new user-requested features when deadlines are tight?",
        "When user feedback directly contradicts product analytics data, how do you investigate and determine the right path forward?"
      ];
      return productQuestions[(turnIndex + normText.length) % productQuestions.length];
    }
  }

  // Domain-specific tailored conversation turns
  const techQuestionPool = [
    "That is a clear explanation. Moving deeper: how would you monitor latency, error rates, and resource utilization in a high-throughput production environment?",
    "Great point. What security vulnerabilities (like OWASP Top 10, auth bypass, or injection) would you specifically audit for in this setup?",
    "Very thoughtful approach. If this system experienced a 10x sudden traffic spike during a flash sale, where would the primary bottleneck occur first?",
    "Solid technical reasoning. How do you handle failure recovery and circuit breaking if a downstream dependency fails unexpectedly?",
    "Excellent analysis. Can you walk me through how you would conduct a post-mortem root cause analysis if an outage did occur?",
    "Well articulated. How do you ensure API backward compatibility when deploying major version updates to active client SDKs?",
    "Impressive clarity. To wrap up this technical section, what would you re-architect if you had double the engineering headcount and timeline?"
  ];

  const managementQuestionPool = [
    "That demonstrates clear leadership. How do you track and communicate project milestones to non-technical executive stakeholders?",
    "Very empathetic perspective. How do you handle situations where team members are suffering from burnout due to shifting deadline priorities?",
    "Strong strategic alignment. How do you evaluate whether to build a capability in-house or purchase a vendor solution?",
    "Great operational insight. How do you foster a culture of innovation while enforcing strict compliance and security constraints?",
    "Excellent leadership framework. How do you structure feedback during annual performance reviews to drive meaningful professional growth?",
    "To conclude this leadership scenario: what is the most valuable leadership lesson you learned from a past mistake or failed launch?"
  ];

  const genericQuestionPool = [
    "Thank you. That makes complete sense. Can you elaborate on the most critical trade-off you had to accept in that decision?",
    "Very detailed answer. How would you measure the long-term success of this strategy six months after implementation?",
    "Excellent response. If project resources or timeline were suddenly cut in half, what scope would you de-prioritize first and why?",
    "That shows high professional maturity. How would you present these findings to executive leaders to secure budget approval?",
    "Spot-on reasoning. What alternative approaches did you consider before settling on this specific strategy?",
    "Great structure in your answer. How do you keep your domain skills updated with rapidly evolving industry best practices?",
    "Very comprehensive explanation. Thank you for walking me through your thought process in such detail."
  ];

  let pool = genericQuestionPool;
  if (languageName.includes("Engineering") || languageName.includes("Software") || languageName.includes("Data") || languageName.includes("AI")) {
    pool = techQuestionPool;
  } else if (languageName.includes("Management") || languageName.includes("Leadership") || languageName.includes("Product")) {
    pool = managementQuestionPool;
  }

  // Use modulo arithmetic over turnIndex so every single turn gets a unique question without repeating
  const safeIndex = Math.abs(turnIndex) % pool.length;
  return pool[safeIndex];
}

// Generate intelligent grammar corrections locally
export function getMockGrammarCorrection(
  text: string,
  languageName: string,
  levelName: string
): GrammarCorrection {
  const norm = text.trim();
  if (norm.length < 5) {
    return {
      correctedText: text,
      isPerfect: true,
      explanation: "Too short for a comprehensive critique, but grammatically clear.",
      suggestions: ["Add more context using the STAR structure."]
    };
  }

  // Check for common grammatical slips
  const hasIhas = /\bi has\b/i.test(norm);
  const hasFiveYear = /\b\d+\s+year\b/i.test(norm) || /\bfive year\b/i.test(norm);
  const hasDisgree = /\bdisgree\b/i.test(norm);
  const hasFails = /\bfails\b/i.test(norm);

  if (hasIhas || hasFiveYear || hasDisgree || hasFails) {
    let corrected = text;
    corrected = corrected.replace(/\bi has\b/gi, "I have");
    corrected = corrected.replace(/\bfive year\b/gi, "five years");
    corrected = corrected.replace(/\b5 year\b/gi, "5 years");
    corrected = corrected.replace(/\bdisgree\b/gi, "disagree");
    corrected = corrected.replace(/\bfails\b/gi, "failed");

    return {
      correctedText: corrected,
      isPerfect: false,
      explanation: "Identified minor agreement/pluralization issues (e.g. 'I have' instead of 'I has', and pluralizing 'years'). The corrected version sounds highly professional.",
      suggestions: [
        "Express your timeline explicitly using plural units (e.g., 'five years').",
        "Adopt more formal modal verbs to convey authority (e.g., 'I successfully mediated' instead of 'I solved')."
      ]
    };
  }

  // Otherwise, provide a high-level corporate upgrade
  let upgrade = text;
  if (norm.startsWith("I think")) {
    upgrade = norm.replace(/^I think/i, "Based on my experience, I would recommend");
  } else if (norm.includes("deal with")) {
    upgrade = norm.replace(/\bdeal with\b/gi, "proactively address and resolve");
  } else if (norm.includes("make it fast")) {
    upgrade = norm.replace(/\bmake it fast\b/gi, "optimize latency and throughput");
  }

  return {
    correctedText: upgrade,
    isPerfect: upgrade === text,
    explanation: upgrade === text 
      ? "Outstanding response! Your vocabulary is industry-standard, structured, and displays strong professional competence."
      : "Your response is grammatically correct. Rephrasing informal phrases (e.g., using active verbs instead of passive voice) creates an executive presence.",
    suggestions: [
      "Explicitly mention quantifiable metrics (e.g., 'boosting efficiency by 20%').",
      "Format your strategy clearly as a multi-step execution map."
    ]
  };
}

// Generate comprehensive performance evaluation locally
export function getMockSessionPerformance(
  conversation: any[],
  languageName: string,
  levelName: string,
  scenarioTitle: string
): SessionPerformance {
  const userTurns = conversation.filter(c => c.role === "user" || c.speaker === "user");
  const totalChars = userTurns.reduce((sum, t) => sum + (t.content || t.text || "").length, 0);
  const hasStarWords = userTurns.some(t => {
    const text = (t.content || t.text || "").toLowerCase();
    return text.includes("situation") || text.includes("task") || text.includes("action") || text.includes("result") || text.includes("star");
  });

  // Dynamic calculations based on user input length and structural cues
  const communicationScore = Math.min(95, 75 + Math.round(totalChars / 50));
  const clarityScore = Math.min(98, 70 + Math.round(totalChars / 40));
  const starScore = hasStarWords ? 92 : 78;
  const domainScore = Math.min(95, 80 + Math.round(userTurns.length * 3));
  const deliveryScore = 85;

  const overallScore = Math.round((communicationScore + clarityScore + starScore + domainScore + deliveryScore) / 5);

  return {
    overallScore,
    metrics: [
      { subject: "Communication", score: communicationScore, fullMark: 100 },
      { subject: "Clarity", score: clarityScore, fullMark: 100 },
      { subject: "Domain Knowledge", score: domainScore, fullMark: 100 },
      { subject: "STAR Method", score: starScore, fullMark: 100 },
      { subject: "Pace & Delivery", score: deliveryScore, fullMark: 100 }
    ],
    strengths: [
      `Strong adaptability tailored to the ${scenarioTitle} context.`,
      `Excellent responsiveness, contributing ${Math.round(totalChars / (userTurns.length || 1))} characters of high-quality verbal structure per response turn.`
    ],
    weaknesses: [
      "Include more quantifiable indicators (e.g. budget saved, code latency decreased, headcount managed).",
      "Explicitly prefix your anecdotes with STAR structural terms to command the room during high-pressure panels."
    ],
    coachingFeedback: `You did a fantastic job practicing for a ${levelName} position in ${languageName}. Your pacing was balanced, showing clear focus. Infusing your technical and leadership summaries with sharp business outcomes will make you an absolutely irresistible candidate to any top-tier recruiter.`
  };
}

// Generate dynamic talking points helper locally
export function getMockSuggestions(aiText: string): string[] {
  const norm = aiText.toLowerCase();
  
  if (norm.includes("redis") || norm.includes("rate-limit") || norm.includes("limit")) {
    return [
      "I would propose implementing a sliding window log with Redis transaction pipelines.",
      "I'd use exponential backoff retries with random jitter on client requests.",
      "I'd partition rate limit keys based on geographical user IDs."
    ];
  }
  
  if (norm.includes("conflict") || norm.includes("defensive") || norm.includes("disagreement")) {
    return [
      "I would schedule a private 1-on-1 first to de-escalate emotional tension.",
      "I would establish objective evaluation standards to remove personal bias.",
      "I'd align our technical priorities with the current sprint commitments."
    ];
  }

  if (norm.includes("m&a") || norm.includes("build") || norm.includes("buy")) {
    return [
      "I'd analyze the Net Present Value of building vs buying over a 3-year timeline.",
      "I would perform a technical audit of the competitor's software architecture.",
      "I'd recommend a hybrid approach: partner with their platform while building our internal capability."
    ];
  }

  return [
    "I would lay out a clear three-step execution roadmap to structure this challenge.",
    "I'd base our priority decisions on measurable customer usage metrics.",
    "I would run quick micro-simulations to gather raw data before making a final choice."
  ];
}
