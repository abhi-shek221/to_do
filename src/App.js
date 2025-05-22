// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Footer from "./components/Layout/Footer";

// Page Components
import Dashboard from "./components/Dashboard/Dashboard";
import TaskForm from "./components/Tasks/TaskForm";
import TaskList from "./components/Tasks/TaskList";
import JournalForm from "./components/Journal/JournalForm";
import JournalList from "./components/Journal/JournalList";

// Context Providers
import { TaskProvider } from "./context/TaskContext";

function App() {
  return (
    <TaskProvider>
      <Router>
        <div className="flex h-screen bg-background-default">
          <Sidebar />
          <div className="flex flex-col flex-grow">
            <Header />
            <main className="flex-grow p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/add" element={<TaskForm />} />
                <Route path="/tasks/edit/:id" element={<TaskForm />} />
                <Route path="/journal" element={<JournalList />} />
                <Route path="/journal/add" element={<JournalForm />} />
                <Route path="/journal/edit/:id" element={<JournalForm />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </Router>
    </TaskProvider>
  );
}

export default App;
