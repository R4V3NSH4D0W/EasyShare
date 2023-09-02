import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios"; // Import Axios for making HTTP requests
import { BiCopy } from "react-icons/bi";

const UserProfie = () => {
  const [sharedUrls, setSharedUrls] = useState([]);
  const [recivedUrls, setReceivedUrls] = useState([]);
  const [mode, setMode] = useState("Sender");
  const userId = localStorage.getItem("userId");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchSharedUrls(userId);
    }
  }, [userId]);

  const fetchSharedUrls = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/sharedUrls/${userId}`
      );
      setSharedUrls(response.data.sharedUrls);
      console.log(response.data.sharedUrls); // Make sure that response.data.sharedUrls contains the array of URLs
    } catch (error) {
      console.error("Error fetching shared URLs:", error);
    }
  };
  const calculateRemainingTime = (generationTime) => {
    const currentTime = Date.now();
    const generationTimestamp = new Date(generationTime).getTime();
    const remainingTimeInSeconds = Math.max(
      0,
      Math.floor(
        (generationTimestamp + 24 * 60 * 60 * 1000 - currentTime) / 1000
      )
    );

    return remainingTimeInSeconds;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = seconds % 60;
    return `${hours}hr ${minutes}min ${secondsLeft}sec`;
  };

  const getRemainingTimeDisplay = (remainingTime) => {
    if (remainingTime > 0) {
      return formatTime(remainingTime);
    } else {
      return "Expired";
    }
  };
  const handleDeleteClick = async (fileUrl, ID) => {
    const fileUniqueId = fileUrl.split("/").pop();
    console.log(fileUniqueId);
    console.log(ID);
    try {
      await axios.delete("http://localhost:3001/deleteSharedUrls", {
        data: { fileUniqueId, ID },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting shared URLs:", error.response);
    }
  };
  const handleRecivedDeleteClick = async (fileUrl) => {
    try {
      await axios.delete("http://localhost:3001/deleteReceivedUrls", {
        data: {
          userID: localStorage.getItem("userId"),
          fileUrl: fileUrl,
        },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting received URL:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSharedUrls((prevSharedUrls) =>
        prevSharedUrls.map((sharedUrl) => ({
          ...sharedUrl,
          remainingTime: calculateRemainingTime(sharedUrl.generationTime),
        }))
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setReceivedUrls((prevReceivedUrls) =>
  //       prevReceivedUrls.map((receivedUrl) => ({
  //         ...receivedUrl,
  //         remainingTime: calculateRemainingTime(receivedUrl.expires),
  //       }))
  //     );
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);
  useEffect(() => {
    if (userId) {
      fetchReceivedUrls(userId);
    }
  }, [userId]);

  const fetchReceivedUrls = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/receivedUrls/${userId}`
      );
      setReceivedUrls(response.data.receivedUrls);
      console.log(response.data.receivedUrls); // Make sure that response.data.sharedUrls contains the array of URLs
    } catch (error) {
      console.error("Error fetching shared URLs:", error);
    }
  };
  const handleCopyClick = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000); // Reset the copied status after 2 seconds
    });
  };
  return (
    <>
      {copied && (
        <span className="bg-gray-400 text-white px-2 py-1 absolute top-0 right-0 ">
          URL Copied!!
        </span>
      )}
      <Navbar />

      <div className=" flex justify-center">
        <div className="border w-[60rem] shadow-md">
          <div className="flex gap-8 mt-10 mb-10 justify-center">
            <button
              onClick={() => setMode("Sender")}
              className={` text-2xl ${
                mode === "Sender" ? "font-semibold underline" : ""
              }`}
            >
              Sended
            </button>
            <button
              onClick={() => setMode("Receiver")}
              className={` text-2xl ${
                mode === "Receiver" ? "font-semibold underline" : ""
              }`}
            >
              Received
            </button>
          </div>
          <div>
            {mode === "Sender" && (
              <>
                <div className=" m-4">
                  {" "}
                  <div className="grid grid-cols-4 gap-4 text-center mb-4">
                    <div className="font-semibold text-gray-600">
                      Added Date
                    </div>
                    <div className="font-semibold text-gray-600">
                      Shared Link
                    </div>
                    <div className="font-semibold text-gray-600">
                      Expires In
                    </div>
                    <div className="font-semibold text-gray-600"></div>
                  </div>
                  <hr className=" mb-6" />
                  {sharedUrls.map((sharedUrl) => (
                    <div key={sharedUrl._id} className="mb-4">
                      <div className="grid grid-cols-4 gap-4 text-center ml-16">
                        <div className=" flex">
                          {" "}
                          {new Date(
                            sharedUrl.generationTime
                          ).toLocaleDateString()}
                        </div>
                        <div className=" flex">
                          <input
                            className="w-[24rem] text-[0.9rem] cursor-pointer"
                            type="text"
                            value={sharedUrl.sharedUrl}
                            readOnly
                          />
                          <BiCopy
                            className="ml-2 cursor-pointer hover:scale-110 text-4xl"
                            onClick={() => handleCopyClick(sharedUrl.sharedUrl)}
                          />
                        </div>

                        <div className="font-semibold text-green-600">
                          {getRemainingTimeDisplay(sharedUrl.remainingTime)}
                        </div>
                        <div className="">
                          <button
                            className="ml-4 text-red-600"
                            onClick={() =>
                              handleDeleteClick(
                                sharedUrl.sharedUrl,
                                sharedUrl._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <hr className=" m-2" />
                    </div>
                  ))}
                </div>
              </>
            )}
            {mode === "Receiver" && (
              <div className="m-4">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="font-semibold text-gray-600">
                    Recived Date
                  </div>
                  <div className="font-semibold text-gray-600">
                    Recived Link
                  </div>
                  <div className="font-semibold text-gray-600">Expires In</div>
                  <div className="font-semibold text-gray-600"></div>
                </div>
                <hr className="mb-6" />
                {recivedUrls.map((receivedUrl) => (
                  <div key={receivedUrl._id} className="mb-4">
                    <div className="grid grid-cols-3 gap-4 text-center ml-16">
                      <div className="flex ml-[2.5rem]">
                        {new Date(
                          receivedUrl.receivedDate
                        ).toLocaleDateString()}
                      </div>
                      <div className="flex">
                        <input
                          className="w-[24rem] text-[0.9rem] cursor-pointer"
                          type="text"
                          value={receivedUrl.recivedUrl}
                          readOnly
                        />
                        <BiCopy
                          className="ml-2 cursor-pointer hover:scale-110 text-4xl"
                          onClick={() =>
                            handleCopyClick(receivedUrl.recivedUrl)
                          }
                        />
                      </div>
                      <div className="font-semibold text-green-600">
                        {new Date(receivedUrl.expires).toLocaleString()}
                      </div>
                      {/* <div className="">
                        <button
                          className="ml-4 text-red-600"
                          onClick={() =>
                            handleRecivedDeleteClick(
                              receivedUrl.receivedUrl,
                              receivedUrl._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div> */}
                    </div>
                    <hr className="m-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfie;
