<div align="center">

# 📱 TensPilot+ Patient App

**Companion patient application for the TensPilot+ ecosystem — connecting TENS therapy patients with their healthcare providers**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[🌐 Live Demo](https://tenspilot.vercel.app) · [🩺 Provider Dashboard](https://github.com/Akachi240/tenspilot-doctors-dashboard) · [🐛 Report Bug](https://github.com/Akachi240/remix-of-tenspilot1/issues)

</div>

---

## 📖 About the Project

**TensPilot+** is a healthcare software ecosystem built to support patients using a TENS (Transcutaneous Electrical Nerve Stimulation) device for pain management.

The ecosystem has two components:
- 🔧 **The TENS Device** — a standalone hardware unit (Arduino Uno based, 4 therapy modes) that delivers electrical stimulation therapy
- 💻 **TensPilot+ Software** — this companion web application (and the provider dashboard) that helps patients log their sessions, track pain levels, and stay connected with their doctor

> The apps and hardware operate independently — TensPilot+ is a **companion app**, not a direct device interface. Patients use it alongside their TENS therapy to keep records and communicate with their provider.

---

## ✨ Features

### 🩺 Patient Tools
| Feature | Description |
|---|---|
| 📊 **Pain Tracker** | Log pain levels before and after sessions, visualise trends over time |
| 📈 **Health Dashboard** | Overview of session history, pain relief stats and progress |
| 📋 **Session Reports** | Auto-generated PDF health reports to share with your doctor |
| 💬 **AI Health Chat** | 24/7 AI-powered health assistant (powered by Groq LLM) |
| 🎓 **Health Education** | Curated medical content and therapy guidance |
| 🎮 **Gamification** | Motivational challenges to keep patients engaged with their therapy |
| ⚙️ **Session Logging** | Manual session entry: mode used, intensity, duration, pain scores |
| 🔔 **Account Settings** | Profile management, language preferences and notifications |

### ⚙️ Technical Highlights
| Capability | Detail |
|---|---|
| 🚀 **Performance** | Vite 5 build system with SWC compiler — sub-second HMR |
| 📱 **PWA** | Full offline support with service workers |
| 🌐 **i18n Ready** | Multi-language support via i18next |
| 🔒 **Secure Auth** | Firebase Authentication with JWT token management |
| ♿ **Accessible** | WCAG-compliant UI built on shadcn/ui + Radix primitives |
| 🎨 **Design System** | Custom TensPilot+ theme with Framer Motion animations |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend Framework** | React + TypeScript | 19 / 5.5 |
| **Build Tool** | Vite + SWC | 5.x |
| **Styling** | Tailwind CSS + shadcn/ui | 3.x |
| **Animations** | Framer Motion | 12.x |
| **State Management** | Zustand | 5.x |
| **Server State** | TanStack Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Backend** | Firebase Auth + Firestore | 12.x |
| **AI / LLM** | Groq SDK | 1.x |
| **PDF Export** | jsPDF | 4.x |
| **Charts** | Recharts | 2.x |
| **Routing** | React Router v6 | 6.x |
| **Testing** | Vitest + React Testing Library | 4.x |
| **Code Quality** | ESLint + Husky + lint-staged | — |
| **Deployment** | Vercel | — |

---

## 🚀 Quick Start

### Prerequisites
- Node.js `>= 18.x`
- npm or bun

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Akachi240/remix-of-tenspilot1.git
cd remix-of-tenspilot1

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Firebase & Groq API credentials

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Copy `.env.example` to `.env.local` and populate:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_API_KEY=your_groq_api_key
```

---

## 📂 Project Structure

```
remix-of-tenspilot1/
├── public/                  # Static assets (icons, PWA manifest)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── auth/           # Login, registration flows
│   │   ├── chat/           # AI chat interface
│   │   ├── dashboard/      # Dashboard widgets & cards
│   │   ├── pain-tracker/   # Pain logging components
│   │   └── reports/        # Report generation
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Firebase config, utilities, helpers
│   ├── pages/              # Route-level page components
│   └── test/               # Unit & integration tests
├── docs/                    # Additional documentation
├── .env.example             # Environment variable template
└── vite.config.ts           # Vite configuration
```

---

## 🗺️ Key Routes

| Route | Page | Description |
|---|---|---|
| `/` | Splash | Animated entry screen |
| `/login` | Login | Firebase authentication |
| `/dashboard` | Dashboard | Main health overview |
| `/session-setup` | Session Setup | Log a new therapy session |
| `/active-session` | Active Session | Active session tracking |
| `/pain-tracker` | Pain Tracker | Log and visualise pain data |
| `/chat` | AI Chat | Groq-powered health assistant |
| `/report` | Report | PDF health report generation |
| `/education` | Education | Health articles & content |
| `/competition` | Competition | Gamified therapy challenges |
| `/settings` | Settings | Account & preferences |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          TensPilot+ Patient App                  │
│  React 19 + TypeScript + Vite + Tailwind CSS    │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
   ┌─────────────────┐  ┌───────────────────┐
   │    Firebase      │  │  External APIs    │
   │  Auth + Firestore│  │  Groq (AI chat)   │
   │  (shared with    │  │  Vercel (hosting) │
   │  Provider App)   │  └───────────────────┘
   └────────┬─────────┘
            │ Real-time sync
            ▼
   ┌──────────────────────────────┐
   │   TensPilot+ Provider App   │
   │  (tenspilot-doctors-dashboard)│
   └──────────────────────────────┘
```

Both apps share the same Firebase backend — patient data entered in the patient app is immediately visible to the doctor in the provider dashboard.

---

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Akachi** — Healthcare Software Engineer

[![GitHub](https://img.shields.io/badge/GitHub-@Akachi240-181717?logo=github)](https://github.com/Akachi240)

---

## 🔗 Related

- 🩺 **[TensPilot+ Provider Dashboard](https://github.com/Akachi240/tenspilot-doctors-dashboard)** — Doctor-facing companion app (shared Firebase backend)

---

<div align="center">
<strong>Made with ❤️ for better healthcare outcomes</strong>
</div>
