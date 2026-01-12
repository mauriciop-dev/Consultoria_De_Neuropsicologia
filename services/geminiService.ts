
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Se inicializa siguiendo estrictamente las guías de uso de la SDK
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBatteryResult = async (batteryName: string, tasks: any[], results: any) => {
  const ai = getAI();
  const prompt = `
    Actúa como un Neuropsicólogo Clínico experto. 
    Analiza los resultados de la batería neuropsicológica infantil: "${batteryName}".
    
    Tareas evaluadas: ${JSON.stringify(tasks)}
    Puntajes y Respuestas del paciente: ${JSON.stringify(results)}
    
    Instrucciones:
    1. Proporciona un resumen clínico estructurado en Markdown.
    2. Usa negritas para términos técnicos.
    3. Incluye una sección de "Fortalezas" y otra de "Debilidades o Signos de Alerta".
    4. Concluye con una "Impresión Diagnóstica Sugerida" específica para esta área.
    5. Mantén un tono profesional, empático y técnico.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "### Error en el Análisis\nNo se pudo generar la interpretación IA debido a un problema de conexión con el modelo.";
  }
};

export const findPatterns = async (allTestResults: any, patientInfo: any) => {
  const ai = getAI();
  const prompt = `
    Como experto en Neurodesarrollo y Neuropsicología, realiza un análisis integral del caso:
    
    DATOS DEL PACIENTE: ${JSON.stringify(patientInfo)}
    RESULTADOS DE TODAS LAS BATERÍAS: ${JSON.stringify(allTestResults)}
    
    Objetivo:
    - Identificar patrones de comportamiento y cognitivos que se repitan entre las diferentes pruebas.
    - Explicar cómo una debilidad en un área (ej. atención) podría estar afectando otra (ej. lenguaje).
    - Sugerir un perfil neuropsicológico (ej. Perfil TDAH, Trastorno Fonológico, etc.).
    - Proporcionar recomendaciones de intervención basadas en evidencia.
    
    Formato: Usa Markdown con encabezados claros.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Pattern Recognition Error:", error);
    return "### Análisis Global No Disponible\nEl sistema no pudo correlacionar los patrones en este momento. Verifique que haya ingresado datos en al menos dos baterías.";
  }
};

export const chatWithGemini = async (message: string, history: { role: string, parts: string }[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Eres un asistente experto en neuropsicología clínica infantil. Ayudas a profesionales a interpretar pruebas y manejar casos clínicos de niños con diversas dificultades de aprendizaje o desarrollo. Tu lenguaje es técnico pero accesible para el profesional.',
    }
  });

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    return "Error en la comunicación con el asistente. Por favor, intente de nuevo.";
  }
};

export const generateStimulusImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `Clinical visual stimulus for children, simple and clear, white background: ${prompt}` }] },
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
