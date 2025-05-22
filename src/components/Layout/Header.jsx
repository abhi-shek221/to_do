import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import TaskContext from "../../context/TaskContext";

const Header = () => {
  const location = useLocation();
  const { getRandomQuote } = useContext(TaskContext);

  // Generate page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";
    if (path === "/tasks") return "My Tasks";
    if (path.includes("/tasks/add")) return "Add New Task";
    if (path.includes("/tasks/edit")) return "Edit Task";
    if (path === "/journal") return "Journal Entries";
    if (path.includes("/journal/add")) return "New Journal Entry";
    if (path.includes("/journal/edit")) return "Edit Journal Entry";

    return "Task Tracker";
  };

  return (
    <header className="bg-gradient-to-l from-gray-400 via-gray-600 to-blue-300 border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Page title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {getPageTitle()}
            </h1>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-lg px-4 py-2 max-w-2xl">
              <p className="text-sm text-gray-700 italic">{getRandomQuote()}</p>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex space-x-3">
            {!(location.pathname === "/tasks/add") &&
              !location.pathname.includes("/tasks/edit") && (
                <Link
                  to="/tasks/add"
                  className="flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                >
                  <span className="mr-2 text-lg">+</span>
                  New Task
                </Link>
              )}

            {!(location.pathname === "/journal/add") &&
              !location.pathname.includes("/journal/edit") && (
                <Link
                  to="/journal/add"
                  className="flex items-center px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-sm"
                >
                  <span className="mr-2 text-lg">+</span>
                  New Journal
                </Link>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
