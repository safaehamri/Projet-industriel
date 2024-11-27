const express = require("express");
const authSchema = require("../shemas/auth_schema");
const tokenSchema = require("../shemas/token_schema");
const registerSchema = require("../shemas/register_schema")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const configs = require("../config/config.json");
const constants = require("../utils/constants");
const utils = require("../utils/util_methods");
const mongoose = require("mongoose"); // Add this line to import mongoose

const router = express.Router();

// Login
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    let user;

    // Step 1: Find user by username in the auth table
    user = await authSchema.findOne({ username });

    // Step 2: If user not found, find user by email in the register table
    // if (!user) {
    //   user = await registerSchema.findOne({ username });
    // }

    if (!user) {
      return res.status(401).json({
        message: "Authorization Failed! User not found",
      });
    }

    // Step 2: Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      // Step 3: Delete existing token for the user
      console.log({ user_id: user._id });
      const userId = mongoose.Types.ObjectId(user._id); // Convert user_id to ObjectId
      console.log(userId)
      const deleteTokenResult = await tokenSchema.deleteOne({ user_id: userId });

      console.log("Delete token result:", deleteTokenResult);

      if (deleteTokenResult.deletedCount > 0) {
        console.log("Existing token deleted");
      } else {
        console.log("No existing token found");
      }

      // Step 4: Generate JWT token
      const token = jwt.sign(
        {
          user_type: user.user_type,
          user_id: user._id
        },
        configs.JWT_KEY,
        {
          expiresIn: "1000h"
        }
      );

      // Step 5: Save token in tokenSchema
      const tokenModel = new tokenSchema({
        user_id: user._id,
        user_type: user.user_type,
        token: token
      });
      await tokenModel.save();

      return res.status(200).json({
        message: "Authorization Success",
        token: token,
        user_type: user.user_type,
        user_id: user._id
      });
    } else {
      return res.status(401).json({
        message: "Authorization Failed! Invalid password"
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Authorization Failed!"
    });
  }
});

// Verify whether the token is correct
router.post("/verifyToken", utils.extractToken, async (req, res) => {
  try {
    const { token } = req;

    // Find token in tokenSchema
    const tokenList = await tokenSchema.find({ token });

    console.log(tokenList)

    if (tokenList.length < 1) {
      return res.status(401).json({
        message: "Verification Failed!"
      });
    }

    res.json({
      message: "JWT Token is Valid",
      user_type: tokenList[0].user_type,
      user_id: tokenList[0].user_id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error
    });
  }
});

module.exports = router;
