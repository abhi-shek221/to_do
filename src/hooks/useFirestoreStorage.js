// src/hooks/useFirestoreStorage.js
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export const useFirestoreStorage = (key, initialValue) => {
  const { user } = useAuth();
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user data document reference
  const getUserDataRef = () => {
    if (!user?.uid) return null;
    return doc(db, "userData", user.uid);
  };

  // Read value from Firestore
  const readValue = async () => {
    if (!user?.uid) {
      setStoredValue(initialValue);
      setLoading(false);
      return initialValue;
    }

    try {
      const userDataRef = getUserDataRef();
      const userDataSnap = await getDoc(userDataRef);

      if (userDataSnap.exists()) {
        const userData = userDataSnap.data();
        const value =
          userData[key] !== undefined ? userData[key] : initialValue;
        setStoredValue(value);
        setLoading(false);
        return value;
      } else {
        // Document doesn't exist, create it with initial values
        await setDoc(userDataRef, { [key]: initialValue }, { merge: true });
        setStoredValue(initialValue);
        setLoading(false);
        return initialValue;
      }
    } catch (err) {
      console.error(`Error reading Firestore key "${key}":`, err);
      setError(err);
      setStoredValue(initialValue);
      setLoading(false);
      return initialValue;
    }
  };

  // Set value to Firestore
  const setValue = async (value) => {
    if (!user?.uid) {
      console.warn("No user logged in, cannot save to Firestore");
      return;
    }

    try {
      setError(null);

      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save to Firestore
      const userDataRef = getUserDataRef();
      await setDoc(userDataRef, { [key]: valueToStore }, { merge: true });

      // Update local state
      setStoredValue(valueToStore);

      console.log(
        `Successfully saved ${key} to Firestore for user ${user.uid}`
      );
    } catch (err) {
      console.error(`Error setting Firestore key "${key}":`, err);
      setError(err);
    }
  };

  // Load data when user changes or component mounts
  useEffect(() => {
    if (user?.uid) {
      readValue();
    } else {
      // User logged out, reset to initial value
      setStoredValue(initialValue);
      setLoading(false);
    }
  }, [user?.uid, key]);

  // Optional: Listen for real-time updates (useful if user has multiple tabs open)
  useEffect(() => {
    if (!user?.uid) return;

    const userDataRef = getUserDataRef();
    const unsubscribe = onSnapshot(
      userDataRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const value =
            userData[key] !== undefined ? userData[key] : initialValue;
          setStoredValue(value);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to Firestore key "${key}":`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, key]);

  return [storedValue, setValue, { loading, error }];
};

export default useFirestoreStorage;
