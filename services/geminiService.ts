
import { GoogleGenAI, Type } from "@google/genai";
import { GameIntensity } from "../types";

export const getSpecialChallenge = async (intensity: GameIntensity, p1: string, p2: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Bạn là một chuyên gia về tình yêu và sự lãng mạn. Hãy tạo ra một thử thách ngắn (tối đa 2 câu) cho ${p1} thực hiện với ${p2}. 
  Mức độ thân mật: ${intensity}. 
  Ngôn ngữ: Tiếng Việt. 
  Hãy làm cho nó thật quyến rũ, sáng tạo và thú vị. Đừng quá thô tục nhưng phải đủ kích thích.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.8,
      }
    });
    return response.text || "Hãy làm điều gì đó thật lãng mạn ngay bây giờ!";
  } catch (error) {
    console.error("Error fetching special challenge:", error);
    return "Hãy trao cho nhau một nụ hôn nồng cháy!";
  }
};
