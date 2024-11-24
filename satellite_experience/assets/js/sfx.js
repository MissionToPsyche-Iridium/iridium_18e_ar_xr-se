let audioContext;
let gainNode;
let sounds;
const audioFilePaths = ["../audio/launch.mp3",
						"../audio/open.mp3",
						"../audio/select.mp3",
						"../audio/close.mp3"]

async function getFile(filePath) {
	let response = await fetch(filePath);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	return audioBuffer;
}

async function setupSounds(paths) {
	const audioBuffers = [];
	for (const path of paths) {
		const sound = await getFile(path);
		audioBuffers.push(sound);
	}
	return audioBuffers;
}

function playSound(audioBuffer, time) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(gainNode);
	soundSource.start(time);
}

function loop(audioBuffer, startSecond, durationMilliseconds) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(gainNode);
	soundSource.start(0, startSecond);
	setTimeout(function () {
		loop(audioBuffer, startSecond, durationMilliseconds);
	}, durationMilliseconds);
}

function playLaunchSound(audioBuffer, time) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(gainNode);
	soundSource.start(time);
	setTimeout(function() {
		loop(audioBuffer, 10, 62000);
	}, 72000);
}

function initializeSounds() {
	audioContext = new AudioContext();
	//audioContext = new (window.AudioContext || window.webkitAudioContext)();
	gainNode = audioContext.createGain();
	gainNode.connect(audioContext.destination);

	setupSounds(audioFilePaths).then((response) => {
		sounds = response;
		playLaunchSound(sounds[0], 0);
	})
}

// Play specific sounds
function playOpenSound() {
	playSound(sounds[1], 0);
}

function playSelectSound() {
	playSound(sounds[2], 0);
}

function playCloseSound() {
	playSound(sounds[3], 0);
}

// Set volume globally
function setVolume(level) {
	if (gainNode) {
		gainNode.gain.value = level; // level should be between 0 (mute) and 1 (full volume)
	}
}

// Expose volume control functions globally
window.setVolume = setVolume;
window.playOpenSound = playOpenSound;
window.playSelectSound = playSelectSound;
window.playCloseSound = playCloseSound;
