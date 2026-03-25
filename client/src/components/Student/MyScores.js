import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'react-toastify';
import QuizResultView from './QuizResultView';

const MyScores = () => {
  const [scores, setScores] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    fetchScores();
    fetchPerformance();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/scores');
      setScores(response.data);
    } catch (error) {
      toast.error('Failed to fetch scores');
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/performance');
      setPerformance(response.data);
    } catch (error) {
      toast.error('Failed to fetch performance data');
    }
  };

  // Show detailed quiz result view if a quiz is selected
  if (selectedQuizId) {
    return (
      <QuizResultView 
        quizId={selectedQuizId} 
        onBack={() => setSelectedQuizId(null)} 
      />
    );
  }

  return (
    <div>
      <h2>My Scores & Performance</h2>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <div className="value">{scores.length}</div>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="value">
            {scores.length > 0
              ? (scores.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / scores.length).toFixed(1)
              : 0}%
          </div>
        </div>
        <div className="stat-card">
          <h3>Best Score</h3>
          <div className="value">
            {scores.length > 0
              ? Math.max(...scores.map(s => parseFloat(s.percentage))).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {performance.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Performance by Subject</h3>
          <BarChart width={800} height={400} data={performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject_name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avg_percentage" fill="#0088FE" name="Average %" />
            <Bar dataKey="min_percentage" fill="#FFBB28" name="Min %" />
            <Bar dataKey="max_percentage" fill="#00C49F" name="Max %" />
          </BarChart>
        </div>
      )}

      <div className="card">
        <h3>All Quiz Scores</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Class</th>
              <th>Quiz</th>
              <th>Experiment</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={index}>
                <td>{score.subject_name}</td>
                <td>{score.class_name}</td>
                <td>{score.quiz_title}</td>
                <td>Exp {score.experiment_number}</td>
                <td>{score.score} / {score.total_marks}</td>
                <td>{parseFloat(score.percentage).toFixed(2)}%</td>
                <td>{new Date(score.submitted_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedQuizId(score.quiz_id)}
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyScores;











