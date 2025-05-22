// src/context/TaskContext.jsx
import React, { createContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Create context
export const TaskContext = createContext();

// Initial state
const initialState = {
  tasks: [],
  journals: [],
  motivationalQuotes: [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Your time is limited, don't waste it living someone else's life.",
  ],
};

// Load state from localStorage if available
const loadState = () => {
  try {
    const savedState = localStorage.getItem("taskAppState");
    if (savedState === null) {
      return initialState;
    }
    return JSON.parse(savedState);
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return initialState;
  }
};

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            ...action.payload,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            status: "not_started",
            progress: 0,
          },
        ],
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                ...action.payload,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "ADD_JOURNAL":
      return {
        ...state,
        journals: [
          ...state.journals,
          {
            ...action.payload,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case "UPDATE_JOURNAL":
      return {
        ...state,
        journals: state.journals.map((journal) =>
          journal.id === action.payload.id
            ? {
                ...journal,
                ...action.payload,
                updatedAt: new Date().toISOString(),
              }
            : journal
        ),
      };

    case "DELETE_JOURNAL":
      return {
        ...state,
        journals: state.journals.filter(
          (journal) => journal.id !== action.payload
        ),
      };

    default:
      return state;
  }
};

// Provider Component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, loadState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("taskAppState", JSON.stringify(state));
  }, [state]);

  // Get random motivational quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(
      Math.random() * state.motivationalQuotes.length
    );
    return state.motivationalQuotes[randomIndex];
  };

  // Get task statistics
  const getTaskStats = () => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inProgress = state.tasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const notStarted = state.tasks.filter(
      (task) => task.status === "not_started"
    ).length;

    return { total, completed, inProgress, notStarted };
  };

  // Group tasks by month
  const getMonthlyTasks = () => {
    const monthlyTasks = {};

    state.tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!monthlyTasks[monthYear]) {
        monthlyTasks[monthYear] = [];
      }

      monthlyTasks[monthYear].push(task);
    });

    return monthlyTasks;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        journals: state.journals,
        dispatch,
        getRandomQuote,
        getTaskStats,
        getMonthlyTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
