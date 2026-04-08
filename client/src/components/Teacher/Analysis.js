import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      setSelectedExperiment('');
    } catch (error) {
      toast.error('Failed to fetch experiments');
    }
  };

  const fetchSubjectAnalysis = async () => {
    try {
      const url = selectedExperiment
        ? `${process.env.REACT_APP_API_URL}/api/teacher/analysis/subject/${selectedSubject}?experiment_id=${selectedExperiment}`
        : `${process.env.REACT_APP_API_URL}/api/teacher/analysis/subject/${selectedSubject}`;
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/details/${cleanQuizId}`);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/analysis/quiz/${selectedQuiz}/questions`);
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/quizzes/${selectedQuiz}/attempts`);
      setQuizAttempts(response.data);
    } catch (error) {
      toast.error('Failed to fetch quiz attempts');
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Performance Analysis</h2>
          <p className="text-slate-500 font-medium mt-1">Visualize quiz and question-level outcomes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
          <div className="relative min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedExperiment('');
                setSelectedQuiz('');
              }}
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
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {selectedSubject && experiments.length > 0 && (
            <div className="relative min-w-[200px]">
              <select
                value={selectedExperiment}
                onChange={(e) => {
                  setSelectedExperiment(e.target.value);
                  setSelectedQuiz('');
                }}
                className="w-full px-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm outline-none appearance-none cursor-pointer"
              >
                <option value="">All Experiments</option>
                {experiments.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    Exp {exp.experiment_number}: {exp.title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Choose a Subject to Analyze</h3>
          <p className="text-slate-500 max-w-md mx-auto">Select a subject from the dropdown to view quiz performance charts and student attempt data.</p>
        </div>
      ) : (
        <>
          {/* Overview Chart */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 mb-6">
            <h3 className="text-lg font-extrabold text-slate-800 mb-6">Subject Performance Overview</h3>
            {subjectAnalysis.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-400 font-medium">No quiz data available for this subject.</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={subjectAnalysis} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="quiz_title" angle={-35} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} height={100} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px' }} />
                  <Bar dataKey="avg_percentage" fill="#6366f1" name="Average %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="min_percentage" fill="#fbbf24" name="Min %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max_percentage" fill="#34d399" name="Max %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quiz summary table */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800">Quiz Performance Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                    <th className="px-6 py-4">Quiz</th>
                    <th className="px-6 py-4">Experiment</th>
                    <th className="px-6 py-4">Avg %</th>
                    <th className="px-6 py-4">Min %</th>
                    <th className="px-6 py-4">Max %</th>
                    <th className="px-6 py-4">Attempts</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {subjectAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-medium">No quiz data found. Quizzes will appear here once students attempt them.</td>
                    </tr>
                  ) : (
                    subjectAnalysis.map(quiz => (
                      <tr key={quiz.quiz_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800">{quiz.quiz_title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Exp {quiz.experiment_number}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{parseFloat(quiz.avg_percentage || 0).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-amber-600 font-medium">{parseFloat(quiz.min_percentage || 0).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">{parseFloat(quiz.max_percentage || 0).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{quiz.total_attempts || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                              onClick={() => {
                                setSelectedQuiz(quiz.quiz_id);
                                fetchQuizDetails(quiz.quiz_id);
                              }}
                            >
                              Quiz Details
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                              onClick={() => {
                                setSelectedQuiz(quiz.quiz_id);
                                setShowQuizDetails(false);
                                setQuizDetails(null);
                              }}
                            >
                              Analysis
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
        </>
      )}

      {/* Quiz Details Modal */}
      {showQuizDetails && quizDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Quiz Details</h3>
                <p className="text-sm text-slate-500 font-medium">{quizDetails.quiz.title}</p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => {
                  setShowQuizDetails(false);
                  setQuizDetails(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="overflow-y-auto p-8 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  { label: 'Subject', value: quizDetails.quiz.subject_name },
                  { label: 'Experiment', value: `Exp ${quizDetails.quiz.experiment_number} - ${quizDetails.quiz.experiment_title}` },
                  { label: 'Total Marks', value: quizDetails.quiz.total_marks },
                  { label: 'Duration', value: quizDetails.quiz.duration_minutes ? `${quizDetails.quiz.duration_minutes} minutes` : 'No limit' },
                  { label: 'Start Date', value: quizDetails.quiz.start_date ? new Date(quizDetails.quiz.start_date).toLocaleString() : 'Not set' },
                  { label: 'End Date', value: quizDetails.quiz.end_date ? new Date(quizDetails.quiz.end_date).toLocaleString() : 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-bold text-slate-800">{value}</p>
                  </div>
                ))}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${quizDetails.quiz.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${quizDetails.quiz.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {quizDetails.quiz.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-extrabold text-slate-800 mb-4 pb-2 border-b border-slate-100">Questions ({quizDetails.questions.length})</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                      <th className="px-5 py-3 w-10">#</th>
                      <th className="px-5 py-3">Question</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Marks</th>
                      <th className="px-5 py-3">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizDetails.questions.map((q, index) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 text-slate-500 font-bold">{index + 1}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700 max-w-xs">
                          <p className="mb-2">{q.question_text}</p>
                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                              {q.options.map((opt, oIdx) => (
                                <span key={oIdx} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                                  <span className="font-bold mr-1">{String.fromCharCode(65+oIdx)}.</span>{opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold uppercase px-2 py-1 bg-slate-100 text-slate-600 rounded">{q.question_type}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700">{q.marks}</td>
                        <td className="px-5 py-4 text-sm font-medium text-emerald-700 bg-emerald-50/50">{q.correct_answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-quiz deep analysis section */}
      {selectedQuiz && !showQuizDetails && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-800">Drill-Down Analysis</h3>
            <button
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
              onClick={() => {
                setSelectedQuiz('');
                setQuestionAnalysis([]);
                setQuizAttempts([]);
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Close Analysis
            </button>
          </div>

          {questionAnalysis.length > 0 && (
            <>
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 mb-6">
                <h3 className="text-base font-extrabold text-slate-800 mb-6">Question-wise Accuracy</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={questionAnalysis} margin={{ top: 5, right: 20, left: 0, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="question_text" angle={-35} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} height={120} tickFormatter={(val) => val.substring(0, 30) + (val.length > 30 ? '...' : '')} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                    <Legend wrapperStyle={{ paddingTop: '16px' }} />
                    <Bar dataKey="accuracy_percentage" fill="#8b5cf6" name="Accuracy %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-800">Question Analysis Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                        <th className="px-6 py-4">Question</th>
                        <th className="px-6 py-4">Marks</th>
                        <th className="px-6 py-4">Correct</th>
                        <th className="px-6 py-4">Attempts</th>
                        <th className="px-6 py-4">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {questionAnalysis.map((q, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-md">{q.question_text.substring(0, 80)}{q.question_text.length > 80 ? '...' : ''}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">{q.marks}</td>
                          <td className="px-6 py-4 text-emerald-600 font-bold">{q.correct_answers}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{q.total_attempts}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[80px]">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${parseFloat(q.accuracy_percentage) || 0}%` }}></div>
                              </div>
                              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{parseFloat(q.accuracy_percentage).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {quizAttempts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-800">Student Attempts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Percentage</th>
                      <th className="px-6 py-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {quizAttempts.map(attempt => (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {attempt.student_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{attempt.student_name}</div>
                              <div className="text-xs text-slate-400">ID: {attempt.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{attempt.score}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden min-w-[80px]">
                              <div
                                className={`h-full rounded-full ${parseFloat(attempt.percentage) >= 60 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                style={{ width: `${parseFloat(attempt.percentage) || 0}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${parseFloat(attempt.percentage) >= 60 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {parseFloat(attempt.percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {questionAnalysis.length === 0 && quizAttempts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <p className="text-slate-500 font-medium">Loading analysis data...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analysis;

