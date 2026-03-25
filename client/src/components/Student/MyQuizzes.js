import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TakeQuiz from './TakeQuiz';

const MyQuizzes = () => {
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchQuizzes();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student/subjects');
      setSubjects(response.data);
      if (response.data.length > 0 && !selectedSubject) {
        setSelectedSubject(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/quizzes/${selectedSubject}`);
      setQuizzes(response.data);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      await axios.post(`http://localhost:5000/api/student/quizzes/${quiz.id}/start`);
      setSelectedQuiz(quiz);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  if (selectedQuiz) {
    return <TakeQuiz quiz={selectedQuiz} onBack={() => {
      setSelectedQuiz(null);
      fetchQuizzes();
    }} />;
  }

  return (
    <div>
      <h2>Available Quizzes</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Select Subject: </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
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

      {selectedSubject && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Experiment</th>
                <th>Total Marks</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>My Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>Exp {quiz.experiment_number}</td>
                  <td>{quiz.total_marks}</td>
                  <td>{quiz.duration_minutes} min</td>
                  <td>{quiz.start_date ? new Date(quiz.start_date).toLocaleDateString() : '-'}</td>
                  <td>{quiz.end_date ? new Date(quiz.end_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span style={{ 
                      color: quiz.attempted ? 'green' : (quiz.in_progress ? 'orange' : 'blue') 
                    }}>
                      {quiz.attempted ? 'Completed' : (quiz.in_progress ? 'In Progress' : 'Available')}
                    </span>
                  </td>
                  <td>
                    {quiz.attempted ? (
                      <span>{quiz.my_score} / {quiz.total_marks} ({quiz.my_percentage}%)</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {!quiz.attempted ? (
                      <button className="btn btn-primary" onClick={() => handleStartQuiz(quiz)}>
                        {quiz.in_progress ? 'Continue Quiz' : 'Start Quiz'}
                      </button>
                    ) : (
                      <span style={{ color: 'green' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;

