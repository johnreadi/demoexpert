const { GoogleGenAI } = require("@google/genai");

let ai = null;

// Initialisation différée du client AI
function getAiClient() {
    if (!ai) {
        if (!process.env.API_KEY) {
            console.error("Clé API Gemini non définie dans les variables d'environnement.");
            // Retourne un client factice pour éviter de faire planter l'application en production
            return {
                chats: {
                    create: () => ({
                        sendMessage: () => Promise.resolve({ text: "Désolé, la configuration de l'assistant IA n'est pas correcte. Veuillez contacter le support." })
                    })
                }
            };
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


const getChatSystemInstruction = (settings) => {
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


const getAiChatResponse = async (message, history, settings) => {
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

module.exports = { getAiChatResponse };
