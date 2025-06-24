import React, { useEffect, useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../api/adminApi.js';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllOrders();
      console.log('Received orders data:', data);

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("API did not return an array for orders:", data);
        setError("Invalid data format received from API. Expected an array of orders.");
        setOrders([]);
        return;
      }

      // Sort orders from newest to oldest based on createdAt
      const sortedOrders = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to load order list (frontend error):', err);
      setError(err.message || 'Failed to load order list. Please check the console for more details.');
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      // Using a custom message box instead of alert()
      // You would replace this with a proper UI notification system
      console.log('Order status updated successfully!');
      alert('Order status updated successfully!'); // Fallback to alert for demonstration
    } catch (err) {
      console.error(`Failed to update order status:`, err);
      alert(`Failed to update order status: ${err.message}`); // Fallback to alert for demonstration
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // Using a custom confirmation modal instead of window.confirm()
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) { // Fallback to window.confirm for demonstration
      try {
        await deleteOrder(orderId);
        await fetchOrders();
        console.log('Order deleted successfully!');
        alert('Order deleted successfully!'); // Fallback to alert for demonstration
      } catch (err) {
        console.error(`Failed to delete order:`, err);
        alert(`Failed to delete order: ${err.message}`); // Fallback to alert for demonstration
      }
    }
  };

  if (loading) return <p style={styles.statusText}>Loading order list...</p>;
  if (error) return <p style={{ ...styles.statusText, color: 'red' }}>Error: {error}</p>;
  if (orders.length === 0 && !loading) return <p style={styles.statusText}>No orders found.</p>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA500'; // Orange
      case 'Processing':
        return '#007bff'; // Blue
      case 'Shipped':
        return '#17a2b8'; // Cyan
      case 'Delivered':
        return '#28a745'; // Green
      case 'Cancelled':
        return '#dc3545'; // Red
      default:
        return '#333'; // Dark gray
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.pageHeading}>Manage Orders</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeaderCell}>Order ID</th>
            <th style={styles.tableHeaderCell}>User</th>
            <th style={styles.tableHeaderCell}>Total Price</th>
            <th style={styles.tableHeaderCell}>Products</th>
            <th style={styles.tableHeaderCell}>Payment Method</th>
            <th style={styles.tableHeaderCell}>Status</th>
            <th style={styles.tableHeaderCell}>Order Date</th>
            <th style={styles.tableHeaderCell}>Time</th> {/* New Time Column Header */}
            <th style={styles.tableHeaderCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id || `order-${index}`} style={{ ...styles.tableRow, ...(index % 2 === 0 ? styles.evenRow : styles.oddRow) }}>
              <td style={styles.tableCell}>{order._id || 'N/A'}</td>
              <td style={styles.tableCell}>
                {/* Removed email from user display */}
                {order.user?.name || 'Unknown'}
              </td>
              <td style={styles.tableCell}>${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
              <td style={styles.tableCell}>
                <ul style={styles.productList}>
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product, pIdx) => (
                      <li key={pIdx} style={styles.productListItem}>
                        {/* Added sequence number to product display */}
                        {pIdx + 1}. {product.name || 'Unknown Product'} (x{product.quantity || 0})
                      </li>
                    ))
                  ) : (
                    <li style={styles.productListItem}>No products found.</li>
                  )}
                </ul>
              </td>
              <td style={styles.tableCell}>{order.paymentMethod === 'cash' ? 'Cash' : 'Card'}</td>
              <td style={styles.tableCell}>
                <select
                  value={order.orderStatus || 'Pending'}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  style={{ ...styles.selectInput, color: getStatusColor(order.orderStatus || 'Pending') }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td style={styles.tableCell}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
              <td style={styles.tableCell}>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}</td> {/* New Time Column Cell */}
              <td style={styles.tableCell}>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
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

const styles = {
    pageContainer: {
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        margin: '20px auto',
        maxWidth: '1400px',
    },
    pageHeading: {
        marginBottom: '25px',
        color: '#2c3e50',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '700',
    },
    statusText: {
        textAlign: 'center',
        marginTop: '30px',
        fontSize: '18px',
        color: '#666',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 8px',
        marginTop: '25px',
    },
    tableHeaderRow: {
        backgroundColor: '#eef2f7',
        borderBottom: 'none',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    tableHeaderCell: {
        padding: '15px 20px',
        textAlign: 'left',
        color: '#444',
        fontWeight: 'bold',
        fontSize: '15px',
        textTransform: 'uppercase',
    },
    tableRow: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.1s ease',
    },
    evenRow: {},
    oddRow: {},
    tableCell: {
        padding: '15px 20px',
        color: '#333',
        fontSize: '14px',
    },
    selectInput: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #999',
        backgroundColor: 'white',
        minWidth: '120px',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background-color 0.2s ease',
    },
    productList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '13px',
    },
    productListItem: {
        marginBottom: '5px',
        color: '#555',
    }
};

export default OrdersPage;
