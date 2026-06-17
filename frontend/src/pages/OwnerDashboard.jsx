import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import StarRating from '../components/StarRating';
import api from '../api/axios';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ sortBy: 'userName', order: 'asc' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/owner/dashboard');

      console.log("OWNER DASHBOARD RESPONSE:", response.data);

      setDashboardData(response.data.data);

    } catch (err) {
      console.error('Failed to fetch owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortedRatings = () => {
    if (!dashboardData?.ratings) return [];
    const sorted = [...dashboardData.ratings].sort((a, b) => {
      const aVal = a[sortConfig.sortBy];
      const bVal = b[sortConfig.sortBy];
      if (typeof aVal === 'string') {
        return sortConfig.order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.order === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  };

  const columns = [
    {
      key: 'userName',
      label: 'User Name',
      sortable: true
    },
    {
      key: 'userEmail',
      label: 'Email',
      sortable: true
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <StarRating
          rating={value}
          readonly
          size={18}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="owner-hero">
          <div className="owner-store-name">
            <span className="owner-store-icon">🏪</span>
            <h1 className="page-title gradient-text">
              {dashboardData?.stores?.[0]?.name || 'Your Store'}
            </h1>
          </div>

          <div className="owner-avg-rating glass-card">
            <span className="owner-avg-label">Average Rating</span>
            <div className="owner-avg-stars">
              <StarRating
                rating={dashboardData?.averageRating ? Math.round(dashboardData.averageRating) : 0}
                readonly
                size={32}
              />
            </div>
            <span className="owner-avg-number">
              {dashboardData?.averageRating
                ? Number(dashboardData.averageRating).toFixed(1)
                : 'N/A'}
            </span>
            <span className="owner-avg-count">
              {dashboardData?.ratings?.length || 0} review{(dashboardData?.ratings?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="owner-ratings-section">
          <h2 className="owner-section-title">All Ratings</h2>
          <DataTable
            columns={columns}
            data={getSortedRatings()}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyMessage="No ratings yet. Share your store to get reviews!"
          />
        </div>
      </div>
    </>
  );
}

export default OwnerDashboard;
