// app/page.js
// Drop VoiceWidget anywhere in your app — this is just for local testing

import VoiceWidget from '../components/VoiceWidget';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <VoiceWidget />
    </main>
  );
}