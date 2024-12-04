let audioContext;
let gainNode;
let sounds;
const audioFilePaths = ["../audio/dunes.mp3",
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

function playFirstSound(audioBuffer, time) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(gainNode);
	soundSource.start(time);
	setTimeout(function() {
		loop(audioBuffer, 10, 324000);
	}, 334000);
}

function initializeSounds() {
	audioContext = new (window.AudioContext || window.webkitAudioContext)();
	gainNode = audioContext.createGain();
	gainNode.connect(audioContext.destination);

	setupSounds(audioFilePaths).then((response) => {
		sounds = response;
		playFirstSound(sounds[0], 0);
	})
}

// Play specific sounds
function playSound1() {
	playSound(sounds[1], 0);
}

function playSound2() {
	playSound(sounds[2], 0);
}

function playSound3() {
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
window.playSound1 = playSound1;
window.playSound2 = playSound2;
window.playSound3 = playSound3;
