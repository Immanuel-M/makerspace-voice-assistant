'use client';

import { useState, useRef } from 'react';
import styles from './VoiceWidget.module.css';

export default function VoiceWidget() {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const statusLabels = {
    idle: 'Tap to ask for help',
    recording: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
  };

  async function startRecording() {
    setError('');
    setTranscript('');
    setResponse('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      setStatus('idle');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('thinking');
    }
  }

  async function processAudio(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const sttRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!sttRes.ok) throw new Error('Transcription failed');
      const { transcript: userText } = await sttRes.json();

      if (!userText || userText.trim() === '') {
        setError('No speech detected. Please try again.');
        setStatus('idle');
        return;
      }

      setTranscript(userText);

      const updatedMessages = [...messagesRef.current, { role: 'user', content: userText }];

      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: updatedMessages }),
      });

      if (!chatRes.ok) throw new Error('Chat response failed');
      const { reply } = await chatRes.json();
      setResponse(reply);

      messagesRef.current = [...updatedMessages, { role: 'assistant', content: reply }];
      setMessages(messagesRef.current);

      setStatus('speaking');
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply }),
      });

      if (!ttsRes.ok) throw new Error('Text-to-speech failed');
      const audioArrayBuffer = await ttsRes.arrayBuffer();
      const audioBlob2 = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob2);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setStatus('idle');
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setStatus('idle');
        };
        audioRef.current.play();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  function handleButtonClick() {
    if (status === 'idle') startRecording();
    else if (status === 'recording') stopRecording();
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Makerspace Assistant</h2>
      <p className={styles.subtitle}>Ask me anything about the Makerspace</p>

      <button
        className={`${styles.micButton} ${styles[status]}`}
        onClick={handleButtonClick}
        disabled={status === 'thinking' || status === 'speaking'}
        aria-label={statusLabels[status]}
      >
        <MicIcon status={status} />
      </button>

      <p className={styles.statusLabel}>{statusLabels[status]}</p>

      {transcript && (
        <div className={styles.bubble}>
          <span className={styles.bubbleLabel}>You said</span>
          <p className={styles.bubbleText}>{transcript}</p>
        </div>
      )}

      {response && (
        <div className={`${styles.bubble} ${styles.responseBubble}`}>
          <span className={styles.bubbleLabel}>Assistant</span>
          <p className={styles.bubbleText}>{response}</p>
        </div>
      )}

      {response && status === 'idle' && (
        <p className={styles.statusLabel}>Tap the mic to ask a follow-up</p>
    )}

      {error && <p className={styles.error}>{error}</p>}

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}

function MicIcon({ status }) {
  if (status === 'thinking') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32">
          <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    );
  }
  if (status === 'speaking') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}