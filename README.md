<div align="center">

# 🏥 Tenspilot Patient Application

**AI-powered patient engagement platform for the Tenspilot M10s health monitoring device**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[🌐 Live Demo](https://tenspilot.vercel.app) · [📋 Provider Dashboard](https://github.com/Akachi240/tenspilot-doctors-dashboard) · [🐛 Report Bug](https://github.com/Akachi240/remix-of-tenspilot1/issues) · [✨ Request Feature](https://github.com/Akachi240/remix-of-tenspilot1/issues)

</div>

---

## 📖 About the Project

The **Tenspilot M10s** is a next-generation health monitoring device designed to bridge the gap between patients and healthcare providers. This patient-facing web application serves as the digital companion — empowering users to track their health in real time, connect with their doctors over live video, and receive AI-driven health guidance 24/7.

> Built for patients. Designed for impact. Powered by modern web technology.

---

## ✨ Features

### 🩺 Core Healthcare
| Feature | Description |
|---|---|
| 📊 **Pain Tracker** | Intelligent pain logging with trend analysis and visual patterns |
| 🎬 **Video Consultations** | Real-time, peer-to-peer doctor consultations via Jitsi SDK |
| 💬 **AI Health Chat** | 24/7 AI-powered health assistant powered by Groq LLM |
| 📈 **Live Dashboard** | Real-time health metrics from the M10s device |
| 📋 **Smart Reports** | Auto-generated clinical reports exportable as PDF |
| 🎮 **Gamification** | Competitive health challenges to keep patients motivated |
| 🎓 **Health Education** | Curated medical content and treatment guidance |
| 🔔 **Session Management** | Full TENS device session setup, monitoring & logging |

### ⚙️ Technical Highlights
| Capability | Detail |
|---|---|
| 🚀 **Performance** | Vite 5 build system with SWC compiler — sub-second HMR |
| 📱 **PWA** | Full offline support with service workers |
| 🌐 **i18n Ready** | Multi-language support via i18next |
| 🔒 **Secure Auth** | Firebase Authentication with JWT token management |
| ♿ **Accessible** | WCAG-compliant UI built on shadcn/ui + Radix primitives |
| 🎨 **Design System** | Custom Tenspilot theme with Framer Motion animations |

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
| **Video Calls** | Jitsi React SDK | 1.x |
| **PDF Export** | jsPDF | 4.x |
| **QR Codes** | qrcode | 1.x |
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
│   │   ├── reports/        # Report generation
│   │   └── video/          # Video consultation UI
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, Firebase config, helpers
│   ├── pages/              # Route-level page components
│   └── test/               # Unit & integration tests
├── docs/                    # Additional documentation
├── .env.example             # Environment variable template
├── vite.config.ts           # Vite configuration
└── tailwind.config.ts       # Tailwind design system
```

---

## 🗺️ Key Routes

| Route | Page | Description |
|---|---|---|
| `/` | Splash | Animated entry screen |
| `/login` | Login | Firebase authentication |
| `/dashboard` | Dashboard | Main health overview |
| `/session-setup` | Session Setup | M10s device configuration |
| `/active-session` | Active Session | Live session monitoring |
| `/pain-tracker` | Pain Tracker | Log and visualize pain data |
| `/video-consult` | Video Consult | Real-time doctor video call |
| `/chat` | AI Chat | Groq-powered health assistant |
| `/report` | Report | PDF health report generation |
| `/education` | Education | Health articles & content |
| `/competition` | Competition | Gamified health challenges |
| `/settings` | Settings | Account & device settings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                Patient Browser App               │
│  React 19 + TypeScript + Vite + Tailwind CSS    │
│  ─────────────────────────────────────────────  │
│  Zustand (global state)                         │
│  TanStack Query (server state + caching)        │
│  React Router v6 (client-side routing)          │
└──────────┬──────────────────────────────────────┘
           │
    ┌──────┴───────────────────────┐
    │                              │
    ▼                              ▼
┌────────────────┐      ┌─────────────────────┐
│   Firebase     │      │   External Services  │
│  ─────────── │      │  ──────────────────  │
│  Auth (JWT)   │      │  Groq SDK (AI Chat)  │
│  Firestore DB │      │  Jitsi (Video Calls) │
│  Storage      │      │  Vercel (Hosting)    │
└────────────────┘      └─────────────────────┘
```

### Authentication Flow
1. User signs in via Firebase Auth (email/password or OAuth)
2. JWT token stored and refreshed automatically
3. `ProtectedRoute` wrapper guards all authenticated pages
4. Firestore user document synced on session start

---

## 🧪 Testing

```bash
# Run all tests (single pass)
npm run test

# Watch mode (TDD)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests live in `src/test/` and use **Vitest** + **React Testing Library** + **jsdom**.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing. Any contributions you make are **greatly appreciated**!

1. **Fork** the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for our code standards and contribution guidelines.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

## 👨‍💻 Author

**Akachi** — Healthcare Software Engineer

[![GitHub](https://img.shields.io/badge/GitHub-@Akachi240-181717?logo=github)](https://github.com/Akachi240)

---

## 🔗 Related

- 🏥 **[Tenspilot Provider Dashboard](https://github.com/Akachi240/tenspilot-doctors-dashboard)** — Doctor-facing clinical management interface

---

<div align="center">
<strong>Made with ❤️ for better healthcare outcomes</strong>
</div>
