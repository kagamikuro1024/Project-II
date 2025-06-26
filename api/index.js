const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log(`Server is running on port 8000`);
});

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://trungle:trungle@pj2.yvj5uym.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Models
const User = require("./models/user");
const Order = require("./models/order");

// --- Helper functions (existing) ---
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "trung5kvshthlnqk38b@gmail.com",
      pass: "rlrm tnxu dptd abxs",
    },
  });

  const mailOptions = {
    from: "Click_Buy.com",
    to: email,
    subject: "Email Verification",
    text: `Please click the following link to verify your email: http://localhost:8000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// NEW: Helper function to send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "trung5kvshthlnqk38b@gmail.com",
      pass: "rlrm tnxu dptd abxs",
    },
  });

  let productListHtml = orderDetails.products.map(product => `
    <li>
      ${product.name} (x${product.quantity}) - $${product.price.toFixed(2)}
    </li>
  `).join('');

  const mailOptions = {
    from: "Click_Buy.com",
    to: userEmail,
    subject: `Order #${orderDetails._id.toString().slice(-6)} Confirmation - Click_Buy.com`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order #${orderDetails._id.toString().slice(-6)} has been successfully placed.</p>
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order ID:</strong> ${orderDetails._id}</li>
        <li><strong>Total Price:</strong> $${orderDetails.totalPrice.toFixed(2)}</li>
        <li><strong>Payment Method:</strong> ${orderDetails.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</li>
        <li><strong>Order Status:</strong> ${orderDetails.orderStatus}</li>
      </ul>
      <h3>Shipping Address:</h3>
      <p>
        ${orderDetails.shippingAddress.name}<br>
        ${orderDetails.shippingAddress.houseNo}, ${orderDetails.shippingAddress.street}<br>
        ${orderDetails.shippingAddress.landmark ? orderDetails.shippingAddress.landmark + '<br>' : ''}
        ${orderDetails.shippingAddress.postalCode}<br>
        Phone: ${orderDetails.shippingAddress.mobileNo}
      </p>
      <h3>Products:</h3>
      <ul>
        ${productListHtml}
      </ul>
      <p>We will notify you once your order has been shipped.</p>
      <p>Thank you for shopping with Click_Buy.com!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail} for order ${orderDetails._id}`);
  } catch (error) {
    console.error(`Error sending order confirmation email to ${userEmail}:`, error);
  }
};


const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

// --- AUTHENTICATION AND AUTHORIZATION MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    console.error("Error in authorizeAdmin middleware:", error);
    res.status(500).json({ message: "Internal server error during authorization" });
  }
};

// --- EXISTING ENDPOINTS ---

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // RECOMMENDED: Hash password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: password, // Replace with hashedPassword if using bcrypt
      role: 'user'
    });

    newUser.verificationToken = crypto.randomBytes(20).toString("hex");
    await newUser.save();
    console.log("New User Registered:", newUser);
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({
      message: "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Failed:", error);
    res.status(500).json({ message: "Email Verification Failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // RECOMMENDED: Compare hashed password here
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid password" });
    // }
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: '24h' });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Login Failed:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

app.post("/addresses", authenticateToken, async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (req.user.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Error adding address" });
  }
});

app.get("/addresses/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    console.error("Error retrieving the addresses:", error);
    res.status(500).json({ message: "Error retrieving the addresses" });
  }
});

// MODIFIED: Endpoint to store all the orders (now sends confirmation email)
app.post("/orders", authenticateToken, async (req, res) => {
   try {
     const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } = req.body;

     if (req.user.userId !== userId) {
         return res.status(403).json({ message: "Unauthorized: Token mismatch for userId" });
     }

     const user = await User.findById(userId);
     if (!user) {
       return res.status(404).json({ message: "User not found" });
     }

     const products = cartItems.map((item) => ({
       name: item?.title, // Changed from item?.name to item?.title
       quantity: item.quantity,
       price: item.price,
       image: item?.image,
     }));

    const order = new Order({
      user: userId,
      products: products,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      orderStatus: 'Pending', // Default status for new orders
    });

    await order.save();

    // NEW: Send order confirmation email after successful order creation
    if (user.email) {
      await sendOrderConfirmationEmail(user.email, order); // Pass user's email and saved order details
    } else {
      console.warn(`User ${userId} does not have an email to send order confirmation.`);
    }

    res.status(200).json({ message: "Order created successfully!" });
  } catch (error) {
    console.error("Error creating orders", error);
    res.status(500).json({ message: "Error creating orders" });
  }
});

// get the user profile (kept as is)
app.get("/profile/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error retrieving the user profile:", error);
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

app.get("/orders/:userId", authenticateToken, async(req,res) => {
  try{
    const userId = req.params.userId;

    if (req.user.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized: Token mismatch for userId" });
    }

    const orders = await Order.find({user:userId}).populate("user");

    if(!orders || orders.length === 0){
      return res.status(404).json({message:"No orders found for this user"})
    }

    res.status(200).json({ orders });
  } catch(error){
      console.error("Error retrieving orders:", error);
      res.status(500).json({ message: "Error retrieving orders" });
    }
});


// --- ADMIN ENDPOINTS ---

app.get("/admin/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error getting all users (admin):", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

app.put("/admin/users/:userId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, role, verified, password } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email, role, verified, password } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user (admin):", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

app.delete("/admin/users/:userId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user (admin):", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.put("/admin/orders/:orderId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: "Invalid order status provided" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: orderStatus } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status (admin):", error);
    res.status(500).json({ message: "Error updating order status" });
  }
});

app.delete("/admin/orders/:orderId", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order (admin):", error);
    res.status(500).json({ message: "Error deleting order" });
  }
});

app.put("/orders/cancel/:orderId", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId; // Get userId from authenticated token

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order belongs to the authenticated user
    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to cancel this order." });
    }

    // Only allow cancellation if the order status is 'Pending' or 'Processing'
    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      return res.status(400).json({ message: `Order cannot be cancelled. Current status: ${order.orderStatus}.` });
    }

    // Update the order status to 'Cancelled'
    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully.", order });

  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order." });
  }
});

app.get('/admin/orders', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email'); // Populate user's name and email
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});
