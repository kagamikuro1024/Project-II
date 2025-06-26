import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  incementQuantity,
  removeFromCart,
} from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";

const CartScreen = () => {
  // Lấy dữ liệu giỏ hàng từ Redux store
  const cart = useSelector((state) => state.cart.cart);
  // Tính tổng giá trị giỏ hàng
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
  const dispatch = useDispatch();

  // Tăng số lượng sản phẩm
  const increaseQuantity = (item) => {
    dispatch(incementQuantity(item));
  };
  // Giảm số lượng sản phẩm
  const decreaseQuantity = (item) => {
    dispatch(decrementQuantity(item));
  };
  // Xóa sản phẩm khỏi giỏ hàng
  const deleteItem = (item) => {
    dispatch(removeFromCart(item));
  };
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        paddingTop: Platform.OS === "android" ? 40 : 0,
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#00CED1",
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 15,
          flexDirection: "row",
          alignItems: "center",
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 8,
            height: 42,
            flex: 1,
            marginRight: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View style={{ paddingLeft: 12, paddingRight: 6 }}>
            <AntDesign name="search1" size={20} color="#666" />
          </View>
          <TextInput
            placeholder="Search Click_buy.in"
            placeholderTextColor="#999"
            style={{
              flex: 1,
              height: "100%",
              fontSize: 15,
              paddingRight: 12,
              color: "#333",
            }}
          />
        </Pressable>

        <Pressable
          style={{
            width: 42,
            height: 42,
            backgroundColor: "white",
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Feather name="mic" size={22} color="#333" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Tổng phụ và nút tiến hành mua */}
        <View style={styles.summaryContainer}>
          <Text style={styles.subtotalText}>
            Subtotal:{" "}
            <Text style={styles.totalAmountText}>${total.toFixed(2)}</Text>
          </Text>
          <Text style={styles.emiDetails}>EMI details Available</Text>

          <Pressable
            onPress={() => navigation.navigate("Confirm")} // Chuyển hướng đến màn hình xác nhận
            style={styles.proceedButton}
          >
            <Text style={styles.proceedButtonText}>
              Proceed to Buy ({cart.length}) items
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Các mặt hàng trong giỏ hàng */}
        <View style={styles.cartItemsContainer}>
          {cart?.map((item, index) => (
            <View key={index} style={styles.productCard}>
              <Pressable style={styles.productInfoRow}>
                <Image
                  style={styles.productImage}
                  source={{ uri: item?.image }}
                />

                <View style={styles.productDetails}>
                  <Text numberOfLines={3} style={styles.productTitle}>
                    {item?.title}
                  </Text>
                  <Text style={styles.productPrice}>${item?.price}</Text>
                  <Text style={styles.inStockText}>In Stock</Text>
                </View>
              </Pressable>

              <View style={styles.quantityControls}>
                <View style={styles.quantityButtonsGroup}>
                  {item?.quantity > 1 ? (
                    <Pressable
                      onPress={() => decreaseQuantity(item)} // Giảm số lượng
                      style={styles.quantityButton}
                    >
                      <AntDesign name="minus" size={20} color="black" />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => deleteItem(item)} // Xóa sản phẩm nếu số lượng là 1
                      style={styles.quantityButton}
                    >
                      <AntDesign name="delete" size={20} color="black" />
                    </Pressable>
                  )}

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{item?.quantity}</Text>
                  </View>

                  <Pressable
                    onPress={() => increaseQuantity(item)} // Tăng số lượng
                    style={styles.quantityButton}
                  >
                    <Feather name="plus" size={20} color="black" />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => deleteItem(item)} // Xóa sản phẩm
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </Pressable>
              </View>

              <View style={styles.bottomActionButtons}>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Save For Later</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>
                    See More Like this
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#333",
  },
  totalAmountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  emiDetails: {
    marginVertical: 5,
    color: "#666",
    fontSize: 14,
  },
  proceedButton: {
    backgroundColor: "#FFC72C",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cartItemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  primeImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginBottom: 5,
  },
  inStockText: {
    color: "green",
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  quantityButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  quantityButton: {
    backgroundColor: "#D8D8D8",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityDisplay: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 7,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  actionButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  bottomActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
});
