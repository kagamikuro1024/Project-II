import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  BackHandler,
  Modal,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import ProductItem from "../components/ProductItem";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
// import { BottomModal, SlideAnimation, ModalContent } from "react-native-modals"; // Commented out in original
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import jwt_decode from "jwt-decode";

const HomeScreen = () => {
  const list = [
    {
      id: "0",
      image: "https://m.media-amazon.com/images/I/41EcYoIZhIL._AC_SY400_.jpg",
      name: "Home",
    },
    {
      id: "1",
      image:
        "https://m.media-amazon.com/images/G/31/img20/Events/Jup21dealsgrid/blockbuster.jpg",
      name: "Deals",
    },
    {
      id: "3",
      image:
        "https://images-eu.ssl-images-amazon.com/images/I/31dXEvtxidL._AC_SX368_.jpg",
      name: "Electronics",
    },
    {
      id: "4",
      image:
        "https://m.media-amazon.com/images/G/31/img20/Events/Jup21dealsgrid/All_Icons_Template_1_icons_01.jpg",
      name: "Mobiles",
    },
    {
      id: "5",
      image:
        "https://m.media-amazon.com/images/G/31/img20/Events/Jup21dealsgrid/music.jpg",
      name: "Music",
    },
    {
      id: "6",
      image: "https://m.media-amazon.com/images/I/51dZ19miAbL._AC_SY350_.jpg",
      name: "Fashion",
    },
  ];
  const images = [
    "https://img.etimg.com/thumb/msid-93051525,width-1070,height-580,imgsize-2243475,overlay-economictimes/photo.jpg",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img22/Wireless/devjyoti/PD23/Launches/Updated_ingress1242x550_3.gif",
    "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Books/BB/JULY/1242x550_Header-BB-Jul23.jpg",
  ];
  const deals = [
    {
      id: "20",
      title: "OnePlus Nord CE 3 Lite 5G (Pastel Lime, 8GB RAM, 128GB Storage)",
      oldPrice: 25000,
      price: 19000,
      image:
        "https://images-eu.ssl-images-amazon.com/images/G/31/wireless_products/ssserene/weblab_wf/xcm_banners_2022_in_bau_wireless_dec_580x800_once3l_v2_580x800_in-en.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/61QRgOgBx0L._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61uaJPLIdML._SX679_.jpg",
        "https://m.media-amazon.com/images/I/510YZx4v3wL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61J6s1tkwpL._SX679_.jpg",
      ],
      color: "Stellar Green",
      size: "6 GB RAM 128GB Storage",
    },
    {
      id: "30",
      title:
        "Samsung Galaxy S20 FE 5G (Cloud Navy, 8GB RAM, 128GB Storage) with No Cost EMI & Additional Exchange Offers",
      oldPrice: 74000,
      price: 26000,
      image:
        "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Wireless/Samsung/SamsungBAU/S20FE/GW/June23/BAU-27thJune/xcm_banners_2022_in_bau_wireless_dec_s20fe-rv51_580x800_in-en.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/81vDZyJQ-4L._SY879_.jpg",
        "https://m.media-amazon.com/images/I/61vN1isnThL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71yzyH-ohgL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61vN1isnThL._SX679_.jpg",
      ],
      color: "Cloud Navy",
      size: "8 GB RAM 128GB Storage",
    },
    {
      id: "40",
      title:
        "Samsung Galaxy M14 5G (ICY Silver, 4GB, 128GB Storage) | 50MP Triple Cam | 6000 mAh Battery | 5nm Octa-Core Processor | Android 13 | Without Charger",
      oldPrice: 16000,
      price: 14000,
      image:
        "https://images-eu.ssl-images-amazon.com/images/G/31/img23/Wireless/Samsung/CatPage/Tiles/June/xcm_banners_m14_5g_rv1_580x800_in-en.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/817WWpaFo1L._SX679_.jpg",
        "https://m.media-amazon.com/images/I/81KkF-GngHL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61IrdBaOhbL._SX679_.jpg",
      ],
      color: "Icy Silver",
      size: "6 GB RAM 64GB Storage",
    },
    {
      id: "50",
      title:
        "realme narzo N55 (Prime Blue, 4GB+64GB) 33W Segment Fastest Charging | Super High-res 64MP Primary AI Camera",
      oldPrice: 12999,
      price: 10999,
      image:
        "https://images-eu.ssl-images-amazon.com/images/G/31/tiyesum/N55/June/xcm_banners_2022_in_bau_wireless_dec_580x800_v1-n55-marchv2-mayv3-v4_580x800_in-en.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/41Iyj5moShL._SX300_SY300_QL70_FMwebp_.jpg",
        "https://m.media-amazon.com/images/I/61og60CnGlL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61twx1OjYdL._SX679_.jpg",
      ],
    },
  ];
  const offers = [
    {
      id: "11",
      title:
        "Oppo Enco Air3 Pro True Wireless in Ear Earbuds with Industry First Composite Bamboo Fiber, 49dB ANC, 30H Playtime, 47ms Ultra Low Latency,Fast Charge,BT 5.3 (Green)",
      offer: "72% off",
      oldPrice: 7500,
      price: 4500,
      image:
        "https://m.media-amazon.com/images/I/61a2y1FCAJL._AC_UL640_FMwebp_QL65_.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/61a2y1FCAJL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71DOcYgHWFL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71LhLZGHrlL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/61Rgefy4ndL._SX679_.jpg",
      ],
      color: "Green",
      size: "Normal",
    },
    {
      id: "22",
      title:
        "Fastrack Limitless FS1 Pro Smart Watch|1.96 Super AMOLED Arched Display with 410x502 Pixel Resolution|SingleSync BT Calling|NitroFast Charging|110+ Sports Modes|200+ Watchfaces|Upto 7 Days Battery",
      offer: "40%",
      oldPrice: 7955,
      price: 3495,
      image: "https://m.media-amazon.com/images/I/41mQKmbkVWL._AC_SY400_.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/71h2K2OQSIL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71BlkyWYupL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71c1tSIZxhL._SX679_.jpg",
      ],
      color: "black",
      size: "Normal",
    },
    {
      id: "33",
      title: "Aishwariya System On Ear Wireless On Ear Bluetooth Headphones",
      offer: "40%",
      oldPrice: 7955,
      price: 3495,
      image: "https://m.media-amazon.com/images/I/41t7Wa+kxPL._AC_SY400_.jpg",
      carouselImages: ["https://m.media-amazon.com/images/I/41t7Wa+kxPL.jpg"],
      color: "black",
      size: "Normal",
    },
    {
      id: "44",
      title:
        "Fastrack Limitless FS1 Pro Smart Watch|1.96 Super AMOLED Arched Display with 410x502 Pixel Resolution|SingleSync BT Calling|NitroFast Charging|110+ Sports Modes|200+ Watchfaces|Upto 7 Days Battery",
      offer: "40%",
      oldPrice: 24999,
      price: 19999,
      image: "https://m.media-amazon.com/images/I/71k3gOik46L._AC_SY400_.jpg",
      carouselImages: [
        "https://m.media-amazon.com/images/I/41bLD50sZSL._SX300_SY300_QL70_FMwebp_.jpg",
        "https://m.media-amazon.com/images/I/616pTr2KJEL._SX679_.jpg",
        "https://m.media-amazon.com/images/I/71wSGO0CwQL._SX679_.jpg",
      ],
      color: "Norway Blue",
      size: "8GB RAM, 128GB Storage",
    },
  ];

  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [category, setCategory] = useState("jewelery");
  const [items, setItems] = useState([
    { label: "Men's clothing", value: "men's clothing" },
    { label: "jewelery", value: "jewelery" },
    { label: "electronics", value: "electronics" },
    { label: "women's clothing", value: "women's clothing" },
  ]);
  const navigation = useNavigation();
  const cart = useSelector((state) => state.cart.cart);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch Products (from FakeStoreAPI - no token required)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://fakestoreapi.com/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  // Common authentication error handler
  const handleAuthError = useCallback((error) => {
    console.error("Authentication error:", error.response?.data || error.message);
    Alert.alert(
      "Session Expired",
      "Your session has expired or is invalid. Please log in again."
    );
    AsyncStorage.removeItem("authToken")
      .then(() => {
        setUserId(null);
        navigation.replace("Login");
      })
      .catch((err) => console.error("Error clearing token on logout:", err));
  }, [navigation, setUserId]);

  // Fetch Addresses (token required)
  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        handleAuthError("No token found for addresses.");
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
        console.error("Error fetching addresses:", error);
        Alert.alert("Error", "Failed to load address list.");
      }
      setAddresses([]);
    }
  }, [userId, handleAuthError]);

  // Fetch User ID from AsyncStorage and set to context
  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedToken = jwt_decode(token);
          const currentUserId = decodedToken.userId;
          setUserId(currentUserId);
          // Only fetch addresses if userId is successfully set from token
          // This will be triggered by the useEffect below
        } else {
          console.log("No auth token found on HomeScreen init. User not logged in.");
          setUserId(null);
        }
      } catch (error) {
        console.error("Error decoding token on HomeScreen:", error);
        setUserId(null);
        Alert.alert("Error", "Failed to read user information. Please log in again.");
        navigation.replace("Login");
      }
    };
    fetchUserAndAddresses();
  }, [setUserId, navigation]);

  // Fetch addresses when userId changes or modal visibility changes
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    } else {
      // Clear addresses if user logs out or no userId is found
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [userId, modalVisible, fetchAddresses]);

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      // Assuming the first address is the default or simply the first available
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddress]);

  const onGenderOpen = useCallback(() => {
    // This function seems to be intended for DropDownPicker.
    // It currently sets 'open' state to its current value, which might not be the intended behavior.
    // Usually, it's used to manage state of multiple dropdowns.
    // setCompanyOpen(false); // This was commented out in original code
  }, []);


  return (
    <>
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              backgroundColor: "#00CED1",
              paddingHorizontal: 16,
              paddingTop: 50,
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
          <Pressable
            onPress={() => setModalVisible(!modalVisible)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 10,
              backgroundColor: "#AFEEEE",
            }}
          >
            <Ionicons name="location-outline" size={24} color="black" />
            <Pressable>
              {selectedAddress ? (
                <Text style={{ fontSize: 16, color: "#333", fontWeight: "500" }}>
                  Deliver to: {selectedAddress?.name}...
                </Text>
              ) : (
                <Text style={{ fontSize: 16, color: "#333" }}>
                  Choose your location
                </Text>
              )}
            </Pressable>
            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {list.map((item, index) => (
              <Pressable
                key={index}
                style={{
                  margin: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  style={{ width: 50, height: 50, resizeMode: "contain" }}
                  source={{ uri: item.image }}
                />

                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: "500",
                    marginTop: 5,
                  }}
                >
                  {item?.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
            Trending Deals of the week
          </Text>
          <View
            style={{
              paddingLeft: 30,
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {deals.map((item, index) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("Info", {
                    id: item.id,
                    title: item.title,
                    price: item?.price,
                    carouselImages: item.carouselImages,
                    color: item?.color,
                    size: item?.size,
                    oldPrice: item?.oldPrice,
                    item: item,
                  })
                }
                key={index}
                style={{
                  marginVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  style={{ width: 200, height: 200, resizeMode: "contain" }}
                  source={{ uri: item?.image }}
                />
              </Pressable>
            ))}
          </View>
          <Text style={{ padding: 10, fontSize: 18, fontWeight: "bold" }}>
            Today's Deals
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {offers.map((item, index) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("Info", {
                    id: item.id,
                    title: item.title,
                    price: item?.price,
                    carouselImages: item.carouselImages,
                    color: item?.color,
                    size: item?.size,
                    oldPrice: item?.oldPrice,
                    item: item,
                  })
                }
                key={index}
                style={{
                  marginVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{ width: 150, height: 150, resizeMode: "contain" }}
                  source={{ uri: item?.image }}
                />

                <View
                  style={{
                    backgroundColor: "#E31837",
                    paddingVertical: 5,
                    width: 130,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    Upto {item?.offer}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <View
            style={{
              height: 1,
              borderColor: "#D0D0D0",
              borderWidth: 2,
              marginTop: 15,
            }}
          />

          <View
            style={{
              marginHorizontal: 10,
              marginTop: 20,
              width: "45%",
              marginBottom: open ? 50 : 15,
            }}
          >
            <DropDownPicker
              style={{
                borderColor: "#B7B7B7",
                height: 30,
                marginBottom: open ? 120 : 15,
              }}
              open={open}
              value={category}
              items={items}
              setOpen={setOpen}
              setValue={setCategory}
              setItems={setItems}
              placeholder="Choose category"
              placeholderStyle={styles.placeholderStyles}
              onOpen={onGenderOpen}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
          <View
            style={{
              paddingLeft: 30,
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {products
              ?.filter((item) => item.category === category)
              .map((item, index) => (
                <ProductItem item={item} key={index} />
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 24,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}
              >
                Choose your location
              </Text>
              <Text style={{ fontSize: 15, color: "#666" }}>
                Select a delivery location to see product availability and
                delivery options
              </Text>
            </View>

            {/* Address Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {!userId && (
                <View style={{ width: 150, height: 140, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8 }}>
                  <Text style={{ textAlign: 'center', color: '#666' }}>Please log in to view addresses.</Text>
                </View>
              )}
              {userId && addresses.length === 0 && (
                <View style={{ width: 150, height: 140, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8 }}>
                  <Text style={{ textAlign: 'center', color: '#666' }}>You don't have any addresses saved.</Text>
                </View>
              )}
              {addresses?.map((item, index) => (
                <Pressable
                  key={item._id || index}
                  onPress={() => {
                    setSelectedAddress(item);
                    setModalVisible(false);
                  }}
                  style={{
                    width: 150,
                    height: 140,
                    borderColor: "#D0D0D0",
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 10,
                    backgroundColor: selectedAddress?._id === item?._id ? "#e0f7fa" : "#f9f9f9",
                    borderColor: selectedAddress?._id === item?._id ? "#0066b2" : "#D0D0D0",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" , gap: 3} }>
                    <Text
                    style={{
                      textAlign: "center",
                      color: "#0066b2",
                      fontWeight: "500",
                      fontSize: 15,
                    }}
                  >
                    {item?.name}
                  </Text>
                  </View>
                  <Text numberOfLines={1} style={{ textAlign: "center", color: "#333", fontSize: 14 }}>
                    {item?.houseNo}, {item?.street}, {item?.city}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Address");
                }}
                style={{
                  width: 150,
                  height: 140,
                  borderColor: "#D0D0D0",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#0066b2",
                    fontWeight: "500",
                    fontSize: 15,
                  }}
                >
                  Add an address or a pickup point
                </Text>
              </Pressable>
            </ScrollView>

            {/* Options List */}
            <View style={{ marginTop: 12, marginBottom: 24 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f0f0f0",
                }}
                onPress={() => Alert.alert("Info", "Enter Vietnam address function is under development.")}
              >
                <View style={{ width: 32, alignItems: "center" }}>
                  <Entypo name="location-pin" size={22} color="#0066b2" />
                </View>
                <Text
                  style={{
                    color: "#0066b2",
                    fontWeight: "500",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Enter a Vietnam address
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f0f0f0",
                }}
                onPress={() => Alert.alert("Info", "Use current location function is under development.")}
              >
                <View style={{ width: 32, alignItems: "center" }}>
                  <Ionicons name="locate-sharp" size={22} color="#0066b2" />
                </View>
                <Text
                  style={{
                    color: "#0066b2",
                    fontWeight: "500",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Use my current location
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => Alert.alert("Info", "Deliver outside Vietnam function is under development.")}
              >
                <View style={{ width: 32, alignItems: "center" }}>
                  <AntDesign name="earth" size={22} color="#0066b2" />
                </View>
                <Text
                  style={{
                    color: "#0066b2",
                    fontWeight: "500",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Deliver outside Vietnam
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
