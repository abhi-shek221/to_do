// src/components/Dashboard/GoalsProgress.jsx
import React, { useContext, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import TaskContext from "../../context/TaskContext";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GoalsProgress = () => {
  const { tasks } = useContext(TaskContext);
  const [selectedPeriod, setSelectedPeriod] = useState("6month"); // '3month', '6month', 'daily'

  // Calculate data based on selected time period
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return null;
    }

    // Check if tasks have completedAt field, otherwise use createdAt or updatedAt
    const hasCompletedAt = tasks.some((task) => task.completedAt);
    const hasUpdatedAt = tasks.some((task) => task.updatedAt);

    // Determine what date field to use
    let dateField = "createdAt";
    if (hasCompletedAt) {
      dateField = "completedAt";
    } else if (hasUpdatedAt) {
      dateField = "updatedAt";
    }

    const today = new Date();

    if (selectedPeriod === "daily") {
      // Daily view for last 14 days
      const twoWeeksAgo = subDays(today, 13);
      const dateRange = eachDayOfInterval({
        start: twoWeeksAgo,
        end: today,
      });

      const dailyCompletedTasks = dateRange.map((date) => {
        const formattedDate = format(date, "yyyy-MM-dd");
        return tasks.filter((task) => {
          if (task.status !== "completed") return false;

          const taskDate = task[dateField] ? new Date(task[dateField]) : null;
          const taskDateFormatted = taskDate
            ? format(taskDate, "yyyy-MM-dd")
            : null;

          return taskDateFormatted === formattedDate;
        }).length;
      });

      const cumulativeCompletions = [];
      let runningTotal = 0;
      dailyCompletedTasks.forEach((count) => {
        runningTotal += count;
        cumulativeCompletions.push(runningTotal);
      });

      return {
        labels: dateRange.map((date) => format(date, "MMM d")),
        datasets: [
          {
            label: "Daily Completed Tasks",
            data: dailyCompletedTasks,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderColor: "rgba(99, 102, 241, 1)",
            pointBackgroundColor: "rgba(99, 102, 241, 1)",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowBlur: 10,
            shadowColor: "rgba(99, 102, 241, 0.3)",
          },
          {
            label: "Cumulative Progress",
            data: cumulativeCompletions,
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            borderColor: "rgba(16, 185, 129, 1)",
            pointBackgroundColor: "rgba(16, 185, 129, 1)",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 3,
            borderDash: [8, 4],
            fill: true,
            tension: 0.4,
          },
        ],
        isDaily: true,
        totalCompleted: runningTotal,
      };
    }

    // Monthly view (3 or 6 months)
    const monthsToShow = selectedPeriod === "3month" ? 2 : 5; // 0-2 = 3 months, 0-5 = 6 months
    const monthsAgo = subMonths(startOfMonth(today), monthsToShow);

    const monthRange = eachMonthOfInterval({
      start: monthsAgo,
      end: today,
    });

    // Calculate completed tasks per month
    const monthlyCompletedTasks = monthRange.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);

      return tasks.filter((task) => {
        if (task.status !== "completed") return false;

        const taskDate = task[dateField] ? new Date(task[dateField]) : null;
        if (!taskDate) return false;

        return taskDate >= monthStart && taskDate <= monthEnd;
      }).length;
    });

    // Calculate total tasks created per month
    const monthlyTotalTasks = monthRange.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);

      return tasks.filter((task) => {
        const taskDate = task.createdAt
          ? new Date(task.createdAt)
          : task.updatedAt
          ? new Date(task.updatedAt)
          : null;
        if (!taskDate) return false;

        return taskDate >= monthStart && taskDate <= monthEnd;
      }).length;
    });

    // Calculate completion rate per month
    const monthlyCompletionRate = monthRange.map((_, index) => {
      const completed = monthlyCompletedTasks[index];
      const total = monthlyTotalTasks[index];
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    // Calculate goal achievement (assuming 80% completion rate is the goal)
    const monthlyGoalAchievement = monthlyCompletionRate.map(
      (rate) => Math.min(rate, 100) // Cap at 100%
    );

    return {
      labels: monthRange.map((date) => format(date, "MMM yyyy")),
      datasets: [
        {
          label: "Completed Tasks",
          data: monthlyCompletedTasks,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "rgba(99, 102, 241, 1)",
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          yAxisID: "y",
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          shadowBlur: 8,
          shadowColor: "rgba(99, 102, 241, 0.2)",
        },
        {
          label: "Completion Rate",
          data: monthlyCompletionRate,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "rgba(16, 185, 129, 1)",
          pointBackgroundColor: "rgba(16, 185, 129, 1)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          shadowBlur: 8,
          shadowColor: "rgba(16, 185, 129, 0.2)",
        },
        {
          label: "Goal Achievement",
          data: monthlyGoalAchievement,
          backgroundColor: "rgba(245, 101, 101, 0.05)",
          borderColor: "rgba(245, 101, 101, 1)",
          pointBackgroundColor: "rgba(245, 101, 101, 1)",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
      isDaily: false,
      monthlyData: {
        completed: monthlyCompletedTasks,
        total: monthlyTotalTasks,
        rate: monthlyCompletionRate,
        goalAchievement: monthlyGoalAchievement,
      },
    };
  }, [tasks, selectedPeriod]);

  // Enhanced chart options with better aesthetics
  const chartOptions = useMemo(() => {
    if (!chartData) return {};

    const maxCompleted = Math.max(...(chartData.datasets[0]?.data || [0]), 5);

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          titleColor: "#f9fafb",
          bodyColor: "#f3f4f6",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              if (label.includes("Rate") || label.includes("Achievement")) {
                return `${label}: ${value}%`;
              }
              return `${label}: ${value} tasks`;
            },
            beforeLabel: function (context) {
              if (
                context.datasetIndex === 0 &&
                !chartData.isDaily &&
                chartData.monthlyData
              ) {
                const index = context.dataIndex;
                const total = chartData.monthlyData.total[index];
                return `Total Tasks: ${total}`;
              }
              return null;
            },
          },
        },
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 13,
              weight: "500",
            },
            color: "#374151",
          },
        },
        title: {
          display: false,
        },
      },
      elements: {
        point: {
          hoverBackgroundColor: "#ffffff",
          hoverBorderWidth: 4,
        },
        line: {
          borderCapStyle: "round",
          borderJoinStyle: "round",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: chartData.isDaily ? "Date" : "Month",
            font: {
              size: 13,
              weight: "bold",
            },
            color: "#374151",
          },
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
            lineWidth: 1,
          },
          ticks: {
            font: {
              size: 12,
            },
            color: "#6b7280",
            padding: 8,
          },
          border: {
            display: false,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: chartData.isDaily ? "Daily Tasks" : "Completed Tasks",
            font: {
              size: 13,
              weight: "bold",
            },
            color: "#374151",
          },
          min: 0,
          suggestedMax: Math.max(maxCompleted + 2, 8),
          grid: {
            color: "rgba(0, 0, 0, 0.08)",
            lineWidth: 1,
          },
          ticks: {
            font: {
              size: 12,
            },
            color: "#6b7280",
            stepSize: 1,
            padding: 8,
          },
          border: {
            display: false,
          },
        },
        ...(chartData.isDaily
          ? {}
          : {
              y1: {
                type: "linear",
                display: true,
                position: "right",
                title: {
                  display: true,
                  text: "Completion Rate (%)",
                  font: {
                    size: 13,
                    weight: "bold",
                  },
                  color: "#374151",
                },
                min: 0,
                max: 100,
                grid: {
                  drawOnChartArea: false,
                  color: "rgba(0, 0, 0, 0.08)",
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                  color: "#6b7280",
                  padding: 8,
                  callback: function (value) {
                    return value + "%";
                  },
                },
                border: {
                  display: false,
                },
              },
            }),
      },
    };
  }, [chartData]);

  // Get statistics for the selected period
  const getStatistics = () => {
    if (!chartData) return null;

    if (chartData.isDaily) {
      const totalTasks = chartData.totalCompleted;
      const avgDaily = (totalTasks / 14).toFixed(1);
      return {
        total: totalTasks,
        average: avgDaily,
        period: "14 days",
      };
    }

    const monthlyData = chartData.monthlyData;
    const totalCompleted = monthlyData.completed.reduce((a, b) => a + b, 0);
    const totalTasks = monthlyData.total.reduce((a, b) => a + b, 0);
    const avgCompletionRate =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const avgMonthly = (totalCompleted / monthlyData.completed.length).toFixed(
      1
    );

    return {
      total: totalCompleted,
      totalTasks: totalTasks,
      average: avgMonthly,
      completionRate: avgCompletionRate,
      period: selectedPeriod === "3month" ? "3 months" : "6 months",
    };
  };

  const statistics = getStatistics();

  // Loading state
  if (!tasks) {
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-gray-600 font-medium">
            Loading progress data...
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData || tasks.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-indigo-600"
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
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No Progress Data Yet
        </h3>
        <p className="text-gray-600 max-w-md leading-relaxed">
          Start creating and completing tasks to see your progress over time.
          Your productivity journey begins with the first task!
        </p>
      </div>
    );
  }

  // Success state with chart
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Goals Progress
          </h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod("daily")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedPeriod === "daily"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setSelectedPeriod("3month")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedPeriod === "3month"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setSelectedPeriod("6month")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedPeriod === "6month"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              6 Months
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">
                {statistics.total}
              </div>
              <div className="text-gray-500">Completed</div>
            </div>
            {!chartData.isDaily && (
              <>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-lg">
                    {statistics.completionRate}%
                  </div>
                  <div className="text-gray-500">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-lg">
                    {statistics.average}
                  </div>
                  <div className="text-gray-500">Avg/Month</div>
                </div>
              </>
            )}
            {chartData.isDaily && (
              <div className="text-center">
                <div className="font-semibold text-gray-900 text-lg">
                  {statistics.average}
                </div>
                <div className="text-gray-500">Avg/Day</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Progress indicators */}
      {!chartData.isDaily && chartData.monthlyData && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-800">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                  {statistics.totalTasks}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics.completionRate}%
                </p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Avg Monthly
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics.average}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsProgress;
