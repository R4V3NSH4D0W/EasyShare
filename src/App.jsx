import React from "react";
import { Routes, Route } from "react-router-dom";
import Client from "./client/Client";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Client />} />
    </Routes>
  );
};

export default App;
