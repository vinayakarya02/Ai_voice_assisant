# 🎙️ Nova — AI Voice Assistant

An Alexa-style, voice-first AI assistant built with **Next.js 15**. Talk to it,
get concise spoken answers, and keep a private history of your conversations —
all running on **free** AI APIs, with **zero-configuration** deployment to
Vercel.

<p align="center">
  <em>Speak → transcribe → ask AI → hear the reply. No account. No database.</em>
</p>

---

## ✨ Features

- **Push-to-talk voice input** with a live transcript and auto-stop on pause
- **Free AI providers** — Groq, Google Gemini, or OpenRouter (switchable)
- **Natural text-to-speech** with male/female voice, adjustable speed & pitch
- **Conversation history** saved to `localStorage` (revisit, delete, export)
- **Response cards** with copy, regenerate, speak-again, and timestamps
- **Elegant dark UI** — glassmorphism, soft gradients, subtle motion
- **Light/Dark themes**, fully **responsive**, and **accessible** (keyboard,
  ARIA, reduced-motion, high-contrast)
- **Typed fallback** so it still works where speech recognition isn't available
- **Export** any chat as **Markdown** or **plain text**
- **Keyboard shortcut**: press **Space** to start/stop talking

---

## 🧰 Tech Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 18 + TypeScript    |
| Styling    | Tailwind CSS                                        |
| Animation  | Framer Motion                                       |
| Icons      | Lucide                                              |
| Voice      | Browser Web Speech API (Recognition + Synthesis)   |
| AI         | Groq / Gemini / OpenRouter (free tiers), via fetch  |
| Storage    | `localStorage` (no database)                        |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your env file and add at least ONE provider key
cp .env.example .env.local     # macOS / Linux
copy .env.example .env.local   # Windows

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000> and click the microphone.

> **Tip:** Voice recognition needs Chrome, Edge, or Safari. In Firefox (no
> `SpeechRecognition`), use the typed input box — everything else still works.

---

## 🔑 Getting a free API key

You only need **one** of these. Groq is recommended (fast + generous free tier).

| Provider   | Get a free key                                             | Default model                              |
| ---------- | ---------------------------------------------------------- | ------------------------------------------ |
| Groq       | <https://console.groq.com/keys>                            | `llama-3.3-70b-versatile`                  |
| Gemini     | <https://aistudio.google.com/app/apikey>                   | `gemini-1.5-flash`                         |
| OpenRouter | <https://openrouter.ai/keys>                               | `meta-llama/llama-3.3-70b-instruct:free`   |

Add it to `.env.local`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
# GEMINI_API_KEY=
# OPENROUTER_API_KEY=
```

`AI_PROVIDER` sets the default. Users can switch providers in **Settings**, but
the server must have a matching key for the selected provider.

### Optional model overrides

```env
# GROQ_MODEL=llama-3.3-70b-versatile
# GEMINI_MODEL=gemini-1.5-flash
# OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

---

## 📁 Project Structure

```
voice-assistant/
├── app/
│   ├── api/chat/route.ts       # AI endpoint (provider dispatch + errors)
│   ├── about/page.tsx          # About page
│   ├── settings/page.tsx       # Settings page
│   ├── globals.css             # Theme tokens + design system
│   ├── icon.svg                # Favicon
│   ├── layout.tsx              # Root layout + providers + app shell
│   ├── template.tsx            # Page-transition wrapper
│   └── page.tsx                # Home (lazy-loaded assistant experience)
├── components/
│   ├── providers/              # Settings & Conversations React contexts
│   ├── settings/               # Settings form + rows
│   ├── skeletons/              # Loading skeletons
│   ├── ui/                     # Reusable primitives (Toggle, Slider, …)
│   ├── AppShell.tsx            # Sidebar + top bar + main
│   ├── AssistantExperience.tsx # Home composition (hero + dock)
│   ├── ConversationView.tsx    # Message transcript
│   ├── MicButton.tsx           # Animated glowing microphone
│   └── … (cards, toasts, waves, logo)
├── hooks/
│   ├── useAssistant.ts         # Orchestration (STT → AI → TTS + history)
│   ├── useSpeechRecognition.ts # Web Speech: recognition
│   ├── useSpeechSynthesis.ts   # Web Speech: synthesis
│   ├── useTypewriter.ts        # Typing animation
│   └── useMediaQuery.ts
├── lib/
│   ├── ai/                     # Provider adapters (groq/gemini/openrouter)
│   ├── constants.ts            # Defaults, system prompt, provider metadata
│   ├── storage.ts              # Safe localStorage helpers
│   └── voice.ts                # Voice selection + speech chunking
├── types/                      # Domain types + Web Speech declarations
├── utils/                      # cn, id, format, export helpers
├── .env.example
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🎛️ Configuration (in-app)

Open **Settings** to change:

- **AI Provider** — Groq / Gemini / OpenRouter
- **Voice** — male/female + a specific system voice
- **Speaking speed** and **pitch**
- **Auto-speak** replies on/off
- **Theme** — dark / light
- **Clear chat history**

All preferences and conversations persist in your browser's `localStorage`.

---

## ☁️ Deploy to Vercel

This app is **zero-config** on Vercel.

### Option A — CLI

```bash
npm i -g vercel
vercel           # follow the prompts
```

Then add your environment variables:

```bash
vercel env add AI_PROVIDER
vercel env add GROQ_API_KEY
# (repeat for any other providers you want to enable)
vercel --prod
```

### Option B — Dashboard

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket).
2. Go to <https://vercel.com/new> and import the repo.
3. Under **Environment Variables**, add `AI_PROVIDER` and your key(s).
4. Click **Deploy**. That's it — no build settings to change.

> Because API keys are read **server-side** in the API route, they are never
> exposed to the browser.

---

## 🧩 How it works

1. `useSpeechRecognition` captures speech and emits a final transcript.
2. `useAssistant` appends the user message and `POST`s the conversation to
   `/api/chat`.
3. The route picks the configured provider adapter (`lib/ai/*`), calls the
   free API server-side, and returns the reply (with typed error handling for
   missing keys, rate limits, timeouts, etc.).
4. The reply is rendered with a typing animation and, if **auto-speak** is on,
   read aloud via `useSpeechSynthesis`.
5. Everything is saved to `localStorage` through the Conversations context.

---

## 🌐 Browser support

| Feature              | Chrome | Edge | Safari | Firefox |
| -------------------- | :----: | :--: | :----: | :-----: |
| Speech recognition   |   ✅   |  ✅  |   ✅   |   ❌    |
| Speech synthesis     |   ✅   |  ✅  |   ✅   |   ✅    |

Where recognition is unavailable, the **typed input** provides full access.

---

## ♿ Accessibility

- Full keyboard navigation and visible focus rings
- ARIA roles/labels on controls, `role="alert"` for errors
- Respects `prefers-reduced-motion` and `prefers-contrast`

---

## 🛠️ Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
```

---

## ❓ Troubleshooting

- **"The AI provider isn't configured"** — add the matching key to `.env.local`
  and restart `npm run dev`.
- **Microphone blocked** — allow mic access in the browser's site settings, then
  press the mic again (the app shows a retry).
- **No sound** — pick a voice under **Settings → Voice** and press **Test voice**;
  some OSes need a voice to be installed first.
- **Rate limited** — free tiers have limits; wait a moment and retry, or switch
  providers in Settings.

---

## 📄 License

MIT — free to use, modify, and share.
