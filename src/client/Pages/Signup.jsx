import React from "react";
import Navbar from "../Components/Navbar";
import { FcGoogle } from "react-icons/fc";
import {
  AiFillFacebook,
  AiFillGithub,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid || !confirmPasswordValid) {
      console.error("Password or Confirm Password is not valid");
      return;
    }

    if (password !== confirmPassword) {
      console.error("Password and Confirm Password do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/signup", {
        email: email,
        password: password,
      });

      setPopupMessage("User has been created");
      // console.log(response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValid(validatePassword(newPassword));
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordValid(
      newConfirmPassword === password || newConfirmPassword === ""
    );
  };
  return (
    <>
      <Navbar />
      {popupMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[25rem] p-8 rounded shadow-lg flex items-center justify-center flex-col">
            <AiOutlineCheckCircle className="text-[6rem] text-green-600 animate-pulse" />
            <p className="text-2xl mt-6">{popupMessage}</p>
            <p className=" text-2xl">Sucessfully</p>
            <div className="mt-8">
              <Link to="/login">
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
            <h2 className="text-2xl font-semibold mb-4">Create an Account</h2>
            <form onSubmit={handleSubmit}>
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
                <div className="flex gap-2">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium"
                  >
                    Password
                  </label>
                  <span>
                    {password.length > 0 && !passwordValid && (
                      <p className="text-red-800 text-sm font-semibold">
                        (must contain at least 6 characters and a number)
                      </p>
                    )}
                  </span>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full py-2 px-3 rounded border focus:outline-none focus:border-primary"
                  placeholder="Your password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>

              {/* Confirm Password input */}
              <div className="mb-4">
                <div className="flex gap-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium"
                  >
                    Confirm Password
                  </label>
                  <span>
                    {" "}
                    {confirmPassword.length > 0 && !confirmPasswordValid && (
                      <p className="text-red-800 text-sm font-semibold">
                        (Passwords do not match)
                      </p>
                    )}
                  </span>
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full py-2 px-3 rounded border focus:outline-none focus:border-primary"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
              </div>

              {/* Sign Up button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Sign Up
              </button>
            </form>
            <div className=" flex justify-center mt-4">
              <span>
                Already have an account?{" "}
                <Link to="/login">
                  <span className=" text-blue-600 hover:text-blue-800 cursor-pointer">
                    Login
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

export default Signup;
