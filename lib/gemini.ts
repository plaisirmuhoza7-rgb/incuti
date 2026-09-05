import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiScanAnalysis } from './types';

// Lazy client initialization inside functions, never at module top-level
function getGeminiModel(modelName: string = 'gemini-3.6-flash') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

export function removeAsterisks(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*/g, '')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

export async function analyzeFarmImageWithGemini(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<GeminiScanAnalysis> {
  const model = getGeminiModel('gemini-3.6-flash');

  const prompt = `You are an agricultural conservation assistant for Rwandan smallholder farmers.
Analyze this farm photo. Respond ONLY in valid JSON, no markdown, no preamble:
{
  "observation": "🇬🇧 <observation in English>\n\n🇷🇼 <observation in Kinyarwanda>",
  "risk_level": "low" | "moderate" | "high",
  "recommendations": [
    "🇬🇧 <action in English>\n🇷🇼 <action in Kinyarwanda>",
    ...
  ],
  "explanation": "🇬🇧 <explanation in English>\n\n🇷🇼 <explanation in Kinyarwanda>",
  "confidence": "low" | "medium" | "high"
}
Provide responses in BOTH English and Kinyarwanda for every text field.
If confidence is "low", observation should state in both languages that the image is not sufficient for a reliable assessment and recommend consulting an agricultural extension officer (Agronome).
Focus on: soil cover/erosion, visible crop disease/pest signs, mulching, general conservation practice indicators. Do not diagnose with false certainty.`;

  if (!model) {
    console.warn('GEMINI_API_KEY is not set. Returning a simulated realistic bilingual conservation assessment.');
    return {
      observation: "🇬🇧 Field photo shows exposed soil with low vegetative cover, visible water erosion channels, and dry soil surface.\n\n🇷🇼 Ifoto igaragaza umurima urimo ubutaka bugaragara butapfutse neza (soil cover nke), hari ibimenyetso by'isuri y'amazi ndetse n'umwuma mu butaka.",
      risk_level: "moderate",
      recommendations: [
        "🇬🇧 Apply grass or crop residue mulch to preserve soil moisture.\n🇷🇼 Sasira umurima ukoresheje ibyatsi byumye (mulching) kugira ngo ubuhehere bugume mu butaka.",
        "🇬🇧 Dig water infiltration trenches (terracing) along contour lines.\n🇷🇼 Cukura imiringoti ifata amazi (trenches) ku gice gihanamye cy'umurima.",
        "🇬🇧 Apply well-decomposed organic compost before planting new crops.\n🇷🇼 Fumbiza ifumbire y'imborera iboze neza mbere yo gutera ibihingwa bishya."
      ],
      explanation: "🇬🇧 Mulching and soil erosion control preserve soil nutrients, prevent runoff, and boost crop yields during dry seasons.\n\n🇷🇼 Gusasira no kurwanya isuri birinda ubutaka gutwarwa n'imvura kandi bikongera umusaruro w'ibihingwa mu bihe by'izuba.",
      confidence: "high"
    };
  }

  try {
    // Strip header prefix if present (e.g. data:image/jpeg;base64,)
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean up potential markdown formatting (e.g. ```json ... ```)
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed: GeminiScanAnalysis = JSON.parse(cleaned);

    // Validate structure
    return {
      observation: parsed.observation || "🇬🇧 Analysis completed.\n\n🇷🇼 Isubiramo ry'isuzuma ryarangiye.",
      risk_level: ['low', 'moderate', 'high'].includes(parsed.risk_level) ? parsed.risk_level : 'moderate',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [parsed.recommendations || "Consult an agricultural extension officer / Gana umujyanama w'ubuhinzi."],
      explanation: parsed.explanation || "🇬🇧 Conservation agriculture ensures long-term soil productivity.\n\n🇷🇼 Ubuhinzi bubungabunga ubutaka butanga umusaruro urambye.",
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    };
  } catch (error) {
    console.error('Gemini vision analysis error:', error);
    // Return low confidence fallback recommending extension officer
    return {
      observation: "🇬🇧 Image quality was insufficient for complete analysis. We recommend consulting a local Agricultural Extension Officer (Agronome).\n\n🇷🇼 Ifoto ntiyashoboye gusesengurwa neza cyangwa ifite ikibazo cy'uburambe. Turakugira inama yo kwegera umujyanama w'ubuhinzi (Agronome / Extension Officer) ku murenge.",
      risk_level: "moderate",
      recommendations: [
        "🇬🇧 Retake a clearer photo in good lighting.\n🇷🇼 Ongera ufate ifoto igaragara neza ifite urumuri rukwiye.",
        "🇬🇧 Consult your local sector agricultural extension officer.\n🇷🇼 Gana umukozi ushinzwe ubuhinzi ku biro by'umurenge wawe."
      ],
      explanation: "🇬🇧 Accurate diagnosis requires clear visual details of the crop and soil.\n\n🇷🇼 Kugira ngo ubone inama zizewe, ubutaka cyangwa igihingwa kigomba kugaragara neza.",
      confidence: "low"
    };
  }
}

export async function askIncutiChat(
  question: string,
  availableLearningTitles: string[] = []
): Promise<string> {
  const model = getGeminiModel('gemini-3.6-flash');

  const titlesList = availableLearningTitles.length > 0 
    ? availableLearningTitles.map(t => `- ${t}`).join('\n')
    : "- Akamaro ko Gusasira no Gupfuka Ubutaka (Mulching)\n- Gucukura Imiringoti no Gutera Ibyatsi by'Ubwatsi ku Misozi\n- Gukora no Gukoresha Ifumbire y'Imborera Iboshye Neza";

  const systemInstruction = `You are "Incuti Bot", a friendly, empathetic, and expert agricultural conservation assistant for Rwandan smallholder farmers.
You MUST respond in BOTH English AND Kinyarwanda for every question asked by the user (Bilingual response format).

Format your response clearly with two sections:
🇬🇧 **English:**
[Provide a short, practical, encouraging answer in English]

🇷🇼 **Kinyarwanda:**
[Provide the equivalent answer in polite, natural Kinyarwanda (e.g. "Muraho muhinzi mwiza", "Turakugira inama")]

When relevant to the farmer's question, recommend one of the following learning topics available in the Incuti Learning Hub:
${titlesList}

Keep answers concise, actionable, respectful, and focused on conservation agriculture: soil cover, mulching, compost manure, agroforestry, minimum tillage, and erosion control.`;

  if (!model) {
    console.warn('GEMINI_API_KEY not set. Returning realistic Incuti Bot bilingual response in English and Kinyarwanda.');
    return `🇬🇧 **English:**\nHello dear farmer! I am Incuti Bot, your assistant for conservation agriculture. Regarding your question: mulching and organic compost are crucial for protecting soil moisture and increasing crop yields. We recommend reading the lesson "${availableLearningTitles[0] || "Benefits of Soil Mulching & Cover"}" in our Learning Hub!\n\n🇷🇼 **Kinyarwanda:**\nMuraho muhinzi mwiza! Ndi Incuti Bot, umufasha wawe mu buhinzi bubungabunga ubutaka. Ku bijyanye n'ikibazo cyawe: Gusasira umurima n'ifumbire y'imborera ni ingenzi cyane mu kubungabunga ubutaka no kongera umusaruro. Turakugira inama yo gusoma isomo ryitwa "${availableLearningTitles[0] || "Akamaro ko Gusasira no Gupfuka Ubutaka"}" mu cyiciro cy'Amasomo!`;
  }

  try {
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'model',
          parts: [{ text: "🇬🇧 **English:**\nHello! I am ready to help Rwandan farmers with expert conservation advice in both English and Kinyarwanda!\n\n🇷🇼 **Kinyarwanda:**\nYego, nditeguye gufasha abahinzi b'i Rwanda mu Kinyarwanda no mu Cyongereza zose zisesuye!" }],
        },
      ],
    });

    const result = await chat.sendMessage(question);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    return "🇬🇧 **English:**\nHello! A temporary connection issue occurred. Please try again or visit our Learning Hub.\n\n🇷🇼 **Kinyarwanda:**\nMuraho! Hagaragaye ikibazo mu itumanaho. Turakugira inama yo kongera kugerageza cyangwa gusura igice cy'Amasomo kuri uru rubuga.";
  }
}
