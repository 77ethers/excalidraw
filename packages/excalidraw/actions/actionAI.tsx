import { StoreAction } from "../store";
import { register } from "./register";

export const actionToggleAIAssistant = register({
  name: "toggleAIAssistant",
  label: "labels.aiAssistant",
  trackEvent: { category: "menu" },
  viewMode: false,
  perform: (elements, appState) => {
    return {
      appState: {
        ...appState,
        openSidebar:
          appState.openSidebar?.name === "ai-assistant"
            ? null
            : { name: "ai-assistant" as const },
      },
      storeAction: StoreAction.CAPTURE,
    };
  },
  predicate: (elements, appState, props, app) => {
    // Only show if aiEnabled prop is true
    return !!props.aiEnabled;
  },
  keyTest: (event) => event.key === "K" && (event.ctrlKey || event.metaKey),
});
