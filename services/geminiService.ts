import type { SiteSettings, ChatMessage } from '../types';

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
  // Stub sans dépendance externe: renvoie une réponse simple et utile.
  const intro = getChatSystemInstruction(settings);
  const lastUser = message?.trim();
  const base = "Je suis un assistant. Pour des réponses IA avancées, veuillez configurer une clé dans GEMINI_API_KEY et activer l'intégration ultérieurement.";
  if (!lastUser) return base;
  return `${base}\n\nContexte: ${intro}\n\nVous avez demandé: "${lastUser}". Pour un devis pièces, utilisez la fonction 'demande de devis' sur la page produit. Pour le rachat véhicule, consultez /rachat-vehicule.`;
};
