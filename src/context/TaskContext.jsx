// src/context/TaskContext.jsx
import React, { createContext, useReducer, useEffect } from "react";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext"; // Import your auth context

// Create context
export const TaskContext = createContext();

// Initial state
const initialState = {
  tasks: [],
  journals: [],
  loading: false,
  error: null,
  motivationalQuotes: [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Your time is limited, don't waste it living someone else's life.",
  ],
};

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_TASK":
      // Check if task already exists
      const existingTaskIndex = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (existingTaskIndex !== -1) {
        // Update existing task instead of adding duplicate
        return {
          ...state,
          tasks: state.tasks.map((task, index) =>
            index === existingTaskIndex ? action.payload : task
          ),
        };
      }
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload } // Merge with existing task data
            : task
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "SET_JOURNALS":
      return {
        ...state,
        journals: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_JOURNAL":
      return {
        ...state,
        journals: [...state.journals, action.payload],
      };

    case "UPDATE_JOURNAL":
      return {
        ...state,
        journals: state.journals.map((journal) =>
          journal.id === action.payload.id ? action.payload : journal
        ),
      };

    case "DELETE_JOURNAL":
      return {
        ...state,
        journals: state.journals.filter(
          (journal) => journal.id !== action.payload
        ),
      };

    case "CLEAR_DATA":
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

// Provider Component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user } = useAuth(); // Get current user from auth context

  // Load user's tasks from Firestore
  useEffect(() => {
    if (!user) {
      // Clear data when user logs out
      dispatch({ type: "CLEAR_DATA" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    // Set up real-time listener for user's tasks
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksMap = new Map();

        // Process all documents and handle duplicates
        snapshot.docs.forEach((doc) => {
          const taskData = { id: doc.id, ...doc.data() };

          // Only keep the latest version if duplicate IDs exist
          if (
            !tasksMap.has(doc.id) ||
            new Date(taskData.updatedAt || taskData.createdAt) >
              new Date(
                tasksMap.get(doc.id).updatedAt || tasksMap.get(doc.id).createdAt
              )
          ) {
            tasksMap.set(doc.id, taskData);
          }
        });

        const tasks = Array.from(tasksMap.values());
        console.log("Tasks loaded:", tasks.length);
        dispatch({ type: "SET_TASKS", payload: tasks });
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load tasks" });
      }
    );

    // Set up real-time listener for user's journals
    const journalsQuery = query(
      collection(db, "journals"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeJournals = onSnapshot(
      journalsQuery,
      (snapshot) => {
        const journalsMap = new Map();

        snapshot.docs.forEach((doc) => {
          const journalData = { id: doc.id, ...doc.data() };

          if (
            !journalsMap.has(doc.id) ||
            new Date(journalData.updatedAt || journalData.createdAt) >
              new Date(
                journalsMap.get(doc.id).updatedAt ||
                  journalsMap.get(doc.id).createdAt
              )
          ) {
            journalsMap.set(doc.id, journalData);
          }
        });

        const journals = Array.from(journalsMap.values());
        dispatch({ type: "SET_JOURNALS", payload: journals });
      },
      (error) => {
        console.error("Error fetching journals:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load journals" });
      }
    );

    return () => {
      unsubscribeTasks();
      unsubscribeJournals();
    };
  }, [user]);

  // Add task to Firestore
  const addTask = async (taskData) => {
    if (!user) {
      throw new Error("User must be authenticated to add tasks");
    }

    try {
      const newTask = {
        ...taskData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: taskData.status || "not_started",
        progress: 0,
      };

      const docRef = await addDoc(collection(db, "tasks"), newTask);

      // Update local state immediately (optimistic update)
      dispatch({
        type: "ADD_TASK",
        payload: { ...newTask, id: docRef.id },
      });

      console.log("Task added successfully:", docRef.id);
    } catch (error) {
      console.error("Error adding task:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add task" });
      throw error;
    }
  };

  // Update task in Firestore
  const updateTask = async (id, taskData) => {
    if (!user) {
      throw new Error("User must be authenticated to update tasks");
    }

    try {
      const taskRef = doc(db, "tasks", id);
      const updatedData = {
        ...taskData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(taskRef, updatedData);

      // Update local state immediately (optimistic update)
      // Only update the fields that were changed, preserve existing data
      dispatch({
        type: "UPDATE_TASK",
        payload: { id, ...updatedData },
      });

      console.log("Task updated successfully:", id);
    } catch (error) {
      console.error("Error updating task:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update task" });
      throw error;
    }
  };

  // Delete task from Firestore
  const deleteTask = async (id) => {
    if (!user) {
      throw new Error("User must be authenticated to delete tasks");
    }

    try {
      await deleteDoc(doc(db, "tasks", id));

      // Update local state immediately (optimistic update)
      dispatch({ type: "DELETE_TASK", payload: id });

      console.log("Task deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting task:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete task" });
      throw error;
    }
  };

  // Update task status - FIXED VERSION
  const updateTaskStatus = async (id, status) => {
    // Find the current task to preserve its data
    const currentTask = state.tasks.find((task) => task.id === id);
    if (!currentTask) {
      console.error("Task not found:", id);
      return;
    }

    // Only update the status field, preserve all other data
    await updateTask(id, {
      status,
      // Preserve all existing task data
      name: currentTask.name,
      description: currentTask.description,
      priority: currentTask.priority,
      tags: currentTask.tags,
      dueDate: currentTask.dueDate,
      progress: currentTask.progress,
      // Add any other fields that should be preserved
    });
  };

  // Add journal to Firestore
  const addJournal = async (journalData) => {
    if (!user) {
      throw new Error("User must be authenticated to add journals");
    }

    try {
      const newJournal = {
        ...journalData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "journals"), newJournal);

      // Update local state immediately (optimistic update)
      dispatch({
        type: "ADD_JOURNAL",
        payload: { ...newJournal, id: docRef.id },
      });

      console.log("Journal added successfully:", docRef.id);
    } catch (error) {
      console.error("Error adding journal:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add journal" });
      throw error;
    }
  };

  // Update journal in Firestore
  const updateJournal = async (id, journalData) => {
    if (!user) {
      throw new Error("User must be authenticated to update journals");
    }

    try {
      const journalRef = doc(db, "journals", id);
      const updatedData = {
        ...journalData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(journalRef, updatedData);

      // Update local state immediately (optimistic update)
      dispatch({
        type: "UPDATE_JOURNAL",
        payload: { id, ...updatedData },
      });

      console.log("Journal updated successfully:", id);
    } catch (error) {
      console.error("Error updating journal:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update journal" });
      throw error;
    }
  };

  // Delete journal from Firestore
  const deleteJournal = async (id) => {
    if (!user) {
      throw new Error("User must be authenticated to delete journals");
    }

    try {
      await deleteDoc(doc(db, "journals", id));

      // Update local state immediately (optimistic update)
      dispatch({ type: "DELETE_JOURNAL", payload: id });

      console.log("Journal deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting journal:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete journal" });
      throw error;
    }
  };

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
    const paused = state.tasks.filter(
      (task) => task.status === "paused"
    ).length;

    return { total, completed, inProgress, notStarted, paused };
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

  // Clear error
  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  return (
    <TaskContext.Provider
      value={{
        // State
        tasks: state.tasks,
        journals: state.journals,
        loading: state.loading,
        error: state.error,

        // Task functions
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,

        // Journal functions
        addJournal,
        updateJournal,
        deleteJournal,

        // Utility functions
        getRandomQuote,
        getTaskStats,
        getMonthlyTasks,
        clearError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
