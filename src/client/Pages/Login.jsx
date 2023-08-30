import React from "react";
import Navbar from "../Components/Navbar";
import { FcGoogle } from "react-icons/fc";
import {
  AiFillCheckCircle,
  AiFillFacebook,
  AiFillGithub,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email: email,
        password: password,
      });

      if (response.data.message === "Login successful") {
        // Set user information in localStorage
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userId", response.data.userId); // Store the userId
        setLoginMessage("Login successful!");
        setShowSuccessPopup(true);
        setShowErrorPopup(false);
      } else {
        setLoginMessage("Login failed. Please check your credentials.");
        setShowSuccessPopup(false);
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginMessage("Invalid Email or Password");
      setShowSuccessPopup(false);
      setShowErrorPopup(true);
    }
  };

  return (
    <>
      <Navbar />
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[25rem] p-8 rounded shadow-lg flex items-center justify-center flex-col">
            {/* Success icon */}
            <AiFillCheckCircle className="text-[6rem] text-green-600 animate-pulse" />
            <p className="text-2xl mt-6">{loginMessage}</p>
            {/* OK button */}
            <div className="mt-8">
              <Link to="/">
                <button className="bg-blue-600 text-white w-[3.5rem] h-[2.5rem] rounded text-[1.2rem] font-semibold hover:bg-blue-800">
                  OK
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 mt-5">
        <div className=" mx-auto border shadow-md w-[30rem]">
          <div className=" m-8">
            <h2 className="text-2xl font-semibold mb-4">
              Login to your Account
            </h2>
            <form onSubmit={handleLogin}>
              {/* Email input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full py-2 px-3 rounded border focus:outline-none"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password input */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full py-2 px-3 rounded border focus:outline-none focus:border-primary"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {showErrorPopup && (
                <p className="text-red-600 text-center mt-4 mb-4 font-semibold">
                  {loginMessage}
                </p>
              )}

              {/* Sign Up button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded "
              >
                Login
              </button>
            </form>
            <div className=" flex justify-center mt-4">
              <span>
                Dont have an Account?{" "}
                <Link to="/signup">
                  <span className=" text-blue-600 hover:text-blue-800 cursor-pointer">
                    Signup
                  </span>
                </Link>
              </span>
            </div>

            {/* Social media sign in */}
            <div className="mt-4">
              <p className="text-center text-sm">Or sign up with</p>
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  className="mx-2  rounded p-2 hover:scale-110 "
                >
                  <FcGoogle className=" text-3xl" />
                </button>
                <button
                  type="button"
                  className="mx-2   rounded p-2 hover:scale-110"
                >
                  <AiFillGithub className=" text-3xl" />
                </button>
                <button
                  type="button"
                  className="mx-2  rounded p-2 hover:scale-110"
                >
                  <AiFillFacebook className=" text-3xl text-blue-800" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
