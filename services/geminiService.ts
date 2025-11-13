import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImagePart } from '../types';
import { SSPP_FRAMEWORK_PROMPT } from '../prompts/sspp';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeImageWithSSPP = async (imagePart: ImagePart): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [
            { text: SSPP_FRAMEWORK_PROMPT },
            imagePart,
          ]
        },
      });
      return response.text;
    } catch (error) {
      console.error("Error analyzing image with SSPP:", error);
      if (error instanceof Error) {
          throw new Error(`Failed to analyze image: ${error.message}`);
      }
      throw new Error("An unknown error occurred while analyzing the image.");
    }
};

export const editImageWithPrompt = async (imagePart: ImagePart, fullPrompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: fullPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in the API response.");
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};