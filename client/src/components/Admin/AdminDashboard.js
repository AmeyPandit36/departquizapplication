import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Subjects from './Subjects';
import Teachers from './Teachers';
import Students from './Students';
import Statistics from './Statistics';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <nav className="nav-menu">
        <Link 
          to="/admin/subjects" 
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </Link>
        <Link 
          to="/admin/teachers" 
          className={activeTab === 'teachers' ? 'active' : ''}
          onClick={() => setActiveTab('teachers')}
        >
          Teachers
        </Link>
        <Link 
          to="/admin/students" 
          className={activeTab === 'students' ? 'active' : ''}
          onClick={() => setActiveTab('students')}
        >
          Students
        </Link>
        <Link 
          to="/admin/statistics" 
          className={activeTab === 'statistics' ? 'active' : ''}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </Link>
      </nav>

      <div className="container">
        <Routes>
          <Route path="subjects" element={<Subjects />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="*" element={<Subjects />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;


