import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined.");
    }

    const connection = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(` Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;