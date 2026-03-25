import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QuizResultView.css';

const QuizResultView = ({ quizId, onBack }) => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizResult();
  }, [quizId]);

  const fetchQuizResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/student/quizzes/${quizId}/result`);
      setResultData(response.data);
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      toast.error(error.response?.data?.message || 'Failed to load quiz result');
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading quiz result...</div>;
  }

  if (!resultData) {
    return <div className="error-message">Quiz result not found.</div>;
  }

  const { student, quiz, attempt, questions } = resultData;

  return (
    <div className="quiz-result-view">
      <div className="result-header no-print">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Scores
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print Result
        </button>
      </div>

      <div className="print-container">
        {/* Header for Print */}
        <div className="result-header-print">
          <h1>Quiz Result</h1>
        </div>

        {/* Student Information */}
        <div className="result-section student-info">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{student.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roll Number:</span>
              <span className="info-value">{student.roll_number}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{student.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Quiz Information */}
        <div className="result-section quiz-info">
          <h2>Quiz Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Quiz Title:</span>
              <span className="info-value">{quiz.title}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Quiz Number:</span>
              <span className="info-value">Experiment {quiz.experiment_number}{quiz.experiment_title ? `: ${quiz.experiment_title}` : ''}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Subject:</span>
              <span className="info-value">{quiz.subject_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Class:</span>
              <span className="info-value">{quiz.class_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{quiz.duration_minutes} minutes</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Marks:</span>
              <span className="info-value">{quiz.total_marks}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Submitted At:</span>
              <span className="info-value">{formatDate(attempt.submitted_at)}</span>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="result-section score-summary">
          <h2>Score Summary</h2>
          <div className="score-display">
            <div className="score-item">
              <span className="score-label">Obtained Marks:</span>
              <span className="score-value">{attempt.score} / {quiz.total_marks}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Percentage:</span>
              <span className="score-value percentage">{attempt.percentage.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="result-section questions-section">
          <h2>Questions and Answers</h2>
          {questions.map((question, index) => (
            <div key={question.id} className={`question-item ${question.is_correct ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="question-marks">({question.marks} {question.marks === 1 ? 'mark' : 'marks'})</span>
                <span className={`answer-status ${question.is_correct ? 'correct' : 'incorrect'}`}>
                  {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              
              <div className="question-text">
                {question.question_text}
              </div>

              {question.question_type === 'mcq' && question.options && (
                <div className="options-list">
                  {question.options.map((option, optIndex) => {
                    const optionLetter = String.fromCharCode(65 + optIndex);
                    const isStudentAnswer = question.student_answer === option;
                    const isCorrectAnswer = question.correct_answer === option;
                    
                    return (
                      <div 
                        key={optIndex} 
                        className={`option-item ${isStudentAnswer && !isCorrectAnswer ? 'wrong-selection' : ''} ${isCorrectAnswer ? 'correct-answer' : ''}`}
                      >
                        <span className="option-letter">{optionLetter}</span>
                        <span className="option-text">{option}</span>
                        {isStudentAnswer && <span className="selection-indicator">(Your Answer)</span>}
                        {isCorrectAnswer && !isStudentAnswer && <span className="correct-indicator">(Correct Answer)</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="answer-section">
                <div className="answer-row">
                  <span className="answer-label">Your Answer:</span>
                  <span className={`answer-value ${question.is_correct ? 'correct' : 'incorrect'}`}>
                    {question.student_answer || '(Not answered)'}
                  </span>
                </div>
                {!question.is_correct && (
                  <div className="answer-row">
                    <span className="answer-label">Correct Answer:</span>
                    <span className="answer-value correct">
                      {question.correct_answer}
                    </span>
                  </div>
                )}
                <div className="answer-row">
                  <span className="answer-label">Marks Obtained:</span>
                  <span className="answer-value">
                    {question.earned_marks} / {question.marks}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer for Print */}
        <div className="result-footer">
          <p>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default QuizResultView;

