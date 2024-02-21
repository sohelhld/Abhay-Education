const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.models");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();
const userRouter = express.Router();

function generateOTP() {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

userRouter.post("/signup", async (req, res) => {
    const { user, email, password } = req.body;
    try {
        const isUserPresent = await userModel.findOne({ email });
        if (isUserPresent) {
            return res.status(400).send("user is already signup plzz login");
        }
        var randomOTP = generateOTP();
        const hash = await bcrypt.hash(password, 8);
        const data = await userModel({
            user,
            email,
            password: hash,
            otp: randomOTP,
        });
        await data.save();

        const message = `
        <p>${user} Your Verification Opt is :-</p>
        <h2>${randomOTP}</h2>
        <p>If you are not requieset this email please ignore it</p>
      `;

        await sendEmail({
            email: email,
            subject: "Verification Opt for SighUp",
            message,
        });

        res.status(200).send({
            message: "Opt sent to your Email plz verified by OTP",
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

userRouter.patch("/verified", async (req, res) => {
    const { otp } = req.body;

    try {
        const isUserPresent = await userModel.findOne({ otp: otp });
        if (!isUserPresent) {
            return res
                .status(400)
                .send({ message: "User not found Wrong OTP" });
        }

        let id = isUserPresent._id;
        let updateIsVerified = { isVerified: 1 };

        let data = await userModel.findByIdAndUpdate(
            { _id: id },
            updateIsVerified
        );
        await data.save();

        res.status(200).send({
            message: `${isUserPresent.user} Your Email is ${isUserPresent.email} SuccesFully Verifed`,
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const isUserPresent = await userModel.findOne({ email });
        if (!isUserPresent) return res.status(400).send("plzz signup first");

        if (isUserPresent.isVerified !== 1) {
            return res.status(400).send("plzz verify your email first");
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            isUserPresent.password
        );
        if (!isPasswordCorrect)
            return res.status(400).send("password is incorrect");

        const token = jwt.sign(
            { user_id: isUserPresent._id },
            process.env.jwt_secret,
            { expiresIn: "1m" }
        );

        res.cookie("token", token);

        res.status(200).send({ msg: "login succesful", token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//Logout
userRouter.get("/logout", Auth, (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).send({ message: "Log Out Successfully" });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

module.exports = { userRouter };
