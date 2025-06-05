import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db, forceOnline } from "../firebase"; // Make sure db is exported from firebase config

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    try {
      // Ensure we're online before attempting Firestore operations
      await forceOnline();

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, photoURL } = user;
        const createdAt = new Date();

        await setDoc(userRef, {
          displayName:
            displayName || additionalData.name || email.split("@")[0],
          email,
          photoURL: photoURL || null,
          createdAt,
          ...additionalData,
        });
        console.log("User document created successfully");
      }

      return userRef;
    } catch (error) {
      console.error("Error creating user document:", error);

      // Handle specific Firestore offline errors
      if (error.code === "unavailable" || error.message.includes("offline")) {
        console.log(
          "Firestore is offline, user document will be created when online"
        );
        // Don't throw error for offline state - let the app continue
        return null;
      }
      throw error;
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", email); // Debug log
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", result.user); // Debug log

      // Create/update user document
      await createUserDocument(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Login error details:", {
        code: error.code,
        message: error.message,
        email: email,
      });

      // More user-friendly error messages
      let errorMessage = error.message;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup
  const signup = async (email, password, name) => {
    try {
      console.log("Attempting signup with:", email, name); // Debug log
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Signup successful:", result.user); // Debug log

      // Update the user's display name
      if (name) {
        await updateProfile(result.user, {
          displayName: name,
        });
      }

      // Create user document in Firestore
      await createUserDocument(result.user, { name });

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Signup error details:", {
        code: error.code,
        message: error.message,
        email: email,
      });

      // More user-friendly error messages
      let errorMessage = error.message;
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled.";
          break;
        default:
          errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      console.log("Attempting Google login"); // Debug log
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful:", result.user); // Debug log

      // Create user document in Firestore
      await createUserDocument(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google login error details:", {
        code: error.code,
        message: error.message,
      });

      let errorMessage = error.message;
      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in popup was closed.";
          break;
        case "auth/popup-blocked":
          errorMessage = "Sign-in popup was blocked by the browser.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Sign-in was cancelled.";
          break;
        default:
          errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Auth state changed - user signed in:", user.uid); // Debug log
        // User is signed in
        setUser({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          photoURL: user.photoURL,
        });
      } else {
        console.log("Auth state changed - user signed out"); // Debug log
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
