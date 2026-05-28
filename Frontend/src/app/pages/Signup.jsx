import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Shield, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Invalid email format');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setError('');
    setIsLoading(true);
    
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-[#09090b] items-center justify-center min-h-screen relative overflow-hidden px-4 py-12">
      {/* Premium Cyber Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Glassmorphic Signup Card */}
      <div className="w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/80 shadow-[0_0_50px_rgba(79,70,229,0.1)] relative z-10 transition-all duration-300 hover:border-zinc-700/50">
        
        {/* Animated Cyber Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-purple-500 animate-shimmer" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-bounce duration-1000">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-zinc-500 text-xs mt-1.5 font-medium tracking-wider uppercase">Join the Model Arena</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <label className="block mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 flex justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-sm mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-xs font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
