import React from "react";

const Navbar = () => {
  return (
    <nav className=" flex justify-between p-6">
      <div className="flex flex-col cursor-pointer">
        <span className=" text-2xl font-bold text-gray-700 hover:text-gray-800">
          EasyShare
        </span>
        <span className=" text-sm text-gray-500 hover:text-gray-600">
          Share your File Easily
        </span>
      </div>
      <div className="flex gap-4">
        <button className=" border rounded-md text-gray-600 h-[3rem] w-[5rem] hover:bg-gray-600 hover:text-white">
          Sign up
        </button>
        <button className=" border border-blue-500 text-blue-600 rounded-md h-[3rem] w-[5rem] hover:bg-blue-600 hover:text-white">
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
