import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const Statistics = () => {
  const [quizzesByClass, setQuizzesByClass] = useState([]);
  const [quizzesBySubject, setQuizzesBySubject] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchStats();
  }, [selectedStudent]);

  const fetchStats = async () => {
    try {
      const [classRes, subjectRes, partRes, scoresRes, perfRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/quizzes-by-class`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/quizzes-by-subject`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-participation`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-scores`, {
          params: selectedStudent ? { student_id: selectedStudent } : {}
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats/student-performance`, {
          params: selectedStudent ? { student_id: selectedStudent } : {}
        })
      ]);

      setQuizzesByClass(classRes.data);
      setQuizzesBySubject(subjectRes.data);
      setParticipation(partRes.data);
      setStudentScores(scoresRes.data);
      setPerformance(perfRes.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 md:p-8 animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Statistics & Analytics</h2>
        <p className="text-slate-500 font-medium mt-1">Overview of department performance and participation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-default">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Quizzes</p>
            <h3 className="text-4xl font-black text-indigo-700">{quizzesByClass.reduce((sum, item) => sum + item.total_quizzes, 0)}</h3>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-default">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Subjects</p>
            <h3 className="text-4xl font-black text-emerald-600">{quizzesBySubject.length}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-default">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-4xl font-black text-amber-500">{participation.reduce((sum, item) => sum + item.total_students, 0)}</h3>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Student Filter</h3>
            <p className="text-sm text-slate-500">View analytics for a specific student</p>
          </div>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              placeholder="Search by Student ID..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col items-center">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 self-start">Quizzes by Class</h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizzesByClass} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total_quizzes" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 flex flex-col items-center">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 self-start">Student Participation</h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="subject_name" angle={-45} textAnchor="end" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '30px'}} />
                <Bar dataKey="students_attempted" fill="#10b981" name="Attempted" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="students_not_attempted" fill="#cbd5e1" name="Not Attempted" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 lg:col-span-2 flex flex-col items-center">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 self-start">Student Performance by Subject</h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="subject_name" angle={-45} textAnchor="end" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '30px'}} />
                <Bar dataKey="avg_percentage" fill="#6366f1" name="Average %" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="min_percentage" fill="#f59e0b" name="Min %" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="max_percentage" fill="#10b981" name="Max %" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-extrabold text-slate-800">Individual Student Scores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold bg-white">
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Quiz</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {studentScores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No scores recorded yet.
                  </td>
                </tr>
              ) : (
                studentScores.map((score, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">{score.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{score.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{score.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 truncate max-w-[200px]" title={score.quiz_title}>{score.quiz_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {score.score} <span className="text-slate-400 text-sm">/ {score.total_marks}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        score.percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        score.percentage >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {score.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                      {new Date(score.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;












