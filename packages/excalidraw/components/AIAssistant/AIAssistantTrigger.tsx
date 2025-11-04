import React from "react";
import { useExcalidrawSetAppState } from "../App";
import { ToolButton } from "../ToolButton";
import { t } from "../../i18n";

export const AIAssistantTrigger: React.FC = () => {
  const setAppState = useExcalidrawSetAppState();

  const handleClick = () => {
    setAppState({
      openSidebar: { name: "ai-assistant" },
    });
  };

  return (
    <ToolButton
      type="button"
      icon={<span style={{ fontSize: "1.25rem" }}>🤖</span>}
      onClick={handleClick}
      title={`${t("labels.aiAssistant")} (Ctrl/Cmd+K)`}
      aria-label={t("labels.aiAssistant")}
      className="ai-assistant-trigger"
    />
  );
};
