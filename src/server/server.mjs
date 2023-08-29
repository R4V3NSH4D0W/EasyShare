import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8, // Set the maximum buffer size to 100MB
  pingTimeout: 60000, // Set the ping timeout to 60 seconds
});

const fileDataMap = {};

io.on("connection", (socket) => {
  // console.log("A user connected");
  const removeExpiredIDs = () => {
    const currentTime = Date.now();
    for (const uniqueID in fileDataMap) {
      const entries = fileDataMap[uniqueID];
      fileDataMap[uniqueID] = entries.filter((entry) => {
        return entry.expirationDate > currentTime;
      });
      if (fileDataMap[uniqueID].length === 0) {
        delete fileDataMap[uniqueID];
      }
    }
  };

  // Schedule the function to run every minute
  setInterval(removeExpiredIDs, 60 * 1000); // Run every 1minute
  // setInterval(removeExpiredIDs, 60 * 60 * 1000); // Run every hour
  socket.on("requestUniqueId", (data) => {
    const uniqueID = uuidv4();

    if (!fileDataMap[uniqueID]) {
      fileDataMap[uniqueID] = [];
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);
    // expirationDate.setSeconds(expirationDate.getSeconds() + 20);
    data.files.forEach((file) => {
      fileDataMap[uniqueID].push({
        fileData: file.fileData,
        fileName: file.fileName,
        expirationDate: expirationDate.getTime(),
      });
    });

    socket.emit("uniqueIdGenerated", {
      uniqueID,
      expirationDate: expirationDate.getTime(),
    });
  });

  socket.on("removeFileFromMap", ({ uniqueID, index }) => {
    if (fileDataMap[uniqueID]) {
      fileDataMap[uniqueID] = fileDataMap[uniqueID].filter(
        (_, i) => i !== index
      );

      // If there are no more files for the given uniqueID, remove it from the map
      if (fileDataMap[uniqueID].length === 0) {
        delete fileDataMap[uniqueID];
      }
    }
  });
  socket.on("addFilesAndUpdateMap", ({ uniqueID, files, expirationDate }) => {
    if (!fileDataMap[uniqueID]) {
      fileDataMap[uniqueID] = [];
    }

    files.forEach((file) => {
      fileDataMap[uniqueID].push({
        fileData: file.fileData,
        fileName: file.fileName,
        expirationDate: expirationDate,
      });
    });

    // Optionally emit a confirmation event back to the client
    socket.emit("filesAddedAndMapUpdated", { uniqueID });
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
