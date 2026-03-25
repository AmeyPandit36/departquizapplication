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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Experiments Management</h2>
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setFormData(prev => ({ ...prev, subject_id: e.target.value }));
            }}
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
            <button className="btn btn-primary" onClick={() => {
              setEditingExperiment(null);
              setFormData({
                subject_id: selectedSubject,
                experiment_number: '',
                title: '',
                description: ''
              });
              setShowModal(true);
            }}>
              Add Experiment
            </button>
          )}
        </div>
      </div>

      {selectedSubject && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Exp. No.</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map(experiment => (
                <tr key={experiment.id}>
                  <td>{experiment.experiment_number}</td>
                  <td>{experiment.title}</td>
                  <td>{experiment.description || '-'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(experiment)} style={{ marginRight: '10px' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(experiment.id)}>
                      Delete
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
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingExperiment ? 'Edit Experiment' : 'Add Experiment'}</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingExperiment(null);
                setFormData({
                  subject_id: selectedSubject,
                  experiment_number: '',
                  title: '',
                  description: ''
                });
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Experiment Number</label>
                <input
                  type="number"
                  value={formData.experiment_number}
                  onChange={(e) => setFormData({ ...formData, experiment_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experiments;












