// src/components/Dashboard/Dashboard.jsx
import React, { useContext } from "react";
import TaskContext from "../../context/TaskContext";
import TasksChart from "./TasksChart";
import GoalsProgress from "./GoalsProgress";
import MotivationCard from "./MotivationCard";

const Dashboard = () => {
  const { tasks, getTaskStats, getMonthlyTasks } = useContext(TaskContext);
  const stats = getTaskStats();
  const monthlyTasks = getMonthlyTasks();

  // Calculate completion rate
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Get recent tasks (last 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white">
          <h3 className="font-semibold text-gray-500">Total Tasks</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="card bg-white">
          <h3 className="font-semibold text-gray-500">Completed</h3>
          <p className="text-3xl font-bold text-success-main">
            {stats.completed}
          </p>
        </div>

        <div className="card bg-white">
          <h3 className="font-semibold text-gray-500">In Progress</h3>
          <p className="text-3xl font-bold text-warning-main">
            {stats.inProgress}
          </p>
        </div>

        <div className="card bg-white">
          <h3 className="font-semibold text-gray-500">Completion Rate</h3>
          <p className="text-3xl font-bold text-primary-main">
            {completionRate}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white">
          <h2 className="font-bold text-xl mb-4">Task Status Overview</h2>
          <TasksChart />
        </div>

        <div className="card bg-white">
          <h2 className="font-bold text-xl mb-4">Goal Progress</h2>
          <GoalsProgress />
        </div>
      </div>

      {/* Recent Tasks & Motivation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-white lg:col-span-2">
          <h2 className="font-bold text-xl mb-4">Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center p-3 border rounded-lg"
                >
                  <div className="flex-grow">
                    <h3 className="font-medium">{task.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`badge ${
                        task.status === "completed"
                          ? "badge-success"
                          : task.status === "in_progress"
                          ? "badge-warning"
                          : "bg-gray-200"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No tasks yet. Add some to get started!
            </p>
          )}
        </div>

        <div className="card bg-primary-light text-white">
          <MotivationCard />
        </div>
      </div>

      {/* Monthly Task Overview */}
      <div className="card bg-white">
        <h2 className="font-bold text-xl mb-4">Monthly Task Overview</h2>
        {Object.keys(monthlyTasks).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monthlyTasks).map(([month, tasks]) => (
              <div key={month} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">{month}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Total: {tasks.length} tasks
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-main"
                    style={{
                      width: `${
                        (tasks.filter((t) => t.status === "completed").length /
                          tasks.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No monthly data available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
