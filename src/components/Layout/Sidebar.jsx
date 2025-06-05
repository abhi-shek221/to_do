import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define navigation items
  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      path: "/journal",
      label: "Journal",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
  ];

  // FIXED: Better isActive function
  const isActive = (path) => {
    // Exact match for dashboard
    if (path === "/") {
      return location.pathname === "/";
    }

    // For other paths, check if current path starts with the nav path
    return location.pathname.startsWith(path);
  };

  // Debug: Add console log to see current path
  console.log("Current path:", location.pathname);
  console.log("Sidebar collapsed:", isCollapsed);

  return (
    <div
      className={`bg-gradient-to-b from-orange-300 to-sky-300 border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-48"
      } min-h-screen flex flex-col flex-shrink-0`}
      // ADDED: flex-shrink-0 to prevent sidebar from shrinking
    >
      {/* Sidebar Header */}
      <div className="h-20 flex items-center justify-between px-4 bg-gradient-to-t  from-orange-300 to-sky-300">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 m-5">
            <div className="w-10 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r mt-5  from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Task Tracker
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-all duration-300 ${
              isCollapsed ? "transform rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`group flex items-center py-3 px-3 rounded-xl transition-all duration-200 ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:transform hover:scale-105"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <div
                  className={`${
                    isActive(item.path)
                      ? "text-white"
                      : "group-hover:text-blue-600"
                  } transition-colors duration-200`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="font-medium text-sm tracking-wide">
                    {item.label}
                  </span>
                )}
                {!isCollapsed && isActive(item.path) && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-sm text-gray-900 mb-2">Stay productive!</p>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 w-full">
              <p className="text-xs text-gray-900 font-medium">
                ✨ Keep going strong
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
