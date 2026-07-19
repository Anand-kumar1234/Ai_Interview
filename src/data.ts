import { LanguageOption, LevelOption, ScenarioOption } from "./types";

export const LEVELS: LevelOption[] = [
  {
    code: "Beginner",
    name: "Junior / Entry-Level (0-2 yrs)",
    desc: "Focuses on foundational skills, learning potential, core knowledge, and adaptability."
  },
  {
    code: "Intermediate",
    name: "Mid-Level Professional (2-5 yrs)",
    desc: "Focuses on independent problem-solving, project ownership, collaboration, and domain expertise."
  },
  {
    code: "Advanced",
    name: "Senior / Lead Executive (5+ yrs)",
    desc: "Focuses on architectural design, systemic scaling, high-level leadership, and strategic business impact."
  }
];

export const VOICES = [
  { name: "Zephyr", label: "Alex (Warm Professional Coach)", gender: "Female" as const },
  { name: "Kore", label: "Sarah (Analytical Lead Recruiter)", gender: "Female" as const },
  { name: "Puck", label: "Daniel (Friendly Engineering Lead)", gender: "Male" as const },
  { name: "Charon", label: "Michael (Calm Executive Interviewer)", gender: "Male" as const },
  { name: "Fenrir", label: "Marcus (Direct Hiring Manager)", gender: "Male" as const }
];

export const LANGUAGES: LanguageOption[] = [
  {
    code: "Software_Engineering",
    name: "Software Engineering",
    nativeName: "Coding, System Design, QA",
    flag: "💻",
    voices: VOICES,
    greeting: "Welcome! Thank you for applying for our Software Engineering position today. To start off, could you tell me a little bit about yourself and some of your favorite technical projects?",
    scenarios: [
      {
        id: "coding_round",
        title: "Technical & Coding Round",
        icon: "Code",
        description: "Practice discussing algorithms, data structures, complexity, optimization, and how you write clean, scalable code.",
        initialPrompt: "Great to have you here! For our technical discussion: imagine you need to design a high-frequency rate-limiter for an public API endpoint. What strategies and data structures would you use to implement it?",
        suggestions: [
          "I would use a Token Bucket algorithm for its flexibility.",
          "I would use Redis sorted sets to store user requests within a sliding window.",
          "I'd implement client-side backoff retries to handle rate limits gracefully."
        ]
      },
      {
        id: "system_design",
        title: "System Design & Scale",
        icon: "Server",
        description: "Practice architecting scalable distributed systems, microservices, databases, load balancing, and caching layers.",
        initialPrompt: "Let's move into high-level system design. How would you design a real-time collaborative whiteboarding platform like Miro or Figma to support millions of active users?",
        suggestions: [
          "I'd use persistent WebSockets or SSE for real-time document synchronization.",
          "I'd use Operational Transformation (OT) or CRDTs to resolve conflict edits.",
          "I would implement Redis Pub/Sub to scale socket connections across multiple servers."
        ]
      },
      {
        id: "behavioral",
        title: "Behavioral (STAR Method)",
        icon: "Briefcase",
        description: "Answering critical behavioral questions on team friction, failure, project ownership, and growth.",
        initialPrompt: "Tell me about a time you had a major technical disagreement with a teammate or senior architect. How did you resolve it and what was the outcome?",
        suggestions: [
          "We disagreed on using PostgreSQL vs MongoDB for a high-write activity log.",
          "I set up a reproducible benchmark simulation to let raw data drive our choice.",
          "We compromised by using PostgreSQL with JSONB columns for flexible data schemas."
        ]
      }
    ]
  },
  {
    code: "Management_Leadership",
    name: "Management & Leadership",
    nativeName: "People Mgmt, Strategy, Execution",
    flag: "👔",
    voices: VOICES,
    greeting: "Hello! Thank you for interviewing for our Management and Leadership position. Let's discuss your management philosophy and experience leading high-impact teams.",
    scenarios: [
      {
        id: "conflict_resolution",
        title: "Team Conflict Resolution",
        icon: "Users",
        description: "Practice resolving friction, aligning priorities, and maintaining a high-trust, collaborative culture.",
        initialPrompt: "Imagine two senior team members are locked in a deep architectural disagreement, stalling product delivery. How would you step in and resolve the situation?",
        suggestions: [
          "I would host a structured technical session to map pros, cons, and business trade-offs.",
          "I would help them partition project ownership to give both clear decision authority.",
          "I'd align the final decision with our immediate quarterly product goals."
        ]
      },
      {
        id: "underperformance",
        title: "Managing Underperformance",
        icon: "Activity",
        description: "Practice delivering clear constructive feedback, coaching, and designing supportive performance roadmaps.",
        initialPrompt: "You have a previously high-performing employee whose delivery has noticeably slipped over the past month. How do you structure and initiate this conversation?",
        suggestions: [
          "I'd set up an empathetic 1-on-1 to understand if there are professional or personal bottlenecks.",
          "I'd point out specific, objective examples of missed milestones rather than making generalizations.",
          "We would co-create a supportive improvement plan with clear, actionable weekly goals."
        ]
      },
      {
        id: "stakeholder_alignment",
        title: "Executive Stakeholder Alignment",
        icon: "TrendingUp",
        description: "Practice presenting complex trade-offs, managing expectations, and negotiating timelines with executives.",
        initialPrompt: "The executive team asks to pull a major launch forward by a month, but your team insists it is impossible without severe risk. How do you handle this alignment?",
        suggestions: [
          "I would present a risk analysis showing potential stability and customer support costs.",
          "I'd suggest trimming non-essential scope to deliver a robust MVP on the early date.",
          "I'd request temporary cross-team support or resources to accelerate the original scope."
        ]
      }
    ]
  },
  {
    code: "Product_Management",
    name: "Product Management",
    nativeName: "Roadmaps, Product Strategy, UX",
    flag: "🎨",
    voices: VOICES,
    greeting: "Welcome! Thank you for interviewing for the Product Manager position. Let's start by discussing a product you love, what makes it great, and how you would improve it.",
    scenarios: [
      {
        id: "product_design",
        title: "Product Design & Empathy",
        icon: "Compass",
        description: "Practice designing products from scratch, targeting user personas, identifying pain points, and prioritizing MVPs.",
        initialPrompt: "How would you design a smart alarm clock and morning routine builder specifically for children aged 5 to 10? Walk me through your design process.",
        suggestions: [
          "I'd focus on gamifying morning milestones with interactive visual avatars.",
          "I'd design a companion app with customizable parental control features.",
          "I'd use progressive ambient lighting instead of jarring sound alarms."
        ]
      },
      {
        id: "prioritization",
        title: "Backlog Prioritization",
        icon: "Layers",
        description: "Practice balancing customer requests, tech debt, business objectives, and defending prioritization framework choices.",
        initialPrompt: "You have three pressing requests: major infrastructure tech debt, an enterprise-demanded feature, and a growth optimization project. How do you prioritize them?",
        suggestions: [
          "I would apply the RICE framework to calculate objective impact and effort scores.",
          "I'd prioritize the security patch first due to immediate corporate compliance risk.",
          "I would establish a dedicated 20% sprint bandwidth partition for tech debt."
        ]
      },
      {
        id: "metrics_analysis",
        title: "Metrics & Root Cause Analysis",
        icon: "BarChart",
        description: "Practice investigating sudden metric anomalies, generating hypotheses, and outlining experimental validation.",
        initialPrompt: "Our weekly active user retention rate dropped by 12% on Monday. Walk me through exactly how you would investigate and diagnose the root cause.",
        suggestions: [
          "I'd verify first with QA and engineering if any new updates or API outages occurred.",
          "I'd segment the retention drop by platform, browser type, geographic region, and user age.",
          "I'd coordinate with marketing to check if any major seasonal user acquisition campaigns concluded."
        ]
      }
    ]
  },
  {
    code: "Data_Science_AI",
    name: "Data Science & AI",
    nativeName: "ML, Analytics, Statistics",
    flag: "📊",
    voices: VOICES,
    greeting: "Welcome! Thanks for interviewing for our Data Science & AI position. Let's start with your experience designing end-to-end machine learning pipelines and statistical models.",
    scenarios: [
      {
        id: "ml_system_design",
        title: "ML System Architecture",
        icon: "Cpu",
        description: "Practice designing real-time predictive systems, feature engineering, loss functions, and evaluating models.",
        initialPrompt: "How would you design a real-time recommendation engine for a streaming service home feed? What models and signals would you use?",
        suggestions: [
          "I would build a two-stage pipeline: fast candidate retrieval, then deep neural network ranking.",
          "I would incorporate real-time user session clicks, historical viewing habits, and item metadata.",
          "I'd evaluate performance online using click-through rate (CTR) and watching duration metrics."
        ]
      },
      {
        id: "ab_experimentation",
        title: "A/B Testing & Experimentation",
        icon: "LineChart",
        description: "Practice planning rigorous statistical tests, calculating power, sample sizes, and handling ambiguous outcomes.",
        initialPrompt: "We ran an A/B test on a registration page, resulting in a 1% lift but with a p-value of 0.08. What is your recommendation?",
        suggestions: [
          "I'd calculate the sample size and power to see if the test needs to run longer.",
          "I would audit the data for segment anomalies, such as extreme outliers skewing results.",
          "I'd recommend staying with the control until we achieve a statistically significant 95% confidence level."
        ]
      },
      {
        id: "pipeline_scale",
        title: "Data Pipelines & ETL",
        icon: "Database",
        description: "Practice explaining data modeling, stream vs batch processing, data lake architecture, and handling schema drift.",
        initialPrompt: "How would you design a scalable ETL pipeline to ingest 20 million daily transaction logs into a queryable data lake?",
        suggestions: [
          "I'd use Apache Kafka for message streaming and Apache Spark for transformation.",
          "I'd store raw logs in S3 as Parquet and load them into a data warehouse like BigQuery.",
          "I would implement data contract checks to automatically alert on schema drift."
        ]
      }
    ]
  },
  {
    code: "Sales_Customer_Success",
    name: "Sales & Customer Success",
    nativeName: "Client Pitch, Negotiation",
    flag: "🤝",
    voices: VOICES,
    greeting: "Hello! Thank you for interviewing for our Sales & Customer Success team. Let's discuss how you build authentic trust and establish long-term enterprise partnerships.",
    scenarios: [
      {
        id: "enterprise_pitching",
        title: "Enterprise Sales Pitch",
        icon: "MessageSquare",
        description: "Practice pitching complex SaaS solutions to skeptical executives, handling pricing objections, and proving ROI.",
        initialPrompt: "Imagine I am the Chief Security Officer of an enterprise bank, and I'm highly skeptical about moving our infrastructure to your cloud solution. Pitch me.",
        suggestions: [
          "I would emphasize our SOC2 Type II, ISO 27001, and financial-grade encryption standards.",
          "I'd share a case study of a major bank that reduced compliance overhead by 35% with us.",
          "I'd suggest starting with a small, highly secure sandbox pilot with zero live data risk."
        ]
      },
      {
        id: "client_churn_crisis",
        title: "Handling Churn Risk & Outages",
        icon: "AlertCircle",
        description: "Practice de-escalating customer anger, negotiating contract retention, and proving strategic partner value.",
        initialPrompt: "A key enterprise client suffered a major service disruption due to our bug. The VP is furious and demands to terminate their contract. How do you handle this call?",
        suggestions: [
          "I would actively listen, validate their frustration, and take absolute personal ownership.",
          "I would coordinate with engineering to share a transparent post-mortem and permanent fixes.",
          "I'd offer a proactive service SLA credit and schedule weekly check-ins to rebuild confidence."
        ]
      }
    ]
  },
  {
    code: "Finance_Strategy",
    name: "Finance & Strategy",
    nativeName: "Valuation, Budgeting, Risk",
    flag: "📈",
    voices: VOICES,
    greeting: "Welcome! Thank you for interviewing for our Finance & Strategy team today. Let's discuss how you approach capital allocation, financial modeling, and corporate valuation.",
    scenarios: [
      {
        id: "build_vs_buy_case",
        title: "M&A Case (Build vs Buy)",
        icon: "GitBranch",
        description: "Practice analyzing acquisitions, evaluating financial synergies, and recommending strategic investment options.",
        initialPrompt: "We want to enter the AI fraud detection sector. Should we spend $15M building the team and software in-house, or buy a competitor for $45M? How do you model this?",
        suggestions: [
          "I would compare the Net Present Value (NPV) and IRR of both options over 5 years.",
          "I'd analyze our internal engineering opportunity costs and speed-to-market advantage.",
          "I would perform a valuation of the competitor to see if the $45M purchase price is justified."
        ]
      },
      {
        id: "budget_cuts_strategy",
        title: "Operating Cost Optimization",
        icon: "Compass",
        description: "Practice identifying operational inefficiencies and designing budget reductions without compromising key output velocities.",
        initialPrompt: "The board requests a 15% reduction in Operating Expenses (OpEx) for next quarter. How would you audit and prioritize cuts across departments?",
        suggestions: [
          "I would start with a zero-based budgeting audit of SaaS licenses and software tool redundancies.",
          "I'd recommend pausing non-converting marketing channels and optimizing agency contracts.",
          "I'd explore consolidating real estate and moving to a high-efficiency hybrid model."
        ]
      }
    ]
  },
  {
    code: "HR_Operations",
    name: "HR & Talent Operations",
    nativeName: "Culture, Talent, Mediation",
    flag: "👥",
    voices: VOICES,
    greeting: "Welcome! Thank you for interviewing for our HR & Talent Operations team. Let's talk about your strategy for building supportive, productive, and inclusive high-growth teams.",
    scenarios: [
      {
        id: "recruitment_drive",
        title: "Talent Acquisition Strategy",
        icon: "Users",
        description: "Practice optimizing the recruiting pipeline, sourcing specialized roles, and improving offer-acceptance ratios.",
        initialPrompt: "We are struggling to hire Senior Security Architects. We source plenty of candidates but lose them in the late interview stages. How do you diagnose this?",
        suggestions: [
          "I'd analyze candidate feedback surveys to see if our technical assessment is causing friction.",
          "I'd audit our compensation package against current market indicators to ensure competitiveness.",
          "I would coach our interviewing teams on how to effectively sell our culture and technical impact."
        ]
      },
      {
        id: "workplace_conflict",
        title: "Workplace Conflict Mediation",
        icon: "ShieldAlert",
        description: "Practice resolving complex management friction, employee complaints, and designing aligned communication guides.",
        initialPrompt: "An engineer reports that they feel isolated and treated unfairly by their manager, while the manager states the engineer is underperforming. How do you intervene?",
        suggestions: [
          "I'd hold separate, neutral, and active listening sessions with both individuals.",
          "I'd review historical performance indicators and documented 1-on-1 feedback notes.",
          "I would facilitate a structured mediation session to define clear mutual expectations."
        ]
      }
    ]
  }
];
