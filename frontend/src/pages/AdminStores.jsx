import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import './AdminStores.css';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortConfig, setSortConfig] = useState({ sortBy: 'name', order: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);

    try {
      const params = { ...sortConfig };

      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const response = await api.get('/admin/stores', { params });

      console.log('=================================');
      console.log('STORES RESPONSE:', response.data);
      console.log('=================================');

      const storesData =
        response.data?.data ||
        response.data?.stores ||
        response.data;

      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error('Failed to fetch stores:', err);

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
      fetchStores();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Store name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.address.trim()) errors.address = 'Address is required';
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
      await api.post('/admin/stores', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      setFormErrors({});
      fetchStores();
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.error || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <StarRating rating={value ? Math.round(value) : 0} readonly size={18} />
      ),
    },
  ];

  const filterConfig = [
    { key: 'name', label: 'Store Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="admin-users-header">
          <div className="page-header">
            <h1 className="page-title gradient-text">Store Management</h1>
            <p className="page-subtitle">Manage all stores in the system</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Store
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
            data={stores}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyMessage="No stores found. Try adjusting your filters."
          />
        )}

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setApiError(''); setFormErrors({}); }} title="Add New Store">
          {apiError && <div className="error-message">{apiError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Store Name</label>
              <input
                name="name"
                type="text"
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                placeholder="Enter store name"
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
                placeholder="store@example.com"
                value={formData.email}
                onChange={handleFormChange}
              />
              <span className="form-error">{formErrors.email || ''}</span>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className={`form-input ${formErrors.address ? 'error' : ''}`}
                placeholder="Store address"
                value={formData.address}
                onChange={handleFormChange}
                rows={3}
                style={{ resize: 'vertical' }}
              ></textarea>
              <span className="form-error">{formErrors.address || ''}</span>
            </div>
            <div className="form-group">
              <label>Owner ID (Optional)</label>
              <input
                name="ownerId"
                type="text"
                className={`form-input ${formErrors.ownerId ? 'error' : ''}`}
                placeholder="Enter store owner's user ID"
                value={formData.ownerId}
                onChange={handleFormChange}
              />
              <span className="form-error">{formErrors.ownerId || ''}</span>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        </Modal>
      </div>
    </>
  );
}

export default AdminStores;
