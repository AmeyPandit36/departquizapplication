import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MyQuizzes from './MyQuizzes';
import MyScores from './MyScores';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('quizzes');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <nav className="nav-menu">
        <Link 
          to="/student/quizzes" 
          className={activeTab === 'quizzes' ? 'active' : ''}
          onClick={() => setActiveTab('quizzes')}
        >
          My Quizzes
        </Link>
        <Link 
          to="/student/scores" 
          className={activeTab === 'scores' ? 'active' : ''}
          onClick={() => setActiveTab('scores')}
        >
          My Scores
        </Link>
      </nav>

      <div className="container">
        <Routes>
          <Route path="quizzes" element={<MyQuizzes />} />
          <Route path="scores" element={<MyScores />} />
          <Route path="*" element={<MyQuizzes />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;












