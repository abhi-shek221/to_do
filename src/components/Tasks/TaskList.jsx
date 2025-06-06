import React, { useContext, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TaskContext from "../../context/TaskContext";
import TaskItem from "./TaskItem";
import { isValidDate } from "../../utils/dateUtils";

const TaskList = () => {
  const { tasks } = useContext(TaskContext);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Safe date comparison helper
  const getDateTimeForComparison = (dateString) => {
    if (!isValidDate(dateString)) {
      return 0; // Return epoch time for invalid dates
    }
    return new Date(dateString).getTime();
  };

  // Validate and sanitize task data
  const sanitizeTask = (task) => {
    return {
      ...task,
      name:
        task.name && task.name.trim() !== ""
          ? task.name.trim()
          : "Untitled Task",
      description: task.description || "",
      status: task.status || "not_started",
      priority: task.priority || "medium",
      tags: Array.isArray(task.tags) ? task.tags : [],
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
      progress: typeof task.progress === "number" ? task.progress : 0,
    };
  };

  // Improved deduplication with better conflict resolution
  const uniqueTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", tasks);
      return [];
    }

    // Create a Map to remove duplicates based on ID
    const taskMap = new Map();

    console.log("Raw tasks:", tasks.length);

    tasks.forEach((task, index) => {
      if (!task || typeof task !== "object") {
        console.warn(`Invalid task at index ${index}:`, task);
        return;
      }

      if (!task.id) {
        console.warn("Task without ID found:", task);
        return;
      }

      // Sanitize task data before processing
      const sanitizedTask = sanitizeTask(task);

      if (taskMap.has(task.id)) {
        const existing = taskMap.get(task.id);

        // Better conflict resolution: prioritize the most recent updatedAt
        const existingTime = getDateTimeForComparison(existing.updatedAt);
        const newTime = getDateTimeForComparison(sanitizedTask.updatedAt);

        // If times are equal, prefer the one with more complete data
        if (
          newTime > existingTime ||
          (newTime === existingTime &&
            sanitizedTask.name !== "Untitled Task" &&
            existing.name === "Untitled Task")
        ) {
          taskMap.set(task.id, sanitizedTask);
          console.log(`Updated task ${task.id} with newer version`);
        } else {
          console.log(`Kept existing version of task ${task.id}`);
        }
      } else {
        taskMap.set(task.id, sanitizedTask);
      }
    });

    const uniqueTasksArray = Array.from(taskMap.values());
    console.log("Unique tasks:", uniqueTasksArray.length);

    return uniqueTasksArray;
  }, [tasks]);

  // Filter tasks based on selected filter and search query
  const filteredTasks = useMemo(() => {
    let filtered = [...uniqueTasks];

    console.log("Before filtering:", filtered.length);
    console.log("Filter applied:", filter);
    console.log("Search query:", searchQuery);

    // Apply status filter
    if (filter === "active") {
      filtered = filtered.filter((task) => task.status !== "completed");
    } else if (filter === "completed") {
      filtered = filtered.filter((task) => task.status === "completed");
    } else if (filter === "in_progress") {
      filtered = filtered.filter((task) => task.status === "in_progress");
    } else if (filter === "not_started") {
      filtered = filtered.filter((task) => task.status === "not_started");
    } else if (filter === "paused") {
      filtered = filtered.filter((task) => task.status === "paused");
    }

    console.log("After status filter:", filtered.length);

    // Apply search filter with safe string handling
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const beforeSearchFilter = filtered.length;
        filtered = filtered.filter(
          (task) =>
            (task.name && task.name.toLowerCase().includes(query)) ||
            (task.description &&
              task.description.toLowerCase().includes(query)) ||
            (task.tags &&
              Array.isArray(task.tags) &&
              task.tags.some(
                (tag) =>
                  tag &&
                  typeof tag === "string" &&
                  tag.toLowerCase().includes(query)
              ))
        );
        console.log(
          `After search filter: ${filtered.length} (was ${beforeSearchFilter})`
        );
      }
    }

    // Apply sorting with safe date handling
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            getDateTimeForComparison(b.createdAt) -
            getDateTimeForComparison(a.createdAt)
          );
        case "oldest":
          return (
            getDateTimeForComparison(a.createdAt) -
            getDateTimeForComparison(b.createdAt)
          );
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "priority_high": {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );
        }
        case "priority_low": {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          );
        }
        case "due_date": {
          const aHasDueDate = isValidDate(a.dueDate);
          const bHasDueDate = isValidDate(b.dueDate);

          if (!aHasDueDate && !bHasDueDate) return 0;
          if (!aHasDueDate) return 1;
          if (!bHasDueDate) return -1;

          return (
            getDateTimeForComparison(a.dueDate) -
            getDateTimeForComparison(b.dueDate)
          );
        }
        default:
          return 0;
      }
    });

    console.log("Final filtered tasks:", filtered.length);
    return filtered;
  }, [uniqueTasks, filter, sort, searchQuery]);

  // Compute task statistics using unique tasks
  const stats = useMemo(() => {
    const total = uniqueTasks.length;
    const completed = uniqueTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inProgress = uniqueTasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const notStarted = uniqueTasks.filter(
      (task) => task.status === "not_started"
    ).length;
    const paused = uniqueTasks.filter(
      (task) => task.status === "paused"
    ).length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      paused,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [uniqueTasks]);

  return (
    <div>
      {/* Tasks Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 ">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Your Tasks</h2>
        <Link
          to="/tasks/add"
          className="flex items-center px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Task
        </Link>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 ">
        <div className="bg-background-paper rounded-lg shadow-card p-3 text-center">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-background-paper rounded-lg shadow-card p-3 text-center">
          <p className="text-sm text-text-secondary">Completed</p>
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-background-paper rounded-lg shadow-card p-3 text-center">
          <p className="text-sm text-text-secondary">In Progress</p>
          <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-background-paper rounded-lg shadow-card p-3 text-center">
          <p className="text-sm text-text-secondary">Not Started</p>
          <p className="text-xl font-bold text-gray-600">{stats.notStarted}</p>
        </div>
        <div className="bg-background-paper rounded-lg shadow-card p-3 text-center">
          <p className="text-sm text-text-secondary">Completion</p>
          <p className="text-xl font-bold text-purple-600">
            {stats.completionRate}%
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-background-paper rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute left-3 top-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
              <option value="paused">Paused</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="priority_high">Priority (High-Low)</option>
              <option value="priority_low">Priority (Low-High)</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => {
            // Ensure task has all required properties before rendering
            if (!task.id) {
              console.error(`Task has no ID:`, task);
              return null;
            }

            return (
              <div
                key={task.id} // Use only task.id as the key
                className="bg-background-paper rounded-lg shadow-card"
              >
                <TaskItem task={task} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-background-paper rounded-lg shadow-card p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012 2h2a2 2 0 012-2"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-text-secondary mb-4">
            {searchQuery || filter !== "all"
              ? "Try changing your search or filter settings."
              : "Get started by adding your first task."}
          </p>
          {!searchQuery && filter === "all" && (
            <Link
              to="/tasks/add"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Task
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
