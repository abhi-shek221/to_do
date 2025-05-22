import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import useLocalStorage from "../../hooks/useLocalStorage";

const JournalList = () => {
  const [journals, setJournals] = useLocalStorage("journals", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [uniqueTags, setUniqueTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract unique tags from all journal entries
    const allTags = journals.flatMap((journal) => journal.tags);
    const uniqueTagsSet = new Set(allTags);
    setUniqueTags(Array.from(uniqueTagsSet));
  }, [journals]);

  const handleDeleteJournal = (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      setJournals(journals.filter((journal) => journal.id !== id));
      toast.success("Journal entry deleted successfully!");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Journal</h2>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow-button"
          onClick={() => navigate("/journal/add")}
        >
          New Entry
        </button>
      </div>

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
            <p className="text-lg text-gray-500">No journal entries found.</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow-button"
              onClick={() => navigate("/journal/add")}
            >
              Create Your First Entry
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
