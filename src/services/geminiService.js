import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = 'AQ.Ab8RN6JxXPzoqvZAtz-HlSVYV_Fidz29tPNfA4u1ncHhsrB1-g';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SAHAKAR_SYSTEM_PROMPT = `You are Sahakar AI — the helpful multilingual assistant for Sahakar Seva (सहकार सेवा), a government-backed cooperative home services platform in India. 

You help:
- CUSTOMERS: Book services, understand pricing (including 18% GST, cooperative welfare cess, distance surcharge), track worker arrival, understand maintenance schedules (AC filter every 90 days, RO purifier every 60 days, chimney every 45 days), and resolve complaints.
- WORKERS: Understand work hour rules (40h/week max, 30h/week minimum target), overtime rules (only when no other worker available in zone, earns 1.5x bonus), insurance eligibility (after 3 months), CIBIL quality score system, leave policies (30 days annual + emergency), tier city mobility, training opportunities.

Services available: Plumbing, Electrical, AC Repair, Cleaning, Painting, Carpentry, Pest Control, Appliance Repair.

Helpline: 1800-XXX-SEVA (24x7 Toll-Free). Emergency SOS: 112.
For offline registration, visit your nearest Seva Kendra.

Respond in the same language the user writes in (Hindi/Bengali/English). Be warm, concise, and solution-focused.
`;

export async function chatWithSahakarAI(messages, userRole = 'customer') {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction: SAHAKAR_SYSTEM_PROMPT + `\nUser role: ${userRole}.`,
        temperature: 0.7,
      },
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const lastMessage = messages[messages.length - 1];
    const response = await chat.sendMessage({ message: lastMessage.text });
    return { text: response.text, error: null };
  } catch (err) {
    console.error('Gemini error:', err);
    return {
      text: "Maafi karein, abhi kuch technical samasya aa rahi hai. Kripya thodi der baad try karein. / Sorry, technical issue. Please try again shortly.",
      error: err.message
    };
  }
}

export async function getServiceDiagnosis(description, language = 'English', imageBase64 = null) {
  try {
    const langInstruction = language === 'Hindi'
      ? 'Respond entirely in Hindi (Devanagari script).'
      : language === 'Bengali'
        ? 'Respond entirely in Bengali (Bengali script).'
        : 'Respond in English.';

    let contents = [];
    if (imageBase64) {
      contents.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    }
    contents.push({
      text: `${langInstruction} You are a home services expert. Analyze this home issue and provide: 1) Likely cause (1-2 sentences) 2) Urgency level (Low/Medium/High/Emergency) 3) Recommended service type 4) Estimated repair time. Problem description: "${description}"`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{ role: 'user', parts: contents }]
    });
    return { text: response.text, error: null };
  } catch (err) {
    return { text: null, error: err.message };
  }
}

export async function getMaintenanceAdvice(serviceType, lastServiceDate, language = 'English') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `In ${language}: Give a 2-sentence maintenance tip for ${serviceType} (last serviced: ${lastServiceDate}). Mention key signs that indicate it needs servicing now.`
        }]
      }]
    });
    return { text: response.text, error: null };
  } catch (err) {
    return { text: null, error: err.message };
  }
}
