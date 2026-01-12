
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Se inicializa siguiendo estrictamente las guías de uso de la SDK
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBatteryResult = async (batteryName: string, tasks: any[], results: any) => {
  const ai = getAI();
  const prompt = `
    Analiza los siguientes resultados de una batería neuropsicológica infantil de "${batteryName}".
    Tareas: ${JSON.stringify(tasks)}
    Resultados: ${JSON.stringify(results)}
    
    Proporciona un resumen clínico breve y una conclusión sugerida. 
    Enfócate en fortalezas y debilidades observadas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Error generating AI analysis.";
  }
};

export const findPatterns = async (allTestResults: any, patientInfo: any) => {
  const ai = getAI();
  const prompt = `
    Como experto neuropsicólogo, analiza el perfil completo del paciente:
    Información: ${JSON.stringify(patientInfo)}
    Resultados Pruebas: ${JSON.stringify(allTestResults)}
    
    Identifica patrones correlacionando diferentes respuestas. 
    Ejemplo: "La dificultad en memoria visual junto con la falla en planeación sugiere un patrón de déficit en memoria de trabajo operativa".
    Indica patrones sugeridos para el diagnóstico final.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Pattern Recognition Error:", error);
    return "No se pudieron identificar patrones automáticamente.";
  }
};

export const chatWithGemini = async (message: string, history: { role: string, parts: string }[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Eres un asistente experto en neuropsicología clínica infantil. Ayudas a profesionales a interpretar pruebas y manejar casos.',
    }
  });

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    return "Error en la comunicación con el asistente.";
  }
};

export const generateStimulusImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `Clinical visual stimulus for children: ${prompt}` }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
