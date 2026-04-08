import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './QuizResultView.css';

const QuizResultView = ({ quizId, onBack }) => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizResult();
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuizResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/quizzes/${quizId}/result`);
      setResultData(response.data);
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      toast.error(error.response?.data?.message || 'Failed to load quiz result');
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="qrv-loading">Loading result...</div>;
  if (!resultData) return <div className="qrv-error">Result not found.</div>;

  const { student, quiz, attempt, questions } = resultData;
  const correct = questions.filter(q => q.is_correct).length;
  const incorrect = questions.length - correct;
  const pct = attempt.percentage.toFixed(1);
  const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : 'F';
  const gradeColor = pct >= 75 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';

  return (
    <div className="qrv-wrapper">
      {/* Action Bar */}
      <div className="qrv-actions no-print">
        <button className="qrv-btn-back" onClick={onBack}>← Back</button>
        <button className="qrv-btn-print" onClick={handlePrint}>🖨 Print</button>
      </div>

      {/* Report Document */}
      <div className="qrv-document">

        {/* Header */}
        <div className="qrv-doc-header">
          <div className="qrv-doc-title">
            <h1>Quiz Result Report</h1>
            <p className="qrv-doc-subtitle">{quiz.subject_name} · {quiz.class_name}</p>
          </div>
          <div className="qrv-grade-badge" style={{ borderColor: gradeColor, color: gradeColor }}>
            <span className="qrv-grade-label">Grade</span>
            <span className="qrv-grade-value">{grade}</span>
          </div>
        </div>

        {/* Meta strip */}
        <div className="qrv-meta-strip">
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Student</span>
            <span className="qrv-meta-val">{student.name}</span>
          </div>
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Roll No.</span>
            <span className="qrv-meta-val">{student.roll_number}</span>
          </div>
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Quiz</span>
            <span className="qrv-meta-val">{quiz.title}</span>
          </div>
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Experiment</span>
            <span className="qrv-meta-val">No. {quiz.experiment_number}{quiz.experiment_title ? ` – ${quiz.experiment_title}` : ''}</span>
          </div>
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Duration</span>
            <span className="qrv-meta-val">{quiz.duration_minutes} min</span>
          </div>
          <div className="qrv-meta-item">
            <span className="qrv-meta-label">Submitted</span>
            <span className="qrv-meta-val">{formatDate(attempt.submitted_at)}</span>
          </div>
        </div>

        {/* Score Summary Row */}
        <div className="qrv-score-row">
          <div className="qrv-score-card qrv-score-main">
            <span className="qrv-sc-num">{attempt.score}<span className="qrv-sc-total"> / {quiz.total_marks}</span></span>
            <span className="qrv-sc-label">Marks Obtained</span>
          </div>
          <div className="qrv-score-card">
            <span className="qrv-sc-num" style={{ color: gradeColor }}>{pct}%</span>
            <span className="qrv-sc-label">Percentage</span>
          </div>
          <div className="qrv-score-card">
            <span className="qrv-sc-num qrv-sc-correct">✓ {correct}</span>
            <span className="qrv-sc-label">Correct</span>
          </div>
          <div className="qrv-score-card">
            <span className="qrv-sc-num qrv-sc-wrong">✗ {incorrect}</span>
            <span className="qrv-sc-label">Incorrect</span>
          </div>
          <div className="qrv-score-card">
            <span className="qrv-sc-num">{questions.length}</span>
            <span className="qrv-sc-label">Total Qs</span>
          </div>
        </div>

        {/* Questions Table */}
        <div className="qrv-table-section">
          <h2 className="qrv-table-title">Answer Sheet</h2>
          <table className="qrv-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Question</th>
                <th style={{ width: '130px' }}>Your Answer</th>
                <th style={{ width: '130px' }}>Correct Answer</th>
                <th style={{ width: '70px' }}>Marks</th>
                <th style={{ width: '80px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id} className={q.is_correct ? 'qrv-row-ok' : 'qrv-row-err'}>
                  <td className="qrv-td-num">{idx + 1}</td>
                  <td className="qrv-td-question">{q.question_text}</td>
                  <td className={`qrv-td-ans ${q.is_correct ? 'qrv-ans-ok' : 'qrv-ans-err'}`}>
                    {q.student_answer || <em>—</em>}
                  </td>
                  <td className="qrv-td-ans qrv-ans-ok">
                    {q.correct_answer}
                  </td>
                  <td className="qrv-td-marks">
                    {q.earned_marks}/{q.marks}
                  </td>
                  <td className="qrv-td-status">
                    <span className={`qrv-badge ${q.is_correct ? 'qrv-badge-ok' : 'qrv-badge-err'}`}>
                      {q.is_correct ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="qrv-footer">
          <span>IT Department Assessment System</span>
          <span>Generated: {new Date().toLocaleString('en-IN')}</span>
        </div>

      </div>
    </div>
  );
};

export default QuizResultView;
