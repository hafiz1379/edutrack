import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/dashboard/classes", label: "Classes", icon: "fas fa-chalkboard" },
    {
      path: "/dashboard/students",
      label: "Students",
      icon: "fas fa-user-graduate",
    },
    {
      path: "/dashboard/teachers",
      label: "Teachers",
      icon: "fas fa-chalkboard-teacher",
    },
    {
      path: "/dashboard/fees",
      label: "Fee Payments",
      icon: "fas fa-money-bill-wave",
    },
    {
      path: "/dashboard/salaries",
      label: "Teacher Salaries",
      icon: "fas fa-money-check-alt",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Fixed Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-30 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">
              School Management
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        <nav className="mt-5 px-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {auth.role === "super" ? "S" : "A"}
                </span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {auth.role === "super" ? "Super Admin" : "Sub Admin"}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Navigation */}
        <header className="bg-white shadow-sm fixed top-0 right-0 left-0 z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {menuItems.find((item) => isActive(item.path))?.label ||
                  "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538.214 1.055.595 1.436L4 17h5m6 0v1m3-12h3m-3 0h-3"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="relative">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.573 1.066c-.94 1.543.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065a1.724 1.724 0 00-1.065-2.572c1.756-.426 1.756-2.924 0-3.35a1.724 1.724 0 00-2.573-1.066c-.94-1.543.826-3.31 2.37-2.37.996-.608 2.296-.07 2.572 1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {auth.role === "super" ? "S" : "A"}
                  </span>
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {auth.role === "super" ? "Super Admin" : "Sub Admin"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-20">
          {" "}
          {/* Added pt-20 to account for fixed header */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
