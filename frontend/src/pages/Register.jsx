import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 15) return `Name must be at least 15 characters (${value.trim().length}/15)`;
        if (value.trim().length > 60) return `Name must be at most 60 characters (${value.trim().length}/60)`;
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return `Password must be at least 8 characters (${value.length}/8)`;
        if (value.length > 16) return `Password must be at most 16 characters (${value.length}/16)`;
        if (!/[A-Z]/.test(value)) return 'Password must contain at least 1 uppercase letter';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Password must contain at least 1 special character';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length > 400) return `Address must be at most 400 characters (${value.trim().length}/400)`;
        return '';
      default:
        return '';
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 7) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 4) return { level: 3, label: 'Good', color: '#06b6d4' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (apiError) setApiError('');
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
      await register(formData);
      setSuccess('Registration successful! Redirecting to login...');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="register-page">
      <div className="login-bg-orb login-bg-orb-1"></div>
      <div className="login-bg-orb login-bg-orb-2"></div>

      <div className="register-card glass-card">
        <div className="login-header">
          <span className="login-logo">⭐</span>
          <h1 className="login-title gradient-text">Create Account</h1>
          <p className="login-subtitle">Join the Store Rating System</p>
        </div>

        {apiError && <div className="error-message">{apiError}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">
              Full Name
              <span className="char-counter">{formData.name.trim().length}/60</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name (20-60 chars)"
              value={formData.name}
              onChange={handleChange}
            />
            <span className="form-error">{errors.name || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            <span className="form-error">{errors.email || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="8-16 chars, 1 upper, 1 special"
              value={formData.password}
              onChange={handleChange}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${passwordStrength.level >= level ? 'active' : ''}`}
                      style={{ backgroundColor: passwordStrength.level >= level ? passwordStrength.color : '' }}
                    ></div>
                  ))}
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            <span className="form-error">{errors.password || ''}</span>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Address
              <span className="char-counter">{formData.address.trim().length}/400</span>
            </label>
            <textarea
              id="address"
              name="address"
              className={`form-input register-textarea ${errors.address ? 'error' : ''}`}
              placeholder="Enter your address (max 400 chars)"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            ></textarea>
            <span className="form-error">{errors.address || ''}</span>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-footer-text">Already have an account?</span>
          <Link to="/login" className="login-footer-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
