import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const mutation = useMutation({
    mutationFn: () => loginApi(email, password),
    onSuccess: (data) => {
      if (data.requiresTOTP || data.totpEnabled) {
        sessionStorage.setItem('loginEmail', email);
        sessionStorage.setItem('loginPassword', password);
        navigate('/verify');
      } else if (data.token) {
        setToken(data.token);
        sessionStorage.removeItem('loginEmail');
        sessionStorage.removeItem('loginPassword');
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    },
    onError: () => {
      setError('Network error');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-md">
            {/* Logo placeholder */}
            <span className="text-3xl font-bold text-blue-600">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to your secure account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="you@email.com"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pr-10 transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-blue-600 transition"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : null}
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {(error || mutation.error) && <Alert type="error">{error || 'Network error'}</Alert>}
        <div className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium transition">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 