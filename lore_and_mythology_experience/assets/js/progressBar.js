export default function incrementProgressBar(currentProgress) {
	let progress = currentProgress;
	/**
	 * Steps:
	 * telescope (1)
	 * asteroid (1)
	 * phases (12)
	 * launch video (1)
	 * countdown timer (1)
	 * phasesSMP (5)
	 * etc. (0) = (21)
	 */
	let totalSteps = 21;
	let progressUnits = 100 / totalSteps;

	let progressBar = document.createElement("div");
    progressBar.setAttribute("id", "progressBar");
    progressBar.setAttribute("style", "width: 100vw; height: 8px; background-color: rgb(200, 200, 200); position: absolute; top: calc(100vh - 8px); z-index: 100; display: block;");

    let progressBars = document.createElement("div");
    progressBars.setAttribute("id", "progressBars");
    progressBars.setAttribute("style", "width: calc(" + progress + " * " + progressUnits + "vw); height: 8px; background-color: rgb(0, 200, 0); position: absolute; top: calc(100vh - 8px); z-index: 100; display: block;");

    document.body.appendChild(progressBar);
    document.body.appendChild(progressBars);
}
