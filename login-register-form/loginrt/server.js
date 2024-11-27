const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const loginRoute = require("./routes/login_route");
const registerRoute = require("./routes/register_route");
const configs = require('./config/config');
const path = require('path'); //used for file path
const busboy = require('connect-busboy'); //middleware for form/file upload
const io = require("socket.io");
const socketEvents = require("./utils/socket_events");
const constants = require("./utils/constants");
const cors = require("cors");



app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(configs.BACKEND_PORT, function () {
    console.log("Student management system backend server is running on port : " + configs.BACKEND_PORT);
});

const socketServer = io(server);

mongoose
    .connect(
        configs.MONGO_URI + "/" + constants.MONGO_DB_NAME,
        { useNewUrlParser: true, useUnifiedTopology: true , writeConcern: { w: 1  } }
    )
    .then(() => {
        console.log("MongoDB database connection established successfully");
    })
    .catch(err => {
        console.log(err.message);
    });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/login", loginRoute);
app.use("/register",registerRoute)


// Sockets
socketServer.on(socketEvents.CONNECT, async (socket) => {
    require('./sockets/chatMessage')(io, socket);
});