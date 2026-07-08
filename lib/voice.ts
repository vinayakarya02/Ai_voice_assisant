import type { VoiceGender } from "@/types";

/**
 * Heuristics for choosing a SpeechSynthesis voice. Browsers do not expose a
 * gender field, so we guess from the voice name using common name lists.
 */

const FEMALE_HINTS = [
  "female",
  "woman",
  "samantha",
  "victoria",
  "zira",
  "susan",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "serena",
  "allison",
  "ava",
  "joanna",
  "salli",
  "kendra",
  "zoe",
  "google us english", // Chrome's default US voice sounds female
];

const MALE_HINTS = [
  "male",
  "man",
  "david",
  "mark",
  "daniel",
  "alex",
  "fred",
  "tom",
  "george",
  "james",
  "arthur",
  "matthew",
  "guy",
  "rishi",
  "oliver",
];

/** Prefer English voices; fall back to whatever the platform provides. */
export function englishFirst(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice[] {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return en.length ? en : voices;
}

export function guessGender(voice: SpeechSynthesisVoice): VoiceGender {
  const name = voice.name.toLowerCase();
  if (MALE_HINTS.some((h) => name.includes(h))) return "male";
  return "female";
}

/**
 * Resolve the voice to use, in priority order:
 *   1. exact voiceURI match (user's explicit pick)
 *   2. first voice matching the requested gender heuristic
 *   3. first English voice
 *   4. first available voice
 */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  voiceURI: string | null,
  gender: VoiceGender
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  if (voiceURI) {
    const exact = voices.find((v) => v.voiceURI === voiceURI);
    if (exact) return exact;
  }

  const pool = englishFirst(voices);
  const hints = gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  const byGender = pool.find((v) =>
    hints.some((h) => v.name.toLowerCase().includes(h))
  );

  return byGender || pool[0] || voices[0] || null;
}

/**
 * Split long text into speakable chunks at sentence boundaries. This avoids
 * the well-known Chrome bug where utterances longer than ~15s get cut off.
 */
export function chunkForSpeech(text: string, maxLen = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if ((current + " " + sentence).trim().length <= maxLen) {
      current = (current + " " + sentence).trim();
    } else {
      if (current) chunks.push(current);
      // A single sentence longer than maxLen is pushed as-is.
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text];
}
