// app/api/tts/route.js
// Receives text reply from Gemini, sends to Deepgram Aura-2 TTS, streams audio back

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    // Aura-2 voices: aura-2-andromeda-en, aura-2-luna-en, aura-2-zeus-en, aura-2-orion-en
    // Change the voice name below to swap voices
    const deepgramRes = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-2-luna-en',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!deepgramRes.ok) {
      const errText = await deepgramRes.text();
      console.error('Deepgram TTS error:', errText);
      return Response.json({ error: 'TTS failed' }, { status: 500 });
    }

    // Stream the audio buffer back to the client
    const audioBuffer = await deepgramRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error('TTS route error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}