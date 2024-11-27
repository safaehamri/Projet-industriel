const mongoose = require("mongoose");
const constants = require("../utils/constants");

const schema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
});

const authSchema = mongoose.model(constants.AUTH_COLLECTION_NAME, schema);
module.exports = authSchema;
