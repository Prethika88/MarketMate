import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("Database connected"));
    
    // Use backticks instead of single quotes for string interpolation
    await mongoose.connect(`${process.env.MONGODB_URI}/greencart`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

export default connectDB;
