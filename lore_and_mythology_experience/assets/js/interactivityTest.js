/**
 * Interactivity Test
 * A test intended to ensure content reacts to user action.
 * Only applicable to screens without static animations.
 */
export default async function interactivityTest(intervalID) {
	console.log("Initiating automatic interactivity test... Please wait.");

	const width = window.innerWidth;
	const height = window.innerHeight;

	let randomX1 = Math.floor(Math.random() * (width + 1));
	let randomY1 = Math.floor(Math.random() * (height + 1));

	let oldLayers = document.elementsFromPoint(randomX1, randomY1);

	let randomX2 = Math.floor(Math.random() * (width + 1));
	let randomY2 = Math.floor(Math.random() * (height + 1));

	let elements = document.elementsFromPoint(randomX2, randomY2);
	if (elements != null) {
		elements.forEach((elem, i) => {
			if (elem.style.backgroundColor != null) {
				elem.click();
			}
		});
	}

	setTimeout(() => {
		let newLayers = document.elementsFromPoint(randomX1, randomY1);
		if (newLayers.length != oldLayers.length) {
			console.log("Interactivity confirmed.");
			clearInterval(intervalID);
		}
		else {
			console.log("No change.");
		}
	}, 2500);
}
