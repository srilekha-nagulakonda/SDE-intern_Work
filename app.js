const express = require("express");
const mongoose = require("mongoose");

const app = express();

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/dating_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  hobbies: [String],
});
const User = mongoose.model("User", userSchema);

// API endpoint
app.get("/match/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const potentialMatches = await User.find({
      _id: { $ne: user_id },
      hobbies: { $in: user.hobbies },
    })
      .sort({ hobbies: -1 })
      .select("id name hobbies");

    res.json(potentialMatches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on the port 3000");
});
