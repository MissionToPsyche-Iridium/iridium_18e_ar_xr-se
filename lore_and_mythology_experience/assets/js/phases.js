import { startPhasesSMP } from "./phasesSMP.js";
import incrementProgressBar from './progressBar.js';
import { AudioManager } from './AudioManager.js';

incrementProgressBar(2);

// TODO: store phase data in json file
const phases = {
    annibale1: {
        title: "Discovery of Psyche",
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "On March 17, 1852, the Italian",
            "astronomer Annibale De Gasparis",
            "discovered an asteroid",
            "in the night sky."
        ]
    },
    annibale2: {
        title: "Discovery of Psyche",
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 2000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "It is the 16th asteroid in",
            "the main asteroid belt between",
            "Mars and Jupiter.",
            "De Gasparis named this asteroid Psyche."
        ]
    },
    asteroid1: {
        title: "Chrysalis Resemblance",
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "image of asteroid",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "The asteroid Psyche has the",
            "resemblance of a chrysalis.",
            "In Greek, the word for chrysalis is 'cyrsos',",
            "meaning gold, gold-colored, or wealth."
        ],
    },
    chrysalis1: {
        title: "Chrysalis Resemblance",
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "Asteroid Psyche in the Chrysalis phase",
        duration: 250,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
        ],
    },
    butterfly1: {
        title: "The 'Breath of Life'",
        image: "../assets/images/chrysalis/butterfly.png",
        alt: "Asteroid Psyche butterfly emerges from chrysalis",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, the breath of life leaves",
            "as someone dies and is represented as",
            "a butterfly leaving its chrysalis.",
            "This breath of life is called Psyche."
        ],

    },
    psychegoddess1: { // psyche goddess part1
        title: "The Goddess Psyche Opening Pandora's Box",
        image: "../assets/images/goddess_psyche/psyche_opening_box.png",
        alt: "image of Psyche goddess opening pandora's box.",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, Psyche, driven by",
            "curiosity, opens a box given to her",
            "by Persephone, meant to contain a",
            "fragment of the queen's divine beauty",
            "for Aphrodite to use."
        ]
    },
    psychegoddess2: { // psyche goddess part2
        title: "The Goddess Psyche Falling Into a Deep Sleep",
        image: "../assets/images/goddess_psyche/psyche_passing_out.png",
        alt: "image of Psyche goddess in a deep, dark sleep.",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "However, instead of beauty,",
            "the box releases a deep sleep",
            "that overwhelms Psyche."
        ]
    },
    psychegoddess3: { // psyche goddess part3
        title: "The Goddess Psyche In A Dark, Dreamless Sleep",
        image: "../assets/images/goddess_psyche/psyche_passing_out_vector.png",
        alt: "outline and stars vector image of Psyche goddess in a deep, dark sleep",
        duration: 250,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "Psyche finds herself in",
            "a dark, dreamless sleep..."
        ]
    },
    psychegoddess4: { // psyche goddess part4
        title: "The Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid sleeping",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 250,
        text: [
            "The asteroid Psyche finds itself in",
            "a similar dark, dreamless sleep..."
        ]
    },
    psychegoddess5: { // psyche goddess part5
        title: "Exploring the Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid core",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 250,
        text: [
            "Like Psyche opening the fateful box,",
            "revealing the unexpected,",
            "humanity explores the Psyche asteroid;",
            "risking the unknown for discovery."
        ]
    }
};

let phaseIndex = 0;
let audioManager;
const phaseValues = Object.values(phases);

// Start the phases
export function startPhases(phasesAudioManager) {
    audioManager = phasesAudioManager;
    phaseIndex = 0;
    console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
    showPhase(phaseValues[phaseIndex]);
}

function afterPhases() {
    startPhasesSMP(audioManager);
}

// Create a <style> tag and add fade effects
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

        if (phase.title && phase.title.length > 0) {
            phase_innerHTML += `<div id="phase-title">`;
            phase_innerHTML += `<span class="title">${phase.title}</span>`;
            phase_innerHTML += `</div>`;
        }

        if (phase.image && phase.image.length > 0) {
            phase_innerHTML += `<img src="${phase.image}" id="phase"/>`;
        }

        if (phase.scroll && phase.scroll.length > 0) {
            phase_innerHTML += `<div id="scroll-container" class="scroll" style="background-image: url(${phase.scroll}); background-size: cover; background-position: center; background-repeat: no-repeat; width: 100%; height: 100%;">`;

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

        if (phase.scroll && phase.scroll.length > 0) {
            let scroll = document.getElementById("papyrus_scroll");

            // Ensure banner exists before applying styles
            if (!scroll) {
                scroll = document.createElement("div");
                scroll.id = "scroll-container";
            }
            scroll.className = "scroll";

            {
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

                overlayImage.setAttribute("style",
                    "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(30vh);" +
                    " left: calc(50vw - ((0.8 * 50vh) / 2)); z-index: 21; transition: 1.5s;");

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
  
function nextPhase() {
    // Remove current phase
    removeCurrentPhase();
  
    // Move to next phase
    phaseIndex++;
    incrementProgressBar(2 + phaseIndex);
    if (phaseIndex < phaseValues.length) {
        setTimeout(() => {
            console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
            showPhase(phaseValues[phaseIndex]);
        }, 250);

    // If at end of phases
    } else {
        afterPhases();
    }
}

// transition out of current phase. Fade out and signal calling the next phase.
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