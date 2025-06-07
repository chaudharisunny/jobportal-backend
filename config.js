const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://chaudharisunny6:fuWw6VmecNMVSEEx@cluster0.2lllcre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

module.exports = connectDB;
