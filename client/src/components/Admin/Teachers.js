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
      const response = await axios.get('http://localhost:5000/api/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/subjects');
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await axios.put(`http://localhost:5000/api/admin/teachers/${editingTeacher.id}`, formData);
        toast.success('Teacher updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/admin/teachers', formData);
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
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
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
      const response = await axios.post('http://localhost:5000/api/admin/import-users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Users imported successfully');
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Teachers Management</h2>
        <div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            style={{ marginRight: '10px' }}
            id="import-file"
          />
          <label htmlFor="import-file" className="btn btn-secondary" style={{ marginRight: '10px', cursor: 'pointer' }}>
            Import Excel
          </label>
          <button className="btn btn-primary" onClick={() => {
            setEditingTeacher(null);
            setFormData({
              user_id: '',
              name: '',
              email: '',
              password: '',
              qualification: '',
              subject_ids: []
            });
            setShowModal(true);
          }}>
            Add Teacher
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.user_id}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email || '-'}</td>
                <td>{teacher.qualification || '-'}</td>
                <td>{teacher.subjects || 'None'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(teacher)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(teacher.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button className="close-btn" onClick={() => {
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
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                  disabled={!!editingTeacher}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Password {editingTeacher && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingTeacher}
                />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assign Subjects</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                  {subjects.map(subject => (
                    <label key={subject.id} style={{ display: 'block', marginBottom: '8px' }}>
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
                        style={{ marginRight: '8px' }}
                      />
                      {subject.class_name} - {subject.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;


