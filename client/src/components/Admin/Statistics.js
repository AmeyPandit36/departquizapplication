import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast } from 'react-toastify';

const Statistics = () => {
  const [quizzesByClass, setQuizzesByClass] = useState([]);
  const [quizzesBySubject, setQuizzesBySubject] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchStats();
  }, [selectedStudent]);

  const fetchStats = async () => {
    try {
      const [classRes, subjectRes, partRes, scoresRes, perfRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/quizzes-by-class`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/quizzes-by-subject`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-participation`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-scores`, {
          params: selectedStudent ? { student_id: selectedStudent } : {}
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-performance`, {
          params: selectedStudent ? { student_id: selectedStudent } : {}
        })
      ]);

      setQuizzesByClass(classRes.data);
      setQuizzesBySubject(subjectRes.data);
      setParticipation(partRes.data);
      setStudentScores(scoresRes.data);
      setPerformance(perfRes.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h2>Statistics & Analytics</h2>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <div className="value">{quizzesByClass.reduce((sum, item) => sum + item.total_quizzes, 0)}</div>
        </div>
        <div className="stat-card">
          <h3>Total Subjects</h3>
          <div className="value">{quizzesBySubject.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="value">{participation.reduce((sum, item) => sum + item.total_students, 0)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Student (optional): </label>
        <input
          type="text"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          placeholder="Enter Student ID"
          style={{ padding: '8px', marginLeft: '10px', width: '200px' }}
        />
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Quizzes by Class</h3>
        <BarChart width={600} height={300} data={quizzesByClass}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="class_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_quizzes" fill="#8884d8" />
        </BarChart>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Student Participation</h3>
        <BarChart width={800} height={400} data={participation}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject_name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="students_attempted" fill="#00C49F" name="Attempted" />
          <Bar dataKey="students_not_attempted" fill="#FF8042" name="Not Attempted" />
        </BarChart>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Student Performance by Subject</h3>
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

      <div className="card">
        <h3>Individual Student Scores</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Subject</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {studentScores.map((score, index) => (
              <tr key={index}>
                <td>{score.user_id}</td>
                <td>{score.student_name}</td>
                <td>{score.subject_name}</td>
                <td>{score.quiz_title}</td>
                <td>{score.score} / {score.total_marks}</td>
                <td>{score.percentage}%</td>
                <td>{new Date(score.submitted_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Statistics;












