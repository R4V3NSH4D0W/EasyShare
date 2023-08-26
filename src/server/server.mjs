import express from "express";
import http from "http";
// import cors from "cors";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
// cors(app());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `*`,
    methods: ["GET", "POST"],
  },
});

const fileDataMap = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("requestUniqueId", (data) => {
    const uniqueID = uuidv4();
    fileDataMap[uniqueID] = data.fileData;
    socket.emit("uniqueIdGenerated", { uniqueID, fileData: data.fileData });
  });

  socket.on("requestForFile", (uniqueId) => {
    const fileData = fileDataMap[uniqueId];
    if (fileData) {
      socket.emit("fileReceived", fileData);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// app.get("/files/:uniqueID", (req, res) => {
//   const { uniqueID } = req.params;
//   const fileData = fileDataMap[uniqueID];

//   if (fileData) {
//     res.send({ success: true, fileData });
//   } else {
//     res.send({ success: false, error: "File not found." });
//   }
// });
