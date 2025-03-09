import { startPhasesSMP } from "./phasesSMP.js";
// TODO: store phase data in json file
const phases = {
    annibale1: {
        title: "Discovery of Psyche",
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 2000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "On March 17, 1852, the Italian astronomer",
            "Annibale De Gasparis discovered the 16th",
            "asteroid in the main asteroid belt",
            "between Mars and Jupiter.",
            "De Gasparis named this asteroid Psyche."
        ]
    },
    asteroid1: {
        title: "Chrysalis Resemblance",
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "image of asteroid",
        duration: 2000,
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
        duration: 2000,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
        ],
    },
    chrysalis2: {
        title: "Chrysalis Resemblance",
        image: "",
        alt: "image of chrysalis",
        duration: 2000,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
        ],
    },
    chrysalis3: {
        title: "The 'Breath of Life'",
        image: "",
        alt: "Asteroid Psyche butterfly emerges from chrysalis",
        duration: 2000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, the breath of life leaves",
            "as someone dies and is represented as",
            "a butterfly leaving its chrysalis.",
            "This breath of life is called Psyche."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ]
    },
    psychegoddess1: { // psyche goddess part1
        title: "The Goddess Psyche Opening Pandora's Box",
        image: "../assets/images/goddess_psyche/psyche_opening_box.png",
        alt: "image of Psyche goddess opening pandora's box.",
        duration: 2000,
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
        duration: 2000,
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
        duration: 2000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "Psyche finds herself in",
            "a dark, dreamless sleep..."
        ]
    },
    psychegoddess4: { // psyche goddess part5
        title: "The Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid sleeping",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 2000,
        text: [
            "The asteroid Psyche finds itself in",
            "a similar dark, dreamless sleep..."
        ]
    },
    psychegoddess5: { // psyche goddess part6
        title: "The Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid",
        scroll: "",
        duration: 2000,
        text: [
            ""
        ]
    },
    psychegoddess7: { // psyche goddess part7
        title: "Exploring the Asteroid Psyche",
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid core",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 2000,
        text: [
            "Like Psyche opening the fateful box,",
            "revealing the unexpected,",
            "humanity explores the Psyche asteroid;",
            "risking the unknown for discovery."
        ]
    }
};

let phaseIndex = 0;
const phaseValues = Object.values(phases);

// Start the phases
export function startPhases() {
    phaseIndex = 0;

    console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
    showPhase(phaseValues[phaseIndex]);
}

function afterPhases() {
    startPhasesSMP();
}

let phaseBool = false;

function showPhase(phase) {
    if (!phaseBool) {
        phaseBool = true;

        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
            "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s;");

        let phase_innerHTML = "";

        if (phase.image && phase.image.length > 0) {
            phase_innerHTML += `<img src="${phase.image}" id="phase"/>`;
        }

        if (phase.scroll && phase.scroll.length > 0) {
            phase_innerHTML += `<img src="${phase.scroll}" id="papyrus_scroll"/>`;

            if (phase.text.some(line => line !== "")) {
                phase_innerHTML += `<div id="scroll_text_box">`;
                phase.text.forEach((line) => {
                    phase_innerHTML += `<span class="info">${line}</span>`;
                });
                phase_innerHTML += `</div>`;
            }
        }

        phase_innerHTML += ``;

        phase_div.innerHTML = phase_innerHTML;
        document.body.appendChild(phase_div);

        // add styles to the phase image and scroll
        if (phase.image && phase.image.length > 0) {
            document.getElementById("phase").setAttribute("style",
                "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
                " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
                " left: calc(50vw - ((0.8 * 50vh + 10vh) / 2)); z-index: 10; transition: 1.5s;");
        }

        if (phase.scroll && phase.scroll.length > 0) {
            let scroll = document.getElementById("papyrus_scroll");

            // Ensure banner exists before applying styles
            if (!scroll) {
                scroll = document.createElement("div");
                scroll.id = "scroll";
                document.body.appendChild(scroll);
            }

            scroll.setAttribute("style",
                "background-color: transparent; max-width: 90vw; width: calc(0.8 * 56vh); border-radius: 12px;" +
                " position: absolute; bottom: -2vh; left: calc(50vw - ((0.8 * 50vh + 10vh) / 2));" +
                " z-index: 5; transition: 1.5s ease-in-out; display: flex; align-items: center; justify-content: center;" +
                " text-align: center; overflow: visible; flex-direction: column;");

            if (phase.text.some(line => line !== "")) {
                let textBox = document.getElementById("scroll_text_box");

                // Ensure the text box exists
                if (!textBox) {
                    textBox = document.createElement("div");
                    textBox.id = "scroll_text_box";
                    banner.appendChild(textBox);
                }

                let bottomValue;

                if (window.innerWidth <= 768) { // Small screens (mobile)
                    console.log("small screen");
                    if (phase.text.length > 3) {
                        bottomValue = "9vh";
                    }  else {
                        bottomValue = "15vh";
                    }
                } else if (window.innerWidth <= 1024) { // Medium screens (tablets)
                    console.log("medium screen");
                    if (phase.text.length > 3) {
                        bottomValue = "15vh";
                    }  else {
                        bottomValue = "18vh";
                    }
                } else { // Large screens (desktops)
                    console.log("large screen");
                    if (phase.text.length > 3) {
                        bottomValue = "15vh";
                    }  else {
                        bottomValue = "18vh";
                    }
                }

                textBox.setAttribute("style",
                    `display: flex; flex-wrap: wrap; position: inherit; align-items: center; 
                         justify-content: center; width: calc(0.8 * 40vh); color: black; 
                         font-size: clamp(0.8rem, 2vw, 0.5rem); font-family: 'Papyrus', Arial, sans-serif; 
                         text-align: center; padding: 0vh 4vh; white-space: normal; 
                         bottom: ${bottomValue}; z-index: 10; left: calc(52vw - ((0.8 * 50vh + 10vh) / 2));`);

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
                overlayImage.setAttribute("src", image.src);
                overlayImage.setAttribute("id", image.id);

                overlayImage.setAttribute("style",
                    "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
                    " left: calc(50vw - ((0.8 * 50vh + 10vh) / 2)); z-index: 21; transition: 1.5s;");

                document.body.appendChild(overlayImage);
            });
        }

        // Add next button
        const nextButton = document.createElement("button");
        nextButton.id = "next-btn";
        nextButton.setAttribute("style", `
            position: absolute;
            bottom: 15px;
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
        `);
        nextButton.addEventListener("click", nextPhase);
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
    if (phaseIndex < phaseValues.length) {
        console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);
        showPhase(phaseValues[phaseIndex]);

    // If at end of phases
    } else {
        afterPhases();
    }
}
  
function removeCurrentPhase() {
    // Remove phase modal
    const phaseModal = document.getElementById("phase_modal");
    if (phaseModal) {
        phaseModal.remove();
    }
  
    // Remove phase images
    const overlayImages = document.querySelectorAll(
        '[id^="chrysalis"], [id^="butterfly"], [id^="chrysalis2"], [id^="butterfly2"]'
    );
    overlayImages.forEach((img) => img.remove());
  
    phaseBool = false;
}