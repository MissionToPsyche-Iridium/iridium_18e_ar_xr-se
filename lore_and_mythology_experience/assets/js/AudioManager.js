class AudioManager {
    constructor() {
        this.audio = new Audio(AMPBackground);
        this.audio.loop = true;
        this.audio.volume = 1;
        this.audio.autoplay = true;

        this.audio.addEventListener('error', (e) => console.error('Audio error:', e));
    }

    play() {
        this.audio.play().catch(error => console.error("Playback failed:", error));
    }

    pause() {
        this.audio.pause();
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }
}

export { AudioManager };

const AMPBackground = "../assets/sfx/background-AMP.mp3";
