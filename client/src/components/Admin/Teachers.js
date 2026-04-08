import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    qualification: '',
    subject_ids: []
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/teachers`);
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/teachers/${editingTeacher.id}`, formData);
        toast.success('Teacher updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/teachers`, formData);
        toast.success('Teacher created successfully');
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({
        user_id: '',
        name: '',
        email: '',
        password: '',
        qualification: '',
        subject_ids: []
      });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      user_id: teacher.user_id,
      name: teacher.name,
      email: teacher.email || '',
      password: '',
      qualification: teacher.qualification || '',
      subject_ids: teacher.subject_ids ? teacher.subject_ids.split(',').map(Number) : []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/import-users`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Users imported successfully');
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Teachers Management</h2>
          <p className="text-slate-500 font-medium mt-1">Manage, import, and organize faculty records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
            id="import-teacher-file"
          />
          <label 
            htmlFor="import-teacher-file" 
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 mr-2 text-indigo-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            Import Excel
          </label>
          <button 
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95"
            onClick={() => {
              setEditingTeacher(null);
              setFormData({
                user_id: '', name: '', email: '', password: '', qualification: '', subject_ids: []
              });
              setShowModal(true);
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Teacher
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Qualification</th>
                <th className="px-6 py-4">Subjects</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No teachers found. Add one or import from Excel.
                  </td>
                </tr>
              ) : (
                teachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition-container group">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-700">
                      {teacher.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{teacher.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                      {teacher.email || <span className="text-slate-300 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {teacher.qualification ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {teacher.qualification}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={teacher.subjects}>
                      {teacher.subjects || <span className="text-slate-300 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          onClick={() => handleEdit(teacher)}
                          title="Edit Teacher"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button 
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          onClick={() => handleDelete(teacher.id)}
                          title="Delete Teacher"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all relative">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-slate-800">
                {editingTeacher ? 'Edit Teacher Details' : 'Register New Teacher'}
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setEditingTeacher(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">User ID <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                    disabled={!!editingTeacher}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 transition-colors outline-none"
                    placeholder="e.g. TCH001"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="e.g. Ph.D., M.Tech"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Password {editingTeacher && <span className="text-slate-400 normal-case ml-1 font-normal">(leave blank to keep)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingTeacher}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="Enter secure password"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 block">Assign Subjects</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[160px] overflow-y-auto">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4">No subjects available</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subjects.map(subject => (
                        <label key={subject.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                          <input
                            type="checkbox"
                            checked={formData.subject_ids.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, subject_ids: [...formData.subject_ids, subject.id] });
                              } else {
                                setFormData({ ...formData, subject_ids: formData.subject_ids.filter(id => id !== subject.id) });
                              }
                            }}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 focus:ring-2"
                          />
                          <div>
                            <span className="block text-sm font-bold text-slate-800">{subject.name}</span>
                            <span className="block text-xs text-slate-500">{subject.class_name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 p-4 -mx-8 -mb-8 mt-2 bg-slate-50 border-t border-slate-100">
                <button 
                  type="button" 
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all active:scale-95"
                >
                  {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;


