import React, { useRef, useState } from "react";
import "./style.css";
import { FaFingerprint } from "react-icons/fa";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaRegFile } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const Sendfile = () => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFingerprintClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return (bytes / 1048576).toFixed(2) + " MB";
    }
  };
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
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
                <RxCross2
                  onClick={() => handleRemoveFile(index)}
                  className=" hover:scale-125"
                />
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
          </div>
        </div>
      )}
    </>
  );
};

export default Sendfile;
