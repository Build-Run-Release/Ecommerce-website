import { GoogleGenAI, Type } from "@google/genai";
import { PRODUCTS } from "../constants";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Reduced product list for token efficiency, mapping important fields
const productCatalog = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  price: p.price
}));

export const searchProductsWithAI = async (userQuery: string): Promise<{ matchedProducts: Product[], message: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are a shopping assistant for the University of Ibadan student store.
        
        Here is our product catalog: ${JSON.stringify(productCatalog)}

        The user said: "${userQuery}"

        Task:
        1. Identify which products from the catalog best match the user's request. Consider vague terms like "something for reading" (Books/Lamps) or "I'm hungry" (Food).
        2. Return a list of product IDs.
        3. Write a short, friendly message to the student explaining why you picked these. Use Nigerian student slang occasionally if appropriate (like "Chief", "Scholar", "no wahala"), but keep it professional.

        Return JSON matching this schema.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            assistantMessage: {
              type: Type.STRING
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const ids = result.productIds || [];
    const message = result.assistantMessage || "Here are some items I found for you.";

    const matched = PRODUCTS.filter(p => ids.includes(p.id));
    return { matchedProducts: matched, message };

  } catch (error) {
    console.error("AI Search Error:", error);
    return { 
      matchedProducts: [], 
      message: "Omo, connection is acting up. I couldn't reach the AI brain. Try searching manually!" 
    };
  }
};