import { GoogleGenAI, Modality, Content } from "@google/genai";

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return null;
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Access base64 audio data from the candidates part.
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech with Gemini:", error);
    return null;
  }
};


export const analyzeMoodFromPrompt = async (prompt: string): Promise<string | null> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return 'helpful'; // Fallback
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use gemini-3-flash-preview for general text reasoning and classification tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
              systemInstruction: "You are a mood analyzer. Respond with only a single word describing the mood of the user's text. The word must be one of: joyful, curious, helpful, celebratory, thoughtful. If you cannot determine a mood, respond with 'curious'. Do not add any other text or punctuation."
            }
        });

        // Use the .text property to access extracted content as per SDK guidelines.
        const mood = (response.text || '').trim().toLowerCase().replace(/[^a-z]/g, '');
        const validMoods = ['joyful', 'curious', 'helpful', 'celebratory', 'thoughtful'];
        return validMoods.includes(mood) ? mood : 'curious'; 
    } catch (error) {
        console.error("Error analyzing mood with Gemini:", error);
        return 'helpful'; // Fallback on error
    }
};

export const getChatResponse = async (history: Content[], newMessage: string): Promise<string | null> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return null;
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const contents: Content[] = [
            ...history,
            { role: 'user', parts: [{ text: newMessage }] }
        ];

        // Use gemini-3-flash-preview for the chatbot assistant.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                systemInstruction: "You are MeeBot, a friendly and knowledgeable assistant for the MeeChain Dashboard. You can answer questions about NFTs, badges, proposals, and the contributor's journey. Keep your answers concise and helpful."
            }
        });

        // Access response text property directly.
        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return "I encountered an error trying to respond. Please check the console for details.";
    }
};
