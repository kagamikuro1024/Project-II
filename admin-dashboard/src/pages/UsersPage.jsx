// admin-dashboard/src/pages/UsersPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../api/adminApi.js'; // Ensure .js extension

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      await fetchUsers();
      alert('User role updated successfully!');
    } catch (err) {
      alert(`Failed to update user role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        await fetchUsers();
        alert('User deleted successfully!');
      } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  if (loading) return <p style={styles.statusText}>Loading user list...</p>;
  if (error) return <p style={{ ...styles.statusText, color: 'red' }}>Error: {error}</p>;
  if (users.length === 0 && !loading) return <p style={styles.statusText}>No users found.</p>;

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.pageHeading}>Manage Users</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeaderCell}>ID</th>
            <th style={styles.tableHeaderCell}>Name</th>
            <th style={styles.tableHeaderCell}>Email</th>
            <th style={styles.tableHeaderCell}>Role</th>
            <th style={styles.tableHeaderCell}>Verified</th>
            <th style={styles.tableHeaderCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => ( // Added index for alternating rows
            <tr key={user._id} style={{ ...styles.tableRow, ...(index % 2 === 0 ? styles.evenRow : styles.oddRow) }}>
              <td style={styles.tableCell}>{user._id}</td>
              <td style={styles.tableCell}>{user.name}</td>
              <td style={styles.tableCell}>{user.email}</td>
              <td style={styles.tableCell}>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td style={styles.tableCell}>{user.verified ? 'Yes' : 'No'}</td>
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
const styles = {
  pageContainer: {
    padding: '30px', // Increased padding
    backgroundColor: '#fff',
    borderRadius: '10px', // More rounded
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', // Stronger shadow
    margin: '20px auto', // Add margin for spacing from dashboard edges
    maxWidth: '1200px', // Max width for content
  },
  pageHeading: {
    marginBottom: '25px', // More spacing
    color: '#2c3e50', // Darker heading color
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
  },
  statusText: {
    textAlign: 'center',
    marginTop: '30px', // More spacing
    fontSize: '18px',
    color: '#666',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate', // Use separate for rounded corners on cells/rows if desired later
    borderSpacing: '0 8px', // Space between rows (for more distinct rows)
    marginTop: '25px',
  },
  tableHeaderRow: {
    backgroundColor: '#eef2f7', // Lighter header background
    borderBottom: 'none', // Remove border as spacing is handled by borderSpacing
    borderRadius: '8px', // Rounded corners for header row
    overflow: 'hidden', // Ensure rounded corners apply
  },
  tableHeaderCell: {
    padding: '15px 20px', // More padding
    textAlign: 'left',
    color: '#444', // Darker header text
    fontWeight: 'bold',
    fontSize: '15px',
    textTransform: 'uppercase', // Uppercase header text
  },
  tableRow: {
    backgroundColor: 'white', // Default background
    borderRadius: '8px', // Rounded corners for rows
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow for rows
    transition: 'transform 0.1s ease', // Smooth transition for hover
  },
  evenRow: {
    // backgroundColor: '#f9f9f9', // Slightly different background for even rows if desired
  },
  oddRow: {
    // backgroundColor: '#ffffff',
  },
  tableRowHover: { // Idea for hover effect
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  tableCell: {
    padding: '15px 20px', // Consistent padding
    color: '#333',
    fontSize: '15px',
    // Apply rounded corners to first/last cells if row is rounded
    // borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' for first
    // borderTopRightRadius: '8px', borderBottomRightRadius: '8px' for last
  },
  selectInput: {
    padding: '8px 12px', // More padding
    borderRadius: '6px', // More rounded
    border: '1px solid #999', /* Stronger border for visibility */
    backgroundColor: 'white',
    minWidth: '100px', // Consistent width
    fontSize: '14px',
    color: '#333', /* Ensure text color is visible */
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', /* Subtle shadow for dropdown */
  },
  deleteButton: {
    backgroundColor: '#e74c3c', // Red color
    color: 'white',
    padding: '10px 15px', // More padding
    border: 'none',
    borderRadius: '6px', // More rounded
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
  deleteButtonHover: {
    backgroundColor: '#c0392b',
  }
};

export default UsersPage;
