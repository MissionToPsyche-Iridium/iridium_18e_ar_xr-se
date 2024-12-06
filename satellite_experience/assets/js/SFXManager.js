export default class SFXManager {
	constructor() {
		this.audioContext = null;
		this.gainNode = null;
		this.sounds = new Map();
		this.audioFilePaths = {
			launch: "../assets/audio/dunes.mp3",
			open: "../assets/audio/open.mp3",
			select: "../assets/audio/select.mp3",
			close: "../assets/audio/close.mp3"
		};
		this.originalVolume = 0.5;
		this.videoVolume = 0.1;
		this.currentVolume = this.originalVolume;

		// this.player = null;
		// this.apiReady = false;
		// this.currentPlayerId = null;
	}

	async initialize() {
		this.audioContext = new AudioContext();
		this.gainNode = this.audioContext.createGain();
		this.gainNode.connect(this.audioContext.destination);

		await this._setupSounds(this.audioFilePaths);

		const savedVolume = localStorage.getItem("volumeSetting");
        if (savedVolume !== null) {
            this.setVolume(savedVolume / 100);
            this.originalVolume = savedVolume / 100;
        } else {
            this.setVolume(this.originalVolume);
        }

		this.playAmbience("launch", 0);
	}

	// Function to load and decode audio data
	async _getFile(filePath) {
		const response = await fetch(filePath);
		const arrayBuffer = await response.arrayBuffer();

		return await this.audioContext.decodeAudioData(arrayBuffer);
	}

	// Function to load each audio data at path
	async _setupSounds(paths) {
		for (const [name, path] of Object.entries(paths)) {
			const audioBuffer = await this._getFile(path);
			this.sounds.set(name, audioBuffer);
		}
	}

	// Loop audio data
	_loop(audioBuffer, startSecond, durationMilliseconds) {
		const soundSource = this.audioContext.createBufferSource();
		soundSource.buffer = audioBuffer;
		soundSource.connect(this.gainNode);
		soundSource.start(0, startSecond);

		setTimeout(() => {
			this._loop(audioBuffer, startSecond, durationMilliseconds);
		}, durationMilliseconds);
	}

	// Play ambient audio
	playAmbience(soundName, time) {
		const audioBuffer = this.sounds.get(soundName);
		if (!audioBuffer) {
			console.error(`Sound "${soundName}" not found`);
			return;
		}

		const soundSource = this.audioContext.createBufferSource();
		soundSource.buffer = audioBuffer;
		soundSource.connect(this.gainNode);
		soundSource.start(time);

		const durationMilliseconds = audioBuffer.duration * 1000;
		setTimeout(() => {
			this._loop(audioBuffer, 10, durationMilliseconds - 10000);
		}, durationMilliseconds);
	}

	// Play audio data
	_playSound(audioBuffer, time) {
		const soundSource = this.audioContext.createBufferSource();
		soundSource.buffer = audioBuffer;
		soundSource.connect(this.gainNode);
		soundSource.start(time);
	}

	// Play audio
	playSound(soundName) {
		const audioBuffer = this.sounds.get(soundName);
		if (audioBuffer) {
			this._playSound(audioBuffer, 0);
		} else {
			console.error(`Sound "${soundName}" not found`);
		}
	}

	// Set volume globally
    setVolume(level) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(level, 1));
            this.currentVolume = this.gainNode.gain.value;
        }
    }

    // // Called from MissionContentManager when a YouTube video might be present
    // initializeYouTubePlayerIfNeeded(playerId) {
    //     // Check if element exists
    //     const playerElement = document.getElementById(playerId);
    //     if (!playerElement) {
    //         console.log('No player element found, skipping YouTube player initialization.');
    //         return;
    //     }

    //     // Check if it's actually a YouTube embed
    //     const src = playerElement.getAttribute('src') || '';
    //     if (!src.includes('youtube.com/embed/')) {
    //         console.log('Not a YouTube video, skipping YouTube player initialization.');
    //         return;
    //     }

    //     // If player already exists for this element, no need to re-initialize
    //     if (this.player && this.currentPlayerId === playerId) {
    //         return;
    //     }

    //     this.currentPlayerId = playerId;
    //     this._loadYouTubeAPI();
    // }

    // _loadYouTubeAPI() {
    //     if (typeof YT === 'undefined') {
    //         const tag = document.createElement('script');
    //         tag.src = "https://www.youtube.com/iframe_api";
    //         const firstScriptTag = document.getElementsByTagName('script')[0];
    //         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    //         window.onYouTubeIframeAPIReady = () => {
    //             this.apiReady = true;
    //             this._initializeYouTubePlayer(this.currentPlayerId);
    //         };
    //     } else {
    //         this.apiReady = true;
    //         this._initializeYouTubePlayer(this.currentPlayerId);
    //     }
    // }

    // _initializeYouTubePlayer(playerId) {
    //     if (!this.apiReady) return;

    //     this.player = new YT.Player(playerId, {
    //         events: {
    //             'onStateChange': (event) => this._onPlayerStateChange(event)
    //         }
    //     });
    // }

    // _onPlayerStateChange(event) {
    //     const YTState = YT.PlayerState;
    //     switch (event.data) {
    //         case YTState.PLAYING:
    //             this.originalVolume = this.currentVolume; 
    //             this.setVolume(this.videoVolume);
    //             break;
    //         case YTState.PAUSED:
    //         case YTState.ENDED:
    //             this.setVolume(this.originalVolume);
    //             break;
    //     }
    // }
}