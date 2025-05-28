import mongoose from "mongoose";
import { User } from "./models/user.model.js"; // Corrected path

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/aura", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Create a test user
const createTestUser = async () => {
    try {
        const user = new User({
            username: "testuser",
            email: "testuser@example.com",
            password: "password123",
        });
        await user.save();
        console.log("Test user created:", user);
    } catch (error) {
        console.error("Error creating test user:", error);
    } finally {
        mongoose.connection.close();
    }
};

createTestUser();