const express = require("express");
const { connected } = require("./db");
const { userRouter } = require("./routes/user.router");
var cookieParser = require("cookie-parser");

const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
require("dotenv").config();

app.use(cookieParser());
app.use(express.json());
app.use("/user", userRouter);

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
    res.sendFile(path.join("./public/index.html"));
});

//socket.io
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(9000, () => {
    console.log("server is listening on port 9000");
});

app.listen(process.env.PORT, async (req, res) => {
    try {
        await connected;
        console.log("Connected with db");
    } catch (error) {
        console.log(error.message);
    }
    console.log("server is connected on port 8080");
});
