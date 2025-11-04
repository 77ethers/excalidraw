import React, { useState } from "react";
import { Dialog } from "./Dialog";
import { TextField } from "./TextField";
import { t } from "../i18n";
import { EditorLocalStorage } from "../data/EditorLocalStorage";
import { EDITOR_LS_KEYS } from "@excalidraw/common";
import "./AISettings.scss";

interface AISettingsProps {
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState<string>(
    EditorLocalStorage.get<string>(EDITOR_LS_KEYS.OAI_API_KEY) || "",
  );
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      EditorLocalStorage.set(EDITOR_LS_KEYS.OAI_API_KEY, apiKey.trim());
      onSave(apiKey.trim());
      onClose();
    }
  };

  const handleClear = () => {
    EditorLocalStorage.delete(EDITOR_LS_KEYS.OAI_API_KEY);
    setApiKey("");
  };

  return (
    <Dialog
      onCloseRequest={onClose}
      title="AI Assistant Settings"
      className="ai-settings-dialog"
      size="small"
    >
      <div className="ai-settings-content">
        <div className="ai-settings-description">
          <p>
            Configure your OpenAI API key to enable AI-powered drawing
            generation.
          </p>
          <p>
            Your API key is stored locally and never sent to Excalidraw
            servers.
          </p>
        </div>

        <div className="ai-settings-field">
          <label htmlFor="ai-api-key">OpenAI API Key</label>
          <div className="ai-settings-input-group">
            <input
              id="ai-api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="ai-settings-input"
              autoFocus
            />
            <button
              type="button"
              className="ai-settings-toggle-visibility"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="ai-settings-help">
          <p>
            Don't have an API key?{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get one from OpenAI
            </a>
          </p>
        </div>

        <div className="ai-settings-actions">
          <button
            type="button"
            onClick={handleClear}
            className="ai-settings-button ai-settings-button--secondary"
            disabled={!apiKey}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ai-settings-button ai-settings-button--secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ai-settings-button ai-settings-button--primary"
            disabled={!apiKey.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
};
