import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { Content } from '@google/genai';

// FIX: Add types for the Web Speech API to resolve "Cannot find name 'SpeechRecognition'" error.
// These types might not be present in all TypeScript DOM library versions.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare var SpeechRecognition: {
  new (): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  new (): SpeechRecognition;
};

// Add SpeechRecognition interface for TypeScript to support prefixed versions
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am MeeBot. How can I help you with your MeeChain journey today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopManuallyRef = useRef(false); // To prevent retry on manual stop
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to auto-clear mic error message
  useEffect(() => {
    if (micError) {
      const timer = setTimeout(() => {
        setMicError(null);
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [micError]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Refactored submit logic to be reusable
  const submitMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyForAPI: Content[] = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      const botResponseText = await getChatResponse(historyForAPI, userMessage.text);
      if (botResponseText) {
        const botMessage: Message = { role: 'model', text: botResponseText };
        setMessages(prev => [...prev, botMessage]);
      } else {
         const errorMessage: Message = { role: 'model', text: "Sorry, I couldn't get a response. Please try again." };
         setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', text: "Oops! Something went wrong on my end." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(inputValue);
  };

  const startRecognition = (isRetry = false) => {
    if (isRecording) return; // Prevent multiple starts

    if (!isRetry) {
        setMicError(null);
        stopManuallyRef.current = false;
    }

    // Check for browser support
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setMicError("Sorry, your browser doesn't support voice input.");
      return;
    }

    try {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            submitMessage(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error(`Speech recognition error (isRetry: ${isRetry}):`, event.error);

            if (event.error === 'network' && !isRetry) {
                // Flag for retry, but only on the first attempt's network error.
                (recognitionRef.current as any).shouldRetry = true;
            } else {
                let errorMessage = "Voice input failed. Please try again.";
                if (event.error === 'network') {
                    errorMessage = "Voice service seems unavailable. Please check your connection or try again later.";
                } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    errorMessage = "Microphone access denied. Please enable it in your browser settings.";
                } else if (event.error === 'no-speech') {
                    errorMessage = "I didn't hear anything. Please try speaking again.";
                }
                setMicError(errorMessage);
            }
        };

        recognition.onend = () => {
            const shouldRetry = (recognitionRef.current as any)?.shouldRetry && !stopManuallyRef.current;
            
            setIsRecording(false);
            recognitionRef.current = null;
            
            if (shouldRetry) {
                // Short delay before retrying to prevent hammering the service
                setTimeout(() => startRecognition(true), 100);
            }
        };

        recognition.start();
        setIsRecording(true);

    } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setMicError("Could not start voice input. Please try again.");
        setIsRecording(false);
    }
  };

  const stopRecognition = () => {
      if (recognitionRef.current) {
          stopManuallyRef.current = true;
          recognitionRef.current.stop();
      }
  };

  const handleMicClick = () => {
      if (isRecording) {
          stopRecognition();
      } else {
          startRecognition();
      }
  };


  // Microphone Icon Component
  const MicrophoneIcon: React.FC<{ isRecording: boolean }> = ({ isRecording }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isRecording ? 'text-red-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {isRecording && <circle cx="12" cy="12" r="10" stroke="none" fill="currentColor" opacity="0.2" className="animate-pulse" />}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  return (
    <>
      {/* Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-hidden={!isOpen}>
        <div className="chatbot-header">
          <h3 className="font-bold text-lg">Chat with MeeBot</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
        </div>
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble-wrapper model">
              <div className="message-bubble model typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="chatbot-input-form flex-col">
          {micError && (
            <p className="text-xs text-red-500 mb-2 text-center animate-fade-in-up" style={{animationDuration: '0.3s'}}>{micError}</p>
          )}
          <div className="flex w-full items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Ask something..."}
              disabled={isLoading || isRecording}
              className="chatbot-input"
              aria-label="Chat message input"
            />
            <button type="button" onClick={handleMicClick} disabled={isLoading} className="chatbot-send-btn" aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
              <MicrophoneIcon isRecording={isRecording} />
            </button>
            <button type="submit" disabled={isLoading || isRecording || !inputValue.trim()} className="chatbot-send-btn" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Floating Action Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="chatbot-fab" aria-label={isOpen ? "Close chat" : "Open chat"}>
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </>
  );
};

export default Chatbot;