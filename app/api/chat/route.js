// app/api/chat/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant for the MVC Makerspace. 
You help students and staff with questions about equipment, tools, 3D printing (Bambu printers), 
soldering, robotics projects, and general Makerspace policies. 
Keep your answers concise and clear — users are listening to your response out loud.
If you don't know something specific, direct the user to speak with a Makerspace coordinator.`;

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || message.trim() === '') {
      return Response.json({ error: 'No message provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const chat = model.startChat({
      systemInstruction:{
        parts: [{ text: SYSTEM_PROMPT }],
        },
      history: history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return Response.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return Response.json({ error: 'Failed to get response' }, { status: 500 });
  }
}