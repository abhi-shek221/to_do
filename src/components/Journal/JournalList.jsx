import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import useFirestoreStorage from "../../hooks/useFirestoreStorage";

const JournalList = () => {
  const [journals, setJournals, { loading: journalsLoading }] =
    useFirestoreStorage("journals", []);
  const [journalStats, setJournalStats, { loading: statsLoading }] =
    useFirestoreStorage("journalStats", {
      totalEntries: 0,
      entriesThisMonth: 0,
      entriesThisWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      moodDistribution: {
        happy: 0,
        neutral: 0,
        sad: 0,
        excited: 0,
        anxious: 0,
      },
      mostUsedTags: {},
      lastEntryDate: null,
      averageEntriesPerWeek: 0,
    });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [uniqueTags, setUniqueTags] = useState([]);
  const [showStats, setShowStats] = useState(false);

  const navigate = useNavigate();
  const loading = journalsLoading || statsLoading;

  useEffect(() => {
    // Extract unique tags from all journal entries
    const allTags = journals.flatMap((journal) => journal.tags);
    const uniqueTagsSet = new Set(allTags);
    setUniqueTags(Array.from(uniqueTagsSet));
  }, [journals]);

  // Function to recalculate statistics when journals change
  const recalculateStats = (updatedJournals) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count entries this month
    const entriesThisMonth = updatedJournals.filter((journal) => {
      const entryDate = new Date(journal.date);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    }).length;

    // Count entries this week
    const entriesThisWeek = updatedJournals.filter((journal) => {
      const entryDate = new Date(journal.date);
      return entryDate >= oneWeekAgo;
    }).length;

    // Calculate mood distribution
    const moodDistribution = {
      happy: 0,
      neutral: 0,
      sad: 0,
      excited: 0,
      anxious: 0,
    };

    // Calculate most used tags
    const tagCounts = {};

    updatedJournals.forEach((journal) => {
      // Count moods
      if (moodDistribution.hasOwnProperty(journal.mood)) {
        moodDistribution[journal.mood]++;
      }

      // Count tags
      journal.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Get top 10 most used tags
    const mostUsedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [tag, count]) => {
        obj[tag] = count;
        return obj;
      }, {});

    // Calculate average entries per week
    const firstEntryDate =
      updatedJournals.length > 0
        ? new Date(Math.min(...updatedJournals.map((j) => new Date(j.date))))
        : now;
    const weeksSinceFirst = Math.max(
      1,
      Math.ceil((now - firstEntryDate) / (7 * 24 * 60 * 60 * 1000))
    );
    const averageEntriesPerWeek =
      Math.round((updatedJournals.length / weeksSinceFirst) * 10) / 10;

    return {
      totalEntries: updatedJournals.length,
      entriesThisMonth,
      entriesThisWeek,
      currentStreak: journalStats.currentStreak, // Keep existing streak calculation
      longestStreak: journalStats.longestStreak, // Keep existing streak calculation
      moodDistribution,
      mostUsedTags,
      lastEntryDate:
        updatedJournals.length > 0
          ? Math.max(...updatedJournals.map((j) => new Date(j.date)))
          : null,
      averageEntriesPerWeek,
    };
  };

  const handleDeleteJournal = async (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      try {
        const updatedJournals = journals.filter((journal) => journal.id !== id);
        setJournals(updatedJournals);

        // Update statistics
        const newStats = recalculateStats(updatedJournals);
        setJournalStats(newStats);

        toast.success("Journal entry deleted successfully!");
      } catch (error) {
        console.error("Error deleting journal:", error);
        toast.error("Failed to delete journal entry. Please try again.");
      }
    }
  };

  const filteredJournals = journals
    .filter((journal) => {
      // Filter by search term
      const matchesSearch =
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by mood if selected
      const matchesMood = filterMood ? journal.mood === filterMood : true;

      // Filter by tag if selected
      const matchesTag = filterTag ? journal.tags.includes(filterTag) : true;

      return matchesSearch && matchesMood && matchesTag;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-background-paper rounded-lg shadow-card p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading your journal data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Journal</h2>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 shadow-button border border-gray-400"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Hide" : "Show"} Stats
          </button>
          <button
            className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark shadow-button border border-gray-400 shadow-lg opacity-80"
            onClick={() => navigate("/journal/add")}
          >
            New Entry
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="bg-background-paper rounded-lg shadow-card p-6">
          <h3 className="text-xl font-semibold mb-4">Journal Statistics</h3>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {journalStats.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {journalStats.entriesThisMonth}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {journalStats.entriesThisWeek}
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {journalStats.averageEntriesPerWeek}
              </div>
              <div className="text-sm text-gray-600">Avg/Week</div>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Mood Distribution</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(journalStats.moodDistribution).map(
                ([mood, count]) => (
                  <div key={mood} className="text-center">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-sm capitalize text-gray-600">
                      {mood}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Most Used Tags */}
          {Object.keys(journalStats.mostUsedTags).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Most Used Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(journalStats.mostUsedTags)
                  .slice(0, 10)
                  .map(([tag, count]) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag} ({count})
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-background-paper rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search journals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="mood" className="block text-sm font-medium mb-1">
              Filter by Mood
            </label>
            <select
              id="mood"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
            >
              <option value="">All Moods</option>
              {["happy", "neutral", "sad", "excited", "anxious"].map((mood) => (
                <option key={mood} value={mood} className="capitalize">
                  {mood}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium mb-1">
              Filter by Tag
            </label>
            <select
              id="tag"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredJournals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">
              {journals.length === 0
                ? "No journal entries found."
                : "No entries match your filters."}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow-button"
              onClick={() => navigate("/journal/add")}
            >
              {journals.length === 0
                ? "Create Your First Entry"
                : "Create New Entry"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJournals.map((journal) => (
              <div
                key={journal.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{journal.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(journal.date), "MMMM d, yyyy")} • Mood:{" "}
                      <span className="capitalize">{journal.mood}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/journal/edit/${journal.id}`)}
                      className="p-2 text-primary hover:bg-gray-100 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteJournal(journal.id)}
                      className="p-2 text-error hover:bg-gray-100 rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-gray-700 line-clamp-3">
                    {journal.content}
                  </p>
                </div>

                {journal.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {journal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/journal/edit/${journal.id}`}
                  className="mt-4 text-sm text-primary hover:underline inline-block"
                >
                  Read more & Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalList;
