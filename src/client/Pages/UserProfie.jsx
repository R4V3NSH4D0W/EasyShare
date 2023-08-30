import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios"; // Import Axios for making HTTP requests

const UserProfie = () => {
  const [sharedUrls, setSharedUrls] = useState([]);
  const userId = localStorage.getItem("userId");

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

  return (
    <>
      <Navbar />
      <div className="border">
        <h2>Shared URLs</h2>
        <ul>
          {sharedUrls.map((sharedUrl) => (
            <li key={sharedUrl._id}>
              <a
                href={sharedUrl.sharedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sharedUrl.sharedUrl}
              </a>
              <span className="ml-6">
                Remaining Time:{" "}
                {getRemainingTimeDisplay(sharedUrl.remainingTime)}
              </span>
              <button
                className="ml-4 text-red-600"
                onClick={() =>
                  handleDeleteClick(sharedUrl.sharedUrl, sharedUrl._id)
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default UserProfie;
