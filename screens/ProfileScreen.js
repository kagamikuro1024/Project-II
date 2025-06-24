import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import React, {
  useLayoutEffect,
  useEffect,
  useContext,
  useState,
  useCallback,
} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import axios from "axios";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
// For user's API calls, you might want a separate API file like '../api/userApi.js'
// For now, directly making axios calls with token.

const ProfileScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#00CED1",
        height: Platform.OS === "android" ? 90 : 100,
        paddingTop: Platform.OS === "android" ? 40 : 50,
      },
      headerLeft: () => (
        <Image
          style={styles.headerLogo}
          source={{
            uri: "https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c518.png",
          }}
        />
      ),
      headerRight: () => (
        <View style={styles.headerIconsContainer}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <AntDesign name="search1" size={24} color="white" />
        </View>
      ),
    });
  }, [navigation]);

  // Common authentication error handler
  const handleAuthError = useCallback((error) => {
    console.error("Authentication error:", error.response?.data || error.message);
    Alert.alert(
      "Session Expired",
      "Your session has expired or is invalid. Please log in again."
    );
    // Clear token and redirect to login screen
    AsyncStorage.removeItem("authToken")
      .then(() => {
        setUserId(null);
        navigation.replace("Login");
      })
      .catch((err) => console.error("Error clearing token:", err));
  }, [navigation, setUserId]);

  // Fetch User Profile
  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        handleAuthError("No token found.");
        return;
      }

      const response = await axios.get(
        `http://10.0.2.2:8000/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError(error);
      } else {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Failed to load profile information.");
      }
    }
  }, [userId, handleAuthError]);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        handleAuthError("No token found.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://10.0.2.2:8000/orders/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Sort orders from newest to oldest based on createdAt
      const sortedOrders = response.data.orders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setOrders(sortedOrders);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError(error);
      } else {
        console.error("Error fetching orders:", error);
        setOrders([]);
        Alert.alert("Error", "Failed to load order list.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, handleAuthError]);

  // Handle Cancel Order (NEW)
  const handleCancelOrder = async (orderId) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              if (!token) {
                handleAuthError("No token found.");
                return;
              }

              const response = await axios.put(
                `http://10.0.2.2:8000/orders/cancel/${orderId}`,
                {}, // No body needed for this specific cancel API
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                Alert.alert("Success", "Order cancelled successfully!");
                fetchOrders(); // Re-fetch orders to update status
              } else {
                Alert.alert("Error", response.data.message || "Failed to cancel order.");
              }
            } catch (error) {
              if (error.response?.status === 401 || error.response?.status === 403) {
                handleAuthError(error);
              } else {
                Alert.alert("Error", error.response?.data?.message || "An error occurred while cancelling the order.");
                console.error("Error cancelling order:", error.response?.data || error.message);
              }
            }
          },
        },
      ]
    );
  };

  // Fetch data initially and when user ID changes
  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, [userId, fetchUserProfile, fetchOrders]);

  // Re-fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchOrders();
    }, [fetchUserProfile, fetchOrders])
  );

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setUserId(null); // Clear userId from context
      console.log("Auth token cleared");
      navigation.replace("Login");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  // Function to get status text style
  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'Pending': return { color: '#FFA500', fontWeight: 'bold' }; // Orange
      case 'Processing': return { color: '#007bff', fontWeight: 'bold' }; // Blue
      case 'Shipped': return { color: '#17a2b8', fontWeight: 'bold' }; // Cyan
      case 'Delivered': return { color: '#28a745', fontWeight: 'bold' }; // Green
      case 'Cancelled': return { color: '#dc3545', fontWeight: 'bold' }; // Red
      default: return { color: '#333', fontWeight: 'bold' };
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text
            style={styles.welcomeText}
            paddingTop={Platform.OS === "android" ? 40 : 50}
          >
            Welcome,{" "}
            <Text style={styles.userName}>{user?.name || "Guest"}</Text>!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Feature under development",
                "Your Account page is under development!"
              );
            }}
          >
            <Text style={styles.actionButtonText}>Your Account</Text>
          </Pressable>

          <Pressable onPress={logout} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Logout</Text>
          </Pressable>
        </View>

        {/* Your Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Orders</Text>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Feature under development",
                "All Orders page is under development!"
              );
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00CED1" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : orders.length > 0 ? (
          <View>
            {orders.map(
              (
                order
              ) => (
                <Pressable
                  style={styles.orderCard}
                  key={order._id}
                  onPress={() =>
                    navigation.navigate("Order", {
                      cartItems: order.products,
                      totalPrice: order.totalPrice,
                      shippingAddress: order.shippingAddress,
                      paymentMethod: order.paymentMethod,
                      orderStatus: order.orderStatus, // Pass order status to order screen
                    })
                  }
                >
                  <Text style={styles.orderCardPrice}>
                    Total: ${order.totalPrice.toFixed(2)}
                  </Text>
                  <Text style={styles.orderDate}>
                    Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.orderPaymentMethod}>
                    Payment:{" "}
                    {order.paymentMethod === "cash"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </Text>
                  {/* NEW: Display Order Status */}
                  <View style={styles.orderStatusContainer}>
                    <Text style={styles.orderStatusLabel}>Status:</Text>
                    <Text style={getStatusTextStyle(order.orderStatus)}>
                      {order.orderStatus}
                    </Text>
                  </View>

                  <View style={styles.orderProductsContainer}>
                    <Text style={styles.productsInOrderText}>
                      Products in this order:
                    </Text>
                    {order.products.map((product, pIdx) => (
                      <View key={pIdx} style={styles.productItemInOrder}>
                        <Image
                          source={{ uri: product.image }}
                          style={styles.orderProductImage}
                        />
                        <View style={styles.productDetailsInOrder}>
                          <Text
                            numberOfLines={2}
                            style={styles.productNameInOrder}
                          >
                            {product.name}
                          </Text>
                          <Text style={styles.productQtyPriceInOrder}>
                            Qty: {product.quantity} | Price: $
                            {product.price.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  {/* NEW: Cancel Button for Pending and Processing Orders */}
                  {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
                    <Pressable
                      onPress={() => handleCancelOrder(order._id)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </Pressable>
                  )}
                </Pressable>
              )
            )}
          </View>
        ) : (
          <View style={styles.emptyOrdersContainer}>
            <Feather name="box" size={50} color="#D0D0D0" />
            <Text style={styles.emptyOrdersText}>No orders found.</Text>
            <Text style={styles.emptyOrdersSubText}>
              Start shopping to see your orders here!
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
              style={styles.startShoppingButton}
            >
              <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  headerLogo: {
    width: 120,
    height: 100,
    resizeMode: "contain",
    marginLeft: -20,
  },
  headerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginRight: 10,
  },
  scrollViewContent: {
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  welcomeContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00CED1",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderCardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#008397",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
  orderPaymentMethod: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },
  // NEW: Order status styles
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderStatusLabel: {
    fontSize: 13,
    color: '#777',
    marginRight: 5,
    fontWeight: 'bold',
  },
  // Dynamic color applied via getStatusTextStyle function

  orderProductsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  productsInOrderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  productItemInOrder: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F5F5",
    gap: 10,
  },
  orderProductImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 5,
  },
  productDetailsInOrder: {
    flex: 1,
  },
  productNameInOrder: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  productQtyPriceInOrder: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  // NEW: Cancel Button styles
  cancelButton: {
    backgroundColor: '#dc3545', // Red for cancel
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyOrdersContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyOrdersText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#777",
    marginTop: 15,
  },
  emptyOrdersSubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  startShoppingButton: {
    backgroundColor: "#00CED1",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startShoppingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
