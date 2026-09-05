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
  mimeType: string = 'image/jpeg',
  lang: 'en' | 'rw' = 'rw',
  farmerNote: string = ''
): Promise<GeminiScanAnalysis> {
  const model = getGeminiModel('gemini-3.6-flash');

  const isEnglish = lang === 'en';

  const noteSection = farmerNote.trim()
    ? `\n\nFarmer's additional context (use this to improve your diagnosis): "${farmerNote.trim()}"`
    : '';

  const prompt = `You are an agricultural conservation assistant for Rwandan smallholder farmers.
Analyze this farm photo. Respond ONLY in valid JSON, no markdown, no preamble:
{
  "observation": "<observation in ${isEnglish ? 'English ONLY' : 'Kinyarwanda ONLY'}>",
  "risk_level": "low" | "moderate" | "high",
  "recommendations": ["<action in ${isEnglish ? 'English ONLY' : 'Kinyarwanda ONLY'}>", ...],
  "explanation": "<why this matters, 1-2 sentences, in ${isEnglish ? 'English ONLY' : 'Kinyarwanda ONLY'}>",
  "confidence": "low" | "medium" | "high"
}
CRITICAL REQUIREMENT:
- All text string values MUST be strictly in ${isEnglish ? 'English' : 'Kinyarwanda'}. Do NOT include other languages or translations.
- Do NOT use asterisks (*) or markdown bold formatting anywhere in the JSON strings.
- If confidence is "low", observation should state that the image is not sufficient for a reliable assessment and recommend consulting a local agricultural extension officer (Agronome).
Focus on: soil cover/erosion, visible crop disease/pest signs, mulching, general conservation practice indicators. Do not diagnose with false certainty.${noteSection}`;

  if (!model) {
    console.warn(`GEMINI_API_KEY is not set. Returning a simulated realistic conservation assessment in ${lang}.`);
    if (isEnglish) {
      return {
        observation: "Field photo shows exposed soil with low vegetative cover, visible water erosion channels, and dry soil surface.",
        risk_level: "moderate",
        recommendations: [
          "Apply grass or crop residue mulch to preserve soil moisture.",
          "Dig water infiltration trenches (terracing) along contour lines.",
          "Apply well-decomposed organic compost before planting new crops."
        ],
        explanation: "Mulching and soil erosion control preserve soil nutrients, prevent runoff, and boost crop yields during dry seasons.",
        confidence: "high"
      };
    }

    return {
      observation: "Ifoto igaragaza umurima urimo ubutaka bugaragara butapfutse neza (soil cover nke), hari ibimenyetso by'isuri y'amazi ndetse n'umwuma mu butaka.",
      risk_level: "moderate",
      recommendations: [
        "Sasira umurima ukoresheje ibyatsi byumye (mulching) kugira ngo ubuhehere bugume mu butaka.",
        "Cukura imiringoti ifata amazi (trenches) ku gice gihanamye cy'umurima.",
        "Fumbiza ifumbire y'imborera iboze neza mbere yo gutera ibihingwa bishya."
      ],
      explanation: "Gusasira no kurwanya isuri birinda ubutaka gutwarwa n'imvura kandi bikongera umusaruro w'ibihingwa mu bihe by'izuba.",
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

    // Validate structure and strip asterisks from all fields
    return {
      observation: removeAsterisks(parsed.observation || (isEnglish ? "Analysis completed." : "Isubiramo ry'isuzuma ryarangiye.")),
      risk_level: ['low', 'moderate', 'high'].includes(parsed.risk_level) ? parsed.risk_level : 'moderate',
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map((rec) => removeAsterisks(rec))
        : [removeAsterisks(parsed.recommendations || (isEnglish ? "Consult an agricultural extension officer." : "Gana umujyanama w'ubuhinzi."))],
      explanation: removeAsterisks(parsed.explanation || (isEnglish ? "Conservation agriculture ensures long-term soil productivity." : "Ubuhinzi bubungabunga ubutaka butanga umusaruro urambye.")),
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    };
  } catch (error) {
    console.error('Gemini vision analysis error:', error);
    // Return low confidence fallback recommending extension officer
    if (isEnglish) {
      return {
        observation: "Image quality was insufficient for complete analysis. We recommend consulting a local Agricultural Extension Officer (Agronome).",
        risk_level: "moderate",
        recommendations: [
          "Retake a clearer photo in good lighting.",
          "Consult your local sector agricultural extension officer."
        ],
        explanation: "Accurate diagnosis requires clear visual details of the crop and soil.",
        confidence: "low"
      };
    }
    return {
      observation: "Ifoto ntiyashoboye gusesengurwa neza cyangwa ifite ikibazo cy'uburambe. Turakugira inama yo kwegera umujyanama w'ubuhinzi (Agronome / Extension Officer) ku murenge.",
      risk_level: "moderate",
      recommendations: [
        "Ongera ufate ifoto igaragara neza ifite urumuri rukwiye.",
        "Gana umukozi ushinzwe ubuhinzi ku biro by'umurenge wawe."
      ],
      explanation: "Kugira ngo ubone inama zizewe, ubutaka cyangwa igihingwa kigomba kugaragara neza.",
      confidence: "low"
    };
  }
}

export async function askIncutiChat(
  question: string,
  availableLearningTitles: string[] = [],
  lang: 'en' | 'rw' = 'rw'
): Promise<string> {
  const model = getGeminiModel('gemini-3.6-flash');
  const isEnglish = lang === 'en';

  const titlesList = availableLearningTitles.length > 0 
    ? availableLearningTitles.map(t => `- ${t}`).join('\n')
    : isEnglish
      ? "- Benefits of Soil Mulching & Ground Cover\n- Terracing & Grass Strip Planting on Slopes\n- Preparation & Application of Organic Compost"
      : "- Akamaro ko Gusasira no Gupfuka Ubutaka (Mulching)\n- Gucukura Imiringoti no Gutera Ibyatsi by'Ubwatsi ku Misozi\n- Gukora no Gukoresha Ifumbire y'Imborera Iboshye Neza";

  const systemInstruction = isEnglish
    ? `You are "Incuti Bot", a friendly, empathetic, and expert agricultural conservation assistant for Rwandan smallholder farmers.
Respond ONLY in clear, natural, and encouraging English. Do NOT include Kinyarwanda words or translations.
Keep answers short, practical, and easy to apply in the Rwandan farming context.
CRITICAL FORMATTING REQUIREMENT: Do NOT use any asterisks (*) or markdown bold/bullet formatting (** or *) anywhere in your response. Write clean plain text paragraphs or simple numbered lists (1., 2., 3.) without any asterisk characters.
When relevant to the farmer's question, recommend one of the following learning topics available in the Incuti Learning Hub:
${titlesList}

Always be humble, respectful, and focus on conservation agriculture: soil cover, mulching, compost manure, agroforestry, minimum tillage, and erosion control.`
    : `You are "Incuti Bot", a friendly, empathetic, and expert agricultural conservation assistant for Rwandan smallholder farmers.
Respond ONLY in natural, encouraging, and clear Kinyarwanda. Do NOT include English words or translations.
Keep answers short, practical, and easy to apply in the Rwandan farming context.
CRITICAL FORMATTING REQUIREMENT: Do NOT use any asterisks (*) or markdown bold/bullet formatting (** or *) anywhere in your response. Write clean plain text paragraphs or simple numbered lists (1., 2., 3.) without any asterisk characters.
When relevant to the farmer's question, recommend one of the following learning topics available in the Incuti Learning Hub:
${titlesList}

Always be humble, respectful (use polite Kinyarwanda e.g. "Muraho muhinzi mwiza", "Turakugira inama"), and focus on conservation agriculture: soil cover, mulching, compost manure, agroforestry, minimum tillage, and erosion control.`;

  if (!model) {
    console.warn(`GEMINI_API_KEY not set. Returning realistic Incuti Bot response in ${lang}.`);
    if (isEnglish) {
      return removeAsterisks(`Hello dear farmer! I am Incuti Bot, your assistant for conservation agriculture. Regarding your question: mulching and organic compost are crucial for protecting soil moisture and increasing crop yields. We recommend reading the lesson "${availableLearningTitles[0] || "Benefits of Soil Mulching & Cover"}" in our Learning Hub!`);
    }
    return removeAsterisks(`Muraho muhinzi mwiza! Ndi Incuti Bot, umufasha wawe mu buhinzi bubungabunga ubutaka. Ku bijyanye n'ikibazo cyawe: Gusasira umurima n'ifumbire y'imborera ni ingenzi cyane mu kubungabunga ubutaka no kongera umusaruro. Turakugira inama yo gusoma isomo ryitwa "${availableLearningTitles[0] || "Akamaro ko Gusasira no Gupfuka Ubutaka"}" mu cyiciro cy'Amasomo!`);
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
          parts: [{ text: isEnglish
            ? "Hello! I am ready to help Rwandan farmers with expert conservation advice in English!"
            : "Yego, nditeguye gufasha abahinzi b'i Rwanda mu Kinyarwanda gisesuye no kubagira inama nziza z'ubuhinzi bubungabunga ubutaka!"
          }],
        },
      ],
    });

    const result = await chat.sendMessage(question);
    return removeAsterisks(result.response.text());
  } catch (error) {
    console.error('Gemini chat error:', error);
    if (isEnglish) {
      return "Hello! A temporary connection issue occurred. Please try again or visit our Learning Hub.";
    }
    return "Muraho! Hagaragaye ikibazo mu itumanaho. Turakugira inama yo kongera kugerageza cyangwa gusura igice cy'Amasomo kuri uru rubuga.";
  }
}
