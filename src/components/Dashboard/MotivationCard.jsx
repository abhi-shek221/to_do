// src/components/Dashboard/MotivationCard.jsx
import React, { useContext, useState, useEffect } from "react";
import TaskContext from "../../context/TaskContext";

const MotivationCard = () => {
  const { getRandomQuote, getTaskStats } = useContext(TaskContext);
  const [quote, setQuote] = useState("");
  const stats = getTaskStats();

  // Change quote every 30 seconds
  useEffect(() => {
    setQuote(getRandomQuote());

    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 30000);

    return () => clearInterval(interval);
  }, [getRandomQuote]);

  // Generate personalized motivation message based on tasks stats
  const getMotivationMessage = () => {
    if (stats.total === 0) {
      return "Ready to start your journey? Add your first task and begin tracking your progress!";
    }

    if (stats.completed === stats.total) {
      return "Amazing job! You've completed all your tasks. Time to set new goals!";
    }

    if (stats.completed > 0 && stats.inProgress === 0 && stats.notStarted > 0) {
      return "Great progress! You've completed some tasks, now it's time to start working on the remaining ones.";
    }

    if (stats.inProgress > 0) {
      return `You're making progress! Keep going with your ${
        stats.inProgress
      } task${stats.inProgress > 1 ? "s" : ""} in progress.`;
    }

    if (stats.completed / stats.total > 0.7) {
      return "You're almost there! Just a few more tasks to complete. Keep up the great work!";
    }

    return "Stay focused and keep tracking your progress. You've got this!";
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-xl mb-4">Today's Motivation</h2>
        <p className="text-lg font-medium mb-6">"{quote}"</p>
        <p className="text-base">{getMotivationMessage()}</p>
      </div>

      <div className="mt-6">
        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Quick Tip</h3>
          <p className="text-sm">
            Break down large tasks into smaller, manageable subtasks to make
            progress more achievable and trackable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotivationCard;
