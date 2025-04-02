/**
* satellitePhases.js
* This file handles satellite (SMP) phase functions and phases.
* @author: Nicole Garcia, Ryan Mcmanamy, Emily Dinaro, Collin Miller
 */

import incrementProgressBar from '../progressBar.js';
import { AudioManager } from '../AudioManager.js';
import phases from './satellitePhasesData.js';
import showIntro from './showIntro.js';
import showLaunch from './showLaunch.js';
import showTimer from './showTimer.js';
import showFinale from './showFinale.js';

incrementProgressBar(14);

/**
 * @typedef {Object} Phase
 * @property {string} title - The title of the phase.
 * @property {string} image - Path to the main image for the phase.
 * @property {string} alt - Alternative text for accessibility.
 * @property {number} duration - Duration in milliseconds.
 * @property {string} [banner] - Optional path to a banner image.
 * @property {string[]} text - An optional array of text strings displayed in the phase.
 * @property {AdditionalImage[]} [additionalImages] - Optional array of additional images.
 */

/**
 * @typedef {Object} AdditionalImage
 * @property {string} src - Path to the additional image.
 * @property {string} id - Unique identifier for the image.
 * @property {string} position - CSS position property.
 * @property {string} top - CSS top position.
 * @property {string} left - CSS left position.
 */

// phase index keeps track of which phase in the satellite dialog the application is currently on
let phaseIndex = 0;
const phaseValues = Object.values(phases);

let introBool = false;
let launchBool = false;
let timerBool = false
let phaseBool = false;
let finaleBool = false;
let audioManager;

/**
* startPhasesSMP
* Handles Satellite phases and calls functions for SMP intro, launch video, mission timer,
 * and for displaying the rest of the phases.
 */
export function startSatellitePhases(phasesAudioManager) {
    audioManager = phasesAudioManager;
    audioManager.stopPlaying();
    phaseIndex = 0;
    // using callbacks to ensure one function completes before another starts
    showIntro(introBool, audioManager, () => {
        showLaunch(launchBool, audioManager, () => {
            showTimer(timerBool, audioManager, phaseValues, phaseIndex, () => {
                console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
                showPhase(phaseValues[phaseIndex]);
            });
        });
    });
}

/**
 * Creates a <style> tag and adds fade in and fade out effects for the phases
 * @type {HTMLStyleElement}
 */
const style = document.createElement("style");
style.innerHTML = `
    .fade-in {
        opacity: 0;
        animation: fadeIn 0.25s forwards;
    }
    
    .fade-out {
        animation: fadeOut 0.25s forwards;
    }

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }

    @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

/**
 * Initializes the satellite (SMP) phase data and displays it.
 * Note: To update the text or images used in the satellite phases, modify the phases object.
 * @param phase - The current phase from the phases data. Contains phase data for phase title, text, and images.
 */
export default function showPhase(phase) {
    console.log('Transitioning to satellite phases');
    new AudioManager("phase_transition");
    if (!phaseBool) {
        phaseBool = true;

        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
            "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s; font-size: 16px");

        let phase_innerHTML = "";

        // Create a div and a span for the phase title
        if (phase.title && phase.title.length > 0) {
            phase_innerHTML += `<div id="phase-title">`;
            phase_innerHTML += `<span class="title">${phase.title}</span>`;
            phase_innerHTML += `</div>`;
        }

        // Create a img for the phase image
        if (phase.image && phase.image.length > 0) {
            phase_innerHTML += `<img src="${phase.image}" id="phase"/>`;
        }

        // Create a img for the phase text box banner image
        if (phase.banner && phase.banner.length > 0) {
            phase_innerHTML += `<img src="${phase.banner}" id="banner"/>`;

            // Create a div and span for the phase text box text
            if (phase.text.some(line => line !== "")) {
                phase_innerHTML += `<div id="banner_text_box">`;
                phase.text.forEach((line) => {
                    phase_innerHTML += `<span class="info">${line}</span>`;
                });
                phase_innerHTML += `</div>`;
            }
        }

        phase_innerHTML += ``;

        phase_div.innerHTML = phase_innerHTML;
        document.body.appendChild(phase_div);

        // add styles to the phase title
        if (phase.title && phase.title.length > 0) {
            document.getElementById("phase-title").setAttribute(
                "style", "text-align: center; font-size: calc(0.08 * 40vh);" +
                " z-index: 21; transition: 1.5s; top: 5vh; color: white; position: absolute; " +
                "left: 50%; transform: translateX(-50%); width: 80%; max-width: 90vw;" +
                "font-family: 'Comfortaa', Arial, sans-serif;");
        }

        // add styles to phase image
        if (phase.image && phase.image.length > 0) {
            document.getElementById("phase").setAttribute("style",
                "background-color: transparent; width: calc(0.8 * 45vh); height: auto;" +
                " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
                " left: 50%; transform: translateX(-50%); z-index: 10;" +
                "transition: 1.5s ease-in-out;");
        }
        // add styles to phase banner
        if (phase.banner && phase.banner.length > 0) {
            let banner = document.getElementById("banner");

            // Ensure banner exists before applying styles
            if (!banner) {
                banner = document.createElement("div");
                banner.id = "banner";
                document.body.appendChild(banner);
            }

            banner.setAttribute("style",
                "background-color: transparent; max-width: 90vw; width: calc(0.8 * 65vh); border-radius: 12px;" +
                " position: absolute; bottom: 3vh; left: 50%; transform: translateX(-50%);" +
                " z-index: 5; transition: 1.5s ease-in-out; display: flex; align-items: center; justify-content: center;" +
                " text-align: center; overflow: visible; flex-direction: column;");

            // add styles to phase text
            if (phase.text.some(line => line !== "")) {
                let textBox = document.getElementById("banner_text_box");

                // Ensure the text box exists
                if (!textBox) {
                    textBox = document.createElement("div");
                    textBox.id = "banner_text_box";
                    banner.appendChild(textBox);
                }

                let bottomValue;

                // adjust text box size for various screen sizes. (Responsive design)
                if (window.innerWidth <= 768) { // Small screens (mobile)
                    console.log("small screen");
                    if (phase.text.length > 3) {
                        bottomValue = "18vh";
                    }  else {
                        bottomValue = "22vh";
                    }
                } else if (window.innerWidth <= 1024) { // Medium screens (tablets)
                    console.log("medium screen");
                    if (phase.text.length > 3) {
                        bottomValue = "21vh";
                    }  else {
                        bottomValue = "23vh";
                    }
                } else { // Large screens (desktops)
                    console.log("large screen");
                    if (phase.text.length > 3) {
                        bottomValue = "21vh";
                    }  else {
                        bottomValue = "24vh";
                    }
                }

                textBox.setAttribute("style",
                    `display: flex; flex-wrap: wrap; position: inherit; align-items: center;
                    justify-content: center; width: calc(0.8* 28vh); color: #C9FFFC;
                    font-size: clamp(0.8rem, 2vw, 0.5rem); font-family: 'Comfortaa', Arial, sans-serif;
                    text-align: center; padding: 4vh; white-space: normal; bottom: ${bottomValue}; z-index: 10;
                    left: calc(50vw - ((0.8 * 50vh + 10vh) / 2))`);

                // Populate the text box with the phase text
                textBox.innerHTML = phase.text.join(" ");  // Converts the array into a single line sentence
            }
        }

        var infos = document.getElementsByClassName("info");
        // set style of phase text box text
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in;");
        }

        // If the phase has additional images, add them
        if (phase.additionalImages) {
            phase.additionalImages.forEach((image, index) => {
                const overlayImage = document.createElement("img");
                overlayImage.classList.add("fade-in");
                overlayImage.setAttribute("src", image.src);
                overlayImage.setAttribute("id", image.id);
                // add position styles for stacking additional images on top of phase image
                overlayImage.setAttribute("style", `position: ${image.position}; top: ${image.top}; left: ${image.left}; z-index: 15;`);
                overlayImage.setAttribute("style", "width: calc(0.8 * 50vh); height: auto" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 10vh);" +
                    " left: 50%; transform: translateX(-50%); z-index: 21; transition: 1.5s ease-in-out;");

                document.body.appendChild(overlayImage);
            });
        }

        // Create a next/continue button with styling
        const nextButton = document.createElement("button");
        nextButton.id = "next-btn";
        nextButton.setAttribute("style", `
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 100px;
            border: none;
            background: url('../assets/images/continue_button.png') no-repeat center center;
            background-size: contain;
            cursor: pointer;
            z-index: 100;
            display: none;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        `);
        /*
        Create an event listener for the next/continue button.
        When clicked, the application will transition to the next phase.
        */
        nextButton.addEventListener("click", () => {
                setTimeout(() => {
                    phase_div.classList.remove("fade-in");
                    phase_div.classList.add("fade-out");

                    setTimeout(() => {
                        removeCurrentPhase();
                        nextPhase();
                    }, 250); // Matches fade-out duration
                }, phase.duration);
            }
        );
        phase_div.appendChild(nextButton);

        // Next button appears after some time passes
        setTimeout(() => {
            nextButton.style.display = "block";
        }, phase.duration);

    } else {
        // Hide the current phase modal if it's already showing
        document.getElementById("phase_modal").setAttribute("style", "display: none;");
        phaseBool = false;
    }
}

/**
 * Handles transitioning to the next phase.
 * Increments the progress bar and phase index.
 */
function nextPhase() {
    // Remove current phase
    removeCurrentPhase();

    // Move to next phase
    phaseIndex++;
    incrementProgressBar(16 + phaseIndex);
    if (phaseIndex < phaseValues.length) {
        setTimeout(() => {
            console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
            showPhase(phaseValues[phaseIndex]);
        }, 250);

        // If at end of phases
    } else {
        showFinale(finaleBool);
    }
}

/**
 * Transitions out of the current phase.
 * Fades out and signals calling the next phase.
 */
function removeCurrentPhase() {
    // Select phase modal
    const phaseModal = document.getElementById("phase_modal");

    // Select overlay images
    const overlayImages = document.querySelectorAll(
        '[id^="butterfly"]'
    );

    // Force reflow (prevents animation issues)
    phaseModal?.offsetHeight;
    overlayImages.forEach((img) => img.offsetHeight);

    // Apply fade-out effect
    if (phaseModal) {
        phaseModal.classList.add("fade-out");
    }
    overlayImages.forEach((img) => {
        img.classList.add("fade-out");
    });

    // Remove elements after animation completes
    setTimeout(() => {
        phaseModal?.remove();
        overlayImages.forEach((img) => img.remove());
    }, 250); // Match fade-out duration in CSS

    phaseBool = false;
}
