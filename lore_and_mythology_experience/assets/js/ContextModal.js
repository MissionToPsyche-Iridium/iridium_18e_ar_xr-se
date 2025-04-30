/**
 * AudioManager - Custom module handling background music, sfx, volume, etc.
 */
import { AudioManager } from './AudioManager.js';

/**
 * Increment a progress bar UI element as steps in the scene are loaded.
 */
import incrementProgressBar from './progressBar.js';

/**
 * Global AudioManager instance used for playing context music and ambient sounds.
 */
let audioManager = new AudioManager();

/**
 * Audio manager plays "context" sound immediately.
 */
audioManager.play("context");
audioManager.setVolume(0.5);

incrementProgressBar(0);

/**
 * Asynchronously loads the "context" modal
 * and waits for the user to dismiss it.
 *
 * @async
 * @function showContext
 * @returns {Promise<void>} A promise that resolves once the user clicks on the telescope background.
 */
export default async function showContext() {
    const phase_div = document.createElement("div");
    phase_div.setAttribute("id", "context_modal");
    phase_div.setAttribute(
        "style",
        "display: block; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
        "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s;"
    );

    // Hide settings button when context is shown
    document.getElementById("settings-icon-button").style.display = "none";

    try {
        // Fetch an external HTML snippet that describes the "context" overlay
        const response = await fetch("../pages/amp_context.html");
        const data = await response.text();
        phase_div.innerHTML = data;
        document.body.appendChild(phase_div);
    } catch (error) {
        console.error("Error fetching the HTML:", error);
    }

    /**
     * Stores a reference to the telescope background element in the context modal.
     * @type {HTMLElement|null}
     */
    const telescopeBackground = document.getElementById("telescopeBg");

    startAnimations();
    await waitForTelescopeClick(telescopeBackground);
    hideContext();
}

/**
 * Returns a promise that resolves when the user clicks on the telescope background.
 *
 * @function waitForTelescopeClick
 * @param {HTMLElement} telescopeBackground
 * @returns {Promise<Event>} Resolves with the click event once it occurs.
 */
function waitForTelescopeClick(telescopeBackground) {
    return new Promise((resolve) => {
        telescopeBackground.addEventListener(
            "click",
            (event) => {
                incrementProgressBar(1);
                triggered("telescope");
                resolve(event);
            },
            { once: true }
        );
    });
}

/**
 * Removes the context modal from the DOM and stop audio.
 *
 * @function hideContext
 * @returns {void}
 */
function hideContext() {
    // Restore settings button visibility
    document.getElementById("settings-icon-button").style.display = "block";

    const modal = document.getElementById("context_modal");
    if (modal) {
        modal.remove();
    }

    // Stop "context" sound
    audioManager.stopPlaying();
}

/**
 * Starts some basic UI animations in the context modal.
 *
 * @function startAnimations
 * @returns {void}
 */
function startAnimations() {
    let opacity = 0;
    let intervalID = 0;
    const scroll = document.getElementById("scroll");
    const clickDialog = document.getElementById("scrollClick");
    const telescopeBackground = document.getElementById("telescopeBg");
    scroll.style.opacity = 0;
    let blinkIn = 0;
    fadeIn();

    /**
     * Fades in the scroll prompt over time.
     * @inner
     */
    function fadeIn() {
        clearInterval(intervalID);
        intervalID = setInterval(showScroll, 10);
    }

    /**
     * Fades out the scroll prompt over time.
     * @inner
     */
    function fadeOut() {
        clearInterval(intervalID);
        intervalID = setInterval(hideScroll, 10);
    }

    /**
     * Increases scroll prompt opacity until fully visible,
     * then schedules fadeOut after a short delay.
     * @inner
     */
    function showScroll() {
        opacity = Number(window.getComputedStyle(scroll).getPropertyValue("opacity"));
        if (opacity < 1) {
            opacity += 0.005;
            scroll.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
            setTimeout(fadeOut, 3000);
        }
    }

    /**
     * Decreases scroll prompt opacity until fully invisible,
     * then starts blinking the telescope background.
     * @inner
     */
    function hideScroll() {
        opacity = Number(window.getComputedStyle(scroll).getPropertyValue("opacity"));
        if (opacity > 0) {
            opacity -= 0.005;
            scroll.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
            // Start the blink animation for the telescope background.
            intervalID = setInterval(blinkTelescope, 10);
            clickDialog.style.opacity = 1;
        }
    }

    /**
     * Blinks the telescope background in/out by manipulating its opacity.
     * @inner
     */
    function blinkTelescope() {
        const currentColor = window.getComputedStyle(telescopeBackground).getPropertyValue("background-color");
        // Updated the regex to allow optional spaces after commas.
        const rgba = currentColor.match(/rgba?\((\d+), ?(\d+), ?(\d+), ?([\d.]+)\)/);
        let opacityValue;

        if (rgba) {
            opacityValue = parseFloat(rgba[4]);
        } else {
            // Fallback if no proper color value is detected.
            opacityValue = 0.99;
            blinkIn = 1;
        }

        if (opacityValue < .4 && blinkIn === 0) {
            opacityValue += 0.005;
            if (opacityValue >= .4) {
                blinkIn = 1;
                opacityValue = .4;
            }
            telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacityValue})`;
        } else {
            opacityValue -= 0.005;
            if (opacityValue <= 0) {
                blinkIn = 0;
                opacityValue = 0;
            }
            telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacityValue})`;
        }
    }
}