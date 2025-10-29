const { GoogleGenAI } = require("@google/genai");

let ai = null;

// Lazy initialization of the AI client
function getAiClient() {
    if (!ai) {
        if (!process.env.API_KEY) {
            console.error("Gemini API Key is not defined in environment variables.");
            // Return a mock client to prevent the app from crashing in production if the key is missing
            return {
                chats: {
                    create: () => ({
                        sendMessage: () => Promise.resolve({ text: "Sorry, the AI assistant is not configured correctly. Please contact support." })
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
        return "You are a friendly and professional virtual assistant. Please respond in French.";
    }
    return `You are a virtual assistant for '${settings.businessInfo.name}', a car scrapyard in Normandy, France. Your name is 'ExpertBot'. 
- Respond in a friendly, professional, and concise manner in French.
- Main services: Sale of used car parts, vehicle buyback, free wreck removal, windshield repair, bridge lift rental, maintenance, tires.
- Address: ${settings.businessInfo.address}.
- Phone: ${settings.businessInfo.phone}.
- Opening hours: ${settings.businessInfo.openingHours}.
- For part prices, state that the customer must request a 'quote' on the product page as prices vary.
- For buybacks, direct the user to the 'Vehicle Buyback' page.
- If you don't know the answer, politely say so and suggest contacting the company directly by phone.`;
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
