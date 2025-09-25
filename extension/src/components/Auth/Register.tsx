import React, { useState } from 'react';

interface RegisterProps {
  onRegisterSuccess: (token: string, user?: any) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        onRegisterSuccess(data.token, data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">🌟 Create Account</h2>
        <p className="text-slate-400 text-sm">Join the learning revolution</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">👤 Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">📧 Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">🔒 Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Create a secure password"
            required
          />
        </div>
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}
        <button
          type="submit"
          className="btn-primary w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          🚀 Create Account
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Already have an account?{" "}
          <button 
            onClick={onSwitchToLogin} 
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
