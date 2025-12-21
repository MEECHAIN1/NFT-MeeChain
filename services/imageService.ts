import { GoogleGenAI } from "@google/genai";

interface ImageGenResponse {
  imageUrl: string;
  metadata?: {
    prompt: string;
    timestamp: string;
  };
}

export const generateMeeBotImage = async (prompt: string): Promise<ImageGenResponse | null> => {
  // Assume process.env.API_KEY is pre-configured and accessible.
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    // Use gemini-2.5-flash-image for high-performance image generation.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      // Note: Do not set responseMimeType or responseModalities when calling generateContent for images.
    });
    
    // Safely iterate through all parts to find the image part (inlineData).
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData,
    );

    if (imagePart?.inlineData) {
      const base64ImageBytes: string = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
      return { 
        imageUrl,
        metadata: {
          prompt,
          timestamp: new Date().toISOString(),
        }
      };
    }

    // Fallback if no image part found.
    console.error('Image generation with Gemini succeeded but returned no image data.');
    return { imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/512` };

  } catch (error) {
    console.error('Error generating MeeBot image with Gemini:', error);
    // Safety fallback for API errors.
    return { imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/512` };
  }
};
