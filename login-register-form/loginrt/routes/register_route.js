const express = require("express");
const registerSchema = require("../shemas/register_schema");
const authSchema = require("../shemas/auth_schema");
const tokenSchema = require("../shemas/token_schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const configs = require("../config/config.json");
const constants = require("../utils/constants");

const router = express.Router();

// Registration
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await registerSchema.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user in the register collection
    const newUser = new registerSchema({
      name,
      email,
    });
    await newUser.save();

    // Create a new user in the auth collection
    const newAuth = new authSchema({
      user_id: newUser._id,
      username: name,
      password_hash: passwordHash,
    });
    await newAuth.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: newUser._id,
      },
      configs.JWT_KEY,
      {
        expiresIn: "1000h",
      }
    );

    // Save token in the tokenSchema
    const newToken = new tokenSchema({
      user_id: newUser._id,
      token,
    });
    await newToken.save();

    return res.status(201).json({
      message: "Registration successful",
      token,
      user_id: newUser._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

module.exports = router;
