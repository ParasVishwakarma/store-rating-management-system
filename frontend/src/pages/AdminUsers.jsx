import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import api from '../api/axios';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortConfig, setSortConfig] = useState({ sortBy: 'name', order: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
    storeId: ''
  });


  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    try {
      const response = await api.get('/admin/stores');

      const storesData =
        response.data?.data ||
        response.data?.stores ||
        response.data;

      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const params = { ...sortConfig };

      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const response = await api.get('/admin/users', { params });

      console.log('=================================');
      console.log('USERS RESPONSE:', response.data);
      console.log('=================================');

      const usersData =
        response.data?.data ||
        response.data?.users ||
        response.data;

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);

      if (err.response) {
        console.error('STATUS:', err.response.status);
        console.error('DATA:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    fetchStores();
  }, []);
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleRowClick = async (user) => {
    setSelectedUser(null);
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
      setSelectedUser(user);
    } finally {
      setDetailLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    else if (formData.name.trim().length < 20) errors.name = 'Name must be at least 20 characters';
    else if (formData.name.trim().length > 60) errors.name = 'Name must be at most 60 characters';

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Min 8 characters';
    else if (formData.password.length > 16) errors.password = 'Max 16 characters';
    else if (!/[A-Z]/.test(formData.password)) errors.password = 'Need 1 uppercase';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) errors.password = 'Need 1 special char';

    if (!formData.address.trim()) errors.address = 'Address is required';
    else if (formData.address.trim().length > 400) errors.address = 'Max 400 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setApiError('');
    try {
      await api.post('/admin/users', formData);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user',
        storeId: ''
      });
      setFormErrors({});
      fetchUsers();
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.error || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const cls = role === 'admin' ? 'badge-admin' : role === 'store_owner' ? 'badge-owner' : 'badge-user';
    const label = role === 'store_owner' ? 'Owner' : role;
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => getRoleBadge(value),
    },
  ];

  const filterConfig = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'role', label: 'Role', type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'store_owner', label: 'Store Owner' },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="admin-users-header">
          <div className="page-header">
            <h1 className="page-title gradient-text">User Management</h1>
            <p className="page-subtitle">Manage all users in the system</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add User
          </button>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={setFilters}
        />

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onSort={handleSort}
            sortConfig={sortConfig}
            onRowClick={handleRowClick}
            emptyMessage="No users found. Try adjusting your filters."
          />
        )}

        {/* Add User Modal */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setApiError(''); setFormErrors({}); }} title="Add New User">
          {apiError && <div className="error-message">{apiError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                placeholder="20-60 characters"
                value={formData.name}
                onChange={handleFormChange}
              />
              <span className="form-error">{formErrors.name || ''}</span>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleFormChange}
              />
              <span className="form-error">{formErrors.email || ''}</span>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                className={`form-input ${formErrors.password ? 'error' : ''}`}
                placeholder="8-16 chars, 1 upper, 1 special"
                value={formData.password}
                onChange={handleFormChange}
              />
              <span className="form-error">{formErrors.password || ''}</span>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className={`form-input ${formErrors.address ? 'error' : ''}`}
                placeholder="Max 400 characters"
                value={formData.address}
                onChange={handleFormChange}
                rows={3}
                style={{ resize: 'vertical' }}
              ></textarea>
              <span className="form-error">{formErrors.address || ''}</span>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleFormChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            {formData.role === 'store_owner' && (
              <div className="form-group">
                <label>Assign Store</label>

                <select
                  name="storeId"
                  className="form-select"
                  value={formData.storeId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Store</option>

                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </Modal>

        {/* User Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="User Details">
          {detailLoading ? (
            <div className="spinner-container" style={{ padding: 30 }}>
              <div className="spinner"></div>
            </div>
          ) : selectedUser ? (
            <div className="user-detail">
              <div className="user-detail-row">
                <span className="user-detail-label">Name</span>
                <span className="user-detail-value">{selectedUser.name}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Email</span>
                <span className="user-detail-value">{selectedUser.email}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Address</span>
                <span className="user-detail-value">{selectedUser.address}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Role</span>
                <span className="user-detail-value">{getRoleBadge(selectedUser.role)}</span>
              </div>
              {selectedUser.role === 'store_owner' && selectedUser.storeRating !== undefined && selectedUser.storeRating !== null && (
                <div className="user-detail-row">
                  <span className="user-detail-label">Store Rating</span>
                  <span className="user-detail-value user-detail-rating">
                    {'★'.repeat(Math.round(selectedUser.storeRating))}{'☆'.repeat(5 - Math.round(selectedUser.storeRating))}
                    <span className="rating-number">{Number(selectedUser.storeRating).toFixed(1)}</span>
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </div>
    </>
  );
}

export default AdminUsers;
