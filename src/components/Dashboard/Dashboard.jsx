// src/components/Dashboard/Dashboard.jsx
import React, { useContext, useMemo } from "react";
import TaskContext from "../../context/TaskContext";
import TasksChart from "./TasksChart";
import GoalsProgress from "./GoalsProgress";
import MotivationCard from "./MotivationCard";

const Dashboard = () => {
  const { tasks, getTaskStats, getMonthlyTasks } = useContext(TaskContext);

  // Memoize calculations for better performance
  const stats = useMemo(() => {
    if (getTaskStats) {
      return getTaskStats();
    }

    // Fallback calculation if getTaskStats is not available
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "completed").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      notStarted: tasks.filter((task) => task.status === "not_started").length,
      paused: tasks.filter((task) => task.status === "paused").length,
    };

    return taskStats;
  }, [tasks, getTaskStats]);

  const monthlyTasks = useMemo(() => {
    if (getMonthlyTasks) {
      return getMonthlyTasks();
    }

    // Fallback calculation for monthly tasks
    const monthly = {};
    tasks.forEach((task) => {
      if (task.createdAt) {
        const date = new Date(task.createdAt);
        const monthKey = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });

        if (!monthly[monthKey]) {
          monthly[monthKey] = [];
        }
        monthly[monthKey].push(task);
      }
    });

    return monthly;
  }, [tasks, getMonthlyTasks]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    return stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
  }, [stats.completed, stats.total]);

  // Get recent tasks (last 5)
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || Date.now());
        const dateB = new Date(b.createdAt || b.updatedAt || Date.now());
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [tasks]);

  // Get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      not_started: "Not Started",
      in_progress: "In Progress",
      completed: "Completed",
      paused: "Paused",
    };
    return statusMap[status] || status;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const classes = {
      completed: "bg-green-100 text-green-800 border-green-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paused: "bg-orange-100 text-orange-800 border-orange-200",
      not_started: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return classes[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6 p-6 bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-500 to-indigo-200">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total Tasks
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Completed
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.completed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                In Progress
              </h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.inProgress}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {completionRate}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Task Status Overview
          </h2>
          <TasksChart />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Goal Progress
          </h2>
          <GoalsProgress />
        </div>
      </div>

      {/* Recent Tasks & Motivation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {task.name}
                    </h3>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span>
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString()
                          : "No date"}
                      </span>
                      {task.priority && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                        task.status
                      )}`}
                    >
                      {getStatusDisplay(task.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="mt-2 text-gray-500">
                No tasks yet. Add some to get started!
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
          <MotivationCard />
        </div>
      </div>

      {/* Monthly Task Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Monthly Task Overview
        </h2>
        {Object.keys(monthlyTasks).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(monthlyTasks)
              .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date descending
              .slice(0, 6) // Show only last 6 months
              .map(([month, monthTasks]) => {
                const completedCount = monthTasks.filter(
                  (t) => t.status === "completed"
                ).length;
                const completionPercentage =
                  monthTasks.length > 0
                    ? Math.round((completedCount / monthTasks.length) * 100)
                    : 0;

                return (
                  <div
                    key={month}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-lg text-gray-900">
                      {month}
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total: {monthTasks.length} tasks</span>
                        <span>Completed: {completedCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {completionPercentage}% complete
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a4 4 0 118 0v4m-4 15a4 4 0 110-8h0a4 4 0 110 8h0z"
              />
            </svg>
            <p className="mt-2 text-gray-500">
              No monthly data available yet. Start adding tasks to see your
              progress over time!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
