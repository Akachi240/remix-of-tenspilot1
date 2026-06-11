import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById("root")!, {
  onRecoverableError: (error, errorInfo) => {
    // Suppress hydration warnings caused by browser extensions
    if (
      error instanceof Error &&
      (error.message.includes('Hydration') || error.message.includes('hydration'))
    ) {
      return;
    }
    console.error(error, errorInfo);
  }
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);