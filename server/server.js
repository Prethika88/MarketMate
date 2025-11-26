import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./configs/passport.js";
import connectDB from "./configs/db.js";
import userRoutes from "./routes/user.route.js";
import sellerRoutes from "./routes/seller.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import addressRoutes from "./routes/address.route.js";
import { stripeWebhooks } from "./controllers/order.controller.js";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to the database
connectDB().then(() => {
    console.log("✅ Connected to the database.");
}).catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit the process if the connection fails
});

// Allowed origins for CORS
const allowedOrigins = ['http://localhost:5173', 'https://greencart-tau.vercel.app'];

// Stripe webhook route
app.post("/stripewebhook", express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express session configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'default_secret', // Fallback in case the env variable is not defined
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Base route
app.get("/", (req, res) => res.send("API is working"));

// API routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/address", addressRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
