import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ProfileProvider } from "@/context/ProfileContext";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import Splash from "./pages/Splash";
import Index from "./pages/Index";
import SessionSetup from "./pages/SessionSetup";
import ActiveSession from "./pages/ActiveSession";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { PainTracker } from "@/components/patient/PainTracker";
import PasswordResetPage from "./pages/PasswordReset";
import TestPainTracker from './pages/TestPainTracker';
import Chat from "./pages/Chat";
import VideoConsult from "./pages/VideoConsult";

// Lazy-load Education page — its EducationGuide component is ~495KB
const Education = React.lazy(() => import("./pages/Education"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-dark)' }} />
      <p className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>Loading…</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  // ── Public routes ──
  { path: "/", element: <Splash /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Login /> },
  { path: "/home", element: <Index /> },
  { path: "/password-reset", element: <PasswordResetPage /> },
  {
    path: "/education",
    element: (
      <Suspense fallback={<LazyFallback />}>
        <Education />
      </Suspense>
    ),
  },

  // ── Protected routes (require auth) ──
  {
    path: "/session-setup",
    element: (
      <ProtectedRoute>
        <SessionSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/active-session",
    element: (
      <ProtectedRoute>
        <ActiveSession />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pain-tracker",
    element: (
      <ProtectedRoute>
        <PainTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/report",
    element: (
      <ProtectedRoute>
        <Report />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/video-consult",
    element: (
      <ProtectedRoute>
        <VideoConsult />
      </ProtectedRoute>
    ),
  },
  { path: "/test-pain-tracker", element: <ProtectedRoute><TestPainTracker /></ProtectedRoute> },

  // ── Catch-all ──
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;