import React, { useState, useEffect, useCallback } from "react";

const VoiceInput = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      try {
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false; // Changed to false for better control
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError("");
          setTranscript("");
        };

        recognitionInstance.onresult = (event) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart;
            } else {
              interimTranscript += transcriptPart;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript && onResult) {
            onResult(finalTranscript.trim());
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          let errorMessage = "Speech recognition error occurred";

          switch (event.error) {
            case "no-speech":
              errorMessage = "No speech detected. Please try again.";
              break;
            case "audio-capture":
              errorMessage = "Audio capture failed. Check your microphone.";
              break;
            case "not-allowed":
              errorMessage =
                "Microphone access denied. Please allow microphone access.";
              break;
            case "network":
              errorMessage = "Network error occurred. Check your connection.";
              break;
            default:
              errorMessage = `Recognition error: ${event.error}`;
          }

          setError(errorMessage);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
        setIsSupported(true);
      } catch (err) {
        console.error("Failed to initialize speech recognition:", err);
        setError("Failed to initialize speech recognition");
        setIsSupported(false);
      }
    } else {
      setError(
        "Your browser does not support speech recognition. Try using Chrome or Edge."
      );
      setIsSupported(false);
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.error("Error stopping recognition:", err);
        }
      }
    };
  }, [onResult]);

  // Start or stop listening
  const toggleListening = useCallback(() => {
    if (!recognition || !isSupported) {
      setError("Speech recognition is not available");
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
        setIsListening(false);
      }
    } else {
      setTranscript("");
      setError("");

      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Error starting recognition. Please try again.");
      }
    }
  }, [isListening, recognition, isSupported]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setError("");
    } catch (err) {
      setError("Microphone access is required for voice input");
    }
  };

  useEffect(() => {
    if (isSupported) {
      requestMicrophonePermission();
    }
  }, [isSupported]);

  if (!isSupported) {
    return (
      <div className="voice-input">
        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <svg
            className="h-5 w-5 text-yellow-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-yellow-800">
            Voice input is not supported in your browser. Please use Chrome or
            Edge for voice features.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input">
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={toggleListening}
          disabled={!isSupported}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ${
            isListening
              ? "bg-red-500 animate-pulse shadow-lg"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          {isListening ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {isListening ? (
            <span className="text-red-600 font-medium">
              🔴 Listening... Click to stop
            </span>
          ) : (
            "Click microphone to start voice input"
          )}
        </span>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {transcript && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Transcript:</span> {transcript}
          </p>
        </div>
      )}

      {isListening && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600 flex items-center">
            <span className="animate-pulse mr-2">🎤</span>
            Speak now... Your speech will be converted to text
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
