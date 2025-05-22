// src/utils/helpers.js
import {
  format,
  parseISO,
  differenceInDays,
  isToday,
  isThisWeek,
} from "date-fns";

// Format a date to a readable string
export const formatDate = (dateString) => {
  try {
    if (!dateString) return "";
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Format month for monthly tasks view
export const formatMonth = (date) => {
  try {
    return format(date, "MMMM yyyy");
  } catch (error) {
    console.error("Error formatting month:", error);
    return "";
  }
};

// Get a relative date description
export const getRelativeDate = (dateString) => {
  try {
    if (!dateString) return "";
    const date = parseISO(dateString);
    const today = new Date();

    if (isToday(date)) return "Today";

    const diffDays = differenceInDays(date, today);

    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

    if (isThisWeek(date)) return format(date, "EEEE");

    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error getting relative date:", error);
    return dateString || "";
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Get a color for priority
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "text-red-600 bg-red-100";
    case "high":
      return "text-orange-600 bg-orange-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Get a color for status
export const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "in_progress":
      return "text-blue-600 bg-blue-100";
    case "not_started":
      return "text-gray-600 bg-gray-100";
    case "paused":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Format status for display (replace underscores with spaces and capitalize)
export const formatStatus = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Generate a random motivational quote
export const getRandomMotivation = () => {
  const quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
    },
    {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
    },
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      text: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau",
    },
    {
      text: "The road to success and the road to failure are almost exactly the same.",
      author: "Colin R. Davis",
    },
    {
      text: "Success seems to be connected with action. Successful people keep moving.",
      author: "Conrad Hilton",
    },
  ];

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};

// Calculate time remaining for a task
export const getTimeRemaining = (dueDate) => {
  if (!dueDate) return null;

  try {
    const now = new Date();
    const due = parseISO(dueDate);
    const diffDays = differenceInDays(due, now);

    if (diffDays < 0) return { overdue: true, days: Math.abs(diffDays) };
    return { overdue: false, days: diffDays };
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return null;
  }
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, currentItem) => {
    (result[currentItem[key]] = result[currentItem[key]] || []).push(
      currentItem
    );
    return result;
  }, {});
};
