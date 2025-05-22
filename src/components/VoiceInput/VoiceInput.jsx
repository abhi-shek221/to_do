import React, { useState, useEffect, useCallback } from "react";

const VoiceInput = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [recognition, setRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;

        setTranscript(transcriptText);

        if (result.isFinal) {
          onResult(transcriptText);
        }
      };

      recognitionInstance.onerror = (event) => {
        setError(`Error occurred in recognition: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Your browser does not support speech recognition");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onResult]);

  // Start or stop listening
  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setError("");

      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        setError("Error starting recognition: " + error.message);
      }
    }
  }, [isListening, recognition]);

  return (
    <div className="voice-input">
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`rounded-full w-10 h-10 flex items-center justify-center ${
            isListening ? "bg-red-500 animate-pulse" : "bg-primary"
          } text-white`}
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
        <span className="ml-2 text-sm">
          {isListening ? "Listening..." : "Click to start voice input"}
        </span>
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {transcript && (
        <div className="px-3 py-2 bg-gray-50 rounded-md">
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
