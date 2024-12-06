export default class SFXManager {
	constructor() {
		this.audioContext = null;
		this.gainNode = null;
		this.sounds = new Map();
		this.audioFilePaths = {
			launch: "../assets/audio/launch.mp3",
			open: "../assets/audio/open.mp3",
			select: "../assets/audio/select.mp3",
			close: "../assets/audio/close.mp3"
		};
	}

	async initialize() {
		this.audioContext = new AudioContext();
		this.gainNode = this.audioContext.createGain();
		this.gainNode.connect(this.audioContext.destination);

		await this._setupSounds(this.audioFilePaths);
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

	// // Play specific sounds
	// function playSound1() {
	// 	playSound(sounds[1], 0);
	// }

	// function playSound2() {
	// 	playSound(sounds[2], 0);
	// }

	// function playSound3() {
	// 	playSound(sounds[3], 0);
	// }

	// Set volume globally
	setVolume(level) {
		if (this.gainNode) {
			this.gainNode.gain.value = Math.max(0, Math.min(level, 1)); // Clamp between 0 (mute) and 1 (full volume)
		}
	}

	// // Expose volume control functions globally
	// window.setVolume = setVolume;
	// window.playSound1 = playSound1;
	// window.playSound2 = playSound2;
	// window.playSound3 = playSound3;
}