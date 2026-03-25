import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'react-toastify';

const Students = () => {
  const [selectedClass, setSelectedClass] = useState('SE');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentPerformance();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/students/class/${selectedClass}`);
      setStudents(response.data);
      setSelectedStudent(null);
      setStudentPerformance(null);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchStudentPerformance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/students/${selectedStudent.id}/performance`);
      setStudentPerformance(response.data);
    } catch (error) {
      toast.error('Failed to fetch student performance');
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div>
      <h2>Students by Class</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label>Select Class: </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '10px', marginLeft: '10px', width: '150px' }}
          >
            <option value="SE">SE (Second Year)</option>
            <option value="TE">TE (Third Year)</option>
            <option value="BE">BE (Fourth Year)</option>
          </select>
        </div>
        <div>
          <strong>Total Students: {students.length}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 2fr' : '1fr', gap: '20px' }}>
        <div className="card">
          <h3>{selectedClass} Students</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr 
                    key={student.id}
                    style={{ 
                      backgroundColor: selectedStudent?.id === student.id ? '#e3f2fd' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleStudentClick(student)}
                  >
                    <td>{student.user_id}</td>
                    <td>{student.name}</td>
                    <td>{student.email || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStudentClick(student);
                        }}
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

        {selectedStudent && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Student Details</h3>
              <div style={{ padding: '15px' }}>
                <p><strong>Student ID:</strong> {selectedStudent.user_id}</p>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Email:</strong> {selectedStudent.email || 'Not provided'}</p>
                <p><strong>Subjects:</strong> {selectedStudent.subjects || 'None'}</p>
              </div>
            </div>

            {studentPerformance && (
              <>
                {studentPerformance.statistics && studentPerformance.statistics.length > 0 && (
                  <div className="card" style={{ marginBottom: '20px' }}>
                    <h3>Performance by Subject</h3>
                    <BarChart width={600} height={300} data={studentPerformance.statistics}>
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

                <div className="card" style={{ marginBottom: '20px' }}>
                  <h3>Subject-wise Statistics</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Class</th>
                        <th>Avg %</th>
                        <th>Total Quizzes</th>
                        <th>Min %</th>
                        <th>Max %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPerformance.statistics?.map((stat, index) => (
                        <tr key={index}>
                          <td>{stat.subject_name}</td>
                          <td>{stat.class_name}</td>
                          <td>{parseFloat(stat.avg_percentage || 0).toFixed(2)}%</td>
                          <td>{stat.total_quizzes || 0}</td>
                          <td>{parseFloat(stat.min_percentage || 0).toFixed(2)}%</td>
                          <td>{parseFloat(stat.max_percentage || 0).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card">
                  <h3>All Quiz Attempts</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                        </tr>
                      </thead>
                      <tbody>
                        {studentPerformance.performance?.map((perf, index) => (
                          <tr key={index}>
                            <td>{perf.subject_name}</td>
                            <td>{perf.class_name}</td>
                            <td>{perf.quiz_title}</td>
                            <td>Exp {perf.experiment_number}</td>
                            <td>{perf.score} / {perf.total_marks}</td>
                            <td>{parseFloat(perf.percentage || 0).toFixed(2)}%</td>
                            <td>{new Date(perf.submitted_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;












