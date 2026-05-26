// app/api/transcribe/route.js
// Receives audio from the widget, sends to Deepgram STT, returns transcript

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return Response.json({ error: 'No audio file received' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();

    const deepgramRes = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm',
        },
        body: audioBuffer,
      }
    );

    if (!deepgramRes.ok) {
      const errText = await deepgramRes.text();
      console.error('Deepgram STT error:', errText);
      return Response.json({ error: 'Transcription failed' }, { status: 500 });
    }

    const data = await deepgramRes.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';

    return Response.json({ transcript });
  } catch (err) {
    console.error('Transcribe route error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}