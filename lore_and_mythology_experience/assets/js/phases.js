// TODO: store phase data in json file
const phases = {
    annibale: {
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 8000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "On March 17, 1852, the Italian astronomer",
            "Annibale De Gasparis discovered the 16th",
            "asteroid in the main asteroid belt",
            "between Mars and Jupiter.",
            "De Gasparis named this asteroid Psyche."
        ]
    },
    chrysalis1: {
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "Asteroid Psyche in the Chrysalis phase",
        duration: 8000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "The asteroid Psyche has the",
            "resemblance of a chrysalis.",
            "In Greek, the word for chrysalis is 'cyrsos',",
            "meaning gold, gold-colored, or wealth."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
        ],
    },
    chrysalis2: {
        image: "../assets/images/chrysalis/asteroid.png",
        alt: "Asteroid Psyche butterfly emerges from chrysalis",
        duration: 10000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, the breath of life leaves",
            "as someone dies and is represented as",
            "a butterfly leaving its chrysalis.",
            "This breath of life is called Psyche."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "10px", left: "10px" },
        ]
    },
    chrysalis3: {
        image: "",
        alt: "Chrysalis and butterfly vector images",
        duration: 2000,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis.png", id: "chrysalis", position: "absolute", top: "0", left: "0" },
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "10px", left: "10px" },
        ]
    },
    chrysalis4: {
        image: "",
        alt: "Chrysalis and butterfly vector stars images",
        duration: 5000,
        scroll: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/chrysalis2.png", id: "chrysalis2", position: "absolute", top: "10px", left: "10px" },
            { src: "../assets/images/chrysalis/butterfly2.png", id: "butterfly2", position: "absolute", top: "10px", left: "10px" },
        ]
    },
    psychegoddess1: { // psyche goddess part1
        image: "../assets/images/goddess_psyche/psyche_opening_box_sketch.png",
        alt: "image of Psyche goddess opening pandora's box.",
        duration: 10000,
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
        image: "../assets/images/goddess_psyche/psyche_sleeping_sketch.png",
        alt: "image of Psyche goddess in a deep, dark sleep.",
        duration: 7000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "However, instead of beauty,",
            "the box releases a deep sleep",
            "that overwhelms Psyche."
        ]
    },
    psychegoddess3: { // psyche goddess part3
        image: "../assets/images/goddess_psyche/psyche_sleeping_vector.png",
        alt: "outline and stars vector image of Psyche goddess in a deep, dark sleep",
        duration: 5000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "Psyche finds herself in",
            "a dark, dreamless sleep..."
        ]
    },
    psychegoddess4: { // psyche goddess part4
        image: "../assets/images/goddess_psyche/psyche_sleeping_stars.png",
        alt: "psyche sleeping stars",
        duration: 5000,
        scroll: "",
        text: [""]
    },
    psychegoddess5: { // psyche goddess part5
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 5000,
        text: [
            "The asteroid Psyche finds herself in",
            "a similar dark, dreamless sleep..."
        ]
    },
    psychegoddess6: { // psyche goddess part5
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid",
        scroll: "",
        duration: 5000,
        text: [
            ""
        ]
    },
    psychegoddess7: { // psyche goddess part6
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "psyche asteroid",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 10000,
        text: [
            "Just as Psyche's curiosity led her to open",
            "the fateful box, revealing the unexpected,",
            "humanity's exploration of the Psyche",
            "asteroid seeks to unlock the secrets of",
            "planetary cores--risking the unknown for",
            "the reward of discovery."
        ]
    },
    finalphase: { // psyche goddess part6
        image: "",
        alt: "no image",
        scroll: "",
        duration: 2000,
        text: [
            ""
        ]
    }
};

let phaseIndex = 0;
const phaseValues = Object.values(phases);

// Start the phases
export function startPhases() {
    phaseIndex = 0;
    displayPhase();
}

function displayPhase() {
    console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);

    if (phaseIndex >= phaseValues.length) {
        afterPhases();
        return;
    }

    const phase = phaseValues[phaseIndex];
    showPhase(phase);
}

function afterPhases() {
    // TODO, what happens after the phases are done?
}

let phaseBool = false;

function showPhase(phase) {
    // Remove phase if still active
    if (phaseBool) {
      removeCurrentPhase();
    }
  
    phaseBool = true;
  
    // Create modal container
    const phase_div = document.createElement("div");
    phase_div.setAttribute("id", "phase_modal");
    phase_div.setAttribute(
        "style",
        "display: block; position: fixed;" +
        "z-index: 20; left: 0; top: 0; width: 100%; height: 100%;" +
        "background-color: rgba(0, 0, 0); overflow: hidden; transition: 1.5s;"
    );
  
    // Main image
    let phase_innerHTML = "";
    if (phase.image && phase.image.length > 0) {
        phase_innerHTML += `<img src="${phase.image}" id="phase"/>`;
    }
  
    // Scroll image/text
    if (phase.scroll && phase.scroll.length > 0) {
        phase_innerHTML += `<img src="${phase.scroll}" id="papyrus_scroll"/>`;
    
        if (phase.text.some((line) => line !== "")) {
            phase_innerHTML += `<div id="scroll_text_box">`;

            phase.text.forEach((line) => {
                phase_innerHTML += `<span class="info">${line}</span>`;
            });

            phase_innerHTML += `</div>`;
        }
    }
  
    // Insert into modal div
    phase_div.innerHTML = phase_innerHTML;
    document.body.appendChild(phase_div);
  
    // Style the main phase image
    if (phase.image && phase.image.length > 0) {
        document.getElementById("phase").setAttribute(
            "style",
            "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
            "border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
            "left: calc(50vw - ((0.8 * 40vh + 10vh) / 2)); z-index: 10; transition: 1.5s;"
        );
    }

    // Style the scroll
    if (phase.scroll && phase.scroll.length > 0) {
        document.getElementById("papyrus_scroll").setAttribute(
            "style",
            "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px;" +
            "position: absolute; top: 50vh; left: calc(50vw - (40vh / 2)); z-index: 5; transition: 1.5s;"
        );
        if (phase.text.some((line) => line !== "")) {
            document.getElementById("scroll_text_box").setAttribute(
            "style",
            "display: flex; flex-direction: column; position: absolute; width: 40vh;" +
                "height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69));" +
                "left: calc(50vw - (40vh / 2)); z-index: 20; transition: 1.5s;"
            );
        }
    }
  
    // Style the text
    const infos = document.getElementsByClassName("info");
    for (let i = 0; i < infos.length; i++) {
        infos[i].setAttribute(
            "style",
            "text-align: center; font-size: calc(0.045 * 40vh);" + "z-index: 21; transition: 1.5s;"
        );
    }
  
    // Add additional images
    if (phase.additionalImages) {
        phase.additionalImages.forEach((image, index) => {
            const overlayImage = document.createElement("img");
            overlayImage.setAttribute("src", image.src);
            overlayImage.setAttribute("id", image.id);
    
            // Different sizes for images
            let styleString = `position: ${image.position}; top: ${image.top}; left: ${image.left}; z-index: 15;`;
            if (index === 0) {
                styleString =
                    "width: calc(0.8 * 20vh); height: 30vh;" +
                    "border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 80vh);" +
                    "left: calc(50vw - ((0.8 * 30vh + 10vh) / 2)); z-index: 21; transition: 1.5s;";
            } else if (index === 1) {
                styleString =
                    "width: calc(0.8 * 30vh); height: 20vh;" +
                    "border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 2vh);" +
                    "left: calc(50vw - ((0.8 * 30vh + 10vh) / 2)); z-index: 21; transition: 1.5s;";
            }
    
            overlayImage.setAttribute("style", styleString);
            document.body.appendChild(overlayImage);
        });
    }
  
    // Create next button
    const nextButton = document.createElement("button");
    nextButton.id = "next-btn";
    nextButton.setAttribute(
        "style",
        `
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;           /* Adjust as needed */
        height: 100px;           /* Adjust as needed */
        border: none;
        background: url('../assets/images/next_button.png') no-repeat center center;
        background-size: contain;
        cursor: pointer;
        z-index: 100;
        `
    );

    nextButton.addEventListener("mouseover", () => {
        nextButton.style.backgroundImage = "url('../assets/images/next_button_light.png')";
    });

    nextButton.addEventListener("mouseout", () => {
        nextButton.style.backgroundImage = "url('../assets/images/next_button.png')";
    });

    nextButton.addEventListener("click", nextPhase);
    phase_div.appendChild(nextButton);
}
  
function nextPhase() {
    // Remove current phase
    removeCurrentPhase();
  
    // Move to next phase
    phaseIndex++;
    if (phaseIndex < phaseValues.length) {
        displayPhase();

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