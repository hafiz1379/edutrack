import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">EduTrack</h1>
          <Link
            to="/login"
            className="bg-white text-blue-600 px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
          Welcome to EduTrack
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8">
          Your all-in-one school management platform to track classes, students, teachers, and more — all in one place.
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
        >
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} EduTrack. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
