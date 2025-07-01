import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInfo, setupMFA, verifyMFA, disableMFA } from '../api/auth';
import { ShieldCheckIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Alert from '../components/Alert';

const Dashboard = () => {
  const { token, logout, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login', { replace: true });
    }
  }, [token, loading, navigate]);

  const { data: user, isLoading, error: userError } = useQuery({
    queryKey: ['userInfo', token],
    queryFn: () => {
      return getUserInfo(token!);
    },
    enabled: !!token && !loading,
    retry: false
  });

  const setupMutation = useMutation({
    mutationFn: () => setupMFA(token!),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setShowMFASetup(true);
      setError('');
    },
    onError: () => {
      setError('Failed to setup MFA');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyMFA(token!, totpCode),
    onSuccess: () => {
      setShowMFASetup(false);
      setTotpCode('');
      setSuccess('MFA enabled successfully');
      queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
    },
    onError: () => {
      setError('Invalid verification code');
    }
  });

  const disableMutation = useMutation({
    mutationFn: () => disableMFA(token!),
    onSuccess: () => {
      setSuccess('MFA disabled successfully');
      queryClient.invalidateQueries({ queryKey: ['userInfo', token] });
    },
    onError: () => {
      setError('Failed to disable MFA');
    }
  });

  const handleEnableMFA = () => {
    setError('');
    setSuccess('');
    setupMutation.mutate();
  };

  const handleVerifyMFA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verifyMutation.mutate();
  };

  const handleDisableMFA = () => {
    if (confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      setError('');
      setSuccess('');
      disableMutation.mutate();
    }
  };

  const closeMFASetup = () => {
    setShowMFASetup(false);
    setQrCode('');
    setTotpCode('');
    setError('');
  };

  if (loading || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (userError || !user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Failed to load user info</h2>
          <p className="text-gray-600 mb-4">
            {userError?.message || 'Unable to fetch user data'}
          </p>
          <button
            onClick={() => {
              logout();
            }}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-md">
            <span className="text-3xl font-bold text-blue-600">👤</span>
          </div>
          <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight mb-1">Welcome!</h2>
          <p className="text-gray-500 text-sm">You are logged in.</p>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-semibold text-gray-700">2FA Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.totpEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.totpEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* MFA Controls */}
          <div className="mb-4">
            {user.totpEnabled ? (
              <button
                onClick={handleDisableMFA}
                disabled={disableMutation.isPending}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <ShieldExclamationIcon className="h-5 w-5" />
                {disableMutation.isPending ? 'Disabling...' : 'Disable MFA'}
              </button>
            ) : (
              <button
                onClick={handleEnableMFA}
                disabled={setupMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                {setupMutation.isPending ? 'Setting up...' : 'Enable MFA'}
              </button>
            )}
          </div>
        </div>

        {(error || success) && (
          <div className="mb-4">
            <Alert type={error ? 'error' : 'success'}>{error || success}</Alert>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 mt-4"
        >
          Sign Out
        </button>
      </div>

      {/* MFA Setup Modal */}
      {showMFASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Setup MFA</h3>
              <button onClick={closeMFASetup} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="mx-auto mb-4 border rounded-lg" />
              )}
            </div>

            <form onSubmit={handleVerifyMFA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter verification code
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-center tracking-widest text-lg font-mono"
                  placeholder="123456"
                  autoFocus
                />
              </div>
              
              {error && <Alert type="error">{error}</Alert>}
              
              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-60"
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify & Enable MFA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
