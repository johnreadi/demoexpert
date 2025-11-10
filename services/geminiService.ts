import { GoogleGenAI } from "@google/genai";
import type { SiteSettings, ChatMessage } from '../types';

let ai: InstanceType<typeof GoogleGenAI> | null = null;

// Lazily initialize the AI client to avoid errors on page load
// if the environment variables are not immediately available.
function getAiClient() {
    if (!ai) {
        // This will only be called when the AI is first needed.
        // The environment is expected to provide the API key at this point.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


const getChatSystemInstruction = (settings: SiteSettings | null): string => {
    if (!settings) {
        return "Vous êtes un assistant virtuel amical et professionnel. Répondez en français.";
    }
    return `Vous êtes un assistant virtuel pour '${settings.businessInfo.name}', une casse automobile en Normandie, France. Votre nom est 'ExpertBot'. 
- Répondez de manière amicale, professionnelle et concise en français.
- Services principaux : Vente de pièces auto d'occasion, rachat de véhicules, enlèvement gratuit d'épaves, réparation pare-brise, location de pont, entretien, pneus.
- Adresse : ${settings.businessInfo.address}.
- Téléphone : ${settings.businessInfo.phone}.
- Horaires : ${settings.businessInfo.openingHours}.
- Pour les prix des pièces, indiquez que le client doit faire une 'demande de devis' sur la page du produit car les prix varient.
- Pour le rachat, dirigez l'utilisateur vers la page 'Rachat de Véhicules'.
- Si vous ne connaissez pas la réponse, dites-le poliment et suggérez de contacter l'entreprise directement par téléphone.`;
};


export const getAiChatResponse = async (message: string, history: ChatMessage[], settings: SiteSettings | null): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const chatModel = settings?.advancedSettings?.ai?.chatModel || 'gemini-2.5-flash';
    const systemInstruction = getChatSystemInstruction(settings);

    const modelHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const chat = aiClient.chats.create({
        model: chatModel,
        config: {
          systemInstruction: systemInstruction,
        },
        history: modelHistory
      });

    const result = await chat.sendMessage(message);
    return result.text;

  } catch (error) {
    console.error("Error getting AI chat response:", error);
     if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Désolé, la configuration de l'assistant IA n'est pas correcte. Veuillez contacter le support.";
    }
    return "Désolé, une erreur technique m'empêche de répondre. Veuillez réessayer plus tard ou nous appeler.";
  }
};
