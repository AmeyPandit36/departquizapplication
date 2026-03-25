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
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <nav className="nav-menu">
        <Link 
          to="/teacher/experiments" 
          className={activeTab === 'experiments' ? 'active' : ''}
          onClick={() => setActiveTab('experiments')}
        >
          Experiments
        </Link>
        <Link 
          to="/teacher/quizzes" 
          className={activeTab === 'quizzes' ? 'active' : ''}
          onClick={() => setActiveTab('quizzes')}
        >
          Quizzes
        </Link>
        <Link 
          to="/teacher/analysis" 
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </Link>
        <Link 
          to="/teacher/students" 
          className={activeTab === 'students' ? 'active' : ''}
          onClick={() => setActiveTab('students')}
        >
          Students
        </Link>
      </nav>

      <div className="container">
        <Routes>
          <Route path="experiments" element={<Experiments />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="students" element={<Students />} />
          <Route path="*" element={<Experiments />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherDashboard;

