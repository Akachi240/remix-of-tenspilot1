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
import { PainTracker } from "@/components/patient/PainTracker";
import PasswordResetPage from "./pages/PasswordReset";
import TestPainTracker from './pages/TestPainTracker';
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";

const Education = React.lazy(() => import("./pages/Education"));
const Chat = React.lazy(() => import("./pages/Chat"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Report = React.lazy(() => import("./pages/Report"));
const VideoConsult = React.lazy(() => import("./pages/VideoConsult"));
const Download = React.lazy(() => import("./pages/Download"));
const Competition = React.lazy(() => import("./pages/Competition"));
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
  {
    path: "/download",
    element: (
      <Suspense fallback={<LazyFallback />}>
        <Download />
      </Suspense>
    ),
  },
  {
    path: "/competition",
    element: (
      <Suspense fallback={<LazyFallback />}>
        <Competition />
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
        <Suspense fallback={<LazyFallback />}>
          <Report />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LazyFallback />}>
          <Settings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LazyFallback />}>
          <Chat />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/video-consult",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LazyFallback />}>
          <VideoConsult />
        </Suspense>
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