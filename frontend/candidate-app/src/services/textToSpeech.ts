// Speaks text using the browser's native Speech Synthesis API. This keeps all TTS-related logic outside InterviewRoom

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
) {
  window.speechSynthesis.cancel(); // stop any speech that may already be running

  const utterance = new SpeechSynthesisUtterance(text);

  // Configure the interviewer voice

  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // called when the browser starts speaking

  utterance.onstart = () => {
    onStart?.();
  };

  // Called when the browser finishes speaking.

  utterance.onend = () => {
    onEnd?.();
  };

  // Handle speech errors.

  utterance.onerror = (event) => {
    console.error("Text-to-speech error:", event);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance) ; // start speaking 

}

// stops the current speech 

export function stopSpeaking() {
    window.speechSynthesis.cancel()
}
