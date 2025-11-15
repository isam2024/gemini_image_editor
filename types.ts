export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface LatentSpaceIdea {
  description: string;
  suggestedPrompt: string;
}

export type LatentSpaceResponse = LatentSpaceIdea[];

export interface IdeasHistoryItem {
  imageUrl: string;
  ideas: LatentSpaceIdea[];
}

export interface ExplorerNode {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  imageUrl: string;
  prompt: string | null;
  ideas: LatentSpaceIdea[] | null;
  isExploring: boolean;
  generatingIdeaIndices: number[];
}