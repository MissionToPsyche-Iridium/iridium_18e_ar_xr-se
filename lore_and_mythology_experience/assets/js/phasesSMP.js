/*
* phasesSMP.js
* This file handles SMP functions and phases.
* @author: Nicole Garcia
 */



// Data for SMP-l phases
const phases = {
    psycheSatellite1: {
        image: "../assets/images/smp/psyche-satellite.png",
        alt: "Psyche satellite with wings like a butterfly.",
        duration: 2000,
        banner: "",
        text: [
            ""
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ],
    },
    psycheSatellite2: {
        image: "../assets/images/smp/psyche-satellite.png",
        alt: "Satellite Psyche with wings like a butterfly",
        duration: 6000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            "With it’s solar panel wings",
            "outstretched like a butterfly,",
            "the Psyche spacecraft echos",
            "the “Breath of Life” after death."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ],
    },
    quote1: {
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "",
        duration: 6000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “Perhaps after NASA’s Psyche",
            "spacecraft arrives at the",
            "Psyche asteroid... “"
        ]
    },
    quote2: {
        image: "../assets/images/goddess_psyche/psyche_drinking_ambrosia.png",
        alt: "",
        duration: 6000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “it will be as though",
            "the Psyche goddess",
            "had drunk the ambrosia",
            "granting her immortality... “"
        ]
    },
    quote3: {
        image: "../assets/images/goddess_psyche/asteroid.png",
        alt: "",
        duration: 6000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “only that the achieved",
            "immortality will be through",
            "scientific documentation rather",
            "than mythological powers. “- McManamy"
        ]
    }
};

let phaseIndex = 0;
const phaseValues = Object.values(phases);

let introBool = false;
let launchBool = false;
let timerBool = false
let phaseBool = false;
let finaleBool = false;

//
/*
* startPhasesSMP
* Handles SMP and calls functions for SMP intro, launch video, mission timer, and for displaying the rest of the phases.
 */
export function startPhasesSMP() {
    phaseIndex = 0;
    // using callbacks to ensure one function completes before another starts
    showSMPIntro(() => {
        showLaunch(() => {
            showTimer(() => {
                displayPhase();
            });
        });
    });
}

/*
* showSMPIntro
* display info about Psyche satellite launch date and time in a typing animation
* takes in a callback function so that phases display only when the prior one is completed
 */
function showSMPIntro(callback) {
    console.log('Transitioning to satellite intro');
    if (!introBool) {
        const text = "Psyche launched at \n10:19 a.m. EDT\nFriday, October 13, 2023.";

        const introDiv = document.createElement("div");
        introDiv.setAttribute("id", "intro-modal");
        introDiv.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; width: 100%; height: 100%; padding: 2vh; ");

        introDiv.innerHTML = "";
        document.body.appendChild(introDiv);

        Object.assign(introDiv.style, {
            top: "100%",
            left: "50%",
            color: "#C9FFFC",
            background: "rgba(0, 0, 0, 0.2)",
            transform: "translate(-50%, -50%)",
            fontSize: "20px",
            fontFamily: "Comfortaa, Arial, sans-serif",
            textAlign: "center",
            whiteSpace: "pre-line",
            borderRight: "2px solid #C9FFFC", // Cursor effect
            padding: "5px",
            overflow: "hidden",
            transition: "1.5s"
        });

        let index = 0;

        function typeText() {
            if (index < text.length) {
                introDiv.innerHTML += text[index] === "\n" ? "<br>" : text[index];
                index++;
                setTimeout(typeText, 75); // typing speed
            } else {
                introDiv.style.borderRight = "none";
            }
        }

        typeText();

        setTimeout(() => {
            // hide phase modal and remove the phase images
            document.getElementById("intro-modal").remove();

            introBool = false;
            callback();
        }, 5000);
    } else {
        document.getElementById("intro-modal").setAttribute("style", "display: none;");
        introBool = false;
        callback();
    }
}

/*
* showLaunch
* display Psyche satellite launch video
* takes in a callback function so that phases display only when the prior one is completed
 */
function showLaunch(callback) {
    console.log('Transitioning to satellite launch');
    if (!launchBool) {
        const launchDiv = document.createElement("div");
        launchDiv.setAttribute("id", "launch-modal");
        launchDiv.setAttribute("style", "display: flex; align-items: center; justify-content: center;" +
            " position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%;" +
            " background-color: rgba(0, 0, 0, 0.8); overflow: hidden; transition: 1.5s; font-family: 'Comfortaa', Arial, sans-serif;");


        const iframe = document.createElement("iframe");
        iframe.setAttribute("width", "800");  // Set a reasonable default size
        iframe.setAttribute("height", "450");
        iframe.setAttribute("src", "https://www.youtube.com/embed/wnAhR6AaUsI?autoplay=1&enablejsapi=1");
        iframe.setAttribute("title", "YouTube video player");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("allow", "autoplay");

        launchDiv.appendChild(iframe);
        document.body.appendChild(launchDiv);

        // YouTube Iframe API
        let player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player(iframe, {
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        // determine video state changes
        function onPlayerStateChange(event) {
            // video finished
            if (event.data === YT.PlayerState.ENDED) {
                document.getElementById("launch-modal").remove();
                launchBool = false;
                callback();  // transition to next function when video ends
            }
        }

        // load YouTube Iframe API script to determine when video ends
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);

    } else {
        const modal = document.getElementById("launch-modal");
        if (modal) {
            modal.remove();
        }
        launchBool = false;
        callback();
    }
}

/*
* showTimer
* display Psyche satellite mission timer
* takes in a callback function so that phases display only when the prior one is completed
 */
function showTimer(callback) {
    console.log('Transitioning to satellite timer');
    setTimeout(() => {
        callback(); // Call the callback after timer is done
    }, 500);
}

/*
* displayPhase
* display SMP-l phases
 */
function displayPhase() {
    console.log("Current Phase Index:", phaseIndex, "Total Phases:", phaseValues.length);

    if (phaseIndex >= phaseValues.length) {
        phaseIndex = 0;
        setTimeout(afterPhases, phaseValues[phaseIndex].duration);
        return;
    }

    const phase = phaseValues[phaseIndex];
    showPhase(phase);
    phaseIndex++;

    setTimeout(displayPhase, phase.duration);
}

/*
* afterPhases
* handler after phases show
 */
function afterPhases() {
    if (!finaleBool) {
        finaleBool = true;

        console.log("Psyche Lore Journey complete!");

        // modal container
        const finaleDiv = document.createElement("div");
        finaleDiv.setAttribute("id", "finale-modal");
        finaleDiv.setAttribute(
            "style",
            "display: flex; flex-direction: column; align-items: center; justify-content: center;" +
            " position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh;" +
            " background-color: rgba(0, 0, 0, 0.8); overflow: hidden; transition: 1.5s;" +
            " font-family: 'Comfortaa', Arial, sans-serif; text-align: center; color: white;"
        );

        // logo image
        const logo = document.createElement("img");
        logo.setAttribute("src", "../assets/images/smp/Psyche_Icon_Color-SVG.svg");
        logo.setAttribute("id", "phase");
        logo.setAttribute(
            "style",
            "background-color: transparent; width: 30vw; max-width: 200px; height: auto;" +
            " border-radius: 12px; padding: 2vh;" +
            " transition: 1.5s ease-in-out;"
        );

        // message
        const finaleText = document.createElement("p");
        finaleText.innerText = "You have come to the end of this experience.";
        finaleText.setAttribute(
            "style",
            "font-size: 2vh; margin-top: 2vh; margin-bottom: 2vh; max-width: 60vw;" +
            " color: white; text-align: center; font-weight: bold;"
        );

        // restart button
        const restartButton = document.createElement("button");
        restartButton.innerText = "Restart the Journey";
        restartButton.setAttribute(
            "style",
            "margin-top: 4vh; width: 30vw; max-width: 200px; padding: 1.5vh 2vw;" +
            " font-size: 1.8vh; font-weight: bold; color: white;" +
            " background-color: #f98400; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s ease;" +
            " font-family: 'Comfortaa', Arial, sans-serif;"
        );

        // Hover effects
        restartButton.addEventListener("mouseover", () => {
            restartButton.style.backgroundColor = "#e09309";
        });

        restartButton.addEventListener("mouseout", () => {
            restartButton.style.backgroundColor = "#f98400";
        });

        // Redirect on click
        restartButton.addEventListener("click", () => {
            window.location.href = "../pages/index.html"; // Change to your desired page
        });

        // Append elements
        finaleDiv.appendChild(logo);
        finaleDiv.appendChild(finaleText); // Add the new text element
        finaleDiv.appendChild(restartButton);
        document.body.appendChild(finaleDiv);
    }
}

// initialize SMP-l phase data and display it
// can put css and html in separate files if needed.
function showPhase(phase) {
    console.log('Transitioning to satellite phases');
    if (!phaseBool) {
        phaseBool = true;

        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
            "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s; font-size: 16px");

        let phase_innerHTML = "";

        if (phase.image && phase.image.length > 0) {
            phase_innerHTML += `<img src="${phase.image}" id="phase"/>`;
        }

        if (phase.banner && phase.banner.length > 0) {
            phase_innerHTML += `<img src="${phase.banner}" id="banner"/>`;

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

        // add styles to the phase image and banner
        if (phase.image && phase.image.length > 0) {
            document.getElementById("phase").setAttribute("style",
                "background-color: transparent; width: calc(0.8 * 45vh); height: auto;" +
                " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh);" +
                " left: calc(50vw - ((0.8 * 50vh + 10vh) / 2)); z-index: 10;" +
                "transition: 1.5s ease-in-out;");
        }
        if (phase.banner && phase.banner.length > 0) {
            let banner = document.getElementById("banner");

            // Ensure banner exists before applying styles
            if (!banner) {
                banner = document.createElement("div");
                banner.id = "banner";
                document.body.appendChild(banner);
            }

            banner.setAttribute("style",
                "background-color: transparent; max-width: 90vw; width: calc(0.8 * 55vh); border-radius: 12px;" +
                " position: absolute; bottom: -2vh; left: calc(50vw - ((0.8 * 50vh + 10vh) / 2));" +
                " z-index: 5; transition: 1.5s ease-in-out; display: flex; align-items: center; justify-content: center;" +
                " text-align: center; overflow: visible; flex-direction: column;");

            if (phase.text.some(line => line !== "")) {
                let textBox = document.getElementById("banner_text_box");

                // Ensure the text box exists
                if (!textBox) {
                    textBox = document.createElement("div");
                    textBox.id = "banner_text_box";
                    banner.appendChild(textBox);
                }

                let bottomValue;

                if (window.innerWidth <= 768) { // Small screens (mobile)
                    console.log("small screen");
                    if (phase.text.length > 3) {
                        bottomValue = "12vh";
                    }  else {
                        bottomValue = "15vh";
                    }
                } else if (window.innerWidth <= 1024) { // Medium screens (tablets)
                    console.log("medium screen");
                    if (phase.text.length > 3) {
                        bottomValue = "15vh";
                    }  else {
                        bottomValue = "16vh";
                    }
                } else { // Large screens (desktops)
                    console.log("large screen");
                    if (phase.text.length > 3) {
                        bottomValue = "15vh";
                    }  else {
                        bottomValue = "16vh";
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
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
                " z-index: 21; transition: 1.5s east-in;");
        }

        // If the phase has additional images, add them
        if (phase.additionalImages) {
            phase.additionalImages.forEach((image, index) => {
                const overlayImage = document.createElement("img");

                overlayImage.setAttribute("src", image.src);
                overlayImage.setAttribute("id", image.id);
                // add position styles for stacking additional images on top of phase image
                overlayImage.setAttribute("style", `position: ${image.position}; top: ${image.top}; left: ${image.left}; z-index: 15;`);
                overlayImage.setAttribute("style", "width: calc(0.8 * 50vh); height: auto" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 10vh);" +
                    " left: calc(50vw - ((0.8 * 50vh + 10vh) / 2)); z-index: 21; transition: 1.5s ease-in-out;");

                document.body.appendChild(overlayImage);
            });
        }

        // clear phase after the duration ends
        // hide phase modal and remove the phase images
        setTimeout(() => {
            document.getElementById("phase_modal").remove();

            // remove any overlay images for the phase
            const overlayImages = document.querySelectorAll('[id^="butterfly"]');
            overlayImages.forEach((img) => img.remove());

            phaseBool = false;
        }, phase.duration);
    } else {
        // Hide the current phase modal if it's already showing
        document.getElementById("phase_modal").setAttribute("style", "display: none;");
        phaseBool = false;
    }
}
