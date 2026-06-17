import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import './UserDashboard.css';

function UserDashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortConfig, setSortConfig] = useState({ sortBy: 'name', order: 'asc' });
  const [ratingLoading, setRatingLoading] = useState({});

  const fetchStores = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
      };

      if (filters.name?.trim()) {
        params.name = filters.name.trim();
      }

      if (filters.address?.trim()) {
        params.address = filters.address.trim();
      }

      const response = await api.get('/stores', { params });

      console.log('=================================');
      console.log('FULL RESPONSE:', response);
      console.log('RESPONSE DATA:', response.data);
      console.log('=================================');

      let storesData = [];

      if (Array.isArray(response.data)) {
        storesData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        storesData = response.data.data;
      } else if (Array.isArray(response.data?.stores)) {
        storesData = response.data.stores;
      }

      console.log('STORES ARRAY:', storesData);
      console.log('TOTAL STORES:', storesData.length);

      setStores(storesData);
    } catch (err) {
      console.error('Failed to fetch stores:', err);

      if (err.response) {
        console.error('STATUS:', err.response.status);
        console.error('ERROR DATA:', err.response.data);
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

  const handleRate = async (store, newRating) => {
    setRatingLoading((prev) => ({ ...prev, [store.id]: true }));
    try {
      if (store.userRatingId) {
        await api.put(`/ratings/${store.userRatingId}`, { rating: newRating });
      } else {
        await api.post('/ratings', { storeId: store.id, rating: newRating });
      }
      await fetchStores();
    } catch (err) {
      console.error('Failed to rate store:', err);
    } finally {
      setRatingLoading((prev) => ({ ...prev, [store.id]: false }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.sortBy !== key) return '';
    return sortConfig.order === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="page-subtitle">Browse and rate stores</p>
        </div>

        <div className="user-search-bar">
          <div className="user-search-group">
            <svg className="user-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              name="name"
              className="form-input user-search-input"
              placeholder="Search by store name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
          </div>
          <div className="user-search-group">
            <svg className="user-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              name="address"
              className="form-input user-search-input"
              placeholder="Search by address..."
              value={filters.address}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <div className="empty-state-text">No stores found. Try a different search.</div>
          </div>
        ) : (
          <div className="store-cards-grid">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className="store-card glass-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="store-card-header">
                  <h3 className="store-card-name">{store.name}</h3>
                  <span className="store-card-email">{store.email}</span>
                </div>
                <div className="store-card-address">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{store.address}</span>
                </div>

                <div className="store-card-ratings">
                  <div className="store-rating-section">
                    <span className="store-rating-label">Overall Rating</span>
                    <StarRating
                      rating={store.overallRating ? Math.round(store.overallRating) : 0}
                      readonly
                      size={20}
                    />
                  </div>
                  <div className="store-rating-divider"></div>
                  <div className="store-rating-section">
                    <span className="store-rating-label">Your Rating</span>
                    {ratingLoading[store.id] ? (
                      <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    ) : (
                      <StarRating
                        rating={store.userRating?.rating || store.userRating || 0}
                        onRate={(rating) => handleRate(store, rating)}
                        size={22}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard;
