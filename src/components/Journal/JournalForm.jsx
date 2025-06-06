import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import VoiceInput from "../VoiceInput/VoiceInput";
import useFirestoreStorage from "../../hooks/useFirestoreStorage";

const JournalForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Use Firestore instead of localStorage
  const [journals, setJournals, { loading: journalsLoading }] =
    useFirestoreStorage("journals", []);

  const [setJournalStats, { loading: statsLoading }] = useFirestoreStorage(
    "journalStats",
    {
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
    }
  );

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const loading = journalsLoading || statsLoading;

  useEffect(() => {
    if (isEditing && journals.length > 0) {
      const journal = journals.find((j) => j.id === id);
      if (journal) {
        setTitle(journal.title);
        setContent(journal.content);
        setMood(journal.mood);
        setTags(journal.tags.join(", "));
        setDate(journal.date);
      }
    }
  }, [id, journals, isEditing]);

  // Function to calculate updated statistics
  const calculateStats = (
    updatedJournals,
    isNewEntry = false,
    isDeleting = false
  ) => {
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

    // Calculate streak (simplified - consecutive days with entries)
    const sortedDates = updatedJournals
      .map((j) => j.date)
      .sort()
      .map((date) => new Date(date).toDateString());

    const uniqueDates = [...new Set(sortedDates)];
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Simple streak calculation based on consecutive unique dates
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(
        expectedDate.getDate() - (uniqueDates.length - 1 - i)
      );

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        tempStreak++;
        if (i === uniqueDates.length - 1) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

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
      currentStreak,
      longestStreak,
      moodDistribution,
      mostUsedTags,
      lastEntryDate:
        updatedJournals.length > 0
          ? Math.max(...updatedJournals.map((j) => new Date(j.date)))
          : null,
      averageEntriesPerWeek,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    const journalEntry = {
      id: isEditing ? id : uuidv4(),
      title,
      content,
      mood,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      date,
      createdAt: isEditing
        ? journals.find((j) => j.id === id)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let updatedJournals;

      if (isEditing) {
        updatedJournals = journals.map((journal) =>
          journal.id === id ? journalEntry : journal
        );
        setJournals(updatedJournals);
        toast.success("Journal updated successfully!");
      } else {
        updatedJournals = [...journals, journalEntry];
        setJournals(updatedJournals);
        toast.success("Journal created successfully!");
      }

      // Update statistics
      const newStats = calculateStats(updatedJournals, !isEditing);
      setJournalStats(newStats);

      navigate("/journal");
    } catch (error) {
      console.error("Error saving journal:", error);
      toast.error("Failed to save journal. Please try again.");
    }
  };

  const handleVoiceInput = (transcript) => {
    setContent(content + " " + transcript);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg shadow-card p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your journal data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg shadow-card p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter journal title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            className="w-full p-2 border border-gray-300 rounded-md min-h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={6}
          />
          <div className="mt-2">
            <VoiceInput onTranscript={handleVoiceInput} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Mood</label>
          <div className="flex space-x-4">
            {["happy", "neutral", "sad", "excited", "anxious"].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="mood"
                  value={option}
                  checked={mood === option}
                  onChange={() => setMood(option)}
                  className="mr-1"
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/journal")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark shadow-button border border-gray-400 shadow-lg opacity-100"
            disabled={loading}
          >
            {isEditing ? "Update" : "Save"} Journal
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;
