import type { SiteSettings, ChatMessage } from '../types';
import { http } from './http';

export const getAiChatResponse = async (message: string, history: ChatMessage[], settings: SiteSettings | null): Promise<string> => {
  try {
    const res = await http<{ text: string }>(`/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history, settings })
    });
    return res?.text || "Désolé, je n’ai pas pu générer de réponse.";
  } catch (e: any) {
    const base = "Je suis un assistant. L’IA n’est pas disponible pour le moment.";
    return base;
  }
};
