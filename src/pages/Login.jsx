import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import LiveClock from '../components/LiveClock';
import logo from '../assets/new_logo_vertical.png';

export default function Login() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(staffId, password);
      navigate(user.is_admin ? '/admin' : '/clock');
    } catch (err) {
      setError('Staff ID or password is incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full relative z-10">
        <div className="flex justify-center mb-8">
          <LiveClock size="sm" />
        </div>

        <div className="bg-paper-raised rounded-2xl shadow-xl shadow-slate-200/50 border border-line overflow-hidden">
          <div className="brand-accent-strip" />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Univasa" className="h-16 object-contain mb-5" />
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">Staff Portal</h1>
              <p className="text-sm text-ink-soft mt-1.5">Secure access for clock-in operations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label htmlFor="staffId" className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Staff ID
                </label>
                <input
                  id="staffId"
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl border border-line bg-paper font-mono-num text-base focus:ring-2 focus:ring-univasa focus:border-univasa outline-none transition-all placeholder:text-slate-400"
                  placeholder="STAFF001"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </div>
              
              {/* 2. Wrapped password field in a relative div and added the toggle button */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"} // Dynamic type
                    required
                    autoComplete="current-password"
                    // Added pr-12 to ensure typed text doesn't hide behind the icon
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-line bg-paper text-base focus:ring-2 focus:ring-univasa focus:border-univasa outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-ink-soft hover:text-univasa transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye Slash Icon (Hide)
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      // Eye Icon (Show)
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-univasa-dark bg-univasa-light border border-univasa/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-univasa hover:bg-univasa-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl transition-all shadow-md shadow-univasa/20 hover:shadow-lg hover:shadow-univasa/30 tracking-wide active:scale-[0.98] mt-2"
              >
                {submitting ? 'Authenticating…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-ink-soft mt-8 font-medium">
          Having trouble signing in? Contact your site administrator.
        </p>
      </div>
    </div>
  );
}