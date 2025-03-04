class AudioManager {
    constructor(choice) {
        if(choice === "context") {
            this.audio = new Audio(AMPCBackground);
        } else if(choice === "amp") {
            this.audio = new Audio(AMPBackground);
        }
        this.audio.loop = true;
        this.audio.volume = 1;
        this.audio.autoplay = true;

        this.audio.addEventListener('error', (e) => console.error('Audio error:', e));
    }

    play() {
        this.audio.play().catch(error => console.error("Playback failed:", error));
    }


    setVolume(volume) {
        this.audio.volume = volume;
    }
}

export { AudioManager };

const AMPBackground = "../assets/sfx/background-AMP.mp3";
const AMPCBackground = "../assets/sfx/background-AMP-C.mp3";
const SMPBackground = "../assets/sfx/background-SMP.mp3";
