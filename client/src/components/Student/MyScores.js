import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';
import QuizResultView from './QuizResultView';

/* ── CSV Export ── */
function exportCsv(scores) {
  const headers = ['Quiz Title', 'Subject', 'Class', 'Experiment', 'Score', 'Total Marks', 'Percentage', 'Submitted At'];
  const rows = scores.map(s => [
    `"${s.quiz_title}"`,
    `"${s.subject_name}"`,
    `"${s.class_name}"`,
    s.experiment_number,
    s.score,
    s.total_marks,
    parseFloat(s.percentage).toFixed(2),
    new Date(s.submitted_at).toLocaleString('en-IN')
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_quiz_scores_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Subject progress card ── */
function SubjCard({ sub }) {
  const pct = Math.min(100, parseFloat(sub.avg_percentage || 0));
  const color = pct >= 75 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';
  const bg   = pct >= 75 ? '#dcfce7' : pct >= 45 ? '#fef3c7' : '#fee2e2';
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: 14 }}>{sub.subject_name}</p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{sub.class_name} · {sub.total_quizzes} quiz{sub.total_quizzes !== 1 ? 'zes' : ''}</p>
        </div>
        <span style={{ background: bg, color, fontWeight: 800, fontSize: 13, padding: '3px 10px', borderRadius: 20 }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Min: {parseFloat(sub.min_percentage || 0).toFixed(1)}%</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Max: {parseFloat(sub.max_percentage || 0).toFixed(1)}%</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                        */
/* ═══════════════════════════════════════════════════════ */
const MyScores = () => {
  const [scores, setScores]         = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scoresRes, perfRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/student/scores`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/student/performance`)
      ]);
      setScores(scoresRes.data);
      setPerformance(perfRes.data);
    } catch {
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  if (selectedQuizId) {
    return <QuizResultView quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)} />;
  }

  /* ── Derived stats ── */
  const avg  = scores.length ? (scores.reduce((s, x) => s + parseFloat(x.percentage), 0) / scores.length).toFixed(1) : '0.0';
  const best = scores.length ? Math.max(...scores.map(x => parseFloat(x.percentage))).toFixed(1) : '0.0';

  /* ── Trend data: chronological ── */
  const trendData = [...scores]
    .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
    .map((s, i) => ({
      name: `#${i + 1}`,
      pct: parseFloat(parseFloat(s.percentage).toFixed(1)),
      label: s.quiz_title
    }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Performance</h1>
          <p className="text-slate-500 mt-1 text-sm">Track your progress across all subjects</p>
        </div>
        {scores.length > 0 && (
          <button
            onClick={() => exportCsv(scores)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
              background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12,
              fontWeight: 700, fontSize: 13, color: '#475569', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
            }}
          >
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Quizzes', value: scores.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'indigo' },
          { label: 'Average Score',  value: `${avg}%`,  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'emerald' },
          { label: 'Best Score',     value: `${best}%`, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl flex items-center gap-5 group hover:translate-y-[-4px] transition-all duration-300">
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-700">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Progress Cards */}
      {performance.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Subject-wise Progress</h2>
          <p className="text-sm text-slate-500 mb-6">Average score per enrolled subject</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {performance.map((sub, i) => <SubjCard key={i} sub={sub} />)}
          </div>
        </div>
      )}

      {/* Trend Line + Bar Chart side by side */}
      {trendData.length > 1 && (
        <>
          <style>{`
            .ms-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            @media (max-width: 900px) { .ms-charts-grid { grid-template-columns: 1fr; } }
          `}</style>
          <div className="ms-charts-grid">
          {/* Line chart — score over time */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Score Trend</h2>
            <p className="text-sm text-slate-500 mb-6">Your performance over time across all quizzes</p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val, _name, props) => [`${val}%`, props.payload.label]}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Score %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart — subject comparison */}
          {performance.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Subject Comparison</h2>
              <p className="text-sm text-slate-500 mb-6">Avg / Min / Max scores by subject</p>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject_name" angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="avg_percentage" fill="#6366f1" radius={[6, 6, 0, 0]} name="Avg %" />
                    <Bar dataKey="min_percentage" fill="#fbbf24" radius={[6, 6, 0, 0]} name="Min %" opacity={0.7} />
                    <Bar dataKey="max_percentage" fill="#10b981" radius={[6, 6, 0, 0]} name="Max %" opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          </div>
        </>
      )}

      {/* Quiz History Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Quiz History & Details</h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            {scores.length} Attempts
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {scores.length > 0 ? scores.map((score, idx) => {
                const pct = parseFloat(score.percentage);
                const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : 'F';
                const gColor = pct >= 75 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';
                const gBg    = pct >= 75 ? '#dcfce7' : pct >= 45 ? '#fef3c7' : '#fee2e2';
                return (
                  <tr key={idx} className="hover:bg-slate-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-700">{score.subject_name}</p>
                      <p className="text-xs text-slate-400 font-medium">Class: {score.class_name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-indigo-600">{score.quiz_title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Exp {score.experiment_number} · {new Date(score.submitted_at).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-lg font-black text-slate-700">{parseFloat(score.percentage).toFixed(1)}%</span>
                      <p className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">{score.score} / {score.total_marks} Marks</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span style={{ background: gBg, color: gColor, fontWeight: 800, fontSize: 15, padding: '4px 14px', borderRadius: 20 }}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedQuizId(score.quiz_id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 text-xs font-bold border border-indigo-100/50 group-hover:shadow-lg group-hover:shadow-indigo-100 shadow-sm"
                      >
                        View Report
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-slate-400 text-sm">No quiz scores yet. Take a quiz to see your results here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyScores;
