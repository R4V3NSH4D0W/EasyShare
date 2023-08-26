import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./style.css";
import { FaRegFile } from "react-icons/fa";
import axios from "axios";
import { data } from "autoprefixer";

const Receiver = () => {
  const { uniqueID } = useParams();
  const [receivedFiles, setReceivedFiles] = useState([]);

  const socket = io.connect("ws://localhost:3001");

  useEffect(() => {
    socket.emit("requestForFile", uniqueID);
  }, []);

  useEffect(() => {
    const fetchFileData = async (id) => {
      try {
        const response = await axios.get(`http://localhost:3001/files/${id}`);
        console.log("Response:", response);
        const data = response.data;
        console.log("Parsed Data:", data);
        if (data.success) {
          return data.fileData;
        } else {
          console.error("File not found.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching file data:", error);
        return null;
      }
    };

    // socket.on("fileReceive", async (data) => {
    //   const { uniqueID, fileData } = data;
    //   console.log("Received file data for unique ID:", uniqueID);
    //   console.log("File data:", fileData);
    //   console.log(fileData);
    //   if (fileData) {
    //     setReceivedFiles((prevFiles) => [
    //       ...prevFiles,
    //       { id: uniqueID, fileData },
    //     ]);
    //   }
    // });
    socket.on("fileReceived", (data) => {
      setReceivedFiles((prev) => [...prev, data]);
    });

    // fetchFileData(uniqueID);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return (bytes / 1048576).toFixed(2) + " MB";
    }
  };

  const downloadFile = (fileData, fileName) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="border w-[20rem] h-[25rem] shadow-md overflow-y-auto rounded">
      <div className="flex justify-between m-4">
        <div className="flex gap-1">
          <span>Received files for ID: {uniqueID}</span>
        </div>
      </div>
      <hr className="m-4 border-gray-300" />

      {receivedFiles.map((file, index) => (
        <div key={index} className="m-4 flex items-center gap-2">
          <FaRegFile />
          <div className="truncate w-[10rem] flex flex-col">
            <span className="text-xs">File ID: {file.id}</span>
            <span className="text-xs">Size: {formatFileSize(file.length)}</span>
          </div>
          <button onClick={() => downloadFile(file, `file_${file.id}`)}>
            Download
          </button>
        </div>
      ))}
    </div>
  );
};

export default Receiver;
