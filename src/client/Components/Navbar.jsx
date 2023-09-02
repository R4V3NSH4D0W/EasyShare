import React from "react";
import { Link } from "react-router-dom";
import userimage from "../../assets/user.png";
import { useState } from "react";
const Navbar = () => {
  const userId = localStorage.getItem("userId");
  const [showOptions, setShowOptions] = useState(false);
  const handleImageClick = () => {
    setShowOptions(!showOptions);
  };
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setShowOptions(false);
  };
  return (
    <nav className="flex justify-between p-6">
      <div className="flex flex-col cursor-pointer">
        <Link to="/">
          <span className="text-2xl font-bold text-gray-700 hover:text-gray-800">
            EasySent
          </span>
        </Link>
        <span className="text-sm text-gray-500 hover:text-gray-600">
          Share your File Easily
        </span>
      </div>
      <div className="flex gap-4 ">
        {userId ? (
          <div>
            <img
              src={userimage}
              alt="Profile"
              className="w-[2.5rem] h-[2.5rem] rounded-full cursor-pointer shadow-lg hover:scale-125"
              onClick={handleImageClick}
            />
            {showOptions && (
              <div className="absolute right-0 mt-2 mr-2 w-[10rem] bg-white rounded shadow-lg border">
                <Link to="/userprofile">
                  <button
                    className="block w-full py-2 px-4 text-left hover:bg-gray-100"
                    onClick={() => setShowOptions(false)}
                  >
                    User Profile
                  </button>
                </Link>
                <hr />
                <Link to="/">
                  <button
                    className="block w-full py-2 px-4 text-left hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/signup">
              <button className="border rounded-md text-gray-600 h-[3rem] w-[5rem] hover:bg-gray-600 hover:text-white">
                Sign up
              </button>
            </Link>
            <Link to="/login">
              <button className="border border-blue-500 text-blue-600 rounded-md h-[3rem] w-[5rem] hover:bg-blue-600 hover:text-white">
                Login
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
