import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import "./style.css";
import { FaFingerprint } from "react-icons/fa";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaRegFile } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { BiCopy } from "react-icons/bi";
const Sendfile = () => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sharedUniqueId, setSharedUniqueId] = useState("");
  const [sharedUrl, setSharedUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
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
  const handleFileRemove = (uniqueID, index) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.filter((_, i) => i !== index)
    );

    // Emit an event to the server to remove the file from fileDataMap
    socket.emit("removeFileFromMap", { uniqueID, index });
  };

  const handelFileAdd = () => {
    fileInputRef.current.click();
  };

  const handleFileAddChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);

    const filesToSend = newFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileData = event.target.result; // base64-encoded data
          const fileName = file.name;
          resolve({ fileData, fileName });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filesToSend).then((fileDataArray) => {
      socket.emit("addFilesAndUpdateMap", {
        uniqueID: sharedUniqueId,
        files: fileDataArray,
      });
    });
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(sharedUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); // Display the message for 2 seconds
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
                onClick={handelFileAdd}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileAddChange}
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
                <RxCross2
                  onClick={() => handleFileRemove(sharedUniqueId, index)}
                  className=" hover:scale-125"
                />
              </div>
            ))}
          </div>
          {/* Right Container  */}
          <div className="border w-[30rem] h-[25rem] shadow-md overflow-y-auto rounded">
            <div className="flex justify-between m-4">
              <div className="flex gap-1">
                <span className=" font-semibold">Send files</span>
              </div>
            </div>
            <hr className="m-4 border-gray-300" />
            <div className="m-4">
              {/* <p>Shared Unique ID: {sharedUniqueId}</p> */}
              <span className=" font-semibold">Share URL</span>
              {sharedUrl && (
                <div className=" flex items-center">
                  <input
                    className=" w-[24rem] text-[0.9rem] cursor-pointer"
                    type="text"
                    value={sharedUrl}
                    readOnly
                  />
                  <BiCopy
                    className="ml-2 cursor-pointer hover:scale-110 text-2xl"
                    onClick={handleCopyClick}
                  />
                  {isCopied && (
                    <span className="bg-gray-400 text-white px-2 py-1 absolute top-0 right-0 ">
                      URL Copied!!
                    </span>
                  )}
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
