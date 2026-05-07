export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface PhotoContext {
  title?: string;
  caption?: string;
  mood?: string;
  note?: string;
}

export interface GoDeepInput {
  photoId: string;
  photoContext?: PhotoContext;
  conversationHistory: ConversationTurn[];
  newMessage: string;
}

export interface GoDeepOutput {
  reply: string;
}
