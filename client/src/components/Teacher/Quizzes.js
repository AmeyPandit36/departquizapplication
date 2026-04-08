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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/subjects`);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/experiments/${selectedSubject}`);
      setExperiments(response.data);
    } catch (error) {
      toast.error('Failed to fetch experiments');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/${selectedSubject}`);
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
        await axios.put(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/${editingQuiz.id}`, updateData);
        toast.success('Quiz updated successfully');
      } else {
        const quizData = {
          ...formData,
          questions: formData.questions.map(q => ({
            ...q,
            options: q.question_type === 'mcq' ? q.options : null
          }))
        };
        await axios.post(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes`, quizData);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/details/${quiz.id}`);
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
      await axios.put(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/${quiz.id}/activate`, {
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/import-questions`, formData, {
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
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Quizzes Management</h2>
          <p className="text-slate-500 font-medium mt-1">Create, import, and activate assessments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm outline-none appearance-none cursor-pointer"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.class_name} - {subject.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          {selectedSubject && (
            <div className="flex gap-2">
              <button 
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm group"
                onClick={() => setShowImportModal(true)}
              >
                <svg className="w-5 h-5 mr-2 text-indigo-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                Import
              </button>
              <button 
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95"
                onClick={() => {
                  setEditingQuiz(null);
                  resetForm();
                  setShowModal(true);
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Create
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Subject</h3>
          <p className="text-slate-500 max-w-md mx-auto">Please select a subject from the dropdown menu above to view or create quizzes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-x-auto">
          <div className="w-full min-w-[700px] md:min-w-0">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-slate-500 font-bold text-[10px] md:text-xs">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Experiment</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status & Attempts</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {quizzes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                      No quizzes found for this subject. Create or import one to get started.
                    </td>
                  </tr>
                ) : (
                  quizzes.map(quiz => (
                    <tr key={quiz.id} className="hover:bg-slate-50/80 transition-container group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{quiz.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Exp {quiz.experiment_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                        {quiz.total_marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                        {quiz.duration_minutes ? `${quiz.duration_minutes} min` : <span className="italic text-slate-300">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center"><svg className="w-3 h-3 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {quiz.start_date ? new Date(quiz.start_date).toLocaleDateString() : '-'}</div>
                          <div className="flex items-center"><svg className="w-3 h-3 mr-1 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {quiz.end_date ? new Date(quiz.end_date).toLocaleDateString() : '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${quiz.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${quiz.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {quiz.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium ml-1">
                            {quiz.total_attempts || 0} attempts
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                            onClick={() => handleEdit(quiz)}
                            title="Edit Quiz"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button 
                            className={`p-2 rounded-lg transition-colors ${quiz.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            onClick={() => toggleQuizActive(quiz)}
                            title={quiz.is_active ? 'Deactivate Quiz' : 'Activate Quiz'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {quiz.is_active ? 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path> : 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              }
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all relative flex flex-col max-h-[95vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-extrabold text-slate-800">
                {editingQuiz ? 'Edit Quiz Settings' : 'Create New Quiz'}
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setEditingQuiz(null);
                  resetForm();
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 md:p-8 flex-1">
              <form id="quiz-form" onSubmit={handleSubmit}>
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Experiment Target <span className="text-rose-500">*</span></label>
                      <select
                        value={formData.experiment_id}
                        onChange={(e) => setFormData({ ...formData, experiment_id: e.target.value })}
                        required
                        disabled={!!editingQuiz}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 transition-colors outline-none cursor-pointer appearance-none"
                      >
                        <option value="">Select Experiment</option>
                        {experiments.map(exp => (
                          <option key={exp.id} value={exp.id}>
                            Exp {exp.experiment_number}: {exp.title}
                          </option>
                        ))}
                      </select>
                      {editingQuiz && <p className="text-xs text-amber-600 mt-1 font-medium">Experiment target cannot be changed after creation.</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Quiz Title <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                        placeholder="e.g. Midterm Evaluation"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Marks <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        value={formData.total_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Duration (Mins)</label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={formData.proctoring.enable}
                        onChange={(e) => updateProctoring('enable', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="font-bold text-slate-800">Enable Time-Windowed Proctoring</span>
                    </label>
                    <p className="text-sm text-slate-500 ml-8 mb-4">Adds secure focus monitoring and randomized camera snapshot protocols while students are actively attempting the quiz.</p>
                    
                    {formData.proctoring.enable && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-8 animate-fade-in pb-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">Min Interval (sec)</label>
                          <input
                            type="number"
                            min="30"
                            value={formData.proctoring.snapshot_interval_min}
                            onChange={(e) => updateProctoring('snapshot_interval_min', e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">Max Interval (sec)</label>
                          <input
                            type="number"
                            min={formData.proctoring.snapshot_interval_min}
                            value={formData.proctoring.snapshot_interval_max}
                            onChange={(e) => updateProctoring('snapshot_interval_max', e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600">Allowed Focus Losses</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.proctoring.max_focus_violations}
                            onChange={(e) => updateProctoring('max_focus_violations', e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!editingQuiz && (
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-extrabold text-slate-800">Quiz Questions</h3>
                        <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                          {formData.questions.length} Question{formData.questions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-6">
                        {formData.questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group transition-colors hover:border-indigo-200">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                              <h4 className="font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">Question {qIndex + 1}</h4>
                              {formData.questions.length > 1 && (
                                <button 
                                  type="button" 
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg text-sm font-bold transition-colors"
                                  onClick={() => removeQuestion(qIndex)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Question Body <span className="text-rose-500">*</span></label>
                                <textarea
                                  value={question.question_text}
                                  onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                                  required
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none min-h-[80px] resize-y"
                                  placeholder="Enter the question text..."
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Question Type</label>
                                  <select
                                    value={question.question_type}
                                    onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none appearance-none cursor-pointer"
                                  >
                                    <option value="mcq">Multiple Choice (MCQ)</option>
                                    <option value="short_answer">Short Answer</option>
                                    <option value="long_answer">Long Answer</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Marks Allotted <span className="text-rose-500">*</span></label>
                                  <input
                                    type="number"
                                    value={question.marks}
                                    onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                                    placeholder="e.g. 5"
                                  />
                                </div>
                              </div>
                              
                              {question.question_type === 'mcq' && (
                                <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
                                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Options</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {question.options.map((option, oIndex) => (
                                      <div key={oIndex} className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                          {String.fromCharCode(65 + oIndex)}
                                        </span>
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                          placeholder={`Option text...`}
                                          required
                                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Correct Answer <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  value={question.correct_answer}
                                  onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                                  required
                                  placeholder={question.question_type === 'mcq' ? "Which option is correct? (e.g. 'A' or exact text)" : "Enter the correct expected answer"}
                                  className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-900 focus:bg-emerald-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors outline-none font-medium"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        type="button" 
                        className="mt-4 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                        onClick={addQuestion}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-2 transition-colors">
                          <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <span className="font-bold text-sm">Add Another Question</span>
                      </button>
                    </div>
                  )}

                  {editingQuiz && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm font-medium mt-6">
                      <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <p>Questions cannot be modified after a quiz has been created. You are only editing the quiz settings (Title, Duration, Marks, Proctoring, Dates).</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-4">
              <button 
                type="button" 
                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                onClick={() => {
                  setShowModal(false);
                  setEditingQuiz(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="quiz-form"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all active:scale-95"
              >
                {editingQuiz ? 'Save Configuration' : 'Create Complete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Questions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all relative flex flex-col max-h-[95vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">Bulk Import Questions</h3>
                  <p className="text-xs text-slate-500 font-medium">Create a quiz quickly using an external file</p>
                </div>
              </div>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-lg"
                onClick={() => {
                  setShowImportModal(false);
                  setImportedQuestions([]);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 md:p-8 flex-1">
              {importedQuestions.length === 0 ? (
                <div className="max-w-2xl mx-auto py-8">
                  <div className="text-center mb-8">
                    <p className="text-slate-600 text-lg">
                      Upload a file containing quiz questions. Supported formats: <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">.xlsx</span>, <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">.xls</span>, <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">.json</span>, <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">.csv</span>
                    </p>
                  </div>
                  
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-8">
                    <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      File Format Requirements
                    </h4>
                    <div className="space-y-4 text-sm text-blue-900/80">
                      <div>
                        <span className="font-bold text-blue-900 block mb-1">Excel/CSV Structure:</span>
                        <p className="bg-white/60 p-2 rounded border border-blue-50 font-mono text-xs">Question | Type (mcq/short_answer/long_answer) | Option1 | Option2 | Option3 | Option4 | Correct Answer</p>
                      </div>
                      <div>
                        <span className="font-bold text-blue-900 block mb-1">JSON Structure:</span>
                        <p className="bg-white/60 p-2 rounded border border-blue-50 font-mono text-xs">Array of objects with: question_text, question_type, options (array), correct_answer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-4 text-indigo-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-2 text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-500">Excel, CSV, or JSON documents</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".xlsx,.xls,.json,.csv"
                        onChange={handleFileImport}
                      />
                    </label>
                  </div>
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

      await axios.post(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes`, quizData);
      toast.success('Quiz created successfully with imported questions!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="mb-8">
        <h3 className="text-lg font-extrabold text-slate-800 mb-4 pb-2 border-b border-slate-100">Quiz Target Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Experiment Target <span className="text-rose-500">*</span></label>
            <select
              value={quizInfo.experiment_id}
              onChange={(e) => setQuizInfo({ ...quizInfo, experiment_id: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none cursor-pointer appearance-none"
            >
              <option value="">Select Experiment</option>
              {experiments.map(exp => (
                <option key={exp.id} value={exp.id}>
                  Exp {exp.experiment_number}: {exp.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Quiz Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={quizInfo.title}
              onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
              placeholder="e.g. End of term test"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Duration (Mins)</label>
            <input
              type="number"
              value={quizInfo.duration_minutes}
              onChange={(e) => setQuizInfo({ ...quizInfo, duration_minutes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
              placeholder="e.g. 45"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Start Date</label>
            <input
              type="datetime-local"
              value={quizInfo.start_date}
              onChange={(e) => setQuizInfo({ ...quizInfo, start_date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">End Date</label>
            <input
              type="datetime-local"
              value={quizInfo.end_date}
              onChange={(e) => setQuizInfo({ ...quizInfo, end_date: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
            />
          </div>
        </div>
        
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <span className="font-bold text-indigo-900">Total Auto-Calculated Marks:</span>
          <span className="bg-white text-indigo-700 font-extrabold px-3 py-1 rounded-lg border border-indigo-200 shadow-sm text-lg">
            {questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0)}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800">Assign Marks & Review</h3>
          <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-xs">
            {questions.length} Questions Imported
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-100 text-slate-700 font-bold w-6 h-6 flex items-center justify-center rounded-lg text-xs shrink-0">
                  {index + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
                  {question.question_type}
                </span>
              </div>
              
              <div className="text-sm font-bold text-slate-800 mb-3 line-clamp-3 flex-1 break-words">
                {question.question_text}
              </div>
              
              <div className="flex-1">
                {question.options && question.options.length > 0 && (
                  <div className="text-xs text-slate-500 mb-3 space-y-1">
                    {question.options.map((opt, i) => (
                      <div key={i} className="flex gap-1.5 truncate">
                        <span className="font-bold">{String.fromCharCode(65 + i)}:</span> {opt}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-emerald-50 text-emerald-800 text-xs px-2 py-1.5 rounded flex items-start gap-1.5 font-medium mb-4">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="break-all">{question.correct_answer}</span>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Marks <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={question.marks || ''}
                    onChange={(e) => handleMarksChange(index, e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">
                    pts
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4 mt-8 border-t border-slate-100">
        <button 
          type="button" 
          className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm" 
          onClick={onCancel}
        >
          Cancel Import
        </button>
        <button 
          type="submit" 
          className="flex-[2] py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all active:scale-95"
        >
          Create Quiz with {questions.filter(q => q.marks && parseInt(q.marks) > 0).length} Questions
        </button>
      </div>
    </form>
  );
};

export default Quizzes;

