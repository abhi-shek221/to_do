// src/components/Dashboard/MotivationCard.jsx
import React, { useContext, useState, useEffect } from "react";
import TaskContext from "../../context/TaskContext";

const MotivationCard = () => {
  const { getRandomQuote, getTaskStats } = useContext(TaskContext);
  const [quote, setQuote] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fallback quotes if getRandomQuote is not available
  const fallbackQuotes = [
    "The way to get started is to quit talking and begin doing.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "It always seems impossible until it's done.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
  ];

  // Get random quote from fallback if needed
  const getRandomQuoteFromFallback = () => {
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  };

  // Get stats with fallback
  const stats = React.useMemo(() => {
    try {
      if (getTaskStats) {
        return getTaskStats();
      }
      // Fallback if getTaskStats is not available
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        paused: 0,
      };
    } catch (error) {
      console.error("Error getting task stats:", error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        paused: 0,
      };
    }
  }, [getTaskStats]);

  // Update time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Initialize and change quote
  useEffect(() => {
    const updateQuote = () => {
      try {
        if (getRandomQuote && typeof getRandomQuote === "function") {
          setQuote(getRandomQuote());
        } else {
          setQuote(getRandomQuoteFromFallback());
        }
      } catch (error) {
        console.error("Error getting quote:", error);
        setQuote(getRandomQuoteFromFallback());
      }
    };

    // Set initial quote
    updateQuote();

    // Change quote every 30 seconds
    const quoteInterval = setInterval(updateQuote, 30000);

    return () => clearInterval(quoteInterval);
  }, [getRandomQuote]);

  // Generate personalized motivation message based on task stats
  const getMotivationMessage = () => {
    const completionRate =
      stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    if (stats.total === 0) {
      return "Ready to start your journey? Add your first task and begin tracking your progress! 🚀";
    }

    if (stats.completed === stats.total && stats.total > 0) {
      return "🎉 Amazing job! You've completed all your tasks. Time to set new goals and keep the momentum going!";
    }

    if (stats.completed > 0 && stats.inProgress === 0 && stats.notStarted > 0) {
      return "Great progress! You've completed some tasks. Now it's time to start working on the remaining ones. Keep it up! 💪";
    }

    if (stats.inProgress > 0) {
      return `You're making progress! Keep going with your ${
        stats.inProgress
      } task${
        stats.inProgress > 1 ? "s" : ""
      } in progress. You're doing great! ⚡`;
    }

    if (completionRate >= 70) {
      return "You're almost there! Just a few more tasks to complete. The finish line is in sight! 🏁";
    }

    if (completionRate >= 50) {
      return "Halfway there! You're building great momentum. Keep pushing forward! 📈";
    }

    if (completionRate >= 25) {
      return "Good start! You're making steady progress. Every task completed is a step closer to your goals! 🎯";
    }

    return "Stay focused and keep tracking your progress. Small steps lead to big achievements! ✨";
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning! ☀️";
    if (hour < 17) return "Good Afternoon! 🌤️";
    if (hour < 21) return "Good Evening! 🌆";
    return "Good Night! 🌙";
  };

  // Get productivity tip
  const getProductivityTip = () => {
    const tips = [
      "Break down large tasks into smaller, manageable subtasks to make progress more achievable.",
      "Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately.",
      "Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break.",
      "Prioritize your tasks using the Eisenhower Matrix: Important vs Urgent.",
      "Set specific, measurable goals with clear deadlines.",
      "Eliminate distractions by creating a dedicated workspace.",
      "Review and adjust your task list regularly to stay on track.",
      "Celebrate small wins to maintain motivation and momentum.",
      "Use time-blocking to dedicate specific hours to important tasks.",
      "Start your day with the most challenging task when your energy is highest.",
    ];

    // Use current time to get a consistent tip for the day
    const dayOfYear = Math.floor(
      (currentTime - new Date(currentTime.getFullYear(), 0, 0)) / 86400000
    );
    return tips[dayOfYear % tips.length];
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-gradient-to-b from-pink-200 via-purple-200 to-indigo-200 rounded-lg">
      {/* Header with greeting */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-black">{getGreeting()}</h2>
          <div className="text-sm text-black/80">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow">
        {/* Quote section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-3">
            💭 Daily Inspiration
          </h3>
          <blockquote className="text-black/90 italic text-base leading-relaxed">
            "{quote}"
          </blockquote>
        </div>

        {/* Motivation message */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-3">
            🎯 Your Progress
          </h3>
          <p className="text-black/90 text-base leading-relaxed">
            {getMotivationMessage()}
          </p>
        </div>

        {/* Quick stats */}
        {stats.total > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-black">
                  {stats.completed}
                </div>
                <div className="text-xs text-black/80 uppercase tracking-wide">
                  Completed
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-black">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs text-black/80 uppercase tracking-wide">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with tip */}
      <div className="mt-6">
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-black/10">
          <h3 className="font-semibold text-black mb-2 flex items-center">
            💡 Pro Tip
          </h3>
          <p className="text-sm text-black/90 leading-relaxed">
            {getProductivityTip()}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-40">
        <svg
          className="w-8 h-8 text-black"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 opacity-10">
        <svg
          className="w-6 h-6 text-black"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    </div>
  );
};

export default MotivationCard;
