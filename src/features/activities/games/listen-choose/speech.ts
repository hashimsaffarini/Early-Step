/** Arabic text-to-speech via the browser (no network, no files). */
export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakArabic(text: string): boolean {
  if (!isSpeechAvailable()) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar';
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
