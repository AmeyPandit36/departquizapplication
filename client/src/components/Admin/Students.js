import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    class_id: '',
    roll_number: '',
    subject_ids: []
  });

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
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

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/classes`);
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/students`, formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        user_id: '',
        name: '',
        email: '',
        password: '',
        class_id: '',
        roll_number: '',
        subject_ids: []
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      user_id: student.user_id,
      name: student.name,
      email: student.email || '',
      password: '',
      class_id: student.class_id || '',
      roll_number: student.roll_number || '',
      subject_ids: student.subject_ids ? student.subject_ids.split(',').map(Number) : []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
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
      toast.success('Students imported successfully');
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Students Management</h2>
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
            setEditingStudent(null);
            setFormData({
              user_id: '',
              name: '',
              email: '',
              password: '',
              class_id: '',
              roll_number: '',
              subject_ids: []
            });
            setShowModal(true);
          }}>
            Add Student
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Class</th>
              <th>Email</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.user_id}</td>
                <td>{student.name}</td>
                <td>{student.roll_number || '-'}</td>
                <td>{student.class_name || '-'}</td>
                <td>{student.email || '-'}</td>
                <td>{student.subjects || 'None'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(student)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(student.id)}>
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
              <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingStudent(null);
                setFormData({
                  user_id: '',
                  name: '',
                  email: '',
                  password: '',
                  class_id: '',
                  roll_number: '',
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
                  disabled={!!editingStudent}
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
                <label>Class</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Educational Roll Number</label>
                <input
                  type="text"
                  value={formData.roll_number}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="form-group">
                <label>Password {editingStudent && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingStudent}
                />
              </div>
              <div className="form-group">
                <label>Enroll in Subjects</label>
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

export default Students;



