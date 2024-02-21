const mongoose = require("mongoose");
require("dotenv").config();

let connected = mongoose.connect(process.env.mongooseURL);

module.exports = { connected };
