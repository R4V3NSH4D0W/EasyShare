import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import cors from "cors";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 2 * 1024 * 1024 * 1024, // Set the maximum buffer size to 2GB
  pingTimeout: 60000, // Set the ping timeout to 60 seconds
});
app.use(express.json());
app.use(cors());
// ----------------------------Connection to MongoDB database-----------------
const uri =
  "mongodb+srv://lenishmagar:TCtg05gMoUz8rLkr@easyshare.pieovce.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    // Now you're connected to the database and can perform operations
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToDatabase();
// -----------------------------------signup-----------------------------
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert the user's data into the "users" collection
    const result = await client.db("users").collection("users").insertOne({
      email: email,
      password: hashedPassword, // Store the hashed password
    });

    res
      .status(201)
      .json({ message: "User created", insertedId: result.insertedId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// ------------------------------login------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await client
      .db("users")
      .collection("users")
      .findOne({ email });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const userId = user._id;

    res
      .status(200)
      .json({ success: true, message: "Login successful", userId });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// ------------------------------uploadingURl---------------------------------------

app.post("/uploadSharedUrl", async (req, res) => {
  const { userId, sharedUrl, generationTime } = req.body;

  try {
    const result = await client.db("users").collection("sharedUrl").insertOne({
      userId: userId,
      sharedUrl: sharedUrl,
      generationTime: generationTime,
    });

    res.status(201).json({
      message: "Shared URL data uploaded",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error uploading shared URL data:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.post("/uploadRecivedUrlToMongoDB", async (req, res) => {
  const { userID, RecivedUrl, ExpiresTime, ReceivedDate } = req.body;
  try {
    // Check if the same URL already exists for the user
    const existingRecord = await client
      .db("users")
      .collection("receivedUrl")
      .findOne({ userId: userID, recivedUrl: RecivedUrl });

    if (existingRecord) {
      // URL already exists for the user, return an error response
      res.status(409).json({ message: "URL already exists for this user" });
    } else {
      // URL does not exist for the user, insert the data

      const result = await client
        .db("users")
        .collection("receivedUrl")
        .insertOne({
          userId: userID,
          recivedUrl: RecivedUrl,
          expires: ExpiresTime,
          receivedDate: ReceivedDate,
        });

      console.log(ExpiresTime);
      console.log(ReceivedDate);
      res.status(201).json({
        message: "Received URL data uploaded",
        insertedId: result.insertedId,
      });
    }
  } catch (error) {
    console.error("Error uploading Received URL data:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// ---------------------------------fetchurl-----------------------------------------
app.get("/sharedUrls/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const sharedUrls = await client
      .db("users")
      .collection("sharedUrl")
      .find({ userId: userId })
      .toArray();

    res.json({ sharedUrls });
  } catch (error) {
    console.error("Error fetching shared URLs:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/receivedUrls/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const receivedUrls = await client
      .db("users")
      .collection("receivedUrl")
      .find({ userId: userId })
      .toArray();

    res.json({ receivedUrls });
  } catch (error) {
    console.error("Error fetching received URLs:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// --------------------------------DeleteFile----------------------------------------
app.delete("/deleteSharedUrls", async (req, res) => {
  const { fileUniqueId, ID } = req.body;
  console.log(fileUniqueId);
  try {
    const objectId = new ObjectId(ID);
    await client
      .db("users")
      .collection("sharedUrl")
      .deleteOne({ _id: objectId });

    if (fileDataMap[fileUniqueId]) {
      delete fileDataMap[fileUniqueId];
    }

    res.status(200).json({ message: "Shared URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting shared URL:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting shared URL" });
  }
});
app.delete("/deleteReceivedUrls", async (req, res) => {
  const { userID, fileUrl } = req.body;

  try {
    const result = await client
      .db("users")
      .collection("receivedUrl")
      .deleteOne({ userId: userID, recivedUrl: fileUrl });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Received URL deleted successfully" });
    } else {
      res.status(404).json({ message: "Received URL not found" });
    }
  } catch (error) {
    console.error("Error deleting received URL:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting received URL" });
  }
});

// -----------------------------Socket Programming----------------------------------
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

  // socket.on("disconnect", () => {
  //   console.log("A user disconnected");
  // });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
