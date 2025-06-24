import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmationScreen = () => {
  const steps = [
    { title: "Address", content: "Address Form" },
    { title: "Delivery", content: "Delivery Options" },
    { title: "Payment", content: "Payment Details" },
    { title: "Place Order", content: "Order Summary" },
  ];
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const { userId } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);

  // Common authentication error handler
  const handleAuthError = async (error) => {
    console.error("Authentication error:", error.response?.data || error.message);
    Alert.alert(
      "Session Expired",
      "Your session has expired or is invalid. Please log in again."
    );
    await AsyncStorage.removeItem("authToken");
    navigation.replace("Login");
  };

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    if (!userId) {
      console.log("User ID not available, skipping address fetch.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        handleAuthError("No token found.");
        return;
      }

      const response = await axios.get(
        `http://10.0.2.2:8000/addresses/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses(response.data.addresses || []);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError(error);
      } else {
        console.log("Error fetching addresses:", error.response ? error.response.data : error.message);
        Alert.alert("Error", `Failed to load address list: ${error.response?.data?.message || error.message}.`);
      }
    }
  };
  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAdress] = useState("");
  const [option, setOption] = useState(false); // This is for delivery option, not payment
  const [selectedOption, setSelectedOption] = useState(""); // This is for payment method

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Missing Information", "Please select a delivery address.");
      return;
    }
    if (!selectedOption) {
      Alert.alert("Missing Information", "Please select a payment method.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in again.");
        navigation.replace("Login");
        return;
      }

      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: total,
        shippingAddress: selectedAddress,
        paymentMethod: selectedOption,
      };

      const response = await axios.post(
        "http://10.0.2.2:8000/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigation.navigate("Order", {
          cartItems: cart,
          totalPrice: total,
          shippingAddress: selectedAddress,
          paymentMethod: selectedOption,
        });
        dispatch(cleanCart());
        console.log("Order created successfully", response.data);
      } else {
        Alert.alert("Order Error", "An error occurred while creating your order. Please try again.");
        console.log("Error creating order", response.data);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError(error);
      } else {
        Alert.alert("Order Error", `Failed to create order: ${error.response?.data?.message || error.message}. Please try again.`);
        console.log("Error during order creation:", error.response ? error.response.data : error.message);
      }
    }
  };

  const pay = async () => {
    if (!selectedAddress) {
      Alert.alert("Missing Address", "Please select a delivery address before proceeding to payment.");
      return;
    }
    try {
      const options = {
        description: "Click_buy Order Payment",
        currency: "INR",
        name: "Click_Buy.in",
        key: "rzp_test_E3GWYimxN7YMk8",
        amount: total * 100,
        prefill: {
          email: "customer@example.com", // Replace with actual user email
          contact: "9999999999", // Replace with actual user contact
          name: "Customer Name", // Replace with actual user name
        },
        theme: { color: "#00CED1" },
      };

      const data = await RazorpayCheckout.open(options);
      console.log("Razorpay success:", data);

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in again.");
        navigation.replace("Login");
        return;
      }

      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: total,
        shippingAddress: selectedAddress,
        paymentMethod: "card",
      };

      const response = await axios.post(
        "http://10.0.2.2:8000/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigation.navigate("Order", {
          cartItems: cart,
          totalPrice: total,
          shippingAddress: selectedAddress,
          paymentMethod: "card",
        });
        dispatch(cleanCart());
        console.log("Order created successfully after payment:", response.data);
      } else {
        Alert.alert("Order Error", "An error occurred while creating your order after payment. Please try again.");
        console.log("Error creating order after payment:", response.data);
      }
    } catch (error) {
      console.log("Error during payment or order creation:", error.code, error.description);
      Alert.alert(
        "Payment Failed",
        `There was an issue with your payment: ${error.description || "Unknown error"}. Please try again.`
      );
      if (error.code === 'PAYMENT_CANCELLED') {
        console.log('Payment cancelled by user.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError(error);
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? 40 : 0,
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Step Progress Bar */}
        <View style={styles.stepContainer}>
          {steps?.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              {index > 0 && (
                <View
                  style={[
                    styles.stepLine,
                    index <= currentStep && { backgroundColor: "#00CED1" },
                  ]}
                />
              )}
              <View
                style={[
                  styles.stepCircle,
                  index < currentStep && { backgroundColor: "#00CED1" },
                  index === currentStep && { borderColor: "#00CED1", borderWidth: 2, backgroundColor: "white" },
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.stepCheck}>&#10003;</Text>
                ) : (
                  <Text style={[styles.stepNumber, index === currentStep && { color: "#00CED1" }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
          ))}
        </View>

        {/* Current Step Content */}
        {currentStep === 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select Delivery Address</Text>
            {addresses?.length === 0 && !userId ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading addresses or user not found...</Text>
              </View>
            ) : addresses?.length === 0 && userId ? (
              <View style={styles.emptyAddressContainer}>
                <MaterialIcons name="location-off" size={40} color="#999" />
                <Text style={styles.emptyAddressText}>You don't have any saved addresses.</Text>
              </View>
            ) : null}


            {addresses?.map((item, index) => (
              <Pressable
                key={item._id || index}
                onPress={() => setSelectedAdress(item)}
                style={[
                  styles.addressCard,
                  selectedAddress &&
                    selectedAddress._id === item?._id &&
                    styles.addressCardSelected,
                ]}
              >
                {selectedAddress && selectedAddress._id === item?._id ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}

                <View style={styles.addressDetails}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressName}>{item?.name}</Text>
                    <Entypo name="location-pin" size={20} color="#E31837" />
                  </View>

                  <Text style={styles.addressText}>
                    {item?.houseNo}{item?.landmark ? `, ${item?.landmark}` : ''}
                  </Text>
                  <Text style={styles.addressText}>{item?.street}</Text>
                  {item?.city && item?.country && (
                    <Text style={styles.addressText}>{item?.city}, {item?.country}</Text>
                  )}
                  <Text style={styles.addressText}>
                    Phone: {item?.mobileNo}
                  </Text>

                  <View style={styles.addressActions}>
                    <Pressable style={styles.addressActionButton} onPress={() => Alert.alert("Info", "Edit function is under development")}>
                      <Text style={styles.addressActionButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.addressActionButton} onPress={() => Alert.alert("Info", "Delete function is under development")}>
                      <Text style={styles.addressActionButtonText}>Remove</Text>
                    </Pressable>
                    <Pressable style={styles.addressActionButton} onPress={() => Alert.alert("Info", "Set as default function is under development")}>
                      <Text style={styles.addressActionButtonText}>
                        Set as Default
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => navigation.navigate("Add")}
              style={styles.addNewAddressButton}
            >
              <Text style={styles.addNewAddressButtonText}>
                Add a new Address
              </Text>
            </Pressable>

            {selectedAddress && (
              <Pressable
                onPress={() => setCurrentStep(1)}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>
                  Deliver to this Address
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Choose your delivery options</Text>

            <Pressable
              onPress={() => setOption(!option)}
              style={styles.deliveryOptionCard}
            >
              {option ? (
                <FontAwesome5 name="dot-circle" size={20} color="#008397" />
              ) : (
                <Entypo name="circle" size={20} color="gray" />
              )}

              <Text style={styles.deliveryOptionText}>
                <Text style={styles.deliveryHighlightText}>
                  Tomorrow by 10pm
                </Text>{" "}
                - FREE delivery with your Prime membership
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCurrentStep(2)}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select your payment Method</Text>

            <Pressable
              onPress={() => setSelectedOption("cash")}
              style={[
                styles.paymentMethodCard,
                selectedOption === "cash" && styles.paymentMethodCardSelected,
              ]}
            >
              {selectedOption === "cash" ? (
                <FontAwesome5 name="dot-circle" size={20} color="#008397" />
              ) : (
                <Entypo name="circle" size={20} color="gray" />
              )}
              <Text style={styles.paymentMethodText}>Cash on Delivery</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedOption("card");
                Alert.alert("Online Payment", "You will be redirected to the payment gateway to complete the transaction. Continue?", [
                  {
                    text: "Cancel",
                    onPress: () => {
                        setSelectedOption("");
                        console.log("Cancel payment is pressed");
                    },
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => pay(),
                  },
                ]);
              }}
              style={[
                styles.paymentMethodCard,
                selectedOption === "card" && styles.paymentMethodCardSelected,
              ]}
            >
              {selectedOption === "card" ? (
                <FontAwesome5 name="dot-circle" size={20} color="#008397" />
              ) : (
                <Entypo name="circle" size={20} color="gray" />
              )}
              <Text style={styles.paymentMethodText}>
                Credit / Debit Card
              </Text>
            </Pressable>

            {selectedOption && (
                <Pressable
                    onPress={() => setCurrentStep(3)}
                    style={styles.continueButton}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </Pressable>
            )}
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Order Now</Text>

            <View style={styles.orderSummaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryItemTitle}>Shipping to:</Text>
                <Text style={styles.summaryItemValue}>
                  {selectedAddress?.name}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryItemTitle}>Items ({cart.length})</Text>
                <Text style={styles.summaryItemValue}>${total.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryItemTitle}>Delivery</Text>
                <Text style={styles.summaryItemValue}>$0.00</Text>
              </View>

              <View style={styles.orderTotalRow}>
                <Text style={styles.orderTotalText}>Order Total</Text>
                <Text style={styles.orderTotalAmount}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.paymentDetailsCard}>
              <Text style={styles.payWithText}>Pay With</Text>
              <Text style={styles.paymentMethodConfirmedText}>
                {selectedOption === "cash"
                  ? "Pay on delivery (Cash)"
                  : "Online Payment (Card)"}
              </Text>
            </View>

            <Pressable
              onPress={handlePlaceOrder}
              style={styles.placeOrderButton}
            >
              <Text style={styles.placeOrderButtonText}>Place your order</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  stepItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  stepLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#D0D0D0",
    left: "0%",
    right: "0%",
    top: 15,
    marginHorizontal: "20%",
    width: "60%",
    zIndex: -1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#D0D0D0",
    borderWidth: 1,
  },
  stepCheck: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  stepTitle: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  addressCardSelected: {
    borderColor: "#008397",
    backgroundColor: "#E0F7FA",
  },
  addressDetails: {
    flex: 1,
    marginLeft: 6,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addressText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 15,
    flexWrap: "wrap",
  },
  addressActionButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  addressActionButtonText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  addNewAddressButton: {
    backgroundColor: "#00CED1",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  addNewAddressButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#FFC72C",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  continueButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  deliveryOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    gap: 10,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  deliveryOptionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  deliveryHighlightText: {
    color: "#008397",
    fontWeight: "600",
  },
  paymentMethodCard: {
    backgroundColor: "white",
    padding: 15,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodCardSelected: {
    borderColor: "#008397",
    backgroundColor: "#E0F7FA",
  },
  paymentMethodText: {
    fontSize: 15,
    color: "#333",
  },
  orderSummaryCard: {
    backgroundColor: "white",
    padding: 18,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  summaryItemValue: {
    color: "#666",
    fontSize: 16,
  },
  orderTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  orderTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  orderTotalAmount: {
    color: "#C60C30",
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentDetailsCard: {
    backgroundColor: "white",
    padding: 18,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payWithText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  paymentMethodConfirmedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  placeOrderButton: {
    backgroundColor: "#FFC72C",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  placeOrderButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyAddressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#FDFDFD',
    marginBottom: 20,
  },
  emptyAddressText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
});
