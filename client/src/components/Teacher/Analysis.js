import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'react-toastify';

const Analysis = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState('');
  const [subjectAnalysis, setSubjectAnalysis] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizDetails, setQuizDetails] = useState(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [questionAnalysis, setQuestionAnalysis] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchExperiments();
      fetchSubjectAnalysis();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectAnalysis();
    }
  }, [selectedExperiment]);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestionAnalysis();
      fetchQuizAttempts();
    } else {
      setQuestionAnalysis([]);
      setQuizAttempts([]);
    }
  }, [selectedQuiz]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/subjects');
      setSubjects(response.data);
      if (response.data.length > 0 && !selectedSubject) {
        setSelectedSubject(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchExperiments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/experiments/${selectedSubject}`);
      setExperiments(response.data);
      setSelectedExperiment('');
    } catch (error) {
      toast.error('Failed to fetch experiments');
    }
  };

  const fetchSubjectAnalysis = async () => {
    try {
      const url = selectedExperiment
        ? `http://localhost:5000/api/teacher/analysis/subject/${selectedSubject}?experiment_id=${selectedExperiment}`
        : `http://localhost:5000/api/teacher/analysis/subject/${selectedSubject}`;
      const response = await axios.get(url);
      setSubjectAnalysis(response.data);
      if (response.data.length > 0 && !selectedQuiz) {
        setSelectedQuiz(response.data[0].quiz_id);
      }
    } catch (error) {
      toast.error('Failed to fetch analysis');
    }
  };

  const fetchQuizDetails = async (quizId) => {
    try {
      // Ensure quizId is a clean number
      const cleanQuizId = typeof quizId === 'string' ? quizId.split(':')[0] : quizId;
      const response = await axios.get(`http://localhost:5000/api/teacher/quizzes/details/${cleanQuizId}`);
      setQuizDetails(response.data);
      setShowQuizDetails(true);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch quiz details';
      toast.error(errorMessage);
    }
  };

  const fetchQuestionAnalysis = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/analysis/quiz/${selectedQuiz}/questions`);
      setQuestionAnalysis(response.data);
    } catch (error) {
      console.error('Question analysis error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch question analysis';
      toast.error(errorMessage);
      setQuestionAnalysis([]);
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/quizzes/${selectedQuiz}/attempts`);
      setQuizAttempts(response.data);
    } catch (error) {
      toast.error('Failed to fetch quiz attempts');
    }
  };

  return (
    <div>
      <h2>Quiz Analysis</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label>Select Subject: </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedExperiment('');
              setSelectedQuiz('');
            }}
            style={{ padding: '10px', marginLeft: '10px', width: '300px' }}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.class_name} - {subject.name}
              </option>
            ))}
          </select>
        </div>
        {selectedSubject && experiments.length > 0 && (
          <div>
            <label>Filter by Experiment: </label>
            <select
              value={selectedExperiment}
              onChange={(e) => {
                setSelectedExperiment(e.target.value);
                setSelectedQuiz('');
              }}
              style={{ padding: '10px', marginLeft: '10px', width: '250px' }}
            >
              <option value="">All Experiments</option>
              {experiments.map(exp => (
                <option key={exp.id} value={exp.id}>
                  Exp {exp.experiment_number}: {exp.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedSubject && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Subject Performance Overview</h3>
            <BarChart width={800} height={400} data={subjectAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quiz_title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_percentage" fill="#0088FE" name="Average %" />
              <Bar dataKey="min_percentage" fill="#FFBB28" name="Min %" />
              <Bar dataKey="max_percentage" fill="#00C49F" name="Max %" />
            </BarChart>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Quiz Details</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Experiment</th>
                  <th>Avg %</th>
                  <th>Min %</th>
                  <th>Max %</th>
                  <th>Attempts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjectAnalysis.map(quiz => (
                  <tr key={quiz.quiz_id}>
                    <td>{quiz.quiz_title}</td>
                    <td>Exp {quiz.experiment_number}</td>
                    <td>{parseFloat(quiz.avg_percentage || 0).toFixed(2)}%</td>
                    <td>{parseFloat(quiz.min_percentage || 0).toFixed(2)}%</td>
                    <td>{parseFloat(quiz.max_percentage || 0).toFixed(2)}%</td>
                    <td>{quiz.total_attempts || 0}</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedQuiz(quiz.quiz_id);
                          fetchQuizDetails(quiz.quiz_id);
                        }}
                        style={{ marginRight: '10px' }}
                      >
                        View Quiz Details
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedQuiz(quiz.quiz_id);
                          setShowQuizDetails(false);
                          setQuizDetails(null);
                        }}
                      >
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showQuizDetails && quizDetails && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>Quiz Details</h2>
              <button className="close-btn" onClick={() => {
                setShowQuizDetails(false);
                setQuizDetails(null);
              }}>×</button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Title:</strong> {quizDetails.quiz.title}</p>
              <p><strong>Subject:</strong> {quizDetails.quiz.subject_name}</p>
              <p><strong>Experiment:</strong> Exp {quizDetails.quiz.experiment_number} - {quizDetails.quiz.experiment_title}</p>
              <p><strong>Total Marks:</strong> {quizDetails.quiz.total_marks}</p>
              <p><strong>Duration:</strong> {quizDetails.quiz.duration_minutes ? `${quizDetails.quiz.duration_minutes} minutes` : 'No limit'}</p>
              <p><strong>Start Date:</strong> {quizDetails.quiz.start_date ? new Date(quizDetails.quiz.start_date).toLocaleString() : 'Not set'}</p>
              <p><strong>End Date:</strong> {quizDetails.quiz.end_date ? new Date(quizDetails.quiz.end_date).toLocaleString() : 'Not set'}</p>
              <p><strong>Status:</strong> <span style={{ color: quizDetails.quiz.is_active ? 'green' : 'red' }}>
                {quizDetails.quiz.is_active ? 'Active' : 'Inactive'}
              </span></p>
            </div>
            <div>
              <h3>Questions</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Marks</th>
                    <th>Options</th>
                    <th>Correct Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {quizDetails.questions.map((q, index) => (
                    <tr key={q.id}>
                      <td>{index + 1}</td>
                      <td>{q.question_text}</td>
                      <td>{q.question_type.toUpperCase()}</td>
                      <td>{q.marks}</td>
                      <td>
                        {q.options ? (
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {q.options.map((opt, optIndex) => (
                              <li key={optIndex}>{opt}</li>
                            ))}
                          </ul>
                        ) : '-'}
                      </td>
                      <td>{q.correct_answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedQuiz && !showQuizDetails && (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Quiz Analysis</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedQuiz('');
                  setQuestionAnalysis([]);
                  setQuizAttempts([]);
                }}
              >
                Close Analysis
              </button>
            </div>
          </div>
          
          {questionAnalysis.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Question-wise Performance</h3>
              <BarChart width={800} height={400} data={questionAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question_text" angle={-45} textAnchor="end" height={150} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy_percentage" fill="#8884d8" name="Accuracy %" />
              </BarChart>
            </div>
          )}

          {questionAnalysis.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Question Analysis Details</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Marks</th>
                    <th>Correct Answers</th>
                    <th>Total Attempts</th>
                    <th>Accuracy %</th>
                  </tr>
                </thead>
                <tbody>
                  {questionAnalysis.map((q, index) => (
                    <tr key={index}>
                      <td>{q.question_text.substring(0, 50)}...</td>
                      <td>{q.marks}</td>
                      <td>{q.correct_answers}</td>
                      <td>{q.total_attempts}</td>
                      <td>{parseFloat(q.accuracy_percentage).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {quizAttempts.length > 0 && (
            <div className="card">
              <h3>Student Attempts</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map(attempt => (
                    <tr key={attempt.id}>
                      <td>{attempt.user_id}</td>
                      <td>{attempt.student_name}</td>
                      <td>{attempt.score}</td>
                      <td>{parseFloat(attempt.percentage || 0).toFixed(2)}%</td>
                      <td>{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {questionAnalysis.length === 0 && quizAttempts.length === 0 && (
            <div className="card">
              <p>Loading analysis data...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analysis;

