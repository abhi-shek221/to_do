// src/components/Dashboard/TasksChart.jsx
import React, { useContext } from "react";
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
  const [chartType, setChartType] = React.useState("doughnut"); // 'doughnut' or 'bar'

  // Count tasks by status
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const notStartedCount = tasks.filter(
    (task) => task.status === "not_started"
  ).length;

  // Group tasks by day for the last 7 days
  const getLast7DaysData = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const tasksByDay = {};
    last7Days.forEach((day) => {
      tasksByDay[day] = {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      };
    });

    tasks.forEach((task) => {
      const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
      if (tasksByDay[taskDate]) {
        if (task.status === "completed") {
          tasksByDay[taskDate].completed += 1;
        } else if (task.status === "in_progress") {
          tasksByDay[taskDate].inProgress += 1;
        } else {
          tasksByDay[taskDate].notStarted += 1;
        }
      }
    });

    return {
      labels: last7Days.map((day) => {
        const date = new Date(day);
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }),
      datasets: [
        {
          label: "Completed",
          data: Object.values(tasksByDay).map((day) => day.completed),
          backgroundColor: "rgba(76, 175, 80, 0.8)",
        },
        {
          label: "In Progress",
          data: Object.values(tasksByDay).map((day) => day.inProgress),
          backgroundColor: "rgba(255, 152, 0, 0.8)",
        },
        {
          label: "Not Started",
          data: Object.values(tasksByDay).map((day) => day.notStarted),
          backgroundColor: "rgba(158, 158, 158, 0.8)",
        },
      ],
    };
  };

  // Doughnut chart data for status overview
  const doughnutData = {
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [
      {
        data: [completedCount, inProgressCount, notStartedCount],
        backgroundColor: [
          "rgba(76, 175, 80, 0.8)",
          "rgba(255, 152, 0, 0.8)",
          "rgba(158, 158, 158, 0.8)",
        ],
        borderColor: [
          "rgba(76, 175, 80, 1)",
          "rgba(255, 152, 0, 1)",
          "rgba(158, 158, 158, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Tasks Created in Last 7 Days",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === "doughnut"
                ? "bg-primary-main text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setChartType("doughnut")}
          >
            Status
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === "bar"
                ? "bg-primary-main text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setChartType("bar")}
          >
            Timeline
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === "doughnut" ? (
          tasks.length > 0 ? (
            <Doughnut
              data={doughnutData}
              options={{ maintainAspectRatio: false }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No task data available yet.</p>
            </div>
          )
        ) : tasks.length > 0 ? (
          <Bar
            data={getLast7DaysData()}
            options={{ ...barOptions, maintainAspectRatio: false }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No task data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksChart;
