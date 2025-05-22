// src/components/Dashboard/GoalsProgress.jsx
import React, { useContext } from "react";
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
import { format, subDays, eachDayOfInterval } from "date-fns";

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

  // Generate date range for the last 14 days
  const today = new Date();
  const twoWeeksAgo = subDays(today, 13);

  const dateRange = eachDayOfInterval({
    start: twoWeeksAgo,
    end: today,
  });

  // Calculate completed tasks per day
  const completedTasksData = dateRange.map((date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return tasks.filter((task) => {
      const taskDate = task.completedAt
        ? format(new Date(task.completedAt), "yyyy-MM-dd")
        : null;
      return taskDate === formattedDate && task.status === "completed";
    }).length;
  });

  // Calculate cumulative completions
  const cumulativeCompletions = [];
  let runningTotal = 0;
  completedTasksData.forEach((count) => {
    runningTotal += count;
    cumulativeCompletions.push(runningTotal);
  });

  // Chart data
  const lineData = {
    labels: dateRange.map((date) => format(date, "MMM d")),
    datasets: [
      {
        label: "Daily Completed Tasks",
        data: completedTasksData,
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        borderColor: "rgba(33, 150, 243, 1)",
        pointBackgroundColor: "rgba(33, 150, 243, 1)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Cumulative Completed Tasks",
        data: cumulativeCompletions,
        backgroundColor: "rgba(156, 39, 176, 0.2)",
        borderColor: "rgba(156, 39, 176, 1)",
        pointBackgroundColor: "rgba(156, 39, 176, 1)",
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Daily Tasks",
        },
        min: 0,
        suggestedMax: Math.max(...completedTasksData) + 1 || 5,
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Cumulative Tasks",
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="h-80">
      {tasks.some((task) => task.status === "completed") ? (
        <Line
          data={lineData}
          options={{ ...lineOptions, maintainAspectRatio: false }}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">
            Complete some tasks to see your progress over time.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalsProgress;
