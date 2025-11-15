import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { ImagePart, LatentSpaceResponse } from '../types';
import { SSPP_FRAMEWORK_PROMPT } from '../prompts/sspp';
import { getLatentSpaceExplorerPrompt } from "../prompts/latentSpace";

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
      const text = response.text;
      if (!text) {
        const firstCandidate = response.candidates?.[0];
        if (firstCandidate?.finishReason && firstCandidate.finishReason !== 'STOP') {
            throw new Error(`Analysis failed with reason: ${firstCandidate.finishReason}.`);
        }
        const promptFeedback = response.promptFeedback;
        if (promptFeedback?.blockReason) {
            throw new Error(`Request was blocked due to ${promptFeedback.blockReason}.`);
        }
        throw new Error("Analysis resulted in an empty response.");
      }
      return text;
    } catch (error) {
      console.error("Error analyzing image with SSPP:", error);
      if (error instanceof Error) {
          throw new Error(`Failed to analyze image: ${error.message}`);
      }
      throw new Error("An unknown error occurred while analyzing the image.");
    }
};

export const exploreLatentSpace = async (imagePart: ImagePart, numIdeas: number = 4): Promise<LatentSpaceResponse> => {
    try {
      const prompt = getLatentSpaceExplorerPrompt(numIdeas);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
          parts: [
            { text: prompt },
            imagePart,
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                suggestedPrompt: { type: Type.STRING },
              },
              required: ["description", "suggestedPrompt"],
            },
          },
        },
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) {
        const firstCandidate = response.candidates?.[0];
        if (firstCandidate?.finishReason && firstCandidate.finishReason !== 'STOP') {
            throw new Error(`Latent space exploration failed with reason: ${firstCandidate.finishReason}.`);
        }
        const promptFeedback = response.promptFeedback;
        if (promptFeedback?.blockReason) {
            throw new Error(`Request was blocked due to ${promptFeedback.blockReason}.`);
        }
        throw new Error("Latent space exploration resulted in an empty response.");
      }

      const result = JSON.parse(jsonStr);
      return result;
    } catch (error) {
      console.error("Error exploring latent space:", error);
      if (error instanceof Error) {
          if (error.name === 'SyntaxError') {
              throw new Error('Failed to parse a valid JSON response from the model.');
          }
          throw new Error(`Failed to explore latent space: ${error.message}`);
      }
      throw new Error("An unknown error occurred while exploring latent space.");
    }
};

export const editImageWithPrompt = async (imagePart: ImagePart | null, fullPrompt: string): Promise<string> => {
  try {
    const parts: ({ text: string } | ImagePart)[] = [];
    if (imagePart) {
        parts.push(imagePart);
    }
    parts.push({ text: fullPrompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstCandidate = response.candidates?.[0];

    if (!firstCandidate || !firstCandidate.content?.parts) {
        const promptFeedback = response.promptFeedback;
        if (promptFeedback?.blockReason) {
            throw new Error(`Request was blocked: ${promptFeedback.blockReason}.`);
        }
        if (firstCandidate?.finishReason && firstCandidate.finishReason !== 'STOP') {
            throw new Error(`Generation failed: ${firstCandidate.finishReason}.`);
        }
        throw new Error("No valid candidates found in the API response. The request may have been blocked or the model failed to generate content.");
    }


    for (const part of firstCandidate.content.parts) {
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
