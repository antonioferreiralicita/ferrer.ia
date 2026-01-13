
export type MessageRole = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export enum BotPersona {
  MUSK = 'MUSK',
  TRUMP = 'TRUMP',
  MARCAL = 'MARCAL',
  HYBRID = 'HYBRID'
}
