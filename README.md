# 🤖 AI Interview — AI-Powered Mock Interview Platform

**AI Interview** is an AI-powered interview practice platform that helps candidates prepare for job interviews through interactive text and voice conversations, personalized feedback, and performance analysis.

Practice interview scenarios, improve your professional communication, refine your answers, and understand where you can improve before your next real interview.

<p align="center">
  <a href="https://ai-interview-three-xi.vercel.app/"><strong>🚀 Live Demo</strong></a>
  &nbsp; | &nbsp;
  <a href="https://github.com/Anand-kumar1234/Ai_Interview"><strong>📂 GitHub Repository</strong></a>
</p>

## ✨ Features

### 🎤 AI-Powered Mock Interviews
- Practice interviews through AI-generated conversations.
- Customize the target role, seniority level, and interview scenario.
- Receive relevant follow-up questions based on your answers.
- Practice technical, behavioral, and professional interview conversations.

### 🗣️ Real-Time Voice Interviews
- Interact with an AI interviewer through voice.
- Receive spoken responses from the AI interviewer.
- Display audio transcriptions of candidate and interviewer responses.
- Select from supported AI voice options.

### 💬 Interactive Text Interviews
- Conduct mock interviews through text conversations.
- Receive concise, context-aware interview questions.
- Practice answering questions in a professional setting.

### ✍️ Answer Correction & Feedback
- Improve the clarity and professionalism of your answers.
- Get grammar, vocabulary, and phrasing suggestions.
- Receive alternative ways to express your responses.
- Learn how to structure stronger interview answers using techniques such as STAR.

### 🌐 AI-Powered Translation
- Translate text into a selected target language.
- Support language-learning and communication practice through AI-assisted translation.

### 📊 Interview Performance Analysis
- Generate a performance report after a practice session.
- Receive an overall interview-readiness score.
- Analyze communication, clarity, domain knowledge, STAR method, and pace and delivery.
- Identify strengths and improvement areas.
- Get personalized coaching feedback.

### ⚙️ Reliable AI Responses
- Retry AI requests and switch between configured Gemini models when necessary.
- Provide structured JSON responses for feedback and performance analysis.
- Include a backend health-check endpoint.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Frontend development and build |
| Tailwind CSS | Styling and responsive UI |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Google Gemini API | Interview conversations and AI analysis |
| Gemini Live API | Real-time voice interaction |
| WebSocket (`ws`) | Live communication bridge |
| Recharts | Data visualization |
| Lucide React | Icons |
| Motion | UI animations |
| Vercel | Live deployment |

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- Git
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Anand-kumar1234/Ai_Interview.git
cd Ai_Interview
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

Keep your API key private. Do not commit `.env.local` or expose your secret API key in frontend code.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 5. Build for Production

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Run the TypeScript check:

```bash
npm run lint
```

## 🔌 Backend API Endpoints

The backend provides the following API endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check server status and API-key configuration |
| `POST` | `/api/chat` | Generate AI interview conversation responses |
| `POST` | `/api/correction` | Correct and evaluate a candidate's answer |
| `POST` | `/api/translate` | Translate text into a target language |
| `POST` | `/api/analyze-session` | Analyze an interview transcript and generate a performance report |

### Example: Health Check

```http
GET /api/health
```

The response includes server status, uptime, environment information, and whether the Gemini API key is configured.

### Example: Interview Chat

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about yourself."
    }
  ],
  "language": "Software Engineer",
  "level": "Entry Level",
  "scenario": "Technical Interview"
}
```

### Example: Answer Correction

```json
{
  "text": "I am good in React and JavaScript.",
  "language": "Software Engineer",
  "level": "Entry Level"
}
```

*Note: These are illustrative request examples based on the backend's expected inputs. They are not actual interview results.*

## 🏗️ How It Works

1. **Choose an interview scenario:** Select the target role, experience level, and interview type.
2. **Start practicing:** Communicate with the AI interviewer through text or voice.
3. **Improve your answers:** Use AI-assisted corrections and professional suggestions.
4. **Review your performance:** Analyze your interview transcript and receive structured feedback.
5. **Keep improving:** Use the feedback to prepare for future interviews.

## 📁 Project Structure

```text
Ai_Interview/
├── src/                  # Frontend application source
├── server.ts             # Express backend and AI integrations
├── index.html            # HTML entry point
├── package.json          # Dependencies and npm scripts
├── package-lock.json     # Dependency lockfile
├── bun.lock              # Bun lockfile
├── .env.example          # Environment variable template
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── metadata.json         # Application metadata
└── README.md             # Project documentation
```

## 🎯 Project Goals

- Make interview preparation accessible through AI.
- Help candidates practice realistic interview conversations.
- Improve communication and professional answer structure.
- Provide actionable feedback through AI-powered performance analysis.
- Explore real-time voice AI and full-stack application development.

## 👨‍💻 Developer

**Anand Kumar**

B.Tech Computer Science Engineering — Artificial Intelligence and Machine Learning.

Interested in full-stack development, AI-powered applications, and building practical tools that solve real-world problems.

- **GitHub:** [Anand-kumar1234](https://github.com/Anand-kumar1234)
- **Project Repository:** [AI Interview](https://github.com/Anand-kumar1234/Ai_Interview)
- **Live Demo:** [Try AI Interview](https://ai-interview-three-xi.vercel.app/)

## 📄 License

No confirmed open-source license has been specified here. Add a `LICENSE` file if you want to define the terms under which others can use, modify, and distribute the project.

---

**Built with ❤️ by Anand Kumar**
