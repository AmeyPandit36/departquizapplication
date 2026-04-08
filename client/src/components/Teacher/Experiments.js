import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Experiments = () => {
  const [subjects, setSubjects] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    experiment_number: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchExperiments();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher/subjects`);
      setSubjects(response.data);
      if (response.data.length > 0 && !selectedSubject) {
        setSelectedSubject(response.data[0].id);
        setFormData(prev => ({ ...prev, subject_id: response.data[0].id }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExperiment) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/teacher/experiments/${editingExperiment.id}`, formData);
        toast.success('Experiment updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/teacher/experiments`, formData);
        toast.success('Experiment created successfully');
      }
      setShowModal(false);
      setEditingExperiment(null);
      setFormData({
        subject_id: selectedSubject,
        experiment_number: '',
        title: '',
        description: ''
      });
      fetchExperiments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (experiment) => {
    setEditingExperiment(experiment);
    setFormData({
      subject_id: experiment.subject_id,
      experiment_number: experiment.experiment_number,
      title: experiment.title,
      description: experiment.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experiment?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/teacher/experiments/${id}`);
      toast.success('Experiment deleted successfully');
      fetchExperiments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Experiments Management</h2>
          <p className="text-slate-500 font-medium mt-1">Organize experiments by subject</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setFormData(prev => ({ ...prev, subject_id: e.target.value }));
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
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          {selectedSubject && (
            <button 
              className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95"
              onClick={() => {
                setEditingExperiment(null);
                setFormData({
                  subject_id: selectedSubject,
                  experiment_number: '',
                  title: '',
                  description: ''
                });
                setShowModal(true);
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Experiment
            </button>
          )}
        </div>
      </div>

      {!selectedSubject ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Select a Subject</h3>
          <p className="text-slate-500 max-w-md mx-auto">Please select a subject from the dropdown menu above to view or manage its related experiments.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4 w-24">Exp. No.</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {experiments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                      No experiments found for this subject.
                    </td>
                  </tr>
                ) : (
                  experiments.map(experiment => (
                    <tr key={experiment.id} className="hover:bg-slate-50/80 transition-container group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                          {experiment.experiment_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{experiment.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-md truncate" title={experiment.description}>
                        {experiment.description || <span className="text-slate-300 italic">No description provided</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                            onClick={() => handleEdit(experiment)}
                            title="Edit Experiment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button 
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                            onClick={() => handleDelete(experiment.id)}
                            title="Delete Experiment"
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
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all relative">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-slate-800">
                {editingExperiment ? 'Edit Experiment' : 'Add New Experiment'}
              </h3>
              <button 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setEditingExperiment(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-5 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Experiment Number <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={formData.experiment_number}
                    onChange={(e) => setFormData({ ...formData, experiment_number: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="e.g. 1"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none"
                    placeholder="Enter experiment title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors outline-none min-h-[100px] resize-y"
                    placeholder="Brief description of the experiment..."
                  />
                </div>
              </div>

              <div className="flex gap-4 p-4 -mx-8 -mb-8 bg-slate-50 border-t border-slate-100">
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
                  {editingExperiment ? 'Save Changes' : 'Create Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experiments;












