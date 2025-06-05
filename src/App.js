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
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

// Context Providers

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-background-default">
                    <Sidebar />
                    <div className="flex flex-col flex-grow">
                      <Header />
                      <main className="flex-grow overflow-auto">
                        <div className="p-6 min-h-full">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tasks" element={<TaskList />} />
                            <Route path="/tasks/add" element={<TaskForm />} />
                            <Route
                              path="/tasks/edit/:id"
                              element={<TaskForm />}
                            />
                            <Route path="/journal" element={<JournalList />} />
                            <Route
                              path="/journal/add"
                              element={<JournalForm />}
                            />
                            <Route
                              path="/journal/edit/:id"
                              element={<JournalForm />}
                            />
                          </Routes>
                        </div>
                        <Footer />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer position="bottom-right" />
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
