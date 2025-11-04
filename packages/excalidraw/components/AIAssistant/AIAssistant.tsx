import React, { useState, useRef, useEffect } from "react";
import { Island } from "../Island";
import { useApp } from "../App";
import { EditorLocalStorage } from "../../data/EditorLocalStorage";
import { EDITOR_LS_KEYS } from "@excalidraw/common";
import { OpenAIService, type AIMessage } from "../../ai/openai-service";
import { AISettings } from "../AISettings";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import "./AIAssistant.scss";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  elements?: ExcalidrawElement[];
  error?: boolean;
}

export const AIAssistant: React.FC = () => {
  const app = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const apiKey = EditorLocalStorage.get<string>(EDITOR_LS_KEYS.OAI_API_KEY);
    setHasApiKey(!!apiKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const apiKey = EditorLocalStorage.get<string>(EDITOR_LS_KEYS.OAI_API_KEY);
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const service = new OpenAIService(apiKey);
      const conversationHistory: AIMessage[] = messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));

      const response = await service.generateDrawing(
        userMessage.content,
        conversationHistory,
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        elements: response.elements,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: error.message || "Failed to generate drawing",
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertElements = (elements: ExcalidrawElement[]) => {
    if (elements && elements.length > 0) {
      const sceneElements = app.scene.getElements();
      app.scene.replaceAllElements([...sceneElements, ...elements]);
      app.setToast({ message: "Drawing inserted!" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    app.setAppState({ openSidebar: null });
  };

  if (showSettings) {
    return (
      <AISettings
        onClose={() => setShowSettings(false)}
        onSave={(apiKey) => {
          setHasApiKey(true);
          setShowSettings(false);
        }}
      />
    );
  }

  return (
    <div className="ai-assistant">
      <Island padding={0} className="ai-assistant-container">
        <div className="ai-assistant-header">
          <h2>AI Drawing Assistant</h2>
          <div className="ai-assistant-header-actions">
            <button
              className="ai-assistant-button ai-assistant-button--icon"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              ⚙️
            </button>
            <button
              className="ai-assistant-button ai-assistant-button--icon"
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="ai-assistant-messages">
          {messages.length === 0 && (
            <div className="ai-assistant-welcome">
              <h3>Welcome to AI Drawing Assistant!</h3>
              <p>
                Describe what you want to draw, and I'll create it for you.
              </p>
              <div className="ai-assistant-examples">
                <p>Try these examples:</p>
                <ul>
                  <li>"Create a simple flowchart for a login process"</li>
                  <li>"Draw a diagram of a client-server architecture"</li>
                  <li>"Make a mind map about machine learning"</li>
                  <li>"Create a timeline with 5 events"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`ai-assistant-message ai-assistant-message--${message.role} ${
                message.error ? "ai-assistant-message--error" : ""
              }`}
            >
              <div className="ai-assistant-message-avatar">
                {message.role === "user" ? "👤" : "🤖"}
              </div>
              <div className="ai-assistant-message-content">
                <div className="ai-assistant-message-text">
                  {message.content}
                </div>
                {message.elements && message.elements.length > 0 && (
                  <button
                    className="ai-assistant-button ai-assistant-button--primary"
                    onClick={() => handleInsertElements(message.elements!)}
                  >
                    Insert Drawing ({message.elements.length} elements)
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-assistant-message ai-assistant-message--assistant">
              <div className="ai-assistant-message-avatar">🤖</div>
              <div className="ai-assistant-message-content">
                <div className="ai-assistant-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-assistant-input-container">
          {!hasApiKey && (
            <div className="ai-assistant-warning">
              <span>⚠️ Please configure your OpenAI API key in settings</span>
            </div>
          )}
          <div className="ai-assistant-input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to draw..."
              className="ai-assistant-input"
              rows={3}
              disabled={isLoading}
            />
            <button
              className="ai-assistant-button ai-assistant-button--send"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              title="Send (Enter)"
            >
              {isLoading ? "..." : "➤"}
            </button>
          </div>
          <div className="ai-assistant-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </Island>
    </div>
  );
};
