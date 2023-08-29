import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./style.css";
import { FaRegFile } from "react-icons/fa";
import imgloading from "../../assets/loading.gif";
import Navbar from "./Navbar";
import { BsDownload } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { AiOutlineDownload } from "react-icons/ai";
import { AiFillEyeInvisible } from "react-icons/ai";
const Receiver = () => {
  const { uniqueID } = useParams();
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [previewedFile, setPreviewedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expirationDate, setExpirationDate] = useState(null);
  const [countdown, setCountdown] = useState("");
  const socket = io.connect("ws://localhost:3001");

  useEffect(() => {
    socket.emit("requestForFileDataMap");

    socket.on("fileDataMap", (data) => {
      const fileDataArray = data[uniqueID];
      console.log(fileDataArray);

      if (fileDataArray) {
        setReceivedFiles(fileDataArray);
        const selectedExpirationDate = fileDataArray[0].expirationDate;
        setExpirationDate(selectedExpirationDate);
        setLoading(false);
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
  const downloadAllFiles = () => {
    receivedFiles.forEach((file, index) => {
      downloadFile(file.fileData, `file_${file.fileName}`);
    });
  };
  const previewFile = (fileData, fileName) => {
    setPreviewedFile({ fileData, fileName });
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif"];
    const extension = fileName.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
  };
  const getTotalSize = () => {
    return receivedFiles.reduce(
      (totalSize, file) => totalSize + file.fileData.length,
      0
    );
  };
  const getCurrentFormattedDate = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString(undefined, options);
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (expirationDate) {
        const currentTime = Date.now();
        const remainingTimeInSeconds = Math.max(
          0,
          Math.floor((expirationDate - currentTime) / 1000)
        );

        const hours = Math.floor(remainingTimeInSeconds / 3600);
        const minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
        const seconds = remainingTimeInSeconds % 60;

        setCountdown(`${hours}hr ${minutes}min ${seconds}sec`);
      }
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [expirationDate]);
  return (
    <>
      <Navbar />
      {loading ? ( // Render loading animation when loading is true
        <div className="loading-animation flex justify-center items-center ">
          <img src={imgloading} />
        </div>
      ) : (
        <div className="flex justify-center items-center ">
          <div className="flex justify-center border rounded-sm w-auto p-4 flex-col shadow-md">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <span className=" text-3xl font-semibold">
                Data Package from {getCurrentFormattedDate()}
              </span>
              <span className=" text-[1.2rem] mb-2 mt-1">
                Expiration Date:{" "}
                <span className=" text-green-600">{countdown}</span>
              </span>

              <button
                className="mt-2 border text-white bg-blue-500 hover:bg-blue-600 h-[3rem] w-[18rem] rounded-sm flex items-center justify-center gap-2"
                onClick={downloadAllFiles}
              >
                <AiOutlineCloudDownload className=" text-2xl" />
                <span>
                  {" "}
                  Download All Files({formatFileSize(getTotalSize())})
                </span>
              </button>
            </div>
            <hr className="mt-8  border-t-2 font-semibold" />
            <div className=" pl-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div className="font-semibold text-gray-600">Name</div>
                <div className="font-semibold text-gray-600">Size</div>
              </div>
              {receivedFiles.map((file, index) => (
                <div key={index}>
                  <div className="grid grid-cols-3 gap-4 ">
                    <span className="text-gray-600">{file.fileName}</span>
                    <span className="text-gray-600 text-center">
                      {formatFileSize(file.fileData.length)}
                    </span>
                    <div className="flex justify-end gap-6 items-center">
                      <AiFillEyeInvisible
                        className=" text-blue-600 text-[1.2rem] hover:text-blue-800"
                        onClick={() =>
                          previewFile(file.fileData, file.fileName)
                        }
                      />
                      <button
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        onClick={() =>
                          downloadFile(file.fileData, `${file.fileName}`)
                        }
                      >
                        <AiOutlineDownload className="text-2xl" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <hr className="mt-4 mb-4  border-t-2 font-semibold" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {previewedFile && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="w-[90%] h-[90%] relative">
            <button
              onClick={() => setPreviewedFile(null)}
              className="bg-red-500 px-3 py-2 absolute top-2 right-2 hover:bg-red-600 transition duration-200"
            >
              <AiOutlineClose className="text-white text-[.9rem]" />
            </button>
            <div className="flex justify-center items-center w-full h-full">
              {isImageFile(previewedFile.fileName) ? (
                <img
                  src={previewedFile.fileData}
                  alt="Preview"
                  className="max-h-full max-w-full"
                />
              ) : (
                <iframe
                  src={previewedFile.fileData}
                  width="100%"
                  height="100%"
                  title="File Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Receiver;
