// admin-dashboard/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in as admin
  if (user && user.role === 'admin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Start loading state

    try {
      await login(email, password); // Call login function from AuthContext
      // If login is successful and user is admin (checked in AuthContext), navigate
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div style={styles.outerContainer}> {/* Added an outer container for centering */}
      <div style={styles.container}>
        <h2 style={styles.heading}>Đăng nhập quản trị viên</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Basic inline styles (Consider moving to a separate CSS file or using Tailwind/Styled Components)
const styles = {
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh', // Ensure it takes full viewport height for centering
    backgroundColor: '#f0f2f5', // Light background for the whole page
    width: '100%', // Ensure outerContainer takes full width
  },
  container: {
    padding: '30px', // Increased padding
    maxWidth: '450px', // Slightly wider
    width: '90%', // Responsive width
    backgroundColor: '#ffffff', // White background for the form card
    borderRadius: '12px', // More rounded corners
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', // Enhanced shadow
    textAlign: 'left', // Ensure text aligns left within the card
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px', // Increased margin
    color: '#333',
    fontSize: '28px', // Larger heading
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px', // Increased margin
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '600', // Semi-bold labels
    fontSize: '15px',
  },
  input: {
    width: 'calc(100% - 24px)', // Account for padding
    padding: '12px', // Increased padding
    borderRadius: '8px', // More rounded input fields
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box', // Include padding in width calculation
  },
  errorText: {
    color: '#e74c3c', // Red for errors
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  button: {
    padding: '14px 20px', // Larger button
    backgroundColor: '#007bff', // Primary blue
    color: 'white',
    border: 'none',
    borderRadius: '8px', // More rounded button
    cursor: 'pointer',
    fontSize: '17px', // Larger font
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    alignSelf: 'center', // Center the button if it doesn't take full width
    width: '100%', // Make button full width of the form
  },
  buttonHover: {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)', // Subtle lift effect on hover
  }
};

export default LoginPage;
