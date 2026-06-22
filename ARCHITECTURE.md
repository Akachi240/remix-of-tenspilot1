# Tenspilot M10s — System Architecture

This document describes the technical architecture of the Tenspilot Patient Application and how it integrates within the broader M10s ecosystem.

---

## 🏗️ High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TENSPILOT M10s ECOSYSTEM                         │
│                                                                         │
│   ┌─────────────────────┐         ┌─────────────────────────────────┐  │
│   │   M10s Hardware     │         │     Patient Web Application     │  │
│   │   (TENS Device)     │──BLE/──▶│   React 19 + Vite + Firebase   │  │
│   │                     │  WiFi   │   (this repository)             │  │
│   └─────────────────────┘         └────────────────┬────────────────┘  │
│                                                     │ Firestore         │
│                                                     ▼                   │
│                                          ┌──────────────────────┐      │
│                                          │   Firebase Backend   │      │
│                                          │   Auth + Firestore   │      │
│                                          │   + Storage          │      │
│                                          └──────────┬───────────┘      │
│                                                     │ Real-time sync    │
│                                                     ▼                   │
│                                    ┌────────────────────────────────┐  │
│                                    │   Provider Dashboard           │  │
│                                    │   (tenspilot-doctors-dashboard)│  │
│                                    └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Application Layer Structure

```
remix-of-tenspilot1/
├── src/
│   ├── components/          # Reusable UI primitives & feature components
│   │   ├── ui/             # shadcn/ui base components (Button, Card, etc.)
│   │   ├── auth/           # Login, signup, password reset
│   │   ├── chat/           # Groq AI chat interface components
│   │   ├── dashboard/      # Health overview widgets
│   │   ├── pain-tracker/   # Pain logging & visualisation
│   │   ├── reports/        # PDF report generation
│   │   ├── session/        # M10s device session management
│   │   └── video/          # Jitsi video consultation
│   ├── context/            # React Context API providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Firebase SDK, utilities, type helpers
│   ├── pages/              # Route-level components
│   └── test/               # Vitest unit & integration tests
```

---

## 🔐 Authentication Architecture

```
User → Login Page
         │
         ▼
   Firebase Auth (Email/Password)
         │
         ├─ Success → JWT Token issued
         │             │
         │             ▼
         │      ProtectedRoute HOC
         │      checks auth state on every route
         │             │
         │             ▼
         │         Authenticated App
         │
         └─ Failure → Error message → Retry
```

**Key files:**
- `src/context/AuthContext.tsx` — Global auth state
- `src/lib/firebase.ts` — Firebase SDK initialisation
- `src/components/auth/ProtectedRoute.tsx` — Route guard

---

## 🗃️ State Management

| Scope | Tool | Use Case |
|---|---|---|
| **Global** | React Context | Auth state, user profile |
| **Server** | TanStack Query | API calls, Firestore queries, caching |
| **Local** | `useState` / `useReducer` | Component-local UI state |
| **Global lightweight** | Zustand | Theme, notification preferences |
| **Forms** | React Hook Form | All form state and validation |

---

## 🌐 Routing (React Router v6)

All routes are protected by `ProtectedRoute`. Public routes:

| Route | Access |
|---|---|
| `/splash` | Public |
| `/login` | Public |
| `/password-reset` | Public |
| `/dashboard` and all others | 🔒 Protected |

---

## 🤖 AI Chat Architecture

```
User Message
    │
    ▼
src/pages/Chat.tsx
    │
    ▼
Groq SDK (client-side API call)
    │
    ├─ Context injected: patient health summary, session history
    │
    ▼
LLM Response (streamed)
    │
    ▼
Chat UI (rendered with markdown support)
```

> ⚠️ API key is accessed via `VITE_GROQ_API_KEY` — do not commit your `.env.local`

---

## 🎬 Video Consultation Architecture

```
Patient opens /video-consult
    │
    ▼
JitsiMeeting component (from @jitsi/react-sdk)
    │
    ├─ Room name generated from appointment ID in Firestore
    │
    ▼
Peer-to-peer WebRTC connection via Jitsi servers
    │
    ▼
Doctor joins same room from Provider Dashboard
```

---

## 📊 Data Flow — Device Session

```
M10s Device
    │ (BLE or local API)
    ▼
SessionSetup page — configures treatment params
    │
    ▼
ActiveSession page — polls real-time device data
    │
    ▼
Firestore (sessions collection)
    │
    ├─ Patient sees session history in Dashboard
    └─ Doctor sees session data in Provider Dashboard
```

---

## 🧪 Testing Strategy

| Type | Tool | Coverage |
|---|---|---|
| Unit tests | Vitest | Pure functions, hooks, utilities |
| Component tests | React Testing Library | UI behaviour, user interactions |
| Integration tests | Vitest + jsdom | Multi-component flows |
| E2E (future) | Playwright | Full user journeys |

Run: `npm run test:coverage`

---

## 🚀 Deployment

- **Platform**: Vercel (automatic preview deployments on PRs)
- **Config**: `vercel.json` — SPA routing with rewrites to `index.html`
- **Environment**: All `VITE_*` env vars must be set in Vercel dashboard
- **Build command**: `npm run build` → `tsc -b && vite build`

---

## 🔗 Related Repositories

- **[Provider Dashboard](https://github.com/Akachi240/tenspilot-doctors-dashboard)** — Doctor-facing application sharing the same Firebase backend
