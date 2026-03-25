import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Quizzes = () => {
  const [subjects, setSubjects] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    experiment_id: '',
    subject_id: '',
    title: '',
    total_marks: '',
    duration_minutes: '',
    start_date: '',
    end_date: '',
    proctoring: {
      enable: false,
      snapshot_interval_min: 60,
      snapshot_interval_max: 180,
      max_focus_violations: 3
    },
    questions: [{ question_text: '', question_type: 'mcq', marks: '', options: ['', '', '', ''], correct_answer: '' }]
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchExperiments();
      fetchQuizzes();
      setFormData(prev => ({ ...prev, subject_id: selectedSubject }));
    }
  }, [selectedSubject]);

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
    } catch (error) {
      toast.error('Failed to fetch experiments');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/quizzes/${selectedSubject}`);
      setQuizzes(response.data);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        // Update quiz basic info (dates, title, marks, duration, status)
        const updateData = {
          title: formData.title,
          total_marks: formData.total_marks,
          duration_minutes: formData.duration_minutes,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          proctoring: formData.proctoring
        };
        await axios.put(`http://localhost:5000/api/teacher/quizzes/${editingQuiz.id}`, updateData);
        toast.success('Quiz updated successfully');
      } else {
        const quizData = {
          ...formData,
          questions: formData.questions.map(q => ({
            ...q,
            options: q.question_type === 'mcq' ? q.options : null
          }))
        };
        await axios.post('http://localhost:5000/api/teacher/quizzes', quizData);
        toast.success('Quiz created successfully');
      }
      setShowModal(false);
      setEditingQuiz(null);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = async (quiz) => {
    try {
      // Fetch quiz details with questions
      const response = await axios.get(`http://localhost:5000/api/teacher/quizzes/details/${quiz.id}`);
      const quizData = response.data;
      
      setEditingQuiz(quiz);
      setFormData({
        experiment_id: quizData.quiz.experiment_id,
        subject_id: quizData.quiz.subject_id,
        title: quizData.quiz.title,
        total_marks: quizData.quiz.total_marks,
        duration_minutes: quizData.quiz.duration_minutes || '',
        start_date: quizData.quiz.start_date ? new Date(quizData.quiz.start_date).toISOString().slice(0, 16) : '',
        end_date: quizData.quiz.end_date ? new Date(quizData.quiz.end_date).toISOString().slice(0, 16) : '',
        proctoring: {
          enable: quizData.quiz.enable_proctoring,
          snapshot_interval_min: quizData.quiz.snapshot_interval_min || 60,
          snapshot_interval_max: quizData.quiz.snapshot_interval_max || 180,
          max_focus_violations: quizData.quiz.max_focus_violations || 3
        },
        questions: quizData.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          marks: q.marks,
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer
        }))
      });
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load quiz details');
    }
  };

  const resetForm = () => {
    setFormData({
      experiment_id: '',
      subject_id: selectedSubject,
      title: '',
      total_marks: '',
      duration_minutes: '',
      start_date: '',
      end_date: '',
      proctoring: {
        enable: false,
        snapshot_interval_min: 60,
        snapshot_interval_max: 180,
        max_focus_violations: 3
      },
      questions: [{ question_text: '', question_type: 'mcq', marks: '', options: ['', '', '', ''], correct_answer: '' }]
    });
  };

  const updateProctoring = (field, value) => {
    setFormData(prev => ({
      ...prev,
      proctoring: {
        ...prev.proctoring,
        [field]: value
      }
    }));
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question_text: '', question_type: 'mcq', marks: '', options: ['', '', '', ''], correct_answer: '' }]
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const toggleQuizActive = async (quiz) => {
    try {
      await axios.put(`http://localhost:5000/api/teacher/quizzes/${quiz.id}/activate`, {
        is_active: !quiz.is_active
      });
      toast.success(`Quiz ${!quiz.is_active ? 'activated' : 'deactivated'}`);
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to update quiz status');
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/teacher/quizzes/import-questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.questions && response.data.questions.length > 0) {
        setImportedQuestions(response.data.questions);
        toast.success(`Successfully imported ${response.data.questions.length} questions!`);
      } else {
        toast.error('No questions found in the file');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import questions');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quizzes Management</h2>
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.class_name} - {subject.name}
              </option>
            ))}
          </select>
          {selectedSubject && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowImportModal(true);
                }}
                style={{ marginRight: '10px' }}
              >
                Import Questions from File
              </button>
              <button className="btn btn-primary" onClick={() => {
                setEditingQuiz(null);
                resetForm();
                setShowModal(true);
              }}>
                Create Quiz Manually
              </button>
            </>
          )}
        </div>
      </div>

      {selectedSubject && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Experiment</th>
                <th>Total Marks</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Attempts</th>
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
                    <span style={{ color: quiz.is_active ? 'green' : 'red' }}>
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{quiz.total_attempts || 0}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleEdit(quiz)}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn ${quiz.is_active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleQuizActive(quiz)}
                    >
                      {quiz.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingQuiz(null);
                resetForm();
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Experiment</label>
                <select
                  value={formData.experiment_id}
                  onChange={(e) => setFormData({ ...formData, experiment_id: e.target.value })}
                  required
                  disabled={!!editingQuiz}
                >
                  <option value="">Select Experiment</option>
                  {experiments.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      Exp {exp.experiment_number}: {exp.title}
                    </option>
                  ))}
                </select>
                {editingQuiz && <small style={{ color: '#666' }}>Experiment cannot be changed after quiz creation</small>}
              </div>
              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.proctoring.enable}
                    onChange={(e) => updateProctoring('enable', e.target.checked)}
                  />
                  Enable time-windowed proctoring
                </label>
                <small style={{ color: '#666' }}>
                  Adds focus monitoring and random camera snapshots while students attempt the quiz.
                </small>
              </div>

              {formData.proctoring.enable && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label>Snapshot interval (min seconds)</label>
                    <input
                      type="number"
                      min="30"
                      value={formData.proctoring.snapshot_interval_min}
                      onChange={(e) => updateProctoring('snapshot_interval_min', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Snapshot interval (max seconds)</label>
                    <input
                      type="number"
                      min={formData.proctoring.snapshot_interval_min}
                      value={formData.proctoring.snapshot_interval_max}
                      onChange={(e) => updateProctoring('snapshot_interval_max', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Allowed focus losses</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.proctoring.max_focus_violations}
                      onChange={(e) => updateProctoring('max_focus_violations', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {!editingQuiz && (
                <>
                  <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>Questions</h3>
                  {formData.questions.map((question, qIndex) => (
                <div key={qIndex} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4>Question {qIndex + 1}</h4>
                    {formData.questions.length > 1 && (
                      <button type="button" className="btn btn-danger" onClick={() => removeQuestion(qIndex)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Question Text</label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={question.question_type}
                        onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                        required
                      >
                        <option value="mcq">MCQ</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="long_answer">Long Answer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Marks</label>
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {question.question_type === 'mcq' && (
                    <div className="form-group">
                      <label>Options</label>
                      {question.options.map((option, oIndex) => (
                        <input
                          key={oIndex}
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          style={{ marginBottom: '5px' }}
                          required
                        />
                      ))}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                      required
                      placeholder={question.question_type === 'mcq' ? 'Enter option letter or text' : 'Enter correct answer'}
                    />
                  </div>
                </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addQuestion} style={{ marginBottom: '15px' }}>
                    Add Question
                  </button>
                </>
              )}
              {editingQuiz && (
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginTop: '20px' }}>
                  <p style={{ color: '#666', margin: 0 }}>
                    <strong>Note:</strong> Questions cannot be edited after quiz creation. You can only update quiz details like title, marks, duration, and dates.
                  </p>
                </div>
              )}
              <br />
              <button type="submit" className="btn btn-primary">{editingQuiz ? 'Update Quiz' : 'Create Quiz'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Import Questions Modal */}
      {showImportModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Import Questions from File</h2>
              <button className="close-btn" onClick={() => {
                setShowImportModal(false);
                setImportedQuestions([]);
              }}>×</button>
            </div>
            
            {importedQuestions.length === 0 ? (
              <div>
                <p style={{ marginBottom: '20px' }}>
                  Upload a file containing quiz questions. Supported formats: Excel (.xlsx, .xls), JSON (.json), CSV (.csv)
                </p>
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <h4>File Format Requirements:</h4>
                  <p><strong>Excel/CSV:</strong> Columns should include: Question, Type (mcq/short_answer/long_answer), Option1, Option2, Option3, Option4, Correct Answer</p>
                  <p><strong>JSON:</strong> Array of objects with: question_text, question_type, options (array), correct_answer</p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.json,.csv"
                  onChange={handleFileImport}
                  style={{ padding: '10px', width: '100%' }}
                />
              </div>
            ) : (
              <ImportQuestionsForm
                importedQuestions={importedQuestions}
                experiments={experiments}
                selectedSubject={selectedSubject}
                onCancel={() => {
                  setShowImportModal(false);
                  setImportedQuestions([]);
                }}
                onSuccess={() => {
                  setShowImportModal(false);
                  setImportedQuestions([]);
                  fetchQuizzes();
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Import Questions Form Component
const ImportQuestionsForm = ({ importedQuestions, experiments, selectedSubject, onCancel, onSuccess }) => {
  const [questions, setQuestions] = useState(importedQuestions);
  const [quizInfo, setQuizInfo] = useState({
    experiment_id: '',
    title: '',
    duration_minutes: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    // Calculate total marks
    const total = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
    setQuizInfo(prev => ({ ...prev, total_marks: total }));
  }, [questions]);

  const handleMarksChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].marks = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!quizInfo.experiment_id || !quizInfo.title) {
      toast.error('Please fill in experiment and quiz title');
      return;
    }

    const questionsWithMarks = questions.filter(q => q.marks && parseInt(q.marks) > 0);
    if (questionsWithMarks.length === 0) {
      toast.error('Please assign marks to at least one question');
      return;
    }

    try {
      const quizData = {
        experiment_id: quizInfo.experiment_id,
        subject_id: selectedSubject,
        title: quizInfo.title,
        total_marks: questionsWithMarks.reduce((sum, q) => sum + parseInt(q.marks), 0),
        duration_minutes: quizInfo.duration_minutes || null,
        start_date: quizInfo.start_date || null,
        end_date: quizInfo.end_date || null,
        questions: questionsWithMarks.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          marks: parseInt(q.marks),
          options: q.options && q.options.length > 0 ? q.options : null,
          correct_answer: q.correct_answer
        }))
      };

      await axios.post('http://localhost:5000/api/teacher/quizzes', quizData);
      toast.success('Quiz created successfully with imported questions!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Quiz Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <label>Experiment *</label>
            <select
              value={quizInfo.experiment_id}
              onChange={(e) => setQuizInfo({ ...quizInfo, experiment_id: e.target.value })}
              required
            >
              <option value="">Select Experiment</option>
              {experiments.map(exp => (
                <option key={exp.id} value={exp.id}>
                  Exp {exp.experiment_number}: {exp.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={quizInfo.title}
              onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
              required
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={quizInfo.duration_minutes}
              onChange={(e) => setQuizInfo({ ...quizInfo, duration_minutes: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="datetime-local"
              value={quizInfo.start_date}
              onChange={(e) => setQuizInfo({ ...quizInfo, start_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="datetime-local"
              value={quizInfo.end_date}
              onChange={(e) => setQuizInfo({ ...quizInfo, end_date: e.target.value })}
            />
          </div>
        </div>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <strong>Total Marks: {questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0)}</strong>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Assign Marks to Questions ({questions.length} questions imported)</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
          {questions.map((question, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Question {index + 1}:</strong> {question.question_text}
              </div>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                <strong>Type:</strong> {question.question_type.toUpperCase()}
                {question.options && question.options.length > 0 && (
                  <>
                    <br />
                    <strong>Options:</strong> {question.options.join(', ')}
                  </>
                )}
                <br />
                <strong>Correct Answer:</strong> {question.correct_answer}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Marks for this question:</label>
                <input
                  type="number"
                  min="1"
                  value={question.marks || ''}
                  onChange={(e) => handleMarksChange(index, e.target.value)}
                  style={{ width: '100px' }}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create Quiz with {questions.filter(q => q.marks && parseInt(q.marks) > 0).length} Questions
        </button>
      </div>
    </form>
  );
};

export default Quizzes;

