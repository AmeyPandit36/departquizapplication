import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

/* ── Countdown hook ── */
function useCountdown(targetDateStr) {
  const calc = useCallback(() => {
    if (!targetDateStr) return null;
    const diff = new Date(targetDateStr) - new Date();
    if (diff <= 0) return { expired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, expired: false };
  }, [targetDateStr]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

/* ── Countdown card ── */
function CountdownCard({ quiz }) {
  const time = useCountdown(quiz?.end_date);
  if (!quiz) return null;
  const urgent = time && !time.expired && time.h < 6;
  const bg     = urgent ? '#fee2e2' : '#eff6ff';
  const border = urgent ? '#fca5a5' : '#bfdbfe';
  const accent = urgent ? '#b91c1c' : '#1d4ed8';
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>⏰</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {urgent ? 'Closing Soon!' : 'Up Next'}
          </p>
          <p style={{ fontWeight: 700, color: '#1e293b', margin: '2px 0 0', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</p>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{quiz.subject_name} · Exp {quiz.experiment_number}</p>
        </div>
      </div>
      {time && !time.expired ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {[['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
            <div key={label} style={{
              textAlign: 'center', background: 'white', borderRadius: 8,
              padding: '6px 10px', minWidth: 44, boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: urgent ? '#dc2626' : '#2563eb', lineHeight: 1 }}>
                {String(val).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Expired</span>
      )}
    </div>
  );
}

/* ── Subject progress card ── */
function SubjectCard({ sub }) {
  const pct   = Math.min(100, parseFloat(sub.avg_percentage || 0));
  const color = pct >= 75 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';
  const bg    = pct >= 75 ? '#dcfce7' : pct >= 45 ? '#fef3c7' : '#fee2e2';
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1.5px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.subject_name}</p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{sub.class_name} · {sub.total_quizzes} quiz{Number(sub.total_quizzes) !== 1 ? 'zes' : ''}</p>
        </div>
        <span style={{ background: bg, color, fontWeight: 800, fontSize: 12, padding: '2px 9px', borderRadius: 20, flexShrink: 0 }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

/* ── Activity item ── */
function ActivityItem({ s }) {
  const pct   = parseFloat(s.percentage || 0);
  const color = pct >= 75 ? '#16a34a' : pct >= 45 ? '#d97706' : '#dc2626';
  const bg    = pct >= 75 ? '#dcfce7' : pct >= 45 ? '#fef3c7' : '#fee2e2';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ background: bg, color, fontWeight: 800, fontSize: 12, padding: '3px 9px', borderRadius: 20, minWidth: 52, textAlign: 'center', flexShrink: 0 }}>
        {pct.toFixed(1)}%
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.quiz_title}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{s.subject_name} · {s.score}/{s.total_marks} marks</p>
      </div>
      <span style={{ fontSize: 11, color: '#cbd5e1', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {new Date(s.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
const StudentHome = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/student/dashboard`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  const stats        = data?.stats || {};
  const nextQuiz     = data?.upcoming_quizzes?.[0] || null;
  const upcomingRest = data?.upcoming_quizzes?.slice(1) || [];
  const subjectPerf  = data?.subject_performance || [];
  const recentScores = data?.recent_scores || [];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Responsive styles */}
      <style>{`
        .sh-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .sh-main-grid { grid-template-columns: 1fr; } }
        .sh-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }
      `}</style>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 24,
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 60, width: 180, height: 180, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 3px' }}>{greeting},</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>{user?.name} 👋</h1>
        <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>
          You have <strong>{data?.subject_count || 0}</strong> enrolled subjects
          {Number(stats.total_quizzes) > 0 && <> and <strong>{stats.total_quizzes}</strong> quizzes completed</>}.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="sh-stats-grid">
        <StatCard icon="📋" label="Total Quizzes"   value={stats.total_quizzes  || 0}     color="#4f46e5" />
        <StatCard icon="📊" label="Average Score"   value={`${stats.avg_percentage  || '0.0'}%`} color="#0891b2" />
        <StatCard icon="🏆" label="Best Score"      value={`${stats.best_percentage || '0.0'}%`} color="#16a34a" />
        <StatCard icon="📚" label="Subjects"         value={data?.subject_count   || 0}     color="#9333ea" />
      </div>

      {/* Two-column layout (stacks on mobile) */}
      <div className="sh-main-grid">

        {/* Left: Upcoming + Subject Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Upcoming Deadlines */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', margin: 0 }}>⏰ Upcoming Deadlines</h2>
              {data?.upcoming_quizzes?.length > 0 && (
                <button onClick={() => onNavigate('quizzes')} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  View all →
                </button>
              )}
            </div>
            {nextQuiz ? (
              <div>
                <CountdownCard quiz={nextQuiz} />
                {upcomingRest.map(q => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ color: '#475569', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{q.title}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
                      {new Date(q.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', margin: 0, fontSize: 14 }}>
                🎉 No upcoming deadlines!
              </p>
            )}
          </div>

          {/* Subject Progress */}
          {subjectPerf.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', margin: '0 0 14px' }}>📚 Subject Progress</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subjectPerf.map((s, i) => <SubjectCard key={i} sub={s} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Activity */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', margin: 0 }}>🕐 Recent Activity</h2>
            {recentScores.length > 0 && (
              <button onClick={() => onNavigate('scores')} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                All scores →
              </button>
            )}
          </div>
          {recentScores.length > 0 ? (
            recentScores.map((s, i) => <ActivityItem key={i} s={s} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📝</div>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#64748b', margin: 0 }}>No quizzes attempted yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 14px' }}>Take your first quiz to see results here</p>
              <button onClick={() => onNavigate('quizzes')} style={{
                padding: '8px 18px', background: '#6366f1', color: 'white',
                border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13
              }}>
                Browse Quizzes →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
