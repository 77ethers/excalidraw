import type { ExcalidrawElement } from "@excalidraw/element/types";
import { newElement, newTextElement } from "@excalidraw/element";
import { randomInteger } from "@excalidraw/utils";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  elements: ExcalidrawElement[];
  message: string;
}

const SYSTEM_PROMPT = `You are an AI assistant that helps users create diagrams and drawings in Excalidraw format.

When a user describes what they want to draw, you should respond with a JSON object containing an array of Excalidraw elements.

Excalidraw elements have the following structure:
- Rectangle: { type: "rectangle", x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, opacity }
- Ellipse: { type: "ellipse", x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, opacity }
- Diamond: { type: "diamond", x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, opacity }
- Arrow: { type: "arrow", x, y, width, height, points: [[0,0], [x,y]], strokeColor, strokeWidth, strokeStyle, roughness, opacity }
- Line: { type: "line", x, y, width, height, points: [[0,0], [x,y]], strokeColor, strokeWidth, strokeStyle, roughness, opacity }
- Text: { type: "text", x, y, width, height, text, fontSize, fontFamily, textAlign, strokeColor }

Important properties:
- fillStyle: "solid" | "hachure" | "cross-hatch" | "zigzag"
- strokeStyle: "solid" | "dashed" | "dotted"
- roughness: 0 (architect), 1 (artist), 2 (cartoonist)
- fontFamily: 1 (Virgil), 2 (Helvetica), 3 (Cascadia)
- textAlign: "left" | "center" | "right"

Common colors:
- "#000000" (black), "#ffffff" (white), "#1971c2" (blue), "#2f9e44" (green), "#e03131" (red), "#f08c00" (orange), "#ffc9c9" (light red)

Always respond with valid JSON in this format:
{
  "elements": [...array of elements...],
  "description": "A brief description of what you created"
}

Create clean, well-organized diagrams with proper spacing. Use text labels to make diagrams clear.`;

export class OpenAIService {
  private apiKey: string;
  private baseURL = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateDrawing(
    prompt: string,
    conversationHistory: AIMessage[] = [],
  ): Promise<AIResponse> {
    const messages: AIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: prompt },
    ];

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
      } catch (e) {
        throw new Error("Failed to parse AI response as JSON");
      }

      if (!parsedResponse.elements || !Array.isArray(parsedResponse.elements)) {
        throw new Error("Invalid response format from AI");
      }

      // Convert the AI's element descriptions to actual Excalidraw elements
      const elements = this.convertToExcalidrawElements(
        parsedResponse.elements,
      );

      return {
        elements,
        message:
          parsedResponse.description ||
          "Created drawing based on your description",
      };
    } catch (error: any) {
      throw new Error(
        error.message || "Failed to generate drawing from OpenAI",
      );
    }
  }

  private convertToExcalidrawElements(
    rawElements: any[],
  ): ExcalidrawElement[] {
    const elements: ExcalidrawElement[] = [];

    for (const raw of rawElements) {
      try {
        const baseProps = {
          x: raw.x || 0,
          y: raw.y || 0,
          strokeColor: raw.strokeColor || "#000000",
          backgroundColor: raw.backgroundColor || "transparent",
          fillStyle: (raw.fillStyle || "solid") as any,
          strokeWidth: raw.strokeWidth || 2,
          strokeStyle: (raw.strokeStyle || "solid") as any,
          roughness: raw.roughness ?? 1,
          opacity: raw.opacity ?? 100,
          width: raw.width || 100,
          height: raw.height || 100,
          seed: randomInteger(),
        };

        if (raw.type === "text") {
          const textElement = newTextElement({
            ...baseProps,
            text: raw.text || "",
            fontSize: raw.fontSize || 20,
            fontFamily: raw.fontFamily || 1,
            textAlign: raw.textAlign || "left",
            verticalAlign: raw.verticalAlign || "top",
          });
          elements.push(textElement as any);
        } else if (
          raw.type === "rectangle" ||
          raw.type === "ellipse" ||
          raw.type === "diamond"
        ) {
          const shapeElement = newElement({
            type: raw.type,
            ...baseProps,
          });
          elements.push(shapeElement);
        } else if (raw.type === "arrow" || raw.type === "line") {
          const points = raw.points || [
            [0, 0],
            [raw.width || 100, raw.height || 100],
          ];
          const linearElement = newElement({
            type: raw.type,
            ...baseProps,
            points: points.map(([x, y]: [number, number]) => [x, y]),
          });
          elements.push(linearElement);
        }
      } catch (error) {
        console.error("Failed to convert element:", raw, error);
      }
    }

    return elements;
  }
}
