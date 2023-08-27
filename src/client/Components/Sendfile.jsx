import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import "./style.css";
import { FaFingerprint } from "react-icons/fa";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaRegFile } from "react-icons/fa";

const Sendfile = () => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sharedUniqueId, setSharedUniqueId] = useState("");
  const [sharedUrl, setSharedUrl] = useState("");
  const socket = io.connect("ws://localhost:3001");

  const handleFingerprintClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);

    const filesToSend = newFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = event.target.result;
          const fileName = file.name;
          resolve({ fileData, fileName });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filesToSend).then((fileDataArray) => {
      socket.emit("requestUniqueId", { files: fileDataArray });
    });
  };
  useEffect(() => {
    socket.on("uniqueIdGenerated", ({ uniqueID }) => {
      setSharedUniqueId(uniqueID);
      setSharedUrl(`${window.location.origin}/receiver/${uniqueID}`);
    });
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

  const getTotalSize = () => {
    return selectedFiles.reduce((totalSize, file) => totalSize + file.size, 0);
  };

  return (
    <>
      {!selectedFiles.length ? (
        <div className="flex justify-center items-center mt-[10rem] cursor-pointer">
          <div className="h-[10rem] w-[10rem] bg-blue-600 rounded-full flex justify-center items-center animation-pulse">
            <FaFingerprint
              className="text-white text-6xl"
              onClick={handleFingerprintClick}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-6 justify-center mt-[5rem]">
          {/* left Container */}
          <div className="border w-[15rem] h-[25rem] shadow-md overflow-y-auto rounded">
            <div className="flex justify-between m-4">
              <div className="flex gap-1">
                <span>{selectedFiles.length} </span>
                <span>files</span>
                <span>({formatFileSize(getTotalSize())})</span>
              </div>
              <BsPlusCircleFill
                className="text-blue-600 h-6 w-6 hover:text-blue-800 hover:scale-125"
                onClick={handleFingerprintClick}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
            </div>
            <hr className="m-4 border-gray-300" />

            {selectedFiles.map((file, index) => (
              <div key={index} className="m-4 flex items-center gap-2">
                <FaRegFile />
                <div className="truncate w-[10rem] flex flex-col">
                  <span className="text-xs">{file.name}</span>
                  <span className="text-xs">{formatFileSize(file.size)}</span>
                </div>
                {/* <RxCross2
                  onClick={() => handleRemoveFile(index)}
                  className=" hover:scale-125"
                /> */}
              </div>
            ))}
          </div>
          {/* Right Container  */}
          <div className="border w-[20rem] h-[25rem] shadow-md overflow-y-auto rounded">
            <div className="flex justify-between m-4">
              <div className="flex gap-1">
                <span>Send files</span>
              </div>
            </div>
            <hr className="m-4 border-gray-300" />
            <div className="m-4">
              <p>Shared Unique ID: {sharedUniqueId}</p>
              {sharedUrl && (
                <div>
                  <p>Shared URL:</p>
                  <input type="text" value={sharedUrl} readOnly />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sendfile;
