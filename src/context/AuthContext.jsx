//AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

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
  const [initializing, setInitializing] = useState(true);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return null;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const { displayName, email, photoURL, uid } = user;
        const userData = {
          uid,
          displayName:
            displayName || additionalData.name || email.split("@")[0],
          email,
          photoURL: photoURL || null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
          isOnline: true,
          ...additionalData,
        };

        console.log("Creating user document for:", email);
        await setDoc(userRef, userData);
        console.log("User document created successfully");
        return userRef;
      } else {
        // Update last login time and set user as online
        console.log("Updating login status for user:", user.uid);
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          isOnline: true,
          isActive: true,
        });
        console.log("Login status updated");
        return userRef;
      }
    } catch (error) {
      console.error("Error creating user document:", error);
      return null;
    }
  };

  // Update user status in Firestore with proper error handling
  const updateUserStatus = async (uid, status) => {
    if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
      console.warn("Invalid user or not authenticated, skipping status update");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn(`User document does not exist for uid: ${uid}`);
        // Don't create document here, let other functions handle it
        return;
      }

      await updateDoc(userRef, {
        isOnline: status,
        lastSeenAt: new Date().toISOString(),
      });

      console.log(`User status updated to ${status ? "online" : "offline"}`);
    } catch (error) {
      console.error("Error updating user status:", error);
      // Don't throw error, just log it
    }
  };

  // Store user session data in Firestore
  const createUserSession = async (user) => {
    if (!user) return;

    try {
      const sessionRef = doc(db, "sessions", user.uid);
      const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        loginAt: new Date().toISOString(),
        isActive: true,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      await setDoc(sessionRef, sessionData, { merge: true });
      console.log("User session stored");
    } catch (error) {
      console.error("Error storing user session:", error);
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      setLoading(true);

      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      if (!email.includes("@")) {
        return { success: false, error: "Please enter a valid email address" };
      }

      console.log("Attempting login for:", email);

      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase login successful:", result.user.uid);

      // Create/update user document and session
      await createUserDocument(result.user);
      await createUserSession(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred.";
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup
  const signup = async (email, password, name) => {
    try {
      setLoading(true);

      if (!email || !password || !name) {
        return { success: false, error: "All fields are required" };
      }

      if (!email.includes("@")) {
        return { success: false, error: "Please enter a valid email address" };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters long",
        };
      }

      console.log("Attempting signup for:", email);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Firebase signup successful:", result.user.uid);

      // Update the user's display name
      if (name) {
        await updateProfile(result.user, {
          displayName: name,
        });
      }

      // Create user document and session
      await createUserDocument(result.user, { name });
      await createUserSession(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Account creation failed. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred.";
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.log("Attempting Google login");

      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful:", result.user.uid);

      await createUserDocument(result.user);
      await createUserSession(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google login error:", error);

      let errorMessage = "Google sign-in failed. Please try again.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in popup was closed. Please try again.";
          break;
        case "auth/popup-blocked":
          errorMessage =
            "Sign-in popup was blocked. Please allow popups and try again.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage = "Sign-in was cancelled.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = error.message || "Google sign-in failed.";
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Simplified logout function
  const logout = async () => {
    try {
      setLoading(true);
      console.log("Starting logout process...");

      const currentUser = auth.currentUser;
      const currentUid = currentUser?.uid;

      // Update user status to offline before signing out (only if user exists)
      if (currentUid) {
        try {
          await Promise.race([
            updateUserStatus(currentUid, false),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 2000)
            ),
          ]);
        } catch (error) {
          console.warn("Failed to update user status during logout:", error);
        }

        // Update session status
        try {
          const sessionRef = doc(db, "sessions", currentUid);
          await Promise.race([
            updateDoc(sessionRef, {
              isActive: false,
              logoutAt: new Date().toISOString(),
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 2000)
            ),
          ]);
          console.log("Session updated");
        } catch (error) {
          console.warn("Failed to update session during logout:", error);
        }
      }

      // Clear local state first
      if (isMountedRef.current) {
        setUser(null);
      }

      // Sign out from Firebase
      await signOut(auth);
      console.log("Logout successful");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);

      // Ensure local state is cleared even on error
      if (isMountedRef.current) {
        setUser(null);
      }

      return { success: false, error: error.message };
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Get user's Firebase ID token
  const getIdToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser && isMountedRef.current) {
          console.log("Auth state changed - user signed in:", firebaseUser.uid);

          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            const userData = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              ...(userSnap.exists() ? userSnap.data() : {}),
            };

            setUser(userData);

            // Update status only if document exists
            if (userSnap.exists()) {
              await updateUserStatus(firebaseUser.uid, true);
            }
          } catch (firestoreError) {
            console.warn(
              "Firestore fetch failed, using Firebase user data only:",
              firestoreError
            );

            if (isMountedRef.current) {
              setUser({
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name:
                  firebaseUser.displayName ||
                  firebaseUser.email?.split("@")[0] ||
                  "User",
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
              });
            }
          }
        } else if (isMountedRef.current) {
          console.log("Auth state changed - user signed out");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        if (isMountedRef.current) {
          setUser(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setInitializing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentUser = auth.currentUser;
      if (currentUser && isMountedRef.current) {
        const isOnline = !document.hidden;
        updateUserStatus(currentUser.uid, isOnline).catch((error) => {
          console.warn(
            "Failed to update user status on visibility change:",
            error
          );
        });
      }
    };

    const handleBeforeUnload = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Use sendBeacon for better reliability during page unload
        try {
          navigator.sendBeacon(
            "/api/logout",
            JSON.stringify({ uid: currentUser.uid })
          );
        } catch (error) {
          // Fallback to regular update
          updateUserStatus(currentUser.uid, false).catch(() => {
            // Ignore errors during page unload
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const value = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    getIdToken,
    loading,
    initializing,
    updateUserStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
