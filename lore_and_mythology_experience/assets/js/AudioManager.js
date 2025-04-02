class AudioManager {
    constructor(choice) {
        if(choice === "pageTurn" || choice === "phase_transition") {
            if (choice === "pageTurn") {
                this.audio = new Audio(pageTurn);
            } else if (choice === "phase_transition") {
                this.audio = new Audio(smpTransition);
            }
            this.audio.loop = false;
            this.audio.volume = 1;
            this.audio.autoplay = true;
            this.audio.addEventListener('error', (e) => console.error('Audio error:', e));
            this.audio.play().catch(error => console.error("Playback failed:", error));

            if (!this.audio.parentElement) {
                const audioContainer = document.getElementById('audio-container') || document.body;
                audioContainer.appendChild(this.audio);
            }
        }


    }

    play(choice) {
        if(choice === "context") {
            this.audio = new Audio(AMPCBackground);
        } else if(choice === "amp") {
            this.audio = new Audio(AMPBackground);
        }else if(choice === "smp") {
            this.audio = new Audio(SMPBackground);
        }else if(choice === "typing") {
            this.audio = new Audio(TypingAudio);
        } else {
            return;
        }

        if (!this.audio.parentElement) {
            const audioContainer = document.getElementById('audio-container') || document.body;
            audioContainer.appendChild(this.audio);
        }

        this.audio.loop = true;
        this.audio.volume = 1;
        this.audio.autoplay = true;

        this.audio.addEventListener('error', (e) => console.error('Audio error:', e));
        this.audio.play().catch(error => console.error("Playback failed:", error));
    }


    setVolume(volume) {
        this.audio.volume = volume;
    }

    stopPlaying() {
        this.audio.pause();
    }
}

export { AudioManager };

const AMPBackground = "../assets/sfx/background-AMP.mp3";
const AMPCBackground = "../assets/sfx/background-AMP-C.mp3";
const SMPBackground = "../assets/sfx/background-SMP.mp3";
const pageTurn = "../assets/sfx/page_turn.mp3";
const TypingAudio = "../assets/sfx/typing.mp3";
const smpTransition = "../assets/sfx/smp_transition.mp3";
