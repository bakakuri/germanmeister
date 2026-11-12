import { CONFIG } from '../config.js';
import { h, toast } from './dom.js';
import { icon } from './icons.js';

// გერმანული ხმა ბრაუზერის ჩაშენებული speechSynthesis-ით — აუდიო ფაილები არ გვჭირდება.
export const audioSupported = 'speechSynthesis' in window;
let voice = null;

function pickVoice() {
  if (!audioSupported) return;
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === CONFIG.SPEECH_LANG) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('de')) ||
    null;
}

if (audioSupported) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

function utterance(text, rate) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = CONFIG.SPEECH_LANG;
  if (voice) u.voice = voice;
  u.rate = rate;
  return u;
}

export function speak(text, rate = 0.9) {
  if (!audioSupported) return toast('ამ ბრაუზერში ხმოვანი წაკითხვა არ მუშაობს');
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance(text, rate));
}

export function speakSequence(lines, rate = 0.9, onEnd) {
  if (!audioSupported) return toast('ამ ბრაუზერში ხმოვანი წაკითხვა არ მუშაობს');
  speechSynthesis.cancel();
  lines.forEach((line, i) => {
    const u = utterance(line, rate);
    if (onEnd && i === lines.length - 1) u.onend = onEnd;
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (audioSupported) speechSynthesis.cancel();
}

// ღილაკი, რომელიც კითხულობს ტექსტს. caption — ღილაკზე დაწერილი ტექსტი (არასავალდებულო).
export function speakBtn(text, { rate = 0.9, caption = '', slow = false } = {}) {
  const label = slow ? 'ნელა მოსმენა' : 'მოსმენა';
  const btn = h(
    'button',
    {
      class: `speak${caption ? ' speak-caption' : ''}`,
      type: 'button',
      'aria-label': label,
      title: label,
      onclick: (e) => {
        e.stopPropagation();
        speak(text, rate);
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 900);
      },
    },
    icon(slow ? 'slow' : 'speaker', 20),
    caption ? h('span', null, caption) : null
  );
  return btn;
}
