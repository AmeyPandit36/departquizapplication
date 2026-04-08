import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const Students = () => {
  const [selectedClass, setSelectedClass] = useState('SE');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentPerformance();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/students/class/${selectedClass}`);
      setStudents(response.data);
      setSelectedStudent(null);
      setStudentPerformance(null);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchStudentPerformance = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/students/${selectedStudent.id}/performance`);
      setStudentPerformance(response.data);
    } catch (error) {
      toast.error('Failed to fetch student performance');
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const classes = [
    { value: 'SE', label: 'SE', full: 'Second Year' },
    { value: 'TE', label: 'TE', full: 'Third Year' },
    { value: 'BE', label: 'BE', full: 'Fourth Year' },
  ];

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">My Students</h2>
          <p className="text-slate-500 font-medium mt-1">
            <span className="font-bold text-indigo-700">{students.length}</span> students in {selectedClass} class
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          {classes.map(cls => (
            <button
              key={cls.value}
              onClick={() => setSelectedClass(cls.value)}
              className={`px-5 py-2.5 font-bold text-sm transition-all ${selectedClass === cls.value ? 'bg-indigo-600 text-white shadow-inner' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {cls.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${selectedStudent ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
        {/* Student List */}
        <div className={`bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden ${selectedStudent ? 'lg:col-span-2' : ''}`}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-700">{selectedClass} Students</h3>
            <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs">{students.length}</span>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                <tr className="uppercase text-xs tracking-wider text-slate-500 font-bold">
                  <th className="px-5 py-4">Student</th>
                  {!selectedStudent && <th className="px-5 py-4">Email</th>}
                  <th className="px-5 py-4 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-5 py-10 text-center text-slate-400 font-medium">No students found in {selectedClass}.</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className={`cursor-pointer transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${selectedStudent?.id === student.id ? 'bg-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'}`}>
                            {student.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                            <div className="text-xs text-slate-400">{student.user_id}</div>
                          </div>
                        </div>
                      </td>
                      {!selectedStudent && (
                        <td className="px-5 py-4 text-sm text-slate-500 truncate max-w-[180px]">{student.email || <span className="text-slate-300 italic">Not set</span>}</td>
                      )}
                      <td className="px-5 py-4 text-center">
                        <button
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleStudentClick(student); }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-extrabold text-slate-800">Student Profile</h3>
                <button
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => { setSelectedStudent(null); setStudentPerformance(null); }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-200">
                  {selectedStudent.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-slate-800">{selectedStudent.name}</h4>
                  <p className="text-slate-500 font-medium">{selectedStudent.email || 'No email provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Student ID</p>
                  <p className="font-bold text-slate-800">{selectedStudent.user_id}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Subjects</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedStudent.subjects || 'None assigned'}</p>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            {studentPerformance && (
              <>
                {studentPerformance.statistics?.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6">
                    <h3 className="text-base font-extrabold text-slate-800 mb-6">Performance by Subject</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={studentPerformance.statistics} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="subject_name" angle={-30} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} height={80} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ paddingTop: '12px' }} />
                        <Bar dataKey="avg_percentage" fill="#6366f1" name="Average %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="min_percentage" fill="#fbbf24" name="Min %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="max_percentage" fill="#34d399" name="Max %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Stats table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-800">Subject-wise Statistics</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Class</th>
                          <th className="px-5 py-3">Avg %</th>
                          <th className="px-5 py-3">Quizzes</th>
                          <th className="px-5 py-3">Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80">
                        {studentPerformance.statistics?.map((stat, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-800">{stat.subject_name}</td>
                            <td className="px-5 py-4"><span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{stat.class_name}</span></td>
                            <td className="px-5 py-4 font-bold text-indigo-600">{parseFloat(stat.avg_percentage || 0).toFixed(1)}%</td>
                            <td className="px-5 py-4 text-slate-600 font-medium">{stat.total_quizzes || 0}</td>
                            <td className="px-5 py-4 text-xs text-slate-500">
                              <span className="text-amber-600 font-bold">{parseFloat(stat.min_percentage || 0).toFixed(1)}%</span>
                              <span className="mx-1 text-slate-300">–</span>
                              <span className="text-emerald-600 font-bold">{parseFloat(stat.max_percentage || 0).toFixed(1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* All Attempts */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-800">All Quiz Attempts</h3>
                  </div>
                  <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Quiz</th>
                          <th className="px-5 py-3">Score</th>
                          <th className="px-5 py-3">Percentage</th>
                          <th className="px-5 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80">
                        {studentPerformance.performance?.map((perf, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-slate-700 text-sm">{perf.subject_name}</div>
                              <div className="text-xs text-slate-400">{perf.class_name} · Exp {perf.experiment_number}</div>
                            </td>
                            <td className="px-5 py-3 text-sm font-medium text-slate-700 max-w-[160px] truncate">{perf.quiz_title}</td>
                            <td className="px-5 py-3 font-bold text-slate-700">{perf.score} / {perf.total_marks}</td>
                            <td className="px-5 py-3">
                              <span className={`font-bold text-sm ${parseFloat(perf.percentage) >= 60 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {parseFloat(perf.percentage || 0).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-500">{new Date(perf.submitted_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
