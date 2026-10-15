export class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.musicTimer = null;
    this.note = 0;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (enabled) this.startMusic();
    else this.stopMusic();
  }

  getContext() {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.context) this.context = new AudioContextClass();
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency, duration = 0.12, type = "sine", volume = 0.035) {
    if (!this.enabled) return;
    const context = this.getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + duration,
    );
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  play(name) {
    const notes = {
      jump: 440,
      coin: 760,
      gem: 920,
      rescue: 600,
      win: 660,
      tap: 340,
      checkpoint: 520,
    };
    const frequency = notes[name] ?? 380;
    this.tone(frequency, name === "win" ? 0.3 : 0.1, "sine", 0.04);
    if (name === "win")
      window.setTimeout(() => this.tone(880, 0.34, "sine", 0.035), 150);
  }

  startMusic() {
    if (this.musicTimer || !this.musicEnabled) return;
    const melody = [
      523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46,
    ];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled || document.hidden) return;
      this.tone(melody[this.note++ % melody.length], 0.24, "sine", 0.012);
    }, 430);
  }

  stopMusic() {
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  destroy() {
    this.stopMusic();
    this.context?.close();
  }
}
