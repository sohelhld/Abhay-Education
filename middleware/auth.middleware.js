const jwt = require("jsonwebtoken");
const { userModel } = require("../models/userModel");
require("dotenv").config();

const auth = async (req, res, next) => {
    try {
        const token =
            req.cookies.token || req.headers.authorization?.split(" ")[1];

        // console.log(token);
        if (!token)
            return res
                .status(401)
                .send({ message: "user is not authinticated " });

        const isTokenCorrect = await jwt.verify(token, process.env.jwt_secret);
        if (!isTokenCorrect) {
            return res.status(401).send({ message: "token is not correct" });
        }
        req.body.email = isTokenCorrect.email;
        req.user = await userModel.findById(isTokenCorrect.id);

        next();
    } catch (error) {
        res.status(404).send(error.message);
    }
};

module.exports = { auth };
