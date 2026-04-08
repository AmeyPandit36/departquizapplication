import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentHome    from './StudentHome';
import MyQuizzes      from './MyQuizzes';
import MyScores       from './MyScores';
import StudentProfile from './StudentProfile';
import './StudentDashboard.css';

const NAV_ITEMS = [
  { id: 'home',     label: '🏠 Home',     path: '/student/home'    },
  { id: 'quizzes',  label: '📝 Quizzes',  path: '/student/quizzes' },
  { id: 'scores',   label: '📊 Scores',   path: '/student/scores'  },
  { id: 'profile',  label: '👤 Profile',  path: '/student/profile' },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  /* active tab from URL */
  const activeId = NAV_ITEMS.find(n => location.pathname.includes(n.id))?.id || 'home';

  return (
    <div className="student-dashboard min-h-screen bg-slate-50/50">

      {/* ── Sticky Header ── */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                  Student Portal
                </span>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Department Quiz System</p>
              </div>
            </div>

            {/* Right: name + logout */}
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-700">Welcome, {user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all duration-300 text-sm font-medium shadow-sm active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Tab Navigation ── */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-xl flex gap-1 flex-wrap justify-center">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeId === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Routes>
            <Route path="home"    element={<StudentHome onNavigate={(tab) => navigate(`/student/${tab}`)} />} />
            <Route path="quizzes" element={<MyQuizzes />} />
            <Route path="scores"  element={<MyScores />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*"       element={<StudentHome onNavigate={(tab) => navigate(`/student/${tab}`)} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
