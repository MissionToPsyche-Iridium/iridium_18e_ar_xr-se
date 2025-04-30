/**
 * asteroidPhases.js
 * This file handles asteroid (AMP) phase functions and phases.
 * @author: Nicole Garcia, Ryan Dinville, Ryan Mcmanamy, Emily Dinaro, Collin Miller
 */

import { startSatellitePhases } from '../satellitePhases/satellitePhases.js';
import incrementProgressBar from '../progressBar.js';
import { AudioManager } from '../AudioManager.js';
import asteroidPhases from './asteroidPhasesData.js';

let phaseIndex = 0;
let audioManager;
const phaseValues = Object.values(asteroidPhases);

/**
 * Start the asteroid phases
 * @param phasesAudioManager handles audio
 */
export function startPhases(phasesAudioManager) {
    audioManager = phasesAudioManager;
    incrementProgressBar(2);
    phaseIndex = 0;
    console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
    showPhase(phaseValues[phaseIndex]);
}

/**
 * Creates a <style> tag and adds fade in and fade out effects to the phases
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

let phaseBool = false;

/**
 * Initializes the asteroid (AMP) phase data and displays it.
 * Note: To update the text or images used in the satellite phases, modify the phases object.
 * @param phase - The current phase from the phases data. Contains phase data for phase title, text, and images.
 */
function showPhase(phase) {
    if (!phaseBool) {
        new AudioManager("pageTurn");
        phaseBool = true;

        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.classList.add("fade-in");
        phase_div.classList.add("phase-modal")

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

        // Create a img for the phase text box banner (scroll) image
        if (phase.scroll && phase.scroll.length > 0) {
            phase_innerHTML += `<div id="scroll-container" class="scroll" style="background-image: url(${phase.scroll}); background-size: cover; background-position: center; background-repeat: no-repeat; width: 100%; height: 100%;">`;

            // Create a div and span for the phase text box text
            if (phase.text.some(line => line !== "")) {
                phase_innerHTML += `<div id="scroll_text_box">`;
                phase.text.forEach((line) => {
                    phase_innerHTML += `<span class="info">${line}</span>`;
                });
                phase_innerHTML += `</div>`;
            }

            phase_innerHTML += `</div>`;
        }

        phase_innerHTML += ``;

        phase_div.innerHTML = phase_innerHTML;
        document.body.appendChild(phase_div);

        // add style to phase title
        if (phase.title && phase.title.length > 0) {
            document.getElementById("phase-title").setAttribute(
                "style", "text-align: center; font-size: calc(0.08 * 40vh);" +
                " z-index: 21; transition: 1.5s; top: 5vh; color: white; position: absolute; " +
                "left: 50%; transform: translateX(-50%); width: 80%; max-width: 90vw;" +
                "font-family: 'Papyrus', Arial, sans-serif;");
        }

        // add styles to the phase image and scroll
        if (phase.image && phase.image.length > 0) {
            document.getElementById("phase").className = "phase";
        }

        // add style to phase banner (scroll)
        if (phase.scroll && phase.scroll.length > 0) {
            let scroll = document.getElementById("papyrus_scroll");

            // Ensure banner exists before applying styles
            if (!scroll) {
                scroll = document.createElement("div");
                scroll.id = "scroll-container";
            }
            scroll.className = "scroll";

            // add style to phase text
            if (phase.text.some(line => line !== "")) {
                let textBox = document.getElementById("scroll_text_box");

                // Ensure the text box exists
                if (!textBox) {
                    textBox = document.createElement("div");
                    textBox.id = "scroll_text_box";
                    scroll.appendChild(textBox);
                    document.body.appendChild(scroll);
                }

                textBox.className = "scroll-text-box";

                // Populate the text box with the phase text
                textBox.innerHTML = phase.text.join(" ");  // Converts the array into a single line sentence
            }
        }
        var infos = document.getElementsByClassName("info");
        // set style of phase text box text
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
                " z-index: 21; transition: 1.5s;");
        }

        // If the phase has additional images, add them
        if (phase.additionalImages) {
            phase.additionalImages.forEach((image, index) => {
                const overlayImage = document.createElement("img");
                overlayImage.classList.add("fade-in");
                overlayImage.setAttribute("src", image.src);
                overlayImage.setAttribute("id", image.id);

                // add position styles for stacking additional images on top of phase image
                overlayImage.setAttribute("style",
                    "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(30vh);" +
                    " left: calc(50vw - ((0.8 * 50vh) / 2)); z-index: 21; transition: 1.5s;");

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
            background: url('../assets/images/continue_button_papyrus.png') no-repeat center center;
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
            // Prevent subsequent clicks
            nextButton.disabled = true;
            nextButton.style.pointerEvents = "none";
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
 * afterAsteroidPhases
 * Handles calling the start of the satellite (SMP) phases
 */
function afterAsteroidPhases() {
    startSatellitePhases(audioManager);
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
    incrementProgressBar(2 + phaseIndex);
    let trigger = (2 + phaseIndex).toString();
    triggered(trigger);
    if (phaseIndex < phaseValues.length) {
        setTimeout(() => {
            console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
            showPhase(phaseValues[phaseIndex]);
        }, 250);

    // If at end of phases
    } else {
        afterAsteroidPhases();
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
        '[id^="chrysalis"], [id^="butterfly"], [id^="chrysalis2"], [id^="butterfly2"]'
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