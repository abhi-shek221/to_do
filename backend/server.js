const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

// Add detailed logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = ["http://localhost:5001", "http://localhost:5002"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow non-browser requests like Postman
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(
          new Error("CORS policy does not allow access from this origin"),
          false
        );
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Initialize Firebase Admin SDK
// Make sure to add your service account key file to your project
const serviceAccount = require("./firebase-admin-key.json"); // You need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL, // Add this to your .env file
});

const db = admin.firestore();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
      console.log("No token provided in request headers");
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Create user session
app.post("/api/auth/session", async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;

    // Store user session in your database or cache
    console.log(`User session created for: ${email} (${uid})`);

    // You can store additional session data here
    const sessionData = {
      uid,
      email,
      displayName,
      loginTime: new Date().toISOString(),
      isActive: true,
      progress: {}, // Initialize empty progress object for user
    };

    // Store in Firestore or your preferred database
    await db.collection("user_sessions").doc(uid).set(sessionData);

    res.json({ success: true, message: "Session created" });
  } catch (error) {
    console.error("Session creation error:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Logout user session
app.post("/api/auth/logout", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Update session status
    await db.collection("user_sessions").doc(uid).update({
      isActive: false,
      logoutTime: new Date().toISOString(),
    });

    console.log(`User session ended for: ${uid}`);
    res.json({ success: true, message: "Session ended" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// Get user profile
app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Update user profile
app.put("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via API
    const allowedUpdates = {
      displayName: updates.displayName,
      photoURL: updates.photoURL,
      preferences: updates.preferences,
      // Add other fields you want to allow updating
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    await db
      .collection("users")
      .doc(uid)
      .update({
        ...allowedUpdates,
        updatedAt: new Date().toISOString(),
      });

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Tasks API endpoints
app.get("/api/tasks", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    console.log("Fetching tasks for user:", uid);

    const tasksSnapshot = await db
      .collection("tasks")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${tasks.length} tasks for user ${uid}`);

    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

app.post("/api/tasks", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const taskData = {
      ...req.body,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("tasks").add(taskData);

    res.json({
      success: true,
      task: { id: docRef.id, ...taskData },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Verify task belongs to user
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists || taskDoc.data().userId !== uid) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tasks").doc(id).update(updates);

    res.json({ success: true, message: "Task updated" });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Verify task belongs to user
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists || taskDoc.data().userId !== uid) {
      return res.status(404).json({ error: "Task not found" });
    }

    await db.collection("tasks").doc(id).delete();

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

/* 
CLIENT-SIDE CODE EXAMPLE:
If you need to call the logout endpoint from your frontend, use this code:

fetch("http://localhost:5000/api/auth/logout", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${firebaseIdToken}`, // firebaseIdToken should be available in your client-side code
  },
});
*/
