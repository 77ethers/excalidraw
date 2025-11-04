# AI Drawing Assistant Feature

This document describes the new AI Drawing Assistant feature added to Excalidraw.

## Overview

The AI Drawing Assistant allows users to generate Excalidraw drawings from natural language descriptions using OpenAI's GPT models. Users provide their own OpenAI API key, which is stored locally in browser storage.

## Features

- **Natural Language to Drawings**: Describe what you want to draw, and the AI generates Excalidraw elements
- **Conversation Interface**: Chat-like UI for iterative refinement
- **Local API Key Storage**: API keys stored securely in browser localStorage
- **Settings Management**: Easy configuration dialog for API key
- **Keyboard Shortcut**: Quick access via Ctrl/Cmd+K

## Components Added

### 1. AIAssistant Component (`packages/excalidraw/components/AIAssistant/`)
- Main sidebar interface for AI interactions
- Chat-style UI with message history
- Insert generated drawings into canvas
- Real-time loading states

### 2. AISettings Component (`packages/excalidraw/components/AISettings.tsx`)
- Dialog for managing OpenAI API key
- Password-style input with show/hide toggle
- Clear instructions and help links

### 3. OpenAI Service (`packages/excalidraw/ai/openai-service.ts`)
- Handles OpenAI API communication
- Converts AI responses to Excalidraw elements
- Structured prompts for optimal results

### 4. AI Action (`packages/excalidraw/actions/actionAI.tsx`)
- Registers the toggle action for AI Assistant
- Keyboard shortcut: Ctrl/Cmd+K
- Integrated with Excalidraw's action system

### 5. AI Trigger Button (`packages/excalidraw/components/AIAssistant/AIAssistantTrigger.tsx`)
- Toolbar button component
- Can be added to custom UIs

## Usage

### Basic Setup

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";

function App() {
  return (
    <Excalidraw
      aiEnabled={true}
      // ... other props
    />
  );
}
```

### With Custom Trigger Button

```tsx
import { Excalidraw, AIAssistantTrigger } from "@excalidraw/excalidraw";

function App() {
  return (
    <Excalidraw
      aiEnabled={true}
      renderTopRightUI={() => (
        <div>
          <AIAssistantTrigger />
        </div>
      )}
    />
  );
}
```

### Accessing the AI Assistant

1. **Via Keyboard**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
2. **Via Trigger Button**: Click the AI button in the toolbar (if added)
3. **Via Action**: Call `actionToggleAIAssistant` programmatically

### Configuring API Key

1. Open AI Assistant (Ctrl/Cmd+K)
2. Click the settings icon (⚙️)
3. Enter your OpenAI API key
4. Click "Save"

Get an API key from: https://platform.openai.com/api-keys

## API

### Props

#### `aiEnabled` (boolean)
- Enables/disables the AI Assistant feature
- Default: `false`
- Required: Yes (to show AI features)

### Exported Components

```tsx
import {
  AIAssistant,
  AIAssistantTrigger,
  AISettings,
} from "@excalidraw/excalidraw";
```

### Actions

```tsx
import { actionToggleAIAssistant } from "@excalidraw/excalidraw";
```

## Architecture

### Data Flow

1. **User Input** → User types prompt in AI Assistant sidebar
2. **API Call** → OpenAI service sends request with conversation history
3. **Response Parsing** → AI returns JSON with Excalidraw element descriptions
4. **Element Creation** → Service converts JSON to actual Excalidraw elements
5. **Canvas Update** → User clicks "Insert" to add elements to canvas

### OpenAI Integration

- **Model**: GPT-4o-mini (configurable)
- **Response Format**: JSON mode
- **System Prompt**: Detailed instructions for generating valid Excalidraw elements
- **Context**: Maintains conversation history for iterative refinements

### Element Types Supported

The AI can generate:
- Rectangles
- Ellipses
- Diamonds
- Arrows
- Lines
- Text labels

With full control over:
- Position (x, y)
- Size (width, height)
- Colors (stroke, background)
- Styles (fill, stroke, roughness)
- Text properties (font, size, alignment)

## Privacy & Security

- **API Key Storage**: Keys stored in browser localStorage only
- **No Server**: Direct communication between browser and OpenAI
- **No Telemetry**: No data sent to Excalidraw servers
- **User Control**: Users provide and manage their own API keys

## File Structure

```
packages/excalidraw/
├── ai/
│   └── openai-service.ts          # OpenAI API integration
├── actions/
│   └── actionAI.tsx                # AI toggle action
├── components/
│   ├── AIAssistant/
│   │   ├── AIAssistant.tsx         # Main sidebar component
│   │   ├── AIAssistant.scss        # Styling
│   │   └── AIAssistantTrigger.tsx  # Trigger button
│   ├── AISettings.tsx              # Settings dialog
│   ├── AISettings.scss             # Settings styling
│   └── LayerUI.tsx                 # Integration point
├── locales/
│   └── en.json                     # i18n labels
└── index.tsx                       # Exports
```

## Examples

### Example Prompts

1. "Create a simple flowchart with 3 steps: Start, Process, End"
2. "Draw a diagram showing client-server architecture with arrows"
3. "Make a mind map about artificial intelligence with 5 branches"
4. "Create a timeline with 4 events in history"
5. "Draw a simple organizational chart with CEO and 3 departments"

### Customization

You can customize the AI behavior by modifying:

- **System Prompt**: Edit `SYSTEM_PROMPT` in `openai-service.ts`
- **Model**: Change `model` parameter in API call
- **Temperature**: Adjust creativity (0.0-2.0)
- **Styling**: Modify `.scss` files for custom appearance

## Troubleshooting

### "Please configure your OpenAI API key"
- Click settings icon and add your API key
- Verify key is valid and has credits

### "Failed to generate drawing"
- Check internet connection
- Verify API key is correct
- Check OpenAI service status
- Try a simpler prompt

### Elements not showing correctly
- Ensure prompt is clear and specific
- Try regenerating with more detailed description
- Check browser console for errors

## Future Enhancements

Potential improvements:
- Support for more element types (frames, embeddables)
- Image-to-diagram conversion
- Style learning from existing drawings
- Template library integration
- Collaborative AI features

## Contributing

To add new features:

1. Extend `OpenAIService` for new capabilities
2. Update `AIAssistant` UI for new interactions
3. Add new actions in `actionAI.tsx` if needed
4. Update this documentation

## License

This feature follows the same license as Excalidraw.
