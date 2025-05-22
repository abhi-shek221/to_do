// src/components/Layout/Header.jsx
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
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-600 italic">{getRandomQuote()}</p>
        </div>

        <div className="flex space-x-4">
          {!(location.pathname === "/tasks/add") &&
            !location.pathname.includes("/tasks/edit") && (
              <Link
                to="/tasks/add"
                className="btn btn-primary flex items-center"
              >
                <span className="mr-1 text-lg">+</span> New Task
              </Link>
            )}

          {!(location.pathname === "/journal/add") &&
            !location.pathname.includes("/journal/edit") && (
              <Link
                to="/journal/add"
                className="btn btn-secondary flex items-center"
              >
                <span className="mr-1 text-lg">+</span> New Journal
              </Link>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
