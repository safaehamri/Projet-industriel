const mongoose = require("mongoose");
const constants = require("../utils/constants");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const registerSchema = mongoose.model(
  constants.REGISTER_COLLECTION_NAME,
  schema
);
module.exports = registerSchema;
