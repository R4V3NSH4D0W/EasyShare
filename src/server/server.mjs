import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
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

    if (!fileDataMap[uniqueID]) {
      fileDataMap[uniqueID] = [];
    }

    data.files.forEach((file) => {
      fileDataMap[uniqueID].push({
        fileData: file.fileData,
        fileName: file.fileName,
      });
    });

    socket.emit("uniqueIdGenerated", { uniqueID });
  });

  socket.on("requestForFileDataMap", () => {
    socket.emit("fileDataMap", fileDataMap);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
