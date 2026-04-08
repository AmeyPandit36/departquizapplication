import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentProfile = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [pwForm, setPwForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]     = useState({ current: false, newPw: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/student/profile`)
      .then(r => setProfile(r.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errors = {};
    if (!pwForm.current) errors.current = 'Required';
    if (!pwForm.newPw)   errors.newPw   = 'Required';
    else if (pwForm.newPw.length < 6) errors.newPw = 'Min 6 characters';
    if (!pwForm.confirm)               errors.confirm = 'Required';
    else if (pwForm.newPw !== pwForm.confirm) errors.confirm = 'Passwords do not match';
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/student/profile/password`, {
        current_password: pwForm.current,
        new_password: pwForm.newPw
      });
      toast.success('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const toggleEye  = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));
  const handlePwInput = (field, val) => {
    setPwForm(p  => ({ ...p, [field]: val }));
    if (pwErrors[field]) setPwErrors(p => ({ ...p, [field]: '' }));
  };

  const PW_FIELDS = [
    { key: 'current', label: 'Current Password' },
    { key: 'newPw',   label: 'New Password'     },
    { key: 'confirm', label: 'Confirm New Password' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Responsive grid */}
      <style>{`
        .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 768px) { .sp-grid { grid-template-columns: 1fr; } }
        .sp-input { width: 100%; padding: 10px 40px 10px 14px; border-radius: 10px; border: 1.5px solid #e5e7eb; font-size: 14px; color: #1e293b; outline: none; background: #fafafa; box-sizing: border-box; transition: border-color 0.2s; }
        .sp-input:focus { border-color: #6366f1; background: #fff; }
        .sp-input.error { border-color: #f87171; }
      `}</style>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 22px' }}>My Profile</h1>

      <div className="sp-grid">

        {/* ── Info Card ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white', fontWeight: 800, flexShrink: 0
            }}>
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{profile?.name}</h2>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: 20 }}>
                Student
              </span>
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: 'User ID',      value: profile?.user_id,                  icon: '🪪' },
            { label: 'Roll Number',  value: profile?.roll_number || '—',        icon: '🔢' },
            { label: 'Email',        value: profile?.email || 'Not provided',   icon: '📧' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#334155' }}>{f.value}</p>
              </div>
            </div>
          ))}

          {/* Enrolled Subjects */}
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              Enrolled Subjects ({profile?.subjects?.length || 0})
            </p>
            {profile?.subjects?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.subjects.map(s => (
                  <span key={s.id} style={{
                    background: '#f0f9ff', color: '#0369a1',
                    fontSize: 12, fontWeight: 600, padding: '4px 12px',
                    borderRadius: 20, border: '1px solid #bae6fd'
                  }}>
                    {s.class_name} – {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No subjects assigned</p>
            )}
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>🔐 Change Password</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>Choose a strong password with at least 6 characters.</p>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            {PW_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => handlePwInput(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className={`sp-input${pwErrors[key] ? ' error' : ''}`}
                  />
                  <button type="button" onClick={() => toggleEye(key)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#94a3b8', padding: 2 }}>
                    {showPw[key] ? '🙈' : '👁️'}
                  </button>
                </div>
                {pwErrors[key] && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{pwErrors[key]}</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={pwLoading} style={{
              padding: '11px', borderRadius: 12, border: 'none', marginTop: 4,
              background: pwLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontWeight: 700, fontSize: 14,
              cursor: pwLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 10px rgba(99,102,241,0.3)', transition: 'opacity 0.2s'
            }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Security tips */}
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>💡 Tips for a strong password</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
              <li>At least 8 characters long</li>
              <li>Mix letters, numbers and symbols</li>
              <li>Avoid your name or roll number</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
