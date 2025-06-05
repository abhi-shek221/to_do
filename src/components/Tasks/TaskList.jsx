import React, { useContext, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TaskContext from "../../context/TaskContext";
import TaskItem from "./TaskItem";

const TaskList = () => {
  const { tasks } = useContext(TaskContext);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on selected filter and search query
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

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

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          (task.description &&
            task.description.toLowerCase().includes(query)) ||
          (task.tags &&
            task.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sort === "name_asc") {
        return a.name.localeCompare(b.name);
      } else if (sort === "name_desc") {
        return b.name.localeCompare(a.name);
      } else if (sort === "priority_high") {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sort === "priority_low") {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sort === "due_date") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

    return filtered;
  }, [tasks, filter, sort, searchQuery]);

  // Compute task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inProgress = tasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const notStarted = tasks.filter(
      (task) => task.status === "not_started"
    ).length;
    const paused = tasks.filter((task) => task.status === "paused").length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      paused,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  return (
    <div>
      {/* Tasks Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 ">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Your Tasks</h2>
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
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
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
