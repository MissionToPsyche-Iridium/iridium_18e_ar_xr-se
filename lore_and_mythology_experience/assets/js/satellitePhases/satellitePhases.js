/**
* satellitePhases.js
* This file handles satellite (SMP) phase functions and phases.
* @author: Nicole Garcia, Ryan Mcmanamy, Emily Dinaro, Collin Miller
 */

import incrementProgressBar from '../progressBar.js';
import { AudioManager } from '../AudioManager.js';
import satellitePhases from './satellitePhasesData.js';
import showIntro from './showIntro.js';
import showLaunch from './showLaunch.js';
import showTimer from './showTimer.js';
import showFinale from './showFinale.js';

// phase index keeps track of which phase in the satellite dialog the application is currently on
let phaseIndex = 0;
const phaseValues = Object.values(satellitePhases);

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
    incrementProgressBar(12);

    /* Restyling the Help Page */
    document.getElementById("papyrus_horizontal").src = "../assets/images/help_page_background2.png";
    document.getElementById("papyrus_horizontal").setAttribute("style", "background-color: rgba(229, 243, 255, 0.9); border-radius: 15px; width: calc(0.7 * 70vh); height: 70vh; position: relative; top: calc((100vh - 70vh) / 2); left: calc((100vw - (0.7 * 70vh)) / 2);");
    document.getElementById("close_help").textContent = "×";
    document.getElementById("close_help").setAttribute("style", "position: absolute; top: calc(((100vh - 70vh) / 2) + ((0.7 * 70vh) / 15)); left: calc((100vw / 2) + ((0.7 * 70vh) / 2) - ((0.7 * 70vh) / 6.3)); font-family: Arial, Helvetica, sans-serif; font-size: 30px; font-weight: bold; cursor: pointer;");
    document.getElementById("help_modal_title").setAttribute("style", "position: absolute; top: calc(((100vh - 70vh) / 2) + ((0.7 * 70vh) / 8)); left: calc((100vw / 2) - (48px / 2)); font-family: Arial, Helvetica, sans-serif; font-size: 24px;");
    const swipes = document.getElementsByClassName("swipe");
    for (let i = 0; i < swipes.length; i++) {
        swipes[i].setAttribute("style", "display: none;");
    }
    document.getElementById("swipe").setAttribute("style", "display: none;");
    const taps = document.getElementsByClassName("tap");
    for (let j = 0; j < taps.length; j++) {
        taps[j].setAttribute("style", "position: absolute; top: calc(((100vh - 70vh) / 2) + 70vh - ((0.3 * 0.7 * 72vh) + 42px + ((0.7 * 70vh) / 4))); left: calc((100vw / 2) - (((0.58 * 0.7 * 70vh) / 2) + 0.7vh)); font-family: Arial, Helvetica, sans-serif;");
    }
    document.getElementById("tap").setAttribute("style", "width: calc(0.3 * 0.7 * 70vh); align-self: center; padding: 0.99vh;");
    const text_boxes = document.getElementsByClassName("text_box");
    for (let k = 0; k < text_boxes.length; k++) {
        text_boxes[k].setAttribute("style", "border-style: solid; border-width: thin; border-color: black; border-radius: 5px; padding: 0.5vh; display: flex; flex-direction: column; width: calc(0.58 * 0.7 * 70vh);");
    }
    const instructs = document.getElementsByClassName("instructions");
    for (let l = 0; l < instructs.length; l++) {
        instructs[l].setAttribute("style", "text-align: center; font-size: 16px; color: #333;");
    }


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
 * @param phase - The current phase from the phase data. Contains phase data for phase title, text, and images.
 */
export default function showPhase(phase) {
    console.log('Transitioning to satellite phases');
    new AudioManager("phase_transition");
    if (!phaseBool) {
        phaseBool = true;

        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.classList.add("phase-modal");

        let phase_innerHTML = "";

        if (phase.title && phase.title.length > 0) {
            phase_innerHTML += `<div id="phase-title">`;
            phase_innerHTML += `<span class="title">${phase.title}</span>`;
            phase_innerHTML += `</div>`;
        }

        if (phase.image && phase.image.length > 0) {
            phase_innerHTML += `<img src="${phase.image}" id="phase" alt="${phase.title}"/>`;
        }

        if (phase.banner && phase.banner.length > 0) {
            phase_innerHTML += `<div id="banner" class="banner" style="background-image: url(${phase.banner}); background-size: cover; background-position: center center; background-repeat: no-repeat; width: 100%; height: 100%;">`;

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

        // add style to phase title
        if (phase.title && phase.title.length > 0) {
            document.getElementById("phase-title").setAttribute(
                "style", "text-align: center; font-size: calc(0.08 * 40vh);" +
                " z-index: 21; transition: 1.5s; top: 5vh; color: white; position: absolute; " +
                "left: 50%; transform: translateX(-50%); width: 80%; max-width: 90vw;" +
                "font-family: 'Comfortaa', Arial, sans-serif;");
        }

        // add styles to the phase image and banner
        if (phase.image && phase.image.length > 0) {
            document.getElementById("phase").className = "phase";
        }

        if (phase.banner && phase.banner.length > 0) {
            let banner = document.getElementById("banner");

            // Ensure banner exists before applying styles
            if (!banner) {
                banner = document.createElement("div");
                banner.style.backgroundImage = `url(${phase.banner})`;
                banner.id = "banner";
            }
            banner.className = "banner";

            if (phase.text.some(line => line !== "")) {
                let textBox = document.getElementById("banner_text_box");

                // Ensure the text box exists
                if (!textBox) {
                    textBox = document.createElement("div");
                    textBox.id = "banner_text_box";
                    banner.appendChild(textBox);
                    document.body.appendChild(banner);
                }


                textBox.className = "banner_text_box";

                // Populate the text box with the phase text
                textBox.innerHTML = phase.text.join(" ");  // Converts the array into a single line sentence
            }
        }

        const infos = document.getElementsByClassName("info");
        for (let i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in;");
        }

        // If the phase has additional images, add them
        if (phase.additionalImages) {
            phase.additionalImages.forEach((image) => {
                const overlayImage = document.createElement("img");
                overlayImage.classList.add("fade-in");
                overlayImage.setAttribute("src", image.src);
                overlayImage.setAttribute("id", image.id);
                // add position styles for stacking additional images on top of phase image
                overlayImage.setAttribute("style", `position: ${image.position}; top: ${image.top}; left: ${image.left}; z-index: 15;`);
                overlayImage.setAttribute("style", "width: calc(0.8 * 50vh); height: auto" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: 20vh;" +
                    " left: 50%; transform: translateX(-50%); z-index: 21; transition: 1.5s ease-in-out;");

                document.body.appendChild(overlayImage);
            });
        }

        // Add next button
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
    incrementProgressBar(14 + phaseIndex);
    let trigger = (14 + phaseIndex).toString();
    triggered(trigger);
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
