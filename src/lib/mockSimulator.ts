import { GrammarCorrection, SessionPerformance } from "../types";

// Deep conversational tree for offline practice & local testing
export function getMockInterviewQuestion(
  languageName: string,
  levelName: string,
  scenarioId: string,
  turnIndex: number,
  userMessageText?: string
): string {
  const normText = (userMessageText || "").toLowerCase();

  // 1. SOFTWARE ENGINEERING
  if (languageName.includes("Engineering") || languageName.includes("Software")) {
    if (scenarioId.includes("coding")) {
      if (turnIndex === 1) {
        if (normText.includes("redis") || normText.includes("sliding")) {
          return "Redis sorted sets are fantastic for sliding windows because of the efficiency of range queries. How would you handle hot-sharding if a single celebrity user triggers millions of API requests per second?";
        }
        return "Excellent start. The Token Bucket algorithm is very effective because it handles sudden bursts gracefully. How would you handle persistent storage and rate synchronization across a cluster of 50 distributed servers?";
      }
      if (turnIndex === 2) {
        return "That's a very solid trade-off. Now, how would you protect the internal services downstream from being overwhelmed if the rate limiter itself goes offline or experiences high latency?";
      }
      return "Fascinating analysis. Let's finish with this: if you had to write a client-side library to consume this rate-limited API, what retry strategies and backoff configurations would you recommend to minimize consumer friction?";
    }
    
    if (scenarioId.includes("system_design")) {
      if (normText.includes("websocket") || normText.includes("real-time") || normText.includes("crdt")) {
        return "Using CRDTs (Conflict-free Replicated Data Types) is indeed the gold standard for Figma-like sync. How would you handle offline sync conflict resolution if a client goes offline for 10 minutes, modifies a shared canvas, and then reconnects?";
      }
      return "Understood. High-frequency websocket updates can overwhelm server CPU and memory. How would you structure your load-balancer and server scaling policies to handle 500,000 active, persistent TCP connections?";
    }

    if (scenarioId.includes("behavioral")) {
      return "That sounds like a classic team alignment challenge. How did you structure the comparative benchmark data, and what metrics did you track to convince the skeptics?";
    }
  }

  // 2. MANAGEMENT & LEADERSHIP
  if (languageName.includes("Management") || languageName.includes("Leadership")) {
    if (scenarioId.includes("conflict")) {
      return "That's a very collaborative approach. What if one of the engineers is extremely defensive and starts accusing you or the other teammate of playing favorites? How do you maintain psychological safety and objectivity?";
    }
    if (scenarioId.includes("underperformance")) {
      return "Empathetic active listening is indeed the correct baseline. If, after two weeks of the performance roadmap, the employee continues to miss critical project deadlines, how do you escalate this while maintaining team morale?";
    }
    return "That's a strategic alignment challenge. What concrete business metrics or risks would you present to the executive team to convince them to expand our engineering bandwidth?";
  }

  // 3. PRODUCT MANAGEMENT
  if (languageName.includes("Product")) {
    if (scenarioId.includes("design")) {
      return "Targeting children aged 5-10 with gamified milestones is brilliant. How do you design the monetization or premium subscription features of this device without making parents feel exploited or violating privacy regulations?";
    }
    if (scenarioId.includes("prioritization")) {
      return "The RICE framework is very effective. How would you justify prioritize a critical system security patch (which has low RICE reach/confidence metrics but massive business risk) over a highly visible user-facing feature?";
    }
    return "Segmenting by platform and geography is the perfect starting diagnostic. If you find the drop is isolated entirely to Android users, what specific engineering or user behavior signals would you request next?";
  }

  // 4. DATA SCIENCE & AI
  if (languageName.includes("Data Science") || languageName.includes("AI")) {
    if (scenarioId.includes("ml_system")) {
      return "The retrieval and ranking two-stage pipeline is a robust design. How do you handle cold-start recommendations for a brand new user who has zero historical session data or profile telemetry?";
    }
    return "That's a very rigorous approach. If the product manager insists on launching the new checkout flow because of the 1% revenue lift, despite the p-value being 0.08, how do you handle this disagreement?";
  }

  // Generic interview questions fallbacks
  const genericQuestions = [
    "Thank you. That makes complete sense. Can you elaborate on the most critical trade-off you had to accept in that decision?",
    "Very detailed answer. How would you measure the long-term success of this strategy six months after implementation?",
    "Excellent. If resources were suddenly cut in half, what features or sub-tasks would you cut first and why?",
    "That is highly professional. Thank you for sharing that experience. Let's move on to the next scenario."
  ];

  return genericQuestions[Math.min(turnIndex, genericQuestions.length - 1)];
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
