import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import api from '../api/axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');

      console.log('DASHBOARD RESPONSE:', response.data);

      const dashboardData = response.data.data || response.data;

      setStats({
        totalUsers: dashboardData.totalUsers || 0,
        totalStores: dashboardData.totalStores || 0,
        totalRatings: dashboardData.totalRatings || 0
      });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            Welcome back,{' '}
            <span className="gradient-text">
              {user?.name}
            </span>
          </h1>

          <p className="page-subtitle">
            Here's an overview of the platform
          </p>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                gradient="primary"
              />

              <StatCard
                title="Total Stores"
                value={stats.totalStores}
                icon="🏪"
                gradient="accent"
              />

              <StatCard
                title="Total Ratings"
                value={stats.totalRatings}
                icon="⭐"
                gradient="orange"
              />
            </div>

            <div className="quick-actions">
              <h2 className="quick-actions-title">
                Quick Actions
              </h2>

              <div className="quick-actions-grid">
                <Link
                  to="/admin/users"
                  className="quick-action-card glass-card"
                >
                  <div className="quick-action-icon">
                    👥
                  </div>

                  <div className="quick-action-info">
                    <h3>Manage Users</h3>
                    <p>
                      View, search, and add users
                    </p>
                  </div>

                  <svg
                    className="quick-action-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>

                <Link
                  to="/admin/stores"
                  className="quick-action-card glass-card"
                >
                  <div className="quick-action-icon">
                    🏪
                  </div>

                  <div className="quick-action-info">
                    <h3>Manage Stores</h3>
                    <p>
                      View, search, and add stores
                    </p>
                  </div>

                  <svg
                    className="quick-action-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;