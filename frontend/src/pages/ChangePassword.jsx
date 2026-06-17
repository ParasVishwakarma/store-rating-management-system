import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './ChangePassword.css';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'currentPassword':
        if (!value) return 'Current password is required';
        return '';
      case 'newPassword':
        if (!value) return 'New password is required';
        if (value.length < 8) return `Minimum 8 characters (${value.length}/8)`;
        if (value.length > 16) return `Maximum 16 characters (${value.length}/16)`;
        if (!/[A-Z]/.test(value)) return 'Must contain at least 1 uppercase letter';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Must contain at least 1 special character';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your new password';
        if (value !== formData.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (apiError) setApiError('');
    if (success) setSuccess('');
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="change-password-page">
        <div className="change-password-card glass-card">
          <div className="change-password-header">
            <h1 className="change-password-title gradient-text">Change Password</h1>
            <p className="change-password-subtitle">Update your account password</p>
          </div>

          {apiError && <div className="error-message">{apiError}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
              <span className="form-error">{errors.currentPassword || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="8-16 chars, 1 upper, 1 special"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <span className="form-error">{errors.newPassword || ''}</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span className="form-error">{errors.confirmPassword || ''}</span>
            </div>

            <button type="submit" className="btn-primary change-password-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
