const mongoose = require("mongoose");
require("dotenv").config()
const Job = require('./models/job'); 
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );
    await Job.syncIndexes()
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

module.exports = connectDB;