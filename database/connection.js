import mongoose from "mongoose";

export const connection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI environment variable is missing or empty");
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Attempting to connect to MongoDB...");
    
    const options = {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 90000,
      maxPoolSize: 10,
      family: 4,
      connectTimeoutMS: 60000,
      retryWrites: true,
      w: "majority"
    };

    let retries = 3;
    while (retries > 0) {
      try {
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("Connected to MongoDB successfully!");
        return;
      } catch (err) {
        retries--;
        console.error("MongoDB Connection Error:", err.message);
        if (retries === 0) {
          throw err;
        }
        console.log(`Connection attempt failed. ${retries} retries left. Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error("=== Database Connection Error ===");
    console.error("Error Type:", error.constructor.name);
    console.error("Error Message:", error.message);
    
    if (error.message.includes("IP that isn't whitelisted")) {
      console.error("\nPlease whitelist your IP in MongoDB Atlas:");
      console.error("1. Go to MongoDB Atlas dashboard");
      console.error("2. Click Network Access");
      console.error("3. Add your current IP or use 0.0.0.0/0 for unrestricted access");
    }
    
    throw error;
  }
};
