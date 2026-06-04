import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Zap } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center space-y-2">
        <p>You're already signed in as {user.email}.</p>
        <p className="text-sm text-slate-500">Redirecting to dashboard…</p>
        <p className="text-sm">
          Want a different account?{' '}
          <Link to="/settings" className="text-blue-600 hover:underline">
            Go to Settings to log out
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm mb-2">
          <Zap className="h-7 w-7" style={{ color: 'var(--accent-dark)' }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">TensPilot+</h1>
      </div>

      {isLogin ? <LoginForm /> : <RegisterForm />}

      <div className="mt-4 text-center text-sm">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <button onClick={() => setIsLogin(false)} className="font-medium text-blue-600 hover:underline">Sign Up</button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button onClick={() => setIsLogin(true)} className="font-medium text-blue-600 hover:underline">Log In</button>
          </p>
        )}
      </div>
    </div>
  );
};