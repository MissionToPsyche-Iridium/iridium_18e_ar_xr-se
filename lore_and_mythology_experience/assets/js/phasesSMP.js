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
        duration: 3000,
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
        alt: "Asteroid Psyche in the Chrysalis phase",
        duration: 8000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            "With it’s solar panel wings outstretched",
            "like a butterfly, the Psyche spacecraft",
            "echos the “Breath of Life” after death."
        ],
        additionalImages: [
            { src: "../assets/images/chrysalis/butterfly.png", id: "butterfly", position: "absolute", top: "0", left: "0" },
        ],
    },
    blank1: {
        image: "",
        alt: "",
        duration: 1000,
        banner: "",
        text: [
            ""
        ]
    },
    psycheGoddess: {
        image: "../assets/images/goddess_psyche/psyche_passing_out_vector.png",
        alt: "Goddess Psyche sleeping vector.",
        duration: 4000,
        banner: "",
        text: [
            ""
        ]
    },
    blank2: {
        image: "",
        alt: "",
        duration: 1000,
        banner: "",
        text: [
            ""
        ]
    },
    finale: {
        image: "",
        alt: "",
        duration: 20000,
        banner: "../assets/images/smp/smp-banner.png",
        text: [
            " “Perhaps after NASA’s",
            "Psyche spacecraft arrives",
            "at the Psyche asteroid,",
            "it will be as though the",
            "Psyche goddess had drunk the",
            "ambrosia granting her immortality,",
            "only that the achieved immortality",
            "will be through scientific documentation",
            "rather than mythological powers.”",
            "- McManamy"
        ]
    },
    blank3: {
        image: "",
        alt: "",
        duration: 1000,
        banner: "",
        text: [
            ""
        ]
    },
};

let phaseIndex = 0;
const phaseValues = Object.values(phases);

let introBool = false;
let launchBool = false;
let timerBool = false
let phaseBool = false;

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
        const text = "Psyche launched at 10:19 a.m. EDT\nFriday, October 13, 2023.";

        const introDiv = document.createElement("div");
        introDiv.setAttribute("id", "intro-modal");
        introDiv.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; width: 100%; height: 100%; ");

        introDiv.innerHTML = "";
        document.body.appendChild(introDiv);

        Object.assign(introDiv.style, {
            top: "100%",
            left: "50%",
            color: "#C9FFFC",
            background: "rgba(0, 0, 0, 0.2)",
            transform: "translate(-50%, -50%)",
            fontSize: "24px",
            fontFamily: "Comfortaa, Arial, sans-serif",
            textAlign: "center",
            whiteSpace: "pre-line",
            borderRight: "2px solid #C9FFFC", // Cursor effect
            paddingRight: "5px",
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
        // launchDiv.setAttribute("style", "display: flex; align-items: center; justify-content: center;" +
        //     " position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%;" +
        //     " background-color: rgba(0, 0, 0, 0.8); overflow: hidden; transition: 1.5s;");
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

    /**
     * The satellite is expected to be captured by Psyche's gravity in late July (2029).
     * The satellite is then expected to orbit indefinitely thereafter, yet the 
     * mission is said to conclude roughly 2 years after arrival (November of 2031).
     */
    // Launched: October 13th, 2023 @2:19PM (GMT)
    var launchTime = 1697206740000;

    // August 1st, 2029 (GMT)
    var arrivalTime = 1880236800000;

    // November 1st, 2031 (GMT)
    var missionCompletionTime = 1951257600000;

    // Demarcation of second leap day since launch (March 1st, 2028 GMT)
    var leapDay = 1835481600000;

    // TEST CASE 1: launch < current < arrival < completion
    // var launchTime = 1697206740000;
    // var arrivalTime = 1951257500000;
    // var missionCompletionTime = 1951257600000;

    // TEST CASE 2: launch < arrival < current < completion
    // var launchTime = 1697206740000;
    // var arrivalTime = 1697206750000;
    // var missionCompletionTime = 1951257600000;

    // TEST CASE 3: launch < arrival < completion < current
    // var launchTime = 1697206740000;
    // var arrivalTime = 1697206750000;
    // var missionCompletionTime = 1697206760000;

    var millisecondsInASecond = 1000;
    var millisecondsInAMinute = millisecondsInASecond * 60;
    var millisecondsInAnHour = millisecondsInAMinute * 60;
    var millisecondsInADay = millisecondsInAnHour * 24;
    var millisecondsInAYear = millisecondsInADay * 365;

    var currentTime = Date.now();

    let message1 = "Mission Status: ";
    let message2 = "";

    let colHeadings = [["|", "Since Launch  |", "Since Arrival  |", "Since Completion "], 
                       ["|", "Since Launch  |", "Since Arrival  |", "Until Completion "], 
                       ["|", "Since Launch  |", "Until Arrival  |", "Until Completion "] 
                      ];
    //let rowHeadings = ["|", "years  |", "days  |", "hours  |", minutes  |", "seconds  |"];

    let launchCountup = {"years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0};
    let timeSinceLaunch = currentTime - launchTime;
    if (currentTime >= leapDay) {
        launchCountup["years"] = Math.floor((timeSinceLaunch - (2 * millisecondsInADay)) / millisecondsInAYear);
    }
    else {
        launchCountup["years"] = Math.floor((timeSinceLaunch - (1 * millisecondsInADay)) / millisecondsInAYear);
    }
    timeSinceLaunch = timeSinceLaunch - (launchCountup["years"] * millisecondsInAYear);
    launchCountup["days"] = Math.floor(timeSinceLaunch / millisecondsInADay);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["days"] * millisecondsInADay);
    launchCountup["hours"] = Math.floor(timeSinceLaunch / millisecondsInAnHour);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["hours"] * millisecondsInAnHour);
    launchCountup["minutes"] = Math.floor(timeSinceLaunch / millisecondsInAMinute);
    timeSinceLaunch = timeSinceLaunch - (launchCountup["minutes"] * millisecondsInAMinute);
    launchCountup["seconds"] = Math.floor(timeSinceLaunch / millisecondsInASecond);

    let arrivalCountdown = {"years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0};
    let completionCountdown = {"years": 0, "days": 0, "hours": 0, "minutes": 0, "seconds": 0};

    let timeUntilArrival = arrivalTime - currentTime;
    let timeSinceArrival = 0;
    let timeUntilCompletion = missionCompletionTime - currentTime;
    let timeSinceCompletion = 0;

    let launchIncrement = 1;
    let arrivalIncrement = 0;
    let completionIncrement = 0;

    if (currentTime >= missionCompletionTime) {
        message1 += "Complete";
        arrivalIncrement = 1;
        completionIncrement = 1;

        timeSinceArrival = currentTime - arrivalTime;

        arrivalCountdown["years"] = Math.floor(timeSinceArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeSinceArrival / millisecondsInADay);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeSinceArrival / millisecondsInAnHour);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeSinceArrival / millisecondsInAMinute);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeSinceArrival / millisecondsInASecond);

        timeSinceCompletion = currentTime - missionCompletionTime;

        completionCountdown["years"] = Math.floor(timeSinceCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeSinceCompletion / millisecondsInADay);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeSinceCompletion / millisecondsInAnHour);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeSinceCompletion / millisecondsInAMinute);
        timeSinceCompletion = timeSinceCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeSinceCompletion / millisecondsInASecond);

        message2 = colHeadings[0];
    }
    else if (currentTime >= arrivalTime) {
        message1 += "Orbiting";
        arrivalIncrement = 1;
        completionIncrement = -1;

        timeSinceArrival = currentTime - arrivalTime;

        arrivalCountdown["years"] = Math.floor(timeSinceArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeSinceArrival / millisecondsInADay);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeSinceArrival / millisecondsInAnHour);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeSinceArrival / millisecondsInAMinute);
        timeSinceArrival = timeSinceArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeSinceArrival / millisecondsInASecond);

        completionCountdown["years"] = Math.floor(timeUntilCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeUntilCompletion / millisecondsInADay);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeUntilCompletion / millisecondsInAnHour);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeUntilCompletion / millisecondsInAMinute);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeUntilCompletion / millisecondsInASecond);

        message2 = colHeadings[1];
    }
    else {
        message1 += "En Route";
        arrivalIncrement = -1;
        completionIncrement = -1;

        arrivalCountdown["years"] = Math.floor(timeUntilArrival / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        arrivalCountdown["days"] = Math.floor(timeUntilArrival / millisecondsInADay);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["days"] * millisecondsInADay);
        arrivalCountdown["hours"] = Math.floor(timeUntilArrival / millisecondsInAnHour);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["hours"] * millisecondsInAnHour);
        arrivalCountdown["minutes"] = Math.floor(timeUntilArrival / millisecondsInAMinute);
        timeUntilArrival = timeUntilArrival - (arrivalCountdown["minutes"] * millisecondsInAMinute);
        arrivalCountdown["seconds"] = Math.floor(timeUntilArrival / millisecondsInASecond);

        completionCountdown["years"] = Math.floor(timeUntilCompletion / (millisecondsInAYear + (millisecondsInADay / 4)));
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["years"] * (millisecondsInAYear + (millisecondsInADay / 4)));
        completionCountdown["days"] = Math.floor(timeUntilCompletion / millisecondsInADay);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["days"] * millisecondsInADay);
        completionCountdown["hours"] = Math.floor(timeUntilCompletion / millisecondsInAnHour);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["hours"] * millisecondsInAnHour);
        completionCountdown["minutes"] = Math.floor(timeUntilCompletion / millisecondsInAMinute);
        timeUntilCompletion = timeUntilCompletion - (completionCountdown["minutes"] * millisecondsInAMinute);
        completionCountdown["seconds"] = Math.floor(timeUntilCompletion / millisecondsInASecond);

        message2 = colHeadings[2];
    }

    for (let i = 0; i < 20; i++) {
        launchCountup["seconds"] += launchIncrement;

        launchCountup["minutes"] += Math.floor(launchCountup["seconds"] / 60);
        launchCountup["hours"] += Math.floor(launchCountup["minutes"] / 60);
        launchCountup["days"] += Math.floor(launchCountup["hours"] / 24);
        launchCountup["years"] += Math.floor(launchCountup["days"] / 365);

        launchCountup["seconds"] = launchCountup["seconds"] % 60;
        launchCountup["minutes"] = launchCountup["minutes"] % 60;
        launchCountup["hours"] = launchCountup["hours"] % 24;
        launchCountup["days"] = launchCountup["days"] % 365;

        if (arrivalIncrement > 0) {
            arrivalCountdown["seconds"] = (arrivalCountdown["seconds"] + arrivalIncrement) % 60;

            if (arrivalCountdown["seconds"] == 0) {
                arrivalCountdown["minutes"] = (arrivalCountdown["minutes"] + arrivalIncrement) % 60;
                if (arrivalCountdown["minutes"] == 0) {
                    arrivalCountdown["hours"] = (arrivalCountdown["hours"] + arrivalIncrement) % 24;
                    if (arrivalCountdown["hours"] == 0) {
                        arrivalCountdown["days"] = (arrivalCountdown["days"] + arrivalIncrement) % 365;
                        if (arrivalCountdown["days"] == 0) {
                            arrivalCountdown["years"] += arrivalIncrement;
                        }
                    }
                }
            }
        }
        else {
            arrivalCountdown["seconds"] = (arrivalCountdown["seconds"] + 60 + arrivalIncrement) % 60;

            if (arrivalCountdown["seconds"] == 59) {
                arrivalCountdown["minutes"] = (arrivalCountdown["minutes"] + 60 + arrivalIncrement) % 60;
                if (arrivalCountdown["minutes"] == 59) {
                    arrivalCountdown["hours"] = (arrivalCountdown["hours"] + 24 + arrivalIncrement) % 24;
                    if (arrivalCountdown["hours"] == 59) {
                        arrivalCountdown["days"] = (arrivalCountdown["days"] + 365 + arrivalIncrement) % 365;
                        if (arrivalCountdown["days"] == 59) {
                            arrivalCountdown["years"] += arrivalIncrement;
                        }
                    }
                }
            }
        }

        if (completionIncrement > 0) {
            completionCountdown["seconds"] = (completionCountdown["seconds"] + completionIncrement) % 60;

            if (completionCountdown["seconds"] == 0) {
                completionCountdown["minutes"] = (completionCountdown["minutes"] + completionIncrement) % 60;
                if (completionCountdown["minutes"] == 0) {
                    completionCountdown["hours"] = (completionCountdown["hours"] + completionIncrement) % 24;
                    if (completionCountdown["hours"] == 0) {
                        completionCountdown["days"] = (completionCountdown["days"] + completionIncrement) % 365;
                        if (completionCountdown["days"] == 0) {
                            completionCountdown["years"] += completionIncrement;
                        }
                    }
                }
            }
        }
        else {
            completionCountdown["seconds"] = (completionCountdown["seconds"] + 60 + completionIncrement) % 60;

            if (completionCountdown["seconds"] == 59) {
                completionCountdown["minutes"] = (completionCountdown["minutes"] + 60 + completionIncrement) % 60;
                if (completionCountdown["minutes"] == 59) {
                    completionCountdown["hours"] = (completionCountdown["hours"] + 24 + completionIncrement) % 24;
                    if (completionCountdown["hours"] == 59) {
                        completionCountdown["days"] = (completionCountdown["days"] + 365 + completionIncrement) % 365;
                        if (completionCountdown["days"] == 59) {
                            completionCountdown["years"] += completionIncrement;
                        }
                    }
                }
            }
        }

        let countdown = {
            placeholder: {
                image: "",
                alt: "",
                //duration: 20000,
                duration: 1000,
                banner: "../assets/images/smp/smp-banner.png",
                text: [
                    ("" + message1),
                    "---------------------------------------------",
                    ("" + "<table><tr><th class='rowHeader'>" + message2[0] + "</th><th class='colHeader'>" + message2[1] + "</th><th class='colHeader'>" + message2[2] + "</th><th class='colHeader'>" + message2[3] + "</th></tr><tr><tr><td class='rowHeader'>Years  |</td><td class='dataCells'>" + launchCountup["years"] + "</td><td class='dataCells'>" + arrivalCountdown["years"] + "</td><td class='dataCells'>" + completionCountdown["years"] + "</td></tr><td class='rowHeader'>Days  |</td><td class='dataCells'>" + launchCountup["days"] + "</td><td class='dataCells'>" + arrivalCountdown["days"] + "</td><td class='dataCells'>" + completionCountdown["days"] + "</td></tr><tr><td class='rowHeader'>Hours  |</td><td class='dataCells'>" + launchCountup["hours"] + "</td><td class='dataCells'>" + arrivalCountdown["hours"] + "</td><td class='dataCells'>" + completionCountdown["hours"] + "</td></tr><tr><td class='rowHeader'>Minutes  |</td><td class='dataCells'>" + launchCountup["minutes"] + "</td><td class='dataCells'>" + arrivalCountdown["minutes"] + "</td><td class='dataCells'>" + completionCountdown["minutes"] + "</td></tr><tr><td class='rowHeader'>Seconds  |</td><td class='dataCells'>" + launchCountup["seconds"] + "</td><td class='dataCells'>" + arrivalCountdown["seconds"] + "</td><td class='dataCells'>" + completionCountdown["seconds"] + "</td></tr></table>")
                ]
            }
        }
        let timerValues = Object.values(countdown);
        let timerPhase = timerValues[0];

        setTimeout(function() {showCountdown(timerPhase, i)}, 1000 * i);
    }

    setTimeout(() => {
        callback();
    }, 20000);
}

function showCountdown(phase, count) {
    console.log('Transitioning to countdown phase');

    if (count == 0) {
        // set up html and css
        const phase_div = document.createElement("div");
        phase_div.setAttribute("id", "phase_modal");
        phase_div.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
            "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s; font-size: 16px");

        let phase_innerHTML = "";

        phase_innerHTML += `<img src="${phase.banner}" id="banner"/>`;

        if (phase.text.some(line => line !== "")) {
            phase_innerHTML += `<div id="banner_text_box">`;
            phase.text.forEach((line) => {
                phase_innerHTML += `<span class="info">${line}</span>`;
            });
            phase_innerHTML += `</div>`;
        }

        phase_innerHTML += ``;
        phase_div.innerHTML = phase_innerHTML;
        document.body.appendChild(phase_div);
    }
    else {
        let phase_innerHTML = "";

        phase_innerHTML += `<img src="${phase.banner}" id="banner"/>`;

        if (phase.text.some(line => line !== "")) {
            phase_innerHTML += `<div id="banner_text_box">`;
            phase.text.forEach((line) => {
                phase_innerHTML += `<span class="info">${line}</span>`;
            });
            phase_innerHTML += `</div>`;
        }

        phase_innerHTML += ``;

        document.getElementById("phase_modal").innerHTML = phase_innerHTML;
    }

    document.getElementById("banner").setAttribute("style",
        "background-color: transparent; width: calc(30vw + 15vh); height: auto; border-radius: 12px;" +
        " position: absolute; top: 70%; left: 50%;" +
        " z-index: 5; transition: 1.5s ease-in-out; transform: translate(-50%, -50%);");

    if (phase.text.some(line => line !== "")) {
        const text = document.getElementById("banner_text_box");
        text.setAttribute("style", " display: flex; flex-direction: column; position: absolute;" +
            " top: 80%; left: 43%; transform: translate(-50%, -50%);" +
            " color: #C9FFFC; font-size: 2rem; font-family: 'Comfortaa', Arial, sans-serif; text-align: center;" +
            " z-index: 10; padding: 10px 20px; border-radius: 8px; transform: translate(-50%, -50%);");
    }

    var infos = document.getElementsByClassName("info");
    for (var i = 0; i < infos.length; i++) {
        infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh);" +
            " z-index: 21; transition: 1.5s east-in;");
    }

    var colHeaders = document.getElementsByClassName("colHeader");
    for (var j = 0; j < colHeaders.length; j++) {
        colHeaders[j].setAttribute("style", "text-align: center; font-size: calc(0.025 * 40vh);" +
            " z-index: 21; transition: 1.5s east-in; white-space: pre;");
    }

    var rowHeaders = document.getElementsByClassName("rowHeader");
    for (var k = 0; k < rowHeaders.length; k++) {
        rowHeaders[k].setAttribute("style", "text-align: right; font-size: calc(0.025 * 40vh);" +
            " z-index: 21; transition: 1.5s east-in; white-space: pre;");
    }

    var dataCells = document.getElementsByClassName("dataCells");
    for (var l = 0; l < dataCells.length; l++) {
        dataCells[l].setAttribute("style", "text-align: center; font-size: calc(0.025 * 40vh);" +
            " z-index: 21; transition: 1.5s east-in;");
    }

    // clear phase after 20 seconds
    if (count == 19) {
        setTimeout(() => {
            document.getElementById("phase_modal").remove();
        }, 1000);
    }
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
    // TODO: what happens after the phases?
    console.log("Psyche Lore Journey complete!");
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
                "background-color: transparent; width: calc(0.8 * 50vh); height: auto;" +
                " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 50vh);" +
                " left: calc(45vw - ((0.8 * 30vh + 10vh) / 2)); z-index: 10;" +
                "transition: 1.5s ease-in-out;");
        }
        if (phase.banner && phase.banner.length > 0) {
            document.getElementById("banner").setAttribute("style",
                "background-color: transparent; width: calc(30vw + 15vh); height: auto; border-radius: 12px;" +
                " position: absolute; top: 70%; left: 50%;" +
                " z-index: 5; transition: 1.5s ease-in-out; transform: translate(-50%, -50%);");
            if (phase.text.some(line => line !== "")) {
                const text = document.getElementById("banner_text_box");
                text.setAttribute("style", " display: flex; flex-direction: column; position: absolute;" +
                    " top: 80%; left: 43%; transform: translate(-50%, -50%);" +
                    " color: #C9FFFC; font-size: 2rem; font-family: 'Comfortaa', Arial, sans-serif; text-align: center;" +
                    " z-index: 10; padding: 10px 20px; border-radius: 8px; transform: translate(-50%, -50%);");
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
                overlayImage.setAttribute("style", "width: calc(0.8 * 55vh); height: auto" +
                    " border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 75vh);" +
                    " left: calc(45vw - ((0.8 * 30vh + 10vh) / 2)); z-index: 21; transition: 1.5s ease-in-out;");

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
