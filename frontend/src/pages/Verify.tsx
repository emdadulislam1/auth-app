import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyTOTP } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Verify = () => {
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, token } = useAuth();

  const email = sessionStorage.getItem('loginEmail') || '';
  const password = sessionStorage.getItem('loginPassword') || '';

  useEffect(() => {
    if (!email || !password) {
      sessionStorage.removeItem('loginEmail');
      sessionStorage.removeItem('loginPassword');
      navigate('/login');
    }
  }, [email, password, navigate]);

  const mutation = useMutation({
    mutationFn: () => verifyTOTP(email, password, totpCode),
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        sessionStorage.removeItem('loginEmail');
        sessionStorage.removeItem('loginPassword');
      } else {
        setError(data.error || '2FA failed');
      }
    },
    onError: () => {
      setError('Network error');
    }
  });

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate();
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem('loginEmail');
    sessionStorage.removeItem('loginPassword');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-md">
            <span className="text-3xl font-bold text-blue-600">🔐</span>
          </div>
          <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight mb-1">Two-Factor Verification</h2>
          <p className="text-gray-500 text-sm">Enter the 6-digit code from your authenticator app</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authenticator Code</label>
            <input
              type="text"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-center tracking-widest text-lg font-mono"
              placeholder="123456"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : null}
            {mutation.isPending ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
        {(error || mutation.error) && <Alert type="error">{error || 'Network error'}</Alert>}
        <div className="mt-8 text-center text-sm text-gray-500">
          <button onClick={handleLogout} className="text-blue-600 hover:underline font-medium transition">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
