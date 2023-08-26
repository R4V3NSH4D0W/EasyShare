import React from "react";
import { Routes, Route } from "react-router-dom";
import Client from "./client/Client";
import Receiver from "./client/Components/Receiver";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Client />} />
      <Route path="/receiver" element={<Receiver />} />
      <Route path="/receiver/:uniqueID" element={<Receiver />} />
    </Routes>
  );
};

export default App;
