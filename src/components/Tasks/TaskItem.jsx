import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow, isValid } from "date-fns";
import TaskContext from "../../context/TaskContext";

const TaskItem = ({ task }) => {
  const { updateTaskStatus, deleteTask } = useContext(TaskContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = (e) => {
    updateTaskStatus(task.id, e.target.value);
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    deleteTask(task.id);
    setIsDeleting(false);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  // Get task status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "not_started":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
      default:
        return "bg-green-100 text-green-800";
    }
  };

  // Safe date formatting helper
  const formatSafeDate = (dateValue, formatFn, fallback = "Unknown") => {
    if (!dateValue) return fallback;

    const date = new Date(dateValue);
    if (!isValid(date)) return fallback;

    try {
      return formatFn(date);
    } catch (error) {
      console.warn("Date formatting error:", error, "for value:", dateValue);
      return fallback;
    }
  };

  return (
    <div className="bg-background-paper rounded-lg shadow-card p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Task Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={task.status === "completed"}
            onChange={(e) =>
              updateTaskStatus(
                task.id,
                e.target.checked ? "completed" : "not_started"
              )
            }
            className="h-5 w-5 text-primary"
          />
          <h3
            className={`font-semibold ${
              task.status === "completed"
                ? "line-through text-text-disabled"
                : "text-text-primary"
            }`}
          >
            {task.name}
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link
                  to={`/tasks/edit/${task.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <div className="mb-3 text-sm text-text-secondary">
          <p>{task.description}</p>
        </div>
      )}

      {/* Task Details */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            task.status
          )}`}
        >
          {task.status?.replace("_", " ") || "unknown"}
        </span>

        <span
          className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority || "low"}
        </span>

        {task.dueDate && (
          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
            Due:{" "}
            {formatSafeDate(
              task.dueDate,
              (date) => format(date, "MMM d, yyyy"),
              "Invalid date"
            )}
          </span>
        )}
      </div>

      {/* Task Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
        <div>
          Created:{" "}
          {formatSafeDate(
            task.createdAt,
            (date) => formatDistanceToNow(date, { addSuffix: true }),
            "Unknown"
          )}
        </div>

        <div>
          <select
            value={task.status || "not_started"}
            onChange={handleStatusChange}
            className="text-xs border border-gray-300 rounded py-0.5 px-1"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
            <p className="mb-4">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-text-primary hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
