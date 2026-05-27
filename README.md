# Makerspace Voice Assistant

A production-deployed voice AI assistant built for the MVC Makerspace demonstrating end-to-end design, development, and deployment of a real-world generative AI workflow.

**Live Demo:** [makerspace-voice-assistant.vercel.app](https://makerspace-voice-assistant.vercel.app)

---

## Overview

This project replaces a static help-request form with a fully conversational voice AI assistant. Users speak a question, receive a spoken response, and can continue the conversation naturally  all without typing. Built as a standalone embeddable widget, it integrates into any existing web application via a single iframe.

The project was conceived, designed, and built independently as part of my role as STEM Activities Coordinator at the MVC Makerspace, with the goal of improving accessibility for students and staff interacting with Makerspace equipment and workflows.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React (Next.js 16, App Router) |
| Speech-to-Text | Deepgram Nova-3 (REST API) |
| Language Model | Google Gemini 2.5 Flash |
| Text-to-Speech | Deepgram Aura-2 (Luna voice) |
| Deployment | Vercel |
| Version Control | GitHub |

---

## AI Pipeline

```
User speaks → Deepgram STT → transcript
transcript → Gemini 2.5 Flash (with conversation history) → text response  
text response → Deepgram Aura-2 TTS → spoken audio playback
```

The assistant maintains full conversation context across multiple exchanges using a persistent message history passed with each API request — enabling natural follow-up questions without re-stating context.

---

## Key Features

- **Push-to-talk interface** — single button initiates recording; visual state feedback (idle → recording → thinking → speaking)
- **Conversation memory** — full message history passed to Gemini on each turn, enabling contextual follow-up
- **Audible responses** — Deepgram Aura-2 TTS speaks every response aloud
- **Custom system prompt** — assistant is scoped to Makerspace-specific knowledge (equipment, safety, 3D printing, soldering, robotics)
- **Drop-in embeddable** — single iframe integration, no dependency on host application's codebase
- **Serverless API routes** — three independent Next.js API endpoints (transcribe, chat, tts) for clean separation of concerns

---

## Architecture

```
makerspace-voice-assistant/
├── app/
│   ├── api/
│   │   ├── transcribe/route.js   # Deepgram STT
│   │   ├── chat/route.js         # Gemini conversation
│   │   └── tts/route.js          # Deepgram Aura-2 TTS
│   └── page.js                   # Entry point
└── components/
    ├── VoiceWidget.jsx            # Core React component
    └── VoiceWidget.module.css     # Scoped styles
```

---

## Local Setup

```bash
git clone https://github.com/Immanuel-M/makerspace-voice-assistant.git
cd makerspace-voice-assistant
npm install
```

Create `.env.local`:
```
DEEPGRAM_API_KEY=your_deepgram_key
GEMINI_API_KEY=your_gemini_key
```

```bash
npm run dev
```

---

## Embedding in an Existing App

```html
<iframe
  src="https://makerspace-voice-assistant.vercel.app"
  width="100%"
  height="600px"
  allow="microphone"
  style="border: none; border-radius: 12px;"
/>
```

---

## Background

This project sits at the intersection of my two careers — 15+ years as a Lead VFX Supervisor on productions including *Avengers: Endgame*, *Black Panther*, and *Star Wars: The Rise of Skywalker*, and a decade-long transition into Computer Science (B.S. CSUSB, 2026).

Building this assistant reflects the same instinct I developed in VFX: identify where a workflow breaks down for the humans using it, then design and build the tool that fixes it. In this case, a static help-request form wasn't serving Makerspace users — so I replaced it with something that actually talks back.

---

## Author

**Immanuel Morris**  
STEM Activities Coordinator, MVC Makerspace  
B.S. Computer Science, CSUSB 2026  
[GitHub](https://github.com/Immanuel-M)
