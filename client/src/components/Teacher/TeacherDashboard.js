import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Experiments from './Experiments';
import Quizzes from './Quizzes';
import Analysis from './Analysis';
import Students from './Students';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('experiments');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Teacher Portal</h1>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Department Quiz System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800">Welcome, {user?.name}</p>
                <p className="text-xs text-slate-500">Faculty Member</p>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <button 
                onClick={handleLogout} 
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 pb-px overflow-x-auto no-scrollbar">
            <Link 
              to="/teacher/experiments" 
              className={`whitespace-nowrap py-4 px-3 sm:px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'experiments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('experiments')}
            >
              Experiments
            </Link>
            <Link 
              to="/teacher/quizzes" 
              className={`whitespace-nowrap py-4 px-3 sm:px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'quizzes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Quizzes
            </Link>
            <Link 
              to="/teacher/analysis" 
              className={`whitespace-nowrap py-4 px-3 sm:px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('analysis')}
            >
              Performance Analysis
            </Link>
            <Link 
              to="/teacher/students" 
              className={`whitespace-nowrap py-4 px-3 sm:px-4 border-b-2 font-bold text-sm transition-colors ${activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              onClick={() => setActiveTab('students')}
            >
              My Students
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="experiments" element={<Experiments />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="students" element={<Students />} />
          <Route path="*" element={<Experiments />} />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;

