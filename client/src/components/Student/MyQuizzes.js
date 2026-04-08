import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import TakeQuiz from './TakeQuiz';

/* ── Deadline badge helper ── */
function deadlineBadge(endDate) {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return null;
  const h = diff / 3600000;
  if (h <= 2)  return { label: `Closes in ${Math.round(diff / 60000)}m`, color: '#dc2626', bg: '#fee2e2' };
  if (h <= 12) return { label: `Closes in ${Math.round(h)}h`, color: '#d97706', bg: '#fef3c7' };
  if (h <= 24) return { label: 'Closes tomorrow', color: '#0369a1', bg: '#e0f2fe' };
  return null;
}

/* ── Preview Modal ── */
function QuizPreviewModal({ quiz, onStart, onClose }) {
  if (!quiz) return null;
  const badge = deadlineBadge(quiz.end_date);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px', maxWidth: 480, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Experiment {quiz.experiment_number}
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '4px 0 0' }}>{quiz.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>

        {/* Deadline warning */}
        {badge && (
          <div style={{ background: badge.bg, color: badge.color, borderRadius: 10, padding: '8px 14px', marginBottom: 18, fontWeight: 700, fontSize: 13 }}>
            ⚠️ {badge.label}!
          </div>
        )}

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '⏱', label: 'Duration', value: `${quiz.duration_minutes} minutes` },
            { icon: '📝', label: 'Total Marks', value: quiz.total_marks },
            { icon: '📅', label: 'Start Date', value: quiz.start_date ? new Date(quiz.start_date).toLocaleDateString('en-IN') : 'Any time' },
            { icon: '🗓', label: 'End Date', value: quiz.end_date ? new Date(quiz.end_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'No deadline' },
          ].map(f => (
            <div key={f.label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{f.icon} {f.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: '#334155' }}>{f.value}</p>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>📢 Instructions</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#78350f', lineHeight: 1.8 }}>
            <li>Once started, the timer cannot be paused.</li>
            <li>Submitting before time is allowed — your answers are saved.</li>
            <li>You can only attempt this quiz once.</li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb',
            background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14
          }}>
            Cancel
          </button>
          <button onClick={onStart} style={{
            flex: 2, padding: '12px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
          }}>
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                        */
/* ═══════════════════════════════════════════════════════ */
const FILTERS = ['All', 'Available', 'In Progress', 'Completed'];

const MyQuizzes = () => {
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchSubjects(); }, []); // eslint-disable-line

  useEffect(() => {
    if (selectedSubject) fetchQuizzes();
  }, [selectedSubject]); // eslint-disable-line

  const fetchSubjects = async () => {
    try {
      const r = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/subjects`);
      setSubjects(r.data);
      if (r.data.length > 0 && !selectedSubject) setSelectedSubject(r.data[0].id);
    } catch { toast.error('Failed to fetch subjects'); }
    finally { setLoading(false); }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const r = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/quizzes/${selectedSubject}`);
      setQuizzes(r.data);
    } catch { toast.error('Failed to fetch quizzes'); }
    finally { setLoading(false); }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/student/quizzes/${quiz.id}/start`);
      setPreviewQuiz(null);
      setSelectedQuiz(quiz);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  if (selectedQuiz) {
    return <TakeQuiz quiz={selectedQuiz} onBack={() => { setSelectedQuiz(null); fetchQuizzes(); }} />;
  }

  /* filter logic */
  const filtered = quizzes.filter(q => {
    if (filter === 'All') return true;
    if (filter === 'Completed') return q.attempted;
    if (filter === 'In Progress') return q.in_progress && !q.attempted;
    if (filter === 'Available') return !q.attempted && !q.in_progress;
    return true;
  });

  const counts = {
    All: quizzes.length,
    Available: quizzes.filter(q => !q.attempted && !q.in_progress).length,
    'In Progress': quizzes.filter(q => q.in_progress && !q.attempted).length,
    Completed: quizzes.filter(q => q.attempted).length,
  };

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {previewQuiz && (
        <QuizPreviewModal
          quiz={previewQuiz}
          onClose={() => setPreviewQuiz(null)}
          onStart={() => handleStartQuiz(previewQuiz)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Quizzes</h1>
          <p className="text-slate-500 mt-1 text-sm">Select a subject and filter quizzes by status</p>
        </div>
        {/* Subject Selector */}
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm w-full md:w-auto">
          <div className="flex items-center gap-2 pl-3 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer pr-10 w-full"
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.class_name} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      {selectedSubject && !loading && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                background: filter === f ? '#6366f1' : '#f1f5f9',
                color: filter === f ? 'white' : '#64748b',
                boxShadow: filter === f ? '0 2px 8px rgba(99,102,241,0.25)' : 'none'
              }}
            >
              {f}
              <span style={{
                marginLeft: 6, fontSize: 11, padding: '1px 7px', borderRadius: 20,
                background: filter === f ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: filter === f ? 'white' : '#94a3b8'
              }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : selectedSubject ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Experiment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Marks</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length > 0 ? (
                  filtered.map(quiz => {
                    const badge = deadlineBadge(quiz.end_date);
                    return (
                      <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{quiz.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <p className="text-xs text-slate-400">
                              Ends: {quiz.end_date ? new Date(quiz.end_date).toLocaleDateString('en-IN') : '—'}
                            </p>
                            {badge && !quiz.attempted && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: badge.color, background: badge.bg, padding: '1px 8px', borderRadius: 20 }}>
                                ⚠ {badge.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                            Exp {quiz.experiment_number}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-slate-600">{quiz.total_marks}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-slate-500 font-medium">{quiz.duration_minutes} min</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${quiz.attempted ? 'bg-emerald-500' : (quiz.in_progress ? 'bg-amber-500' : 'bg-indigo-500')} animate-pulse`}></span>
                            <span className={`text-xs font-bold ${quiz.attempted ? 'text-emerald-600' : (quiz.in_progress ? 'text-amber-600' : 'text-indigo-600')}`}>
                              {quiz.attempted ? 'Completed' : (quiz.in_progress ? 'In Progress' : 'Available')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {!quiz.attempted ? (
                            <button
                              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${quiz.in_progress ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
                              onClick={() => setPreviewQuiz(quiz)}
                            >
                              <div className="flex items-center gap-2">
                                {quiz.in_progress ? 'Resume' : 'Start Now'}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </div>
                            </button>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-emerald-600 font-bold text-sm">{quiz.my_score} / {quiz.total_marks}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{quiz.my_percentage}% Score</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No {filter !== 'All' ? filter.toLowerCase() : ''} quizzes</h3>
                        <p className="text-slate-400 max-w-xs mx-auto text-sm mt-1">
                          {filter !== 'All' ? `Try switching to "All" to see every quiz.` : 'No active quizzes for this subject.'}
                        </p>
                        {filter !== 'All' && (
                          <button onClick={() => setFilter('All')} style={{ marginTop: 12, fontSize: 13, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                            Show all quizzes
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 p-12 text-center">
          <svg className="w-16 h-16 text-indigo-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-bold text-slate-700">Explore Subjects</h3>
          <p className="text-slate-400 mt-2">Please select a subject from the list to see your quizzes.</p>
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
