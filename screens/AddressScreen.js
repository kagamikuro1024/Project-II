import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { UserType } from "../UserContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const { userId, setUserId } = useContext(UserType);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedToken = jwt_decode(token);
          const fetchedUserId = decodedToken.userId;
          setUserId(fetchedUserId);
        } else {
          console.log("No auth token found. User might not be logged in.");
          Alert.alert("Authentication Error", "No login session found. Please log in again.");
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Failed to fetch user or decode token:", error);
        Alert.alert("Authentication Error", "There was an issue loading user information. Please log in again.");
        navigation.replace("Login");
      }
    };

    fetchUser();
  }, [setUserId, navigation]);

  const handleAddAddress = async () => {
    if (!userId) {
        Alert.alert("Error", "User ID not found. Please try logging in again.");
        console.log("Attempted to add address without userId");
        return;
    }

    // Basic validation
    if (!name.trim() || !mobileNo.trim() || !houseNo.trim() || !street.trim() || !postalCode.trim()) {
        Alert.alert("Missing Information", "Please fill in all required fields.");
        return;
    }
    if (!/^\d{10}$/.test(mobileNo)) {
        Alert.alert("Invalid Phone Number", "Please enter a 10-digit phone number.");
        return;
    }
     if (!/^\d{5,6}$/.test(postalCode)) {
        Alert.alert("Invalid Postal Code", "Please enter a valid postal code.");
        return;
    }

    const address = {
      name,
      mobileNo,
      houseNo,
      street,
      landmark,
      postalCode,
      // You might want to get city and country from input fields
      city: "Hanoi", // Defaulting for now
      country: "Vietnam", // Defaulting for now
    };

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in again.");
        navigation.replace("Login");
        return;
      }

      const response = await axios.post(
        "http://10.0.2.2:8000/addresses",
        { userId, address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Address added successfully!");
        setName("");
        setMobileNo("");
        setHouseNo("");
        setStreet("");
        setLandmark("");
        setPostalCode("");

        setTimeout(() => {
          navigation.goBack();
        }, 500);
      } else {
        Alert.alert("Error", "Failed to add address. Please try again.");
        console.log("Error response:", response.data);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to add address: ${error.response?.data?.message || error.message}. Please try again.`);
      console.log("Error adding address:", error.response ? error.response.data : error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert("Session Expired", "Your session has expired. Please log in again.");
        navigation.replace("Login");
      }
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.headerBar} />

      <View style={styles.container}>
        <Text style={styles.title}>Add a New Address</Text>

        {/* Country - Kept simple as it was not interactive */}
        <View style={styles.inputContainer}>
          <Icon name="earth" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholderTextColor={"#888"}
            placeholder="Country (Default: Vietnam)"
            style={styles.input}
            editable={false}
            value="Vietnam"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name (First and Last Name)</Text>
          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="Enter your full name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="phone-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={mobileNo}
              onChangeText={setMobileNo}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>House No., Building, Company</Text>
          <View style={styles.inputContainer}>
            <Icon name="home-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={houseNo}
              onChangeText={setHouseNo}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="House number, building name, etc."
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area, Street, Ward/Commune</Text>
          <View style={styles.inputContainer}>
            <Icon name="map-marker-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="Street name, area"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landmark (Optional)</Text>
          <View style={styles.inputContainer}>
            <Icon name="flag-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="e.g. Near Apollo Hospital"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Postal Code (Pincode)</Text>
          <View style={styles.inputContainer}>
            <Icon name="mailbox-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholderTextColor={"#888"}
              style={styles.input}
              placeholder="Enter postal code"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Pressable onPress={handleAddAddress} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Address</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  headerBar: {
    height: 50,
    backgroundColor: "#00CED1",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: "#2D3748",
  },
  addButton: {
    backgroundColor: "#FFC72C",
    paddingVertical: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A3700",
  },
});
