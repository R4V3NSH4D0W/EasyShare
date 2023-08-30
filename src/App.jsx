import React from "react";
import { Routes, Route } from "react-router-dom";
import Client from "./client/Client";
import Receiver from "./client/Components/Receiver";
import Login from "./client/Pages/Login";
import Signup from "./client/Pages/Signup";
import UserProfie from "./client/Pages/UserProfie";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Client />} />
      <Route path="/receiver" element={<Receiver />} />
      <Route path="/receiver/:uniqueID" element={<Receiver />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/userprofile" element={<UserProfie />} />
    </Routes>
  );
};

export default App;
