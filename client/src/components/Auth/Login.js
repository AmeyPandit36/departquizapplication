import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [user_id, setUser_id] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(user_id, password);

    if (result.success) {
      toast.success('Login successful!');
      
      const role = result.user?.role;
      
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else if (role === 'student') {
        navigate('/student/home');
      }
    } else {
      toast.error(result.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">
      {/* Left Column: Hero & Branding */}
      <div className="md:w-1/2 relative flex items-center justify-center p-8 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 overflow-hidden min-h-[40vh] md:min-h-screen">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        
        {/* Glass Content inside Hero */}
        <div className="relative z-10 text-center text-white bg-white/10 backdrop-blur-lg border border-white/20 p-10 md:p-14 rounded-3xl shadow-2xl max-w-lg transform hover:scale-[1.02] transition-transform duration-500 will-change-transform">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 shadow-inner ring-1 ring-white/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 drop-shadow-lg leading-tight">
            Department Quiz App
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 font-medium mb-8">
            Excellence in IT Department Assessment
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <span className="px-4 py-2 bg-white/20 rounded-full text-xs md:text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm transition hover:bg-white/30 cursor-default">Secure</span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-xs md:text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm transition hover:bg-white/30 cursor-default">Fast</span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-xs md:text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm transition hover:bg-white/30 cursor-default">Reliable</span>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-slate-50 relative z-20">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-slate-100/60 ring-1 ring-slate-200/50">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your credentials to sign in.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">User ID</label>
              <input
                type="text"
                value={user_id}
                onChange={(e) => setUser_id(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 outline-none shadow-sm"
                placeholder="Enter your User ID"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 outline-none shadow-sm"
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-4 text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 rounded-xl font-bold text-lg tracking-wide shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-1 transform transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <>
                  Sign In
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-center gap-3 text-slate-600 text-sm font-medium">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Admin: <strong className="font-extrabold text-indigo-700 ml-1">ADMIN001</strong> / <strong className="font-extrabold text-indigo-700 ml-1">admin123</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

