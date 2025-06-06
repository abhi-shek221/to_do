// src/components/Dashboard/TasksChart.jsx
import React, { useContext, useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import TaskContext from "../../context/TaskContext";
import { format, subDays, eachDayOfInterval } from "date-fns";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const TasksChart = () => {
  const { tasks } = useContext(TaskContext);
  const [chartType, setChartType] = useState("doughnut"); // 'doughnut' or 'bar'

  // Memoized task counts for better performance
  const taskCounts = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        paused: 0,
        total: 0,
      };
    }

    const counts = {
      completed: tasks.filter((task) => task.status === "completed").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      notStarted: tasks.filter((task) => task.status === "not_started").length,
      paused: tasks.filter((task) => task.status === "paused").length,
      total: tasks.length,
    };

    return counts;
  }, [tasks]);

  // Enhanced color scheme
  const colors = {
    completed: {
      bg: "rgba(34, 197, 94, 0.8)",
      border: "rgba(34, 197, 94, 1)",
      light: "rgba(34, 197, 94, 0.2)",
    },
    inProgress: {
      bg: "rgba(59, 130, 246, 0.8)",
      border: "rgba(59, 130, 246, 1)",
      light: "rgba(59, 130, 246, 0.2)",
    },
    notStarted: {
      bg: "rgba(156, 163, 175, 0.8)",
      border: "rgba(156, 163, 175, 1)",
      light: "rgba(156, 163, 175, 0.2)",
    },
    paused: {
      bg: "rgba(245, 158, 11, 0.8)",
      border: "rgba(245, 158, 11, 1)",
      light: "rgba(245, 158, 11, 0.2)",
    },
  };


  // Get last 7 days data with better error handling
  const barChartData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return null;
    }

    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);

    const dateRange = eachDayOfInterval({
      start: sevenDaysAgo,
      end: today,
    });

    const tasksByDay = {};

    // Initialize all days
    dateRange.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      tasksByDay[dateKey] = {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        paused: 0,
      };
    });

    // Count tasks by day based on creation date
    tasks.forEach((task) => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null;
      if (taskDate) {
        const dateKey = format(taskDate, "yyyy-MM-dd");
        if (tasksByDay[dateKey]) {
          const status = task.status || "not_started";
          if (tasksByDay[dateKey][status] !== undefined) {
            tasksByDay[dateKey][status]++;
          }
        }
      }
    });

    return {
      labels: dateRange.map((date) => format(date, "EEE, MMM d")),
      datasets: [
        {
          label: "Completed",
          data: Object.values(tasksByDay).map((day) => day.completed),
          backgroundColor: colors.completed.bg,
          borderColor: colors.completed.border,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "In Progress",
          data: Object.values(tasksByDay).map((day) => day.inProgress),
          backgroundColor: colors.inProgress.bg,
          borderColor: colors.inProgress.border,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Paused",
          data: Object.values(tasksByDay).map((day) => day.paused),
          backgroundColor: colors.paused.bg,
          borderColor: colors.paused.border,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Not Started",
          data: Object.values(tasksByDay).map((day) => day.notStarted),
          backgroundColor: colors.notStarted.bg,
          borderColor: colors.notStarted.border,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [tasks, colors.completed.bg, colors.completed.border, colors.inProgress.bg, colors.inProgress.border, colors.notStarted.bg, colors.notStarted.border, colors.paused.bg, colors.paused.border]);

  // Enhanced doughnut chart data
  const doughnutData = useMemo(() => {
    const data = [
      taskCounts.completed,
      taskCounts.inProgress,
      taskCounts.paused,
      taskCounts.notStarted,
    ];
    const labels = ["Completed", "In Progress", "Paused", "Not Started"];
    const backgroundColors = [
      colors.completed.bg,
      colors.inProgress.bg,
      colors.paused.bg,
      colors.notStarted.bg,
    ];
    const borderColors = [
      colors.completed.border,
      colors.inProgress.border,
      colors.paused.border,
      colors.notStarted.border,
    ];

    // Filter out zero values for cleaner display
    const filteredData = [];
    const filteredLabels = [];
    const filteredBgColors = [];
    const filteredBorderColors = [];

    data.forEach((value, index) => {
      if (value > 0) {
        filteredData.push(value);
        filteredLabels.push(labels[index]);
        filteredBgColors.push(backgroundColors[index]);
        filteredBorderColors.push(borderColors[index]);
      }
    });

    return {
      labels: filteredLabels,
      datasets: [
        {
          data: filteredData,
          backgroundColor: filteredBgColors,
          borderColor: filteredBorderColors,
          borderWidth: 2,
          hoverBackgroundColor: filteredBgColors.map((color) =>
            color.replace("0.8", "0.9")
          ),
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [taskCounts]);

  // Enhanced chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / taskCounts.total) * 100).toFixed(
                  1
                );
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const percentage = ((value / taskCounts.total) * 100).toFixed(1);
            return `${label}: ${value} tasks (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Tasks Created in Last 7 Days",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          afterLabel: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total > 0) {
              return `Total for this day: ${total} tasks`;
            }
            return null;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Number of Tasks",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };

  // Loading state
  if (!tasks) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Chart Type Toggle */}
      <div className="mb-4 flex justify-between items-center ">
        <div className="text-sm text-gray-600">
          Total Tasks: <span className="font-semibold">{taskCounts.total}</span>
        </div>
        <div
          className="inline-flex rounded-lg shadow-sm border border-gray-200"
          role="group"
        >
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border-r border-gray-200 transition-colors ${
              chartType === "doughnut"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setChartType("doughnut")}
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 3.314-2.686 6-6 6a6 6 0 01-5.668-7.973z"
                clipRule="evenodd"
              />
            </svg>
            Status
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              chartType === "bar"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setChartType("bar")}
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Timeline
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80 bg-gray-50 rounded-lg p-4">
        {taskCounts.total === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Tasks Yet
            </h3>
            <p className="text-gray-500 max-w-sm">
              Create your first task to see visual insights about your
              productivity and progress.
            </p>
          </div>
        ) : chartType === "doughnut" ? (
          <div className="h-full">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        ) : (
          <div className="h-full">
            {barChartData ? (
              <Bar data={barChartData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No timeline data available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {taskCounts.total > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-700">
              {taskCounts.completed}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-700">
              {taskCounts.inProgress}
            </div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-700">
              {taskCounts.paused}
            </div>
            <div className="text-xs text-yellow-600">Paused</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-lg font-bold text-gray-700">
              {taskCounts.notStarted}
            </div>
            <div className="text-xs text-gray-600">Not Started</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksChart;
