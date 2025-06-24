// admin-dashboard/src/pages/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
  const { logout, user } = useAuth();

  return (
    <div style={styles.dashboardContainer}>
      {/* Sidebar - Left Navigation Bar */}
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Admin Dashboard</h3>
        <p style={styles.welcomeText}>Hello, {user?.name || 'Admin'}!</p>
        <ul style={styles.navList}>
          <li style={styles.navItem}><Link to="/users" style={styles.navLink}>Manage Users</Link></li>
          <li style={styles.navItem}><Link to="/orders" style={styles.navLink}>Manage Orders</Link></li>
          {/* Add other links here */}
        </ul>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Main Content - Dashboard Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.mainContentTitle}>Welcome to Admin Dashboard!</h1>
        <p style={styles.mainContentText}>Use the sidebar to navigate through management sections.</p>
        {/* You can add widgets, statistics, charts here */}
        <div style={styles.statsGrid}>
            <div style={styles.statCard}>
                <h3>Total Users</h3>
                <p style={styles.statNumber}>...</p> {/* Data will be loaded from API */}
            </div>
            <div style={styles.statCard}>
                <h3>Total Orders</h3>
                <p style={styles.statNumber}>...</p> {/* Data will be loaded from API */}
            </div>
            {/* Add more stat cards */}
        </div>
      </div>
    </div>
  );
};

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh', /* Ensure it takes full viewport height */
    backgroundColor: '#f8f9fa', // Lighter background for the entire dashboard
    width: '100%', /* Ensure it takes full width */
  },
  sidebar: {
    width: '280px', // Slightly wider sidebar
    flexShrink: 0, /* Prevent sidebar from shrinking */
    backgroundColor: '#2d3a4b', // Darker, more professional blue-gray
    color: '#ecf0f1',
    padding: '30px 20px', // More vertical padding
    boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)', // Stronger shadow
    display: 'flex', /* Added flex for internal layout of sidebar */
    flexDirection: 'column',
    justifyContent: 'space-between', /* Pushes logout button to bottom */
    transition: 'width 0.3s ease', // Smooth transition for responsive sidebar if implemented
  },
  sidebarTitle: {
    textAlign: 'center',
    marginBottom: '40px', // More space below title
    color: '#ffffff',
    fontSize: '24px', // Larger title
    fontWeight: '700',
    borderBottom: '1px solid #3c4e62', // Slightly lighter border
    paddingBottom: '20px',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#bdc3c7',
    fontSize: '15px',
  },
  navList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    flexGrow: 1, /* Allows nav list to take available space */
  },
  navItem: {
    marginBottom: '12px', // More spacing between items
  },
  navLink: {
    color: '#ecf0f1', // Lighter text color
    textDecoration: 'none',
    padding: '12px 18px', // More padding
    display: 'block',
    borderRadius: '8px', // More rounded corners
    transition: 'background-color 0.2s ease, color 0.2s ease',
    fontSize: '16px',
    fontWeight: '500',
  },
  navLinkHover: {
    backgroundColor: '#3c4e62', // Darker hover state
    color: '#ffffff',
  },
  logoutButton: {
    marginTop: '60px', // More margin from nav list
    width: '100%',
    padding: '14px 20px', // Larger button
    backgroundColor: '#e74c3c', // Red color
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '17px', // Larger font
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  },
  logoutButtonHover: {
    backgroundColor: '#c0392b',
  },
  mainContent: {
    flex: 1,
    padding: '40px', // More padding for main content
    overflowY: 'auto', /* Add scroll for content if it overflows */
    backgroundColor: '#f8f9fa', // Lighter background for main content area
  },
  mainContentTitle: {
    marginBottom: '30px',
    color: '#2c3e50', // Darker title color
    fontSize: '32px', // Larger title
    fontWeight: '700',
  },
  mainContentText: {
    color: '#666',
    fontSize: '17px',
    lineHeight: '1.6',
    marginBottom: '40px', // More space below intro text
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Adjust min width for cards
    gap: '25px', // More gap between cards
    marginTop: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px', // More padding
    borderRadius: '10px', // More rounded
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', // Stronger shadow
    textAlign: 'center',
    borderLeft: '5px solid #007bff', // Accent border
  },
  statNumber: {
    fontSize: '40px', // Larger numbers
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: '15px',
  }
};

export default DashboardPage;
