import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import TaskContext from "../../context/TaskContext";
import VoiceInput from "../VoiceInput/VoiceInput";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, addTask, updateTask } = useContext(TaskContext);

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
      } else {
        // Task not found, redirect to tasks list
        navigate("/tasks");
      }
    }
  }, [id, tasks, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleVoiceInput = (text) => {
    // Simple logic to determine which field to update based on text content
    if (
      text.toLowerCase().includes("title") ||
      text.toLowerCase().includes("name")
    ) {
      const nameMatch = text.match(
        /title|name(.*?)(?:description|status|priority|due date|due|tags|$)/i
      );
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        setFormData((prev) => ({ ...prev, name }));
      }
    } else if (text.toLowerCase().includes("description")) {
      const descMatch = text.match(
        /description(.*?)(?:status|priority|due date|due|tags|$)/i
      );
      if (descMatch && descMatch[1]) {
        const description = descMatch[1].trim();
        setFormData((prev) => ({ ...prev, description }));
      }
    } else {
      // Default to updating description if no specific field is mentioned
      setFormData((prev) => ({ ...prev, description: text }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

    if (id) {
      updateTask(id, taskData);
    } else {
      addTask(taskData);
    }

    // Redirect to tasks list
    navigate("/tasks");
  };

  return (
    <div className="bg-background-paper rounded-lg shadow-card p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Edit Task" : "Add New Task"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Task Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="Enter task name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-text-primary mb-1"
          >
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter task description"
            ></textarea>

            <button
              type="button"
              onClick={() => setIsUsingVoice(!isUsingVoice)}
              className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full hover:bg-primary-dark"
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

          {isUsingVoice && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <VoiceInput onResult={handleVoiceInput} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. work, personal, urgent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="px-4 py-2 border border-gray-300 rounded-md text-text-primary hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {id ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
