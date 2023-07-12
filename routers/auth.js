const express = require("express");
const { registerUser, authenticateUser } = require("../functions/firebase");
const router = express.Router();
const bodyParser = require("body-parser");

// Use body-parser middleware to parse JSON request bodies
router.use(bodyParser.json());

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, profileData } = req.body;
  const userId = await registerUser(email, password, profileData);
  if (userId) {
    res.status(201).json({ userId });
  } else {
    res.status(400).json({ error: "Error registering user" });
  }
});

// Authenticate a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const authResult = await authenticateUser(email, password);
  if (authResult) {
    res.status(200).json(authResult);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get user data
router.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userProfileRef = await db.collection("users").doc(userId).get();
  const userProfileData = userProfileRef.data();
  if (userProfileData) {
    res.status(200).json(userProfileData);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

module.exports = router;