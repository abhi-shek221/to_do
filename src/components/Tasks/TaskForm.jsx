import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import TaskContext from "../../context/TaskContext";
import VoiceInput from "../VoiceInput/VoiceInput";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, loading, error, clearError } =
    useContext(TaskContext);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "not_started",
    priority: "medium",
    dueDate: "",
    tags: "",
  });

  const [errors, setErrors] = useState({});
  const [isUsingVoice, setIsUsingVoice] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState("description");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear any existing errors when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Load task data if editing
  useEffect(() => {
    if (id) {
      const task = tasks.find((task) => task.id === id);

      if (task) {
        setFormData({
          name: task.name,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
            ? format(new Date(task.dueDate), "yyyy-MM-dd")
            : "",
          tags: task.tags ? task.tags.join(", ") : "",
        });
      } else if (!loading) {
        // Task not found and not loading, redirect to tasks list
        navigate("/tasks");
      }
    }
  }, [id, tasks, navigate, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleVoiceInput = (text) => {
    if (!text || !text.trim()) return;

    const cleanText = text.trim();

    // Enhanced voice input processing with better field detection
    if (activeVoiceField === "name") {
      setFormData((prev) => ({ ...prev, name: cleanText }));
    } else if (activeVoiceField === "description") {
      setFormData((prev) => ({ ...prev, description: cleanText }));
    } else {
      // Smart field detection based on keywords
      const lowerText = cleanText.toLowerCase();

      if (
        lowerText.includes("title") ||
        lowerText.includes("name") ||
        lowerText.includes("task name")
      ) {
        // Extract task name
        const namePatterns = [
          /(?:title|name|task name)(?:\s+is)?\s*[:.]?\s*(.+?)(?:\.|$)/i,
          /^(.+?)(?:\s+(?:description|desc|details))/i,
        ];

        for (const pattern of namePatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            setFormData((prev) => ({ ...prev, name: match[1].trim() }));
            return;
          }
        }
      }

      if (
        lowerText.includes("description") ||
        lowerText.includes("details") ||
        lowerText.includes("about")
      ) {
        // Extract description
        const descPatterns = [
          /(?:description|details|about)(?:\s+is)?\s*[:.]?\s*(.+)/i,
          /^(.+?)(?:\s+(?:priority|status|due))/i,
        ];

        for (const pattern of descPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            setFormData((prev) => ({ ...prev, description: match[1].trim() }));
            return;
          }
        }
      }

      if (lowerText.includes("priority")) {
        // Extract priority
        if (lowerText.includes("urgent")) {
          setFormData((prev) => ({ ...prev, priority: "urgent" }));
        } else if (lowerText.includes("high")) {
          setFormData((prev) => ({ ...prev, priority: "high" }));
        } else if (lowerText.includes("low")) {
          setFormData((prev) => ({ ...prev, priority: "low" }));
        } else if (lowerText.includes("medium")) {
          setFormData((prev) => ({ ...prev, priority: "medium" }));
        }
        return;
      }

      if (lowerText.includes("status")) {
        // Extract status
        if (lowerText.includes("completed") || lowerText.includes("done")) {
          setFormData((prev) => ({ ...prev, status: "completed" }));
        } else if (
          lowerText.includes("in progress") ||
          lowerText.includes("working")
        ) {
          setFormData((prev) => ({ ...prev, status: "in_progress" }));
        } else if (
          lowerText.includes("paused") ||
          lowerText.includes("on hold")
        ) {
          setFormData((prev) => ({ ...prev, status: "paused" }));
        } else if (lowerText.includes("not started")) {
          setFormData((prev) => ({ ...prev, status: "not_started" }));
        }
        return;
      }

      // Default to updating the active field or description
      setFormData((prev) => ({
        ...prev,
        [activeVoiceField]: cleanText,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (formData.name.trim().length > 100) {
      newErrors.name = "Task name must be less than 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear any previous errors

    // Process tags from comma-separated string to array
    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : [];

    const taskData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate).toISOString()
        : null,
      tags: tagsArray,
    };

    try {
      if (id) {
        await updateTask(id, taskData);
      } else {
        await addTask(taskData);
      }

      // Redirect to tasks list on success
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving task:", error);
      setErrors({ submit: "Error saving task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner if data is loading
  if (loading && id) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 m-14 max-w-2xl mx-auto">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading task...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-14 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {id ? "Edit Task" : "Add New Task"}
      </h2>

      {/* Display global error from context */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Display form submission error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Name*
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter task name"
              maxLength={100}
            />
            <button
              type="button"
              onClick={() => {
                setActiveVoiceField("name");
                setIsUsingVoice(!isUsingVoice);
              }}
              disabled={isSubmitting}
              className="absolute right-2 top-2 p-1 text-gray-400 hover:text-blue-500 transition-colors disabled:cursor-not-allowed"
              title="Use voice input for task name"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.name.length}/100 characters
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              className={`w-full px-3 py-2 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter task description"
              maxLength={500}
            ></textarea>

            <button
              type="button"
              onClick={() => {
                setActiveVoiceField("description");
                setIsUsingVoice(!isUsingVoice);
              }}
              disabled={isSubmitting}
              className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 disabled:cursor-not-allowed ${
                isUsingVoice && activeVoiceField === "description"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title="Use voice input for description"
            >
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>

          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>

          {isUsingVoice && !isSubmitting && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-800">
                  Voice Input for{" "}
                  {activeVoiceField === "name" ? "Task Name" : "Description"}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsUsingVoice(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <VoiceInput onResult={handleVoiceInput} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter tags separated by commas"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors ${
              isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {id ? "Updating..." : "Adding..."}
              </div>
            ) : id ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            disabled={isSubmitting}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
