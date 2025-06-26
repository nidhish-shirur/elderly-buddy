const speechService = {
  speak: (text, rate = 1, pitch = 1) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = 'en-US';

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      // Try to find a female English voice
      const femaleVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    }
    return false;
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      return true;
    }
    return false;
  },

  // Check if browser supports speech synthesis
  isSupported: () => {
    return 'speechSynthesis' in window;
  }
};

export default speechService; 