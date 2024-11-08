let audioContext;
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
	soundSource.connect(audioContext.destination);
	soundSource.start(time);
}

function loop(audioBuffer, startSecond, durationMilliseconds) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(audioContext.destination);
	soundSource.start(0, startSecond);
	setTimeout(function () {
		loop(audioBuffer, startSecond, durationMilliseconds);
	}, durationMilliseconds);
}

function playFirstSound(audioBuffer, time) {
	const soundSource = audioContext.createBufferSource();
	soundSource.buffer = audioBuffer;
	soundSource.connect(audioContext.destination);
	soundSource.start(time);
	setTimeout(function() {
		loop(audioBuffer, 10, 62000);
	}, 72000);
}

function initializeSounds() {
	setupSounds(audioFilePaths).then((response) => {
		sounds = response;
		playFirstSound(sounds[0], 0);
	})
}

function playSound1() {
	playSound(sounds[1], 0);
}

function playSound2() {
	playSound(sounds[2], 0);
}

function playSound3() {
	playSound(sounds[3], 0);
}
