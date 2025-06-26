import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/CartReducer";

const ProductInfoScreen = () => {
  const route = useRoute();
  const { width } = Dimensions.get("window");
  const [addedToCart, setAddedToCart] = useState(false);
  const navigation = useNavigation();
  const height = width * 0.8;
  const dispatch = useDispatch();

  // Thêm sản phẩm vào giỏ hàng
  const addItemToCart = (item) => {
    setAddedToCart(true);
    dispatch(addToCart(item));
    // Đặt lại trạng thái sau 6 giây
    setTimeout(() => {
      setAddedToCart(false);
    }, 6000);
  };

  // Lấy dữ liệu giỏ hàng từ Redux store
  const cart = useSelector((state) => state.cart.cart);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.searchIconLeft}>
            <AntDesign name="search1" size={20} color="#666" />
          </View>
          <TextInput
            placeholder="Search Click_buy.in"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </Pressable>
        <Pressable style={styles.micButton}>
          <Feather name="mic" size={22} color="#333" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carouselContainer}
        >
          {/* Hiển thị ảnh sản phẩm từ carouselImages */}
          {route.params.carouselImages.map((item, index) => (
            <ImageBackground
              style={[styles.carouselImage, { width, height }]}
              source={{ uri: item }}
              key={index}
            >
              <View style={styles.imageOverlay}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>20% off</Text>
                </View>
                <View style={styles.actionIconCircle}>
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={20}
                    color="black"
                  />
                </View>
              </View>
              <View style={styles.heartIconContainer}>
                <AntDesign name="hearto" size={20} color="black" />
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{route?.params?.title}</Text>
          <Text style={styles.productPrice}>${route?.params?.price}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Color:</Text>
          <Text style={styles.detailValue}>{route?.params?.color}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Size:</Text>
          <Text style={styles.detailValue}>{route?.params?.size}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceDeliverySection}>
          <Text style={styles.totalPrice}>
            Total: ${route.params.price.toFixed(2)}
          </Text>
          <Text style={styles.freeDeliveryText}>FREE delivery!!!</Text>
          <View style={styles.deliveryLocation}>
            <Ionicons name="location" size={20} color="black" />
            <Text style={styles.deliveryLocationText}>
              Deliver To Trung - ...
            </Text>
          </View>
          <Text style={styles.inStockText}>IN Stock</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => addItemToCart(route.params?.item)} // Gọi hàm thêm vào giỏ hàng
            style={({ pressed }) => [
              styles.actionButton,
              styles.addToCartButton,
              pressed && styles.buttonPressed,
            ]}
          >
            {addedToCart ? (
              <Text style={styles.buttonText}>Added to cart</Text>
            ) : (
              <Text style={styles.buttonText}>Add to cart</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              dispatch(addToCart(route.params?.item)); // Thêm sản phẩm vào giỏ hàng và chuyển hướng
              navigation.navigate("Main", { screen: "Cart" });
            }}
            style={({ pressed }) => [
              styles.actionButton,
              styles.buyNowButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Buy now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductInfoScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    backgroundColor: "#00CED1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    height: 42,
    flex: 1,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIconLeft: {
    paddingLeft: 12,
    paddingRight: 6,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    paddingRight: 12,
    color: "#333",
  },
  micButton: {
    width: 42,
    height: 42,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  carouselContainer: {
    marginTop: 0,
  },
  carouselImage: {
    resizeMode: "contain",
    justifyContent: "space-between",
  },
  imageOverlay: {
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  discountBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C60C30",
    justifyContent: "center",
    alignItems: "center",
  },
  discountText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 13,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartIconContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    padding: 15,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
    color: "#28A745",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 15,
    color: "#555",
    marginRight: 8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  priceDeliverySection: {
    padding: 15,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 8,
    color: "#333",
  },
  freeDeliveryText: {
    color: "#DC3545",
    fontWeight: "500",
    marginBottom: 8,
  },
  deliveryLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    gap: 8,
  },
  deliveryLocationText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  inStockText: {
    color: "#28A745",
    marginHorizontal: 15,
    fontWeight: "600",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addToCartButton: {
    backgroundColor: "#FFC107",
  },
  buyNowButton: {
    backgroundColor: "#FFC72C",
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
