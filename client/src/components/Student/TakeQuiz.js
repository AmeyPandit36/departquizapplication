import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TakeQuiz.css';
import useProctoring from '../../hooks/useProctoring';
import FlashcardLab from './FlashcardLab';

const TakeQuiz = ({ quiz, onBack }) => {
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({}); // Store answers as we go
  const [viewMode, setViewMode] = useState('traditional'); // 'traditional' or 'flashcard'

  const handleFinalSubmit = useCallback(async (autoSubmit = false) => {
    if (submitted) return;

    if (!autoSubmit && !window.confirm('Are you sure you want to submit the quiz?')) {
      return;
    }

    try {
      const formattedAnswers = {};
      if (quizData && quizData.questions) {
        quizData.questions.forEach((question, index) => {
          formattedAnswers[index] = answers[index] || answers[index.toString()] || '';
        });
      } else {
        Object.assign(formattedAnswers, answers);
      }

      const response = await axios.post(`http://localhost:5000/api/student/quizzes/${quiz.id}/submit`, {
        answers: formattedAnswers
      });
      
      setResult(response.data);
      setSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Quiz submission error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit quiz';
      toast.error(errorMessage);
    }
  }, [answers, quiz.id, quizData, submitted]);

  useEffect(() => {
    fetchQuizDetails();
  }, [quiz.id]);

  useEffect(() => {
    if (quizData && quizData.quiz.duration_minutes && !submitted) {
      const duration = quizData.quiz.duration_minutes * 60;
      setTimeLeft(duration);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinalSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizData, submitted, handleFinalSubmit]);

  const fetchQuizDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/quizzes/details/${quiz.id}`);
      
      if (!response.data || !response.data.questions || response.data.questions.length === 0) {
        toast.error('Quiz has no questions or data is invalid');
        onBack();
        return;
      }
      
      setQuizData(response.data);
      
      // Initialize answers from existing attempt if any
      if (response.data.quiz.current_attempt && response.data.quiz.current_attempt.answers) {
        try {
          const existingAnswers = typeof response.data.quiz.current_attempt.answers === 'string' 
            ? JSON.parse(response.data.quiz.current_attempt.answers)
            : response.data.quiz.current_attempt.answers;
          setAnswers(existingAnswers);
          setQuestionAnswers(existingAnswers);
        } catch (parseError) {
          console.error('Error parsing existing answers:', parseError);
          const emptyAnswers = {};
          response.data.questions.forEach((q, index) => {
            emptyAnswers[index] = '';
          });
          setAnswers(emptyAnswers);
          setQuestionAnswers(emptyAnswers);
        }
      } else {
        const emptyAnswers = {};
        response.data.questions.forEach((q, index) => {
          emptyAnswers[index] = '';
        });
        setAnswers(emptyAnswers);
        setQuestionAnswers(emptyAnswers);
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load quiz. Please try again.';
      toast.error(errorMessage);
      
      if (error.response?.status === 403 || error.response?.status === 404) {
        setTimeout(() => onBack(), 2000);
      } else {
        onBack();
      }
    }
  };

  const handleAnswerSelect = (value) => {
    const newAnswers = { ...questionAnswers, [currentQuestionIndex]: value };
    setQuestionAnswers(newAnswers);
    setAnswers(newAnswers);
  };

  const handleCardClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinalSubmit(false);
    }
  };

  const proctoringStatus = useProctoring({
    enabled: Boolean(quizData?.quiz?.enable_proctoring),
    attemptId: quizData?.quiz?.current_attempt?.id,
    onLimitReached: () => {
      toast.error('Focus limit exceeded. Auto-submitting your quiz.');
      handleFinalSubmit(true);
    }
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizData) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (submitted && result) {
    return (
      <div className="quiz-result-container">
        <div className="quiz-result-card">
          <h2>Quiz Submitted!</h2>
          <div className="result-content">
            <div className="result-percentage">{result.percentage}%</div>
            <p className="result-score">
              Score: {result.score} / {quizData.quiz.total_marks}
            </p>
            <button className="btn btn-primary" onClick={onBack}>
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const selectedAnswer = questionAnswers[currentQuestionIndex] || '';

  // Flashcard Lab View
  if (viewMode === 'flashcard') {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-title-section">
            <h2>{quizData.quiz.title}</h2>
            <div className="quiz-meta">
              <span>{quizData.quiz.subject_name}</span>
              {timeLeft !== null && (
                <span className={`time-left ${timeLeft < 60 ? 'time-warning' : ''}`}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              )}
              <button 
                className="view-toggle-btn"
                onClick={() => setViewMode('traditional')}
                title="Switch to Traditional View"
              >
                📋 Traditional View
              </button>
            </div>
          </div>
        </div>

        <div className="flashcard-lab-wrapper">
          <FlashcardLab
            questions={quizData.questions}
            answers={questionAnswers}
            onAnswerSelect={handleAnswerSelect}
            onCardClick={handleCardClick}
            currentQuestionIndex={currentQuestionIndex}
          />
        </div>

        {/* Question Detail Panel */}
        <div className="flashcard-question-panel">
          <div className="flashcard-question-content">
            <div className="question-header">
              <h3>Question {currentQuestionIndex + 1} of {quizData.questions.length}</h3>
              <div className="question-marks">{currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}</div>
            </div>
            <div className="question-text">{currentQuestion.question_text}</div>
            
            {currentQuestion.question_type === 'mcq' && currentQuestion.options ? (
              <div className="answer-options">
                {currentQuestion.options.map((option, oIndex) => {
                  const optionLetter = String.fromCharCode(65 + oIndex);
                  const isSelected = selectedAnswer === option;
                  
                  return (
                    <button
                      key={oIndex}
                      type="button"
                      className={`answer-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <div className="option-letter">{optionLetter}</div>
                      <div className="option-text">{option}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-answer-container">
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Type your answer here..."
                  className="text-answer-input"
                />
              </div>
            )}

            <div className="quiz-actions">
              {currentQuestionIndex > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary submit-answer-btn"
                onClick={handleNextQuestion}
                disabled={!selectedAnswer && currentQuestion.question_type === 'mcq'}
              >
                {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Traditional View
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title-section">
          <h2>{quizData.quiz.title}</h2>
          <div className="quiz-meta">
            <span>{quizData.quiz.subject_name}</span>
            {timeLeft !== null && (
              <span className={`time-left ${timeLeft < 60 ? 'time-warning' : ''}`}>
                ⏱️ {formatTime(timeLeft)}
              </span>
            )}
            <button 
              className="view-toggle-btn"
              onClick={() => setViewMode('flashcard')}
              title="Switch to Flashcard Lab View"
            >
              🎴 Flashcard Lab
            </button>
          </div>
        </div>
      </div>

      <div className="quiz-card">
        {proctoringStatus.enabled && (
          <div className="proctor-banner">
            <div>
              <strong>Proctoring Active</strong>
              <span className="badge">{proctoringStatus.cameraGranted ? 'Camera On' : 'Camera Off'}</span>
            </div>
            <div className="proctor-stats">
              <span>Focus alerts: {proctoringStatus.focusViolations}{proctoringStatus.maxFocusViolations ? ` / ${proctoringStatus.maxFocusViolations}` : ''}</span>
              <span>Snapshots captured: {proctoringStatus.snapshotsTaken}</span>
            </div>
            {proctoringStatus.error && <div className="proctor-warning">{proctoringStatus.error}</div>}
          </div>
        )}
        <div className="quiz-card-header">
          <div className="question-counter">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="question-content">
          <div className="question-text">
            {currentQuestion.question_text}
          </div>

          <div className="question-marks">
            {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
          </div>

          {currentQuestion.question_type === 'mcq' && currentQuestion.options ? (
            <div className="answer-options">
              {currentQuestion.options.map((option, oIndex) => {
                const optionLetter = String.fromCharCode(65 + oIndex); // A, B, C, D
                const isSelected = selectedAnswer === option;
                
                return (
                  <button
                    key={oIndex}
                    type="button"
                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <div className="option-letter">{optionLetter}</div>
                    <div className="option-text">{option}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-answer-container">
              <textarea
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Type your answer here..."
                className="text-answer-input"
              />
            </div>
          )}

          <div className="quiz-actions">
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              >
                Previous
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary submit-answer-btn"
              onClick={handleNextQuestion}
              disabled={!selectedAnswer && currentQuestion.question_type === 'mcq'}
            >
              {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
