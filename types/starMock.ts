export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StarMockAPIRequest {
  messages: ChatMessage[];
}

export interface StarMockAPIResponse {
  message: ChatMessage;
  error?: string;
}
