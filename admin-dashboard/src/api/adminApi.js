  import axios from 'axios';

  const API_BASE_URL = 'http://localhost:8000'; 

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  export const adminLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      
      if (response.data.role !== 'admin') {
        throw new Error('You do not have administrator access.');
      }

      localStorage.setItem('adminToken', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed.');
    }
  };

  export const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      console.log('API Response for Users:', response.data);
      
      // Xử lý an toàn cho users
      if (response.data && Array.isArray(response.data.users)) {
        return response.data.users;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected users data format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to load user list.');
    }
  };

  export const updateUser = async (userId, userData) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update user.');
    }
  };

  export const deleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      return response.data.message;
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete user.');
    }
  };
export const getAllOrders = async () => {
  try {
    const response = await axiosInstance.get('/admin/orders');
    console.log('API Response for Orders:', response.data);

    if (response.data && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected orders data format:', response.data);
      return [];
    }
  } catch (error) {
    // Log chi tiết lỗi
    if (error.response) {
      console.error('Error fetching orders:', error.response.data, 'Status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw new Error(error.response?.data?.message || 'Failed to load order list.');
  }
};

  export const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/admin/orders/${orderId}`, { orderStatus: newStatus });
      return response.data.order;
    } catch (error) {
      console.error('Error updating order status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update order status.');
    }
  };

  export const deleteOrder = async (orderId) => {
    try {
      const response = await axiosInstance.delete(`/admin/orders/${orderId}`);
      return response.data.message;
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete order.');
    }
  };

  export const cancelOrder = async (orderId) => {
    try {
      const response = await axiosInstance.put(`/orders/cancel/${orderId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });
      return response.data.message;
    } catch (error) {
      console.error('Error cancelling order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to cancel order.');
    }
  };