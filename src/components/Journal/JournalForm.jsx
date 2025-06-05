import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import VoiceInput from "../VoiceInput/VoiceInput";
import useLocalStorage from "../../hooks/useLocalStorage";

const JournalForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [journals, setJournals] = useLocalStorage("journals", []);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
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

  const handleSubmit = (e) => {
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
        ? journals.find((j) => j.id === id).createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      setJournals(
        journals.map((journal) => (journal.id === id ? journalEntry : journal))
      );
      toast.success("Journal updated successfully!");
    } else {
      setJournals([...journals, journalEntry]);
      toast.success("Journal created successfully!");
    }

    navigate("/journal");
  };

  const handleVoiceInput = (transcript) => {
    setContent(content + " " + transcript);
  };

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
          >
            {isEditing ? "Update" : "Save"} Journal
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;
