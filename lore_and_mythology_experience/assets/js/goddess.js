const phases = {
    annibale: {
        image: "../assets/images/annibale.jpg",
        alt: "image of astronomer Annibale De Gasparis",
        duration: 5000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "On March 17, 1852, the Italian astronomer",
            "Annibale De Gasparis discovered the 16th",
            "asteroid in the main asteroid belt",
            "between Mars and Jupiter.",
            "De Gasparis named this asteroid Psyche."
        ]
    },
    psychegoddess1: { // psyche goddess part1
        image: "../assets/images/goddess_psyche/psyche_opening_box_sketch.png",
        alt: "image of Psyche goddess opening pandora's box.",
        duration: 5000,
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        text: [
            "In Greek mythology, Psyche, driven by",
            "curiosity, opens a box given to her",
            "by Persephone, meant to contain a",
            "fragment of the queen's divide beauty",
            "for Aphrodite to use."
        ]
    },
    psychegoddess2: { // psyche goddess part2
        image: "../assets/images/goddess_psyche/psyche_sleeping_sketch.png",
        alt: "image of Psyche goddess in a deep, dark sleep.",
        duration: 5000,
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
            "Psyche finds herself in a dark, dreamless",
            "sleep..."
        ]
    },
    psychegoddess4: { // psyche goddess part4
        image: "../assets/images/goddess_psyche/psyche_sleeping_stars.png",
        alt: "",
        duration: 5000,
        scroll: "",
        text: [""]
    },
    psychegoddess5: { // psyche goddess part5
        image: "../assets/images/goddess_psyche/asteroid.png",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 5000,
        text: [
            "The asteroid Psyche finds herself in a similar dark,",
            "dreamless sleep."
        ]
    },
    psychegoddess6: { // psyche goddess part6
        image: "../assets/images/goddess_psyche/asteroid.png",
        scroll: "../assets/images/papyrus_scroll_double_sided.png",
        duration: 5000,
        text: [
            "Just as Psyche's curiosity led her to open",
            "the fateful box, revealing the unexpected,",
            "humanity's exploration of the Psyche",
            "asteroid seeks to unlock the secrets of",
            "planetary cores--risking the unknown for",
            "the reward of discovery."
        ]
    }
};

let phaseIndex = 0;

export function showPhases() {
    const phaseValues = Object.values(phases);

    const displayPhase = () => {
        if (phaseIndex < phaseValues.length) {
            const phase = phaseValues[phaseIndex];
            showPhase(phase);
            phaseIndex++;
            setTimeout(displayPhase, phase.duration); // After the phase duration, call the next phase
        }
    };

    displayPhase();
}

let phaseBool = false;

export function showPhase(phase) {
    if (!phaseBool) {
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
            "background-color: rgba(0, 0, 0, 1);");

        let phase_innerHTML = `
            <img src="${phase.image}" id="phase"/>
            <img src="${phase.scroll}" id="papyrus_scroll"/>
            <div id="scroll_text_box">`;
        phase.text.forEach((line) => {
            phase_innerHTML += `<span class="info">` + line + `</span>`;
        });
        phase_innerHTML += `</div>`;

        phase_div.innerHTML = phase_innerHTML;
        document.body.appendChild(phase_div);

        document.getElementById("phase").setAttribute("style",
            "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh;" +
            " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
            " left: calc(50vw - ((0.8 * 40vh + 10vh) / 2));");
        document.getElementById("papyrus_scroll").setAttribute("style",
            "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px;" +
            " position: absolute; top: 50vh; left: calc(50vw - (40vh / 2));");
        document.getElementById("scroll_text_box").setAttribute("style",
            "display: flex; flex-direction: column; position: absolute; width: 40vh; " +
            "height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69)); " +
            "left: calc(50vw - (40vh / 2));");

        var infos = document.getElementsByClassName("info");
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh); z-index: 21;");
        }

        phaseBool = true;  // Set phaseBool to true once the modal is created
    } else {
        // Hide the current phase modal if it's already showing
        document.getElementById("phase_modal").setAttribute("style", "display: none;");
    }
}
