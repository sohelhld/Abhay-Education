const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    user: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: { type: String, require: true },
    isVerified: { type: Number, default: 0 },
    otp: { type: Number },
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
