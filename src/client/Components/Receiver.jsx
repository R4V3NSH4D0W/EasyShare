import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./style.css";
import { FaRegFile } from "react-icons/fa";
import Navbar from "./Navbar";
const Receiver = () => {
  const { uniqueID } = useParams();
  const [receivedFiles, setReceivedFiles] = useState([]);
  const socket = io.connect("ws://localhost:3001");

  useEffect(() => {
    socket.emit("requestForFileDataMap");

    socket.on("fileDataMap", (data) => {
      const fileDataArray = data[uniqueID];
      console.log(fileDataArray);

      if (fileDataArray) {
        setReceivedFiles(fileDataArray);
      }
    });

    return () => {
      socket.off("fileDataMap");
    };
  }, [uniqueID]);

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
    <>
      <Navbar />
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
              <span className="text-xs"> {file.fileName}</span>
              <span className="text-xs">
                Size: {formatFileSize(file.fileData.length)}
              </span>
            </div>
            <button
              onClick={() =>
                downloadFile(file.fileData, `file_${file.fileName}`)
              }
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Receiver;
