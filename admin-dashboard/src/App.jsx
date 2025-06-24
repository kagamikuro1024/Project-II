// admin-dashboard/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx'; // SỬA ĐÂY: Thêm .jsx
import DashboardPage from './pages/DashboardPage.jsx'; // SỬA ĐÂY: Thêm .jsx
import UsersPage from './pages/UsersPage.jsx';     // SỬA ĐÂY: Thêm .jsx
import OrdersPage from './pages/OrdersPage.jsx';   // SỬA ĐÂY: Thêm .jsx
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; // SỬA ĐÂY: Thêm .jsx

// Component để bảo vệ các route cần đăng nhập với quyền admin
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Checking authentication...</div>; // Reverted translation
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
